package com.nibm.room_service.dto;

import com.nibm.room_service.entity.ExperienceCategory;
import com.nibm.room_service.entity.ExperienceDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateExperienceRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String shortDescription;
    private String longDescription;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private String imageUrl;

    @Positive(message = "Duration must be positive")
    private Integer durationHours;

    @NotNull(message = "Category is required")
    private ExperienceCategory category;

    @NotNull(message = "Difficulty is required")
    private ExperienceDifficulty difficulty;
    
    private boolean active = true;
}
