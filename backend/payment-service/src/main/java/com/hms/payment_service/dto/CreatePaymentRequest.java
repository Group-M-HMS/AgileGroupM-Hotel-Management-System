package com.hms.payment_service.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreatePaymentRequest(

        @NotNull(message = "bookingId is required")
        Long bookingId,

        @NotBlank(message = "paymentMethod is required")
        @Size(max = 50, message = "paymentMethod must be at most 50 characters")
        String paymentMethod
) {
}
