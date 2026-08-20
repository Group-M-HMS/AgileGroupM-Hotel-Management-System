package com.hms.payment_service.dto;


import com.hms.payment_service.entity.PaymentStatus;

import java.math.BigDecimal;


public record PaymentHistoryItem(
        Long paymentId,
        Long bookingId,
        BigDecimal amount,
        PaymentStatus status
) {
}
