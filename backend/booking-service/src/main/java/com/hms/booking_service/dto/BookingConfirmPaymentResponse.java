package com.hms.booking_service.dto;

import com.hms.booking_service.entity.BookingStatus;

public record BookingConfirmPaymentResponse(
        Long bookingId,
        BookingStatus status,
        String bookingReference
) {
}
