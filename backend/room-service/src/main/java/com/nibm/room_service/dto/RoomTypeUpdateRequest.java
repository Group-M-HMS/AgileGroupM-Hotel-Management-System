package com.nibm.room_service.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

/**
 * Type-level fields, applied to every (non-deleted) room of the room type. Unit-level fields
 * (room number, status) are deliberately absent. Null gallery/amenities leave them unchanged.
 */
public record RoomTypeUpdateRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be at most 255 characters")
        String title,

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

        @Size(max = 50, message = "Bed type must be at most 50 characters")
        String bedType,

        @Size(max = 30, message = "At most 30 gallery images")
        List<String> gallery,

        @Size(max = 50, message = "At most 50 amenities")
        List<String> amenities
) {}
