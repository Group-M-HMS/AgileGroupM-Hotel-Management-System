package com.nibm.room_service.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record RoomUpdateRequest(
        @Size(max = 255, message = "Title must be at most 255 characters")
        String title,

        @Size(max = 50, message = "Room number must be at most 50 characters")
        String roomNumber,

        @Size(max = 100, message = "Room type must be at most 100 characters")
        String roomType,

        @Size(max = 2000, message = "Short description must be at most 2000 characters")
        String shortDescription,

        @Size(max = 10000, message = "Full description must be at most 10000 characters")
        String fullDescription,

        @NotNull(message = "Price per night is required")
        @DecimalMin(value = "0.01", message = "Price per night must be greater than 0")
        @DecimalMax(value = "100000", message = "Price per night is unrealistically high")
        BigDecimal pricePerNight,

        @NotNull(message = "Max occupancy is required")
        @Min(value = 1, message = "Max occupancy must be at least 1")
        @Max(value = 20, message = "Max occupancy must be at most 20")
        Integer maxOccupancy,

        @Min(value = 1, message = "Size must be positive")
        @Max(value = 10000, message = "Size is unrealistically large")
        Integer sizeSqm,

        @Min(value = 1, message = "Bed count must be positive")
        @Max(value = 20, message = "Bed count is unrealistically high")
        Integer bedCount,

        @Size(max = 50, message = "Bed type must be at most 50 characters")
        String bedType,

        String thumbnailUrl,

        @Size(max = 30, message = "At most 30 gallery images")
        List<String> gallery,

        @Size(max = 50, message = "At most 50 amenities")
        List<String> amenities
) {}
