package com.hms.payment_service.repository;

import com.hms.payment_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<Payment> findByBookingId(Long bookingId);

    // Payment history is scoped to the logged-in customer directly.
    List<Payment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
