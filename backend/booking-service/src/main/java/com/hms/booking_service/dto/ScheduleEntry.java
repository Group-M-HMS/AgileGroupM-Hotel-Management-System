package com.hms.booking_service.dto;

import com.hms.booking_service.entity.BookingStatus;

import java.time.LocalDate;

public record ScheduleEntry(
        Long bookingId,
        Long roomId,
        LocalDate checkIn,
        LocalDate checkOut,
        BookingStatus status,
        String guestName
) {
}
