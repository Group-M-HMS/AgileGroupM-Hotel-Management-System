package com.hms.booking_service.dto;

import com.hms.booking_service.entity.BookingSource;
import com.hms.booking_service.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AdminBookingSummary(
        Long id,
        String ref,
        String guestId,
        String guestName,
        String guestEmail,
        String guestPhone,
        Long roomId,
        String roomTitle,
        String roomNumber,
        LocalDate checkIn,
        LocalDate checkOut,
        Integer guests,
        BigDecimal amount,
        boolean paid,
        BookingStatus status,
        BookingSource source,
        String specialRequests,
        String cancelReason
) {
}
