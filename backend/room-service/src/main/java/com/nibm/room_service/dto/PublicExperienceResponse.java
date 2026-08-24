package com.nibm.room_service.dto;

import com.nibm.room_service.entity.ExperienceCategory;
import com.nibm.room_service.entity.ExperienceDifficulty;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PublicExperienceResponse {
    private Long id;
    private String title;
    private String shortDescription;
    private String longDescription;
    private BigDecimal price;
    private String imageUrl;
    private Integer durationHours;
    private ExperienceCategory category;
    private ExperienceDifficulty difficulty;
}
