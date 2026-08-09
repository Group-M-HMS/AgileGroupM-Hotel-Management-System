package com.hms.booking_service.dto;

import java.math.BigDecimal;

public record BookingInternalResponse(
        Long bookingId,
        String customerId,
        BigDecimal totalAmount,
        String status
) {
}
