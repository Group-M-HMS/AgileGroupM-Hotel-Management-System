package com.hms.booking_service.dto;

import com.hms.booking_service.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BookingSummary(
        Long bookingId,
        String hotelName,
        String roomType,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        BookingStatus status,
        BigDecimal totalAmount,
        Integer guestCount,
        BigDecimal subTotal,
        BigDecimal taxAmount
) {
}
