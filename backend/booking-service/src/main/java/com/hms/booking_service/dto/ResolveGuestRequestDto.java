package com.hms.booking_service.dto;

import com.hms.booking_service.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;

public record ResolveGuestRequestDto(
        @NotNull(message = "Resolution status is required (APPROVED or DISMISSED)")
        RequestStatus status,
        String resolvedBy
) {}
