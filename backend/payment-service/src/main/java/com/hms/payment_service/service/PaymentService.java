package com.hms.payment_service.service;

import com.hms.payment_service.client.BookingServiceClient;
import com.hms.payment_service.client.StripePaymentClient;
import com.hms.payment_service.dto.*;
import com.hms.payment_service.entity.Payment;
import com.hms.payment_service.entity.PaymentStatus;
import com.hms.payment_service.exception.InvalidPaymentStateException;
import com.hms.payment_service.exception.PaymentNotFoundException;
import com.hms.payment_service.repository.PaymentRepository;
import com.stripe.model.PaymentIntent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;


@Service
public class PaymentService {

    private final StripePaymentClient stripePaymentClient;
    private final BookingServiceClient bookingServiceClient;
    private final PaymentRepository paymentRepository;

    public PaymentService(StripePaymentClient stripePaymentClient,
                          BookingServiceClient bookingServiceClient,
                          PaymentRepository paymentRepository) {
        this.stripePaymentClient = stripePaymentClient;
        this.bookingServiceClient = bookingServiceClient;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public CreatePaymentResponse createPayment(CreatePaymentRequest request, String idempotencyKeyHeader) {
        String idempotencyKey = (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank())
                ? idempotencyKeyHeader
                : "auto-" + request.bookingId() + "-" + UUID.randomUUID();

        var existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            Payment payment = existing.get();
            PaymentIntent intent = stripePaymentClient.retrievePaymentIntent(payment.getStripePaymentIntentId());
            return new CreatePaymentResponse(payment.getId(), payment.getAmount(), payment.getStatus(),
                    intent.getClientSecret());
        }

        BookingInfo booking = bookingServiceClient.getBooking(request.bookingId());

        PaymentIntent intent = stripePaymentClient.createPaymentIntent(
                booking.totalAmount(), "usd", idempotencyKey, request.bookingId());

        Payment payment = new Payment();
        payment.setBookingId(request.bookingId());
        payment.setCustomerId(booking.customerId());
        payment.setStripePaymentIntentId(intent.getId());
        payment.setIdempotencyKey(idempotencyKey);
        payment.setAmount(booking.totalAmount());
        payment.setCurrency("USD");
        payment.setPaymentMethod(request.paymentMethod());
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        return new CreatePaymentResponse(payment.getId(), payment.getAmount(), payment.getStatus(),
                intent.getClientSecret());
    }


    @Transactional
    public ConfirmPaymentResponse confirmPayment(ConfirmPaymentRequest request) {
        Payment payment = paymentRepository.findById(request.paymentId())
                .orElseThrow(() -> new PaymentNotFoundException(request.paymentId()));

        if (payment.getStatus() == PaymentStatus.PAID) {
            // Already confirmed - return the existing result rather than re-charging
            // or re-triggering Booking Service (idempotent confirm). The reference was
            // returned on the original confirm and isn't stored here, hence null.
            return new ConfirmPaymentResponse(payment.getId(), payment.getStatus(), "CONFIRMED", null);
        }

        PaymentIntent intent = stripePaymentClient.retrievePaymentIntent(payment.getStripePaymentIntentId());

        if (!"succeeded".equals(intent.getStatus())) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new InvalidPaymentStateException(
                    "Stripe reports payment status '" + intent.getStatus() + "', expected 'succeeded'");
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setTransactionReference(request.transactionReference());
        paymentRepository.save(payment);

        BookingConfirmResult bookingResult = bookingServiceClient.confirmBooking(
                payment.getBookingId(), payment.getTransactionReference());

        return new ConfirmPaymentResponse(payment.getId(), payment.getStatus(),
                bookingResult.status(), bookingResult.bookingReference());
    }

    @Transactional(readOnly = true)
    public List<PaymentHistoryItem> getPaymentHistory(String customerId) {
        return paymentRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(p -> new PaymentHistoryItem(p.getId(), p.getBookingId(), p.getAmount(), p.getStatus()))
                .toList();
    }
}
