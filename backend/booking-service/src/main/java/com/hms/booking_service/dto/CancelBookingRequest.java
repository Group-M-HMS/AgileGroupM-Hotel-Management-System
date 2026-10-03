package com.hms.booking_service.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;

public record CancelBookingRequest(
        @NotBlank(message = "reason is required")
        @Size(max = 255, message = "reason must be at most 255 characters")
        String reason
) {
}
