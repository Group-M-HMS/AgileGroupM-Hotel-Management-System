package com.hms.payment_service.dto;

import jakarta.validation.constraints.NotNull;

public record ConfirmPaymentRequest(

        @NotNull(message = "paymentId is required")
        Long paymentId,

        String transactionReference
) {
}
