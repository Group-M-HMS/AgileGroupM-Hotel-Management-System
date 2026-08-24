package com.nibm.room_service.dto;

import com.nibm.room_service.entity.ExperienceCategory;
import com.nibm.room_service.entity.ExperienceDifficulty;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateExperienceRequest {

    private String title;
    private String shortDescription;
    private String longDescription;

    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private String imageUrl;

    @Positive(message = "Duration must be positive")
    private Integer durationHours;

    private ExperienceCategory category;
    private ExperienceDifficulty difficulty;
    private Boolean active;
}
