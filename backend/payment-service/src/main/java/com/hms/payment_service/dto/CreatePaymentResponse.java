package com.hms.payment_service.dto;

import com.hms.payment_service.entity.PaymentStatus;

import java.math.BigDecimal;


public record CreatePaymentResponse(
        Long paymentId,
        BigDecimal amount,
        PaymentStatus status,
        String clientSecret
) {
}
