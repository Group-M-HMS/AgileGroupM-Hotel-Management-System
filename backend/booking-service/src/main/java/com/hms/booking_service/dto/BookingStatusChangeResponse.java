package com.hms.booking_service.dto;

import com.hms.booking_service.entity.BookingStatus;

public record BookingStatusChangeResponse(
        Long bookingId,
        BookingStatus status
) {
}
