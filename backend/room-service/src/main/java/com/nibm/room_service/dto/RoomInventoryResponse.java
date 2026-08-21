package com.nibm.room_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record RoomInventoryResponse(
        Long id,
        String title,
        String roomNumber,
        String roomType,
        String shortDescription,
        String fullDescription,
        BigDecimal pricePerNight,
        Integer maxOccupancy,
        Integer sizeSqm,
        Integer bedCount,
        String bedType,
        String thumbnailUrl,
        Float averageRating,
        Integer reviewCount,
        List<String> gallery,
        List<String> amenities,
        LocalDateTime createdAt
) {}
