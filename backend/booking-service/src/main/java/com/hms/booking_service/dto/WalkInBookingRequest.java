package com.hms.booking_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record WalkInBookingRequest(

        @NotBlank(message = "guestName is required")
        String guestName,

        @NotBlank(message = "guestEmail is required")
        @Email(message = "guestEmail must be a valid email")
        String guestEmail,

        String guestPhone,

        @NotNull(message = "roomId is required")
        Long roomId,

        @NotNull(message = "checkIn is required")
        LocalDate checkIn,

        @NotNull(message = "checkOut is required")
        LocalDate checkOut,

        @NotNull(message = "guests is required")
        @Min(value = 1, message = "guests must be at least 1")
        Integer guests,

        String specialRequests,

        boolean paid
) {
}
