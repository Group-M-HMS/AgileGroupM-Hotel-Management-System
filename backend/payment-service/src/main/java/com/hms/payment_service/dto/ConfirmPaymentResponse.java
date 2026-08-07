package com.hms.payment_service.dto;

import com.hms.payment_service.entity.PaymentStatus;

public record ConfirmPaymentResponse(
        Long paymentId,
        PaymentStatus status,
        String bookingStatus
) {
}
