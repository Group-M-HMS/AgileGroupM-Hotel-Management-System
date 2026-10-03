package com.hms.payment_service.service;

import com.hms.payment_service.client.BookingServiceClient;
import com.hms.payment_service.client.StripePaymentClient;
import com.hms.payment_service.dto.*;
import com.hms.payment_service.entity.Payment;
import com.hms.payment_service.entity.PaymentStatus;
import com.hms.payment_service.exception.BookingNotConfirmableException;
import com.hms.payment_service.exception.BookingNotFoundException;
import com.hms.payment_service.exception.InvalidPaymentStateException;
import com.hms.payment_service.exception.PaymentNotFoundException;
import com.hms.payment_service.exception.StripeIntegrationException;
import com.hms.payment_service.repository.PaymentRepository;
import com.stripe.model.PaymentIntent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

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

    /**
     * Starts a payment for one of the caller's own bookings. The caller's Firebase token is
     * forwarded to booking-service, which only returns bookings owned by that customer.
     * A booking can only be paid while PENDING, never twice, and retries reuse the open intent.
     */
    @Transactional
    public CreatePaymentResponse createPayment(CreatePaymentRequest request, String idempotencyKeyHeader,
                                               String authorization) {
        BookingInfo booking = bookingServiceClient.getOwnedBooking(request.bookingId(), authorization);

        if (!"PENDING".equals(booking.status())) {
            throw new InvalidPaymentStateException(
                    "Booking is " + booking.status() + "; only a PENDING booking can be paid");
        }

        List<Payment> earlier = paymentRepository.findByBookingId(request.bookingId());
        if (earlier.stream().anyMatch(p -> p.getStatus() == PaymentStatus.PAID)) {
            throw new InvalidPaymentStateException("This booking has already been paid");
        }

        // A retry must not open a second Stripe intent (and a second possible charge).
        var open = earlier.stream().filter(p -> p.getStatus() == PaymentStatus.PENDING).findFirst();
        if (open.isPresent()) {
            return toCreateResponse(open.get());
        }

        // Keys are always scoped to the verified booking, and client-supplied ones live in their own
        // namespace, so a caller can never supply a key that matches another booking's payment.
        String idempotencyKey = (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank())
                ? "client-" + request.bookingId() + "-" + idempotencyKeyHeader
                // Deterministic per booking + attempt number, so Stripe dedupes network retries too.
                : "booking-" + request.bookingId() + "-attempt-" + earlier.size();

        var existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            if (!existing.get().getBookingId().equals(request.bookingId())) {
                throw new InvalidPaymentStateException("Idempotency key is already in use");
            }
            return toCreateResponse(existing.get());
        }

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

    /**
     * Confirms a payment after Stripe reports success, then confirms the booking. If booking-service
     * refuses (e.g. the unpaid hold expired and the booking was cancelled) the customer has already
     * been charged, so the charge is refunded instead of being left dangling.
     *
     * noRollbackFor: the REFUNDED / REFUND_FAILED / FAILED status must be saved even though an
     * exception is thrown to tell the client what happened.
     */
    @Transactional(noRollbackFor = {InvalidPaymentStateException.class, StripeIntegrationException.class})
    public ConfirmPaymentResponse confirmPayment(ConfirmPaymentRequest request, String authorization) {
        Payment payment = paymentRepository.findById(request.paymentId())
                .orElseThrow(() -> new PaymentNotFoundException(request.paymentId()));

        // Ownership: booking-service answers 404 for a booking that isn't the caller's.
        bookingServiceClient.getOwnedBooking(payment.getBookingId(), authorization);

        if (payment.getStatus() == PaymentStatus.PAID) {
            // Already confirmed - return the existing result rather than re-charging
            // or re-triggering Booking Service (idempotent confirm). The reference was
            // returned on the original confirm and isn't stored here, hence null.
            return new ConfirmPaymentResponse(payment.getId(), payment.getStatus(), "CONFIRMED", null);
        }
        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new InvalidPaymentStateException("This payment was refunded; the booking was not confirmed");
        }

        PaymentIntent intent = stripePaymentClient.retrievePaymentIntent(payment.getStripePaymentIntentId());

        if (!"succeeded".equals(intent.getStatus())) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new InvalidPaymentStateException(
                    "Stripe reports payment status '" + intent.getStatus() + "', expected 'succeeded'");
        }

        BookingConfirmResult bookingResult;
        try {
            bookingResult = bookingServiceClient.confirmBooking(payment.getBookingId(), intent.getId());
        } catch (BookingNotConfirmableException | BookingNotFoundException ex) {
            return refundAndFail(payment, intent, ex);
        }

        payment.setStatus(PaymentStatus.PAID);
        // Server truth, not the client-supplied reference.
        payment.setTransactionReference(intent.getId());
        paymentRepository.save(payment);

        return new ConfirmPaymentResponse(payment.getId(), payment.getStatus(),
                bookingResult.status(), bookingResult.bookingReference());
    }

    private ConfirmPaymentResponse refundAndFail(Payment payment, PaymentIntent intent, RuntimeException cause) {
        log.warn("Booking {} could not be confirmed after Stripe success ({}); refunding payment {}",
                payment.getBookingId(), cause.getMessage(), payment.getId());
        try {
            stripePaymentClient.refund(intent.getId(), "refund-payment-" + payment.getId());
        } catch (StripeIntegrationException refundError) {
            payment.setStatus(PaymentStatus.REFUND_FAILED);
            paymentRepository.save(payment);
            log.error("REFUND FAILED for payment {} (booking {}, intent {}): manual refund needed",
                    payment.getId(), payment.getBookingId(), intent.getId(), refundError);
            throw new InvalidPaymentStateException(
                    "Your payment was taken but the booking could not be confirmed, and the automatic refund failed. "
                            + "Please contact us with payment reference " + payment.getId() + ".");
        }
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);
        throw new InvalidPaymentStateException(
                "Your booking could no longer be held (the payment window expired), so your payment was refunded "
                        + "in full. Please search again and rebook.");
    }

    private CreatePaymentResponse toCreateResponse(Payment payment) {
        PaymentIntent intent = stripePaymentClient.retrievePaymentIntent(payment.getStripePaymentIntentId());
        return new CreatePaymentResponse(payment.getId(), payment.getAmount(), payment.getStatus(),
                intent.getClientSecret());
    }
}
