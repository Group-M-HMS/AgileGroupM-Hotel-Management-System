package com.hms.booking_service.dto;

import com.hms.booking_service.entity.BookingStatus;
import java.time.LocalDateTime;

public record CheckInOutResponse(
        Long bookingId,
        String bookingReference,
        Long roomId,
        BookingStatus bookingStatus,
        String roomStatus,
        LocalDateTime timestamp,
        String message
) {}
