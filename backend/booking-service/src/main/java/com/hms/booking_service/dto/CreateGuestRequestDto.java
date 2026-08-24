package com.hms.booking_service.dto;

import com.hms.booking_service.entity.RequestKind;
import jakarta.validation.constraints.NotBlank;

public record CreateGuestRequestDto(
        RequestKind kind,
        @NotBlank(message = "Title is required")
        String title,
        @NotBlank(message = "Detail is required")
        String detail,
        Long roomId,
        Long bookingId,
        String customerId,
        String guestName
) {}
