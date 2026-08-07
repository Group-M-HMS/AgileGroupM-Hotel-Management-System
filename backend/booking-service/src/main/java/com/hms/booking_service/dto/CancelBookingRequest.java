package com.hms.booking_service.dto;

import jakarta.validation.constraints.NotBlank;

public record CancelBookingRequest(
        @NotBlank(message = "reason is required")
        String reason
) {
}
