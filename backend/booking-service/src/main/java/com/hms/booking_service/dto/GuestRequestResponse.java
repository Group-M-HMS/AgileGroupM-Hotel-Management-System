package com.hms.booking_service.dto;

import com.hms.booking_service.entity.RequestKind;
import com.hms.booking_service.entity.RequestStatus;

import java.time.LocalDateTime;

public record GuestRequestResponse(
        Long id,
        String kind,
        String title,
        String detail,
        Long roomId,
        Long bookingId,
        String guestName,
        String resolved,
        String time,
        String resolvedBy,
        LocalDateTime resolvedAt,
        LocalDateTime createdAt
) {}
