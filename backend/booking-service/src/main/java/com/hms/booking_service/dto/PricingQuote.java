package com.hms.booking_service.dto;

import java.math.BigDecimal;

public record PricingQuote(
        BigDecimal nightlyRate,
        Integer nights,
        BigDecimal subtotal,
        BigDecimal tax,
        BigDecimal total
) {
}
