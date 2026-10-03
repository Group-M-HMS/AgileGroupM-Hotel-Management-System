package com.nibm.room_service.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public, guest-facing summary of one room type (no room numbers or other per-unit data).
 * Price is the lowest nightly rate in the type; occupancy is the highest.
 */
public record RoomTypeResponse(
        String roomType,
        String title,
        String shortDescription,
        String fullDescription,
        BigDecimal pricePerNight,
        Integer maxOccupancy,
        Integer sizeSqm,
        String bedType,
        List<String> gallery,
        List<String> amenities
) {}
