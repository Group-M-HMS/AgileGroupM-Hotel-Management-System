package com.hms.booking_service.dto;

import com.hms.booking_service.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BookingDetailResponse(
        Long bookingId,
        Long roomId,
        String hotelName,
        String roomType,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        Integer numberOfGuests,
        String specialRequests,
        BookingStatus status,
        String paymentStatus,
        BigDecimal totalAmount,
        String bookingReference
) {
}
