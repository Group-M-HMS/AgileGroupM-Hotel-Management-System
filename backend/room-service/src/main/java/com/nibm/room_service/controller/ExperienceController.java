package com.nibm.room_service.controller;

import com.nibm.room_service.dto.ApiResponse;
import com.nibm.room_service.dto.PublicExperienceResponse;
import com.nibm.room_service.service.ExperienceAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceAdminService experienceAdminService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PublicExperienceResponse>>> getExperiences() {
        List<PublicExperienceResponse> experiences = experienceAdminService.getPublicExperiences();
        return ResponseEntity.ok(ApiResponse.success("Experiences retrieved successfully", experiences));
    }
}
