package com.hms.booking_service.dto;

import jakarta.validation.constraints.Size;
import com.hms.booking_service.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;

public record ResolveGuestRequestDto(
        @NotNull(message = "Resolution status is required (APPROVED or DISMISSED)")
        RequestStatus status,
        @Size(max = 255, message = "resolvedBy must be at most 255 characters")
        String resolvedBy
) {}
