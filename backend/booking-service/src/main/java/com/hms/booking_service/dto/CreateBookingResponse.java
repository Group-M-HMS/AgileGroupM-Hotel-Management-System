package com.hms.booking_service.dto;

import com.hms.booking_service.entity.BookingStatus;

import java.math.BigDecimal;

public record CreateBookingResponse(
        Long uuid,
        BookingStatus status,
        BigDecimal totalAmount
) {
}
