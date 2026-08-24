package com.nibm.room_service.controller;

import com.nibm.room_service.dto.AdminExperienceResponse;
import com.nibm.room_service.dto.ApiResponse;
import com.nibm.room_service.dto.CreateExperienceRequest;
import com.nibm.room_service.dto.UpdateExperienceRequest;
import com.nibm.room_service.exception.AdminUnauthorizedException;
import com.nibm.room_service.service.ExperienceAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/experiences")
@RequiredArgsConstructor
public class ExperienceAdminController {

    private final ExperienceAdminService experienceAdminService;

    @Value("${admin.secret}")
    private String adminSecret;

    private void validateAdminSecret(String secret) {
        if (secret == null || !secret.equals(adminSecret)) {
            throw new AdminUnauthorizedException("Invalid or missing admin secret");
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminExperienceResponse>>> getAllExperiences(
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret) {
        validateAdminSecret(secret);
        List<AdminExperienceResponse> experiences = experienceAdminService.getAllExperiences();
        return ResponseEntity.ok(ApiResponse.success("Experiences retrieved successfully", experiences));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminExperienceResponse>> getExperienceById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret) {
        validateAdminSecret(secret);
        AdminExperienceResponse experience = experienceAdminService.getExperienceById(id);
        return ResponseEntity.ok(ApiResponse.success("Experience retrieved successfully", experience));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminExperienceResponse>> createExperience(
            @Valid @RequestBody CreateExperienceRequest request,
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret) {
        validateAdminSecret(secret);
        AdminExperienceResponse experience = experienceAdminService.createExperience(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Experience created successfully", experience));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminExperienceResponse>> updateExperience(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExperienceRequest request,
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret) {
        validateAdminSecret(secret);
        AdminExperienceResponse experience = experienceAdminService.updateExperience(id, request);
        return ResponseEntity.ok(ApiResponse.success("Experience updated successfully", experience));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret) {
        validateAdminSecret(secret);
        experienceAdminService.deleteExperience(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Experience deleted successfully", null));
    }
}
