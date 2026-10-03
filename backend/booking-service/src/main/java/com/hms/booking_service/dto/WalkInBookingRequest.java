package com.hms.booking_service.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record WalkInBookingRequest(

        @NotBlank(message = "guestName is required")
        @Size(max = 255, message = "guestName must be at most 255 characters")
        String guestName,

        @NotBlank(message = "guestEmail is required")
        @Email(message = "guestEmail must be a valid email")
        @Size(max = 255, message = "guestEmail must be at most 255 characters")
        String guestEmail,

        @Pattern(regexp = "^$|^\\+?[0-9\\s\\-()]{7,20}$", message = "phone must be 7-20 digits (spaces, + - ( ) allowed)")
        String guestPhone,

        @NotNull(message = "roomId is required")
        Long roomId,

        @NotNull(message = "checkIn is required")
        LocalDate checkIn,

        @NotNull(message = "checkOut is required")
        LocalDate checkOut,

        @NotNull(message = "guests is required")
        @Min(value = 1, message = "guests must be at least 1")
        @Max(value = 20, message = "guests must be at most 20")
        Integer guests,

        @Size(max = 1000, message = "specialRequests must be at most 1000 characters")
        String specialRequests,

        boolean paid
) {
}
