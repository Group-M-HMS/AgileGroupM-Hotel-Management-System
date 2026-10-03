package com.nibm.user_service.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GuestRegistrationRequest(
        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
        @Pattern(regexp = "^[\\p{L}\\s'’.-]+$", message = "First name may only contain letters, spaces, apostrophes, dots and hyphens")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
        @Pattern(regexp = "^[\\p{L}\\s'’.-]+$", message = "Last name may only contain letters, spaces, apostrophes, dots and hyphens")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        @Size(max = 254, message = "Email must be at most 254 characters")
        String email,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$", message = "Phone number must be 7-20 digits (spaces, + - ( ) allowed)")
        String phone,

        String firebaseUid
) {}
