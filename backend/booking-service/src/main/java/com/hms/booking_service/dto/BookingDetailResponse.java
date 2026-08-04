package com.hms.booking_service.dto;

import com.hms.booking_service.entity.BookingStatus;

public record BookingDetailResponse(
        Long bookingId,
        String hotelName,
        String roomType,
        BookingStatus status,
        String paymentStatus,
        String bookingReference
) {
}
