package com.hms.booking_service.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateBookingRequest(

        @NotNull(message = "roomId is required")
        Long roomId,

        @NotNull(message = "checkInDate is required")
        LocalDate checkInDate,

        @NotNull(message = "checkOutDate is required")
        LocalDate checkOutDate,

        @NotNull(message = "numberOfGuests is required")
        @Min(value = 1, message = "numberOfGuests must be at least 1")
        Integer numberOfGuests,

        String specialRequests,

        // NIBM2-440: booking submission must be rejected if T&Cs aren't accepted.
        @AssertTrue(message = "Terms and conditions must be accepted")
        boolean termsAccepted
) {
}
