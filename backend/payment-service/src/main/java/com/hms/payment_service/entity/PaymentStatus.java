package com.hms.payment_service.entity;

public enum PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    /** Stripe charge succeeded but the booking could not be confirmed; the money was refunded. */
    REFUNDED,
    /** Same situation, but the Stripe refund call itself failed: needs manual follow-up. */
    REFUND_FAILED
}
