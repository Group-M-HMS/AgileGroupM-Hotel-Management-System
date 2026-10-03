package com.hms.booking_service.dto;

import jakarta.validation.constraints.Size;
import com.hms.booking_service.entity.RequestKind;
import jakarta.validation.constraints.NotBlank;

public record CreateGuestRequestDto(
        RequestKind kind,
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be at most 255 characters")
        String title,
        @NotBlank(message = "Detail is required")
        @Size(max = 5000, message = "Detail must be at most 5000 characters")
        String detail,
        Long roomId,
        Long bookingId,
        String customerId,
        @Size(max = 255, message = "guestName must be at most 255 characters")
        String guestName
) {}
