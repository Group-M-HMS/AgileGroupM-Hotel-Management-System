package com.hms.pricing_service.dto;

import java.math.BigDecimal;

public record QuoteResponse(BigDecimal nightlyRate,
                            Integer nights,
                            BigDecimal subtotal,
                            BigDecimal tax,
                            BigDecimal total) {
}
