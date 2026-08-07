package com.hms.payment_service.dto;

import java.math.BigDecimal;

public record BookingInfo(
        Long bookingId,
        Long customerId,
        BigDecimal totalAmount,
        String status
) {
}
