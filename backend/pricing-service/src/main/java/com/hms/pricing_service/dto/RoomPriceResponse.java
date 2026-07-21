package com.hms.pricing_service.dto;

import java.math.BigDecimal;

public record RoomPriceResponse(Long roomId,
                                BigDecimal nightlyRate) {
}
