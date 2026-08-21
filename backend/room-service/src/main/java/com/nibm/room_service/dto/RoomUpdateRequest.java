package com.nibm.room_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record RoomUpdateRequest(
        String title,

        String roomNumber,

        String roomType,

        String shortDescription,

        String fullDescription,

        @NotNull(message = "Price per night is required")
        @DecimalMin(value = "0.01", message = "Price per night must be greater than 0")
        BigDecimal pricePerNight,

        @NotNull(message = "Max occupancy is required")
        @Min(value = 1, message = "Max occupancy must be at least 1")
        Integer maxOccupancy,

        Integer sizeSqm,

        Integer bedCount,

        String bedType,

        String thumbnailUrl,

        List<String> gallery,

        List<String> amenities
) {}
