package com.hms.payment_service.dto;

/** Result of confirming a booking via booking-service's internal API. */
public record BookingConfirmResult(
        String status,
        String bookingReference
) {
}
