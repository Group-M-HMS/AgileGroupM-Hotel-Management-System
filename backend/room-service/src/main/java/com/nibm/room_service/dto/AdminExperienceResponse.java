package com.nibm.room_service.dto;

import com.nibm.room_service.entity.ExperienceCategory;
import com.nibm.room_service.entity.ExperienceDifficulty;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminExperienceResponse {
    private Long id;
    private String title;
    private String shortDescription;
    private String longDescription;
    private BigDecimal price;
    private String imageUrl;
    private Integer durationHours;
    private ExperienceCategory category;
    private ExperienceDifficulty difficulty;
    private boolean active;
    private LocalDateTime createdAt;
}
