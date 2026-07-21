package com.hms.pricing_service.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record QuoteRequest(
        @NotNull(message = "room_id is required")
        Long roomId,

        @NotNull(message = "check_in is required")
        LocalDate checkIn,

        @NotNull(message = "check_out is required")
        LocalDate checkOut
) {
}
