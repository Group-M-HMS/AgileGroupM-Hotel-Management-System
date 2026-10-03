package com.nibm.room_service.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.DecimalMax;
import com.nibm.room_service.entity.ExperienceCategory;
import com.nibm.room_service.entity.ExperienceDifficulty;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateExperienceRequest {

    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;
    @Size(max = 2000, message = "Short description must be at most 2000 characters")
    private String shortDescription;
    @Size(max = 10000, message = "Long description must be at most 10000 characters")
    private String longDescription;

    @Positive(message = "Price must be positive")
    @DecimalMax(value = "100000", message = "Price is unrealistically high")
    private BigDecimal price;

    private String imageUrl;

    @Positive(message = "Duration must be positive")
    @Max(value = 240, message = "Duration must be at most 240 hours")
    private Integer durationHours;

    private ExperienceCategory category;
    private ExperienceDifficulty difficulty;
    private Boolean active;
}
