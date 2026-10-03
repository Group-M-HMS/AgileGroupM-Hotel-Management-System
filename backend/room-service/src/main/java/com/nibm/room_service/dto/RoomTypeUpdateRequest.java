package com.nibm.room_service.dto;

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
        String title,

        String shortDescription,

        String fullDescription,

        @NotNull(message = "Price per night is required")
        @DecimalMin(value = "0.01", message = "Price per night must be greater than 0")
        BigDecimal pricePerNight,

        @NotNull(message = "Max occupancy is required")
        @Min(value = 1, message = "Max occupancy must be at least 1")
        Integer maxOccupancy,

        Integer sizeSqm,

        String bedType,

        List<String> gallery,

        List<String> amenities
) {}
