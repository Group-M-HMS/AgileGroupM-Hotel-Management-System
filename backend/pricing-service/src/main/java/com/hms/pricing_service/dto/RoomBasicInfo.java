package com.hms.pricing_service.dto;

import java.math.BigDecimal;

public record RoomBasicInfo(Long id,
                            String name,
                            BigDecimal pricePerNight) {
}
