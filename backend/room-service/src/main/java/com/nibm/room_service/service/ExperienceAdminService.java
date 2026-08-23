package com.nibm.room_service.service;

import com.nibm.room_service.dto.AdminExperienceResponse;
import com.nibm.room_service.dto.CreateExperienceRequest;
import com.nibm.room_service.dto.PublicExperienceResponse;
import com.nibm.room_service.dto.UpdateExperienceRequest;
import com.nibm.room_service.entity.Experience;
import com.nibm.room_service.exception.ExperienceNotFoundException;
import com.nibm.room_service.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExperienceAdminService {

    private final ExperienceRepository experienceRepository;

    public List<PublicExperienceResponse> getPublicExperiences() {
        return experienceRepository.findAllByActiveTrue().stream()
                .map(this::mapToPublicResponse)
                .collect(Collectors.toList());
    }

    public List<AdminExperienceResponse> getAllExperiences() {
        return experienceRepository.findAll().stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    public AdminExperienceResponse getExperienceById(Long id) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ExperienceNotFoundException("Experience not found with id: " + id));
        return mapToAdminResponse(experience);
    }

    @Transactional
    public AdminExperienceResponse createExperience(CreateExperienceRequest request) {
        Experience experience = new Experience();
        experience.setTitle(request.getTitle());
        experience.setShortDescription(request.getShortDescription());
        experience.setLongDescription(request.getLongDescription());
        experience.setPrice(request.getPrice());
        experience.setImageUrl(request.getImageUrl());
        experience.setDurationHours(request.getDurationHours());
        experience.setCategory(request.getCategory());
        experience.setDifficulty(request.getDifficulty());
        experience.setActive(request.isActive());

        Experience saved = experienceRepository.save(experience);
        return mapToAdminResponse(saved);
    }

    @Transactional
    public AdminExperienceResponse updateExperience(Long id, UpdateExperienceRequest request) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ExperienceNotFoundException("Experience not found with id: " + id));

        if (request.getTitle() != null) experience.setTitle(request.getTitle());
        if (request.getShortDescription() != null) experience.setShortDescription(request.getShortDescription());
        if (request.getLongDescription() != null) experience.setLongDescription(request.getLongDescription());
        if (request.getPrice() != null) experience.setPrice(request.getPrice());
        if (request.getImageUrl() != null) experience.setImageUrl(request.getImageUrl());
        if (request.getDurationHours() != null) experience.setDurationHours(request.getDurationHours());
        if (request.getCategory() != null) experience.setCategory(request.getCategory());
        if (request.getDifficulty() != null) experience.setDifficulty(request.getDifficulty());
        if (request.getActive() != null) experience.setActive(request.getActive());

        Experience updated = experienceRepository.save(experience);
        return mapToAdminResponse(updated);
    }

    @Transactional
    public void deleteExperience(Long id) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ExperienceNotFoundException("Experience not found with id: " + id));
        experience.setActive(false);
        experienceRepository.save(experience);
    }

    private AdminExperienceResponse mapToAdminResponse(Experience experience) {
        return AdminExperienceResponse.builder()
                .id(experience.getId())
                .title(experience.getTitle())
                .shortDescription(experience.getShortDescription())
                .longDescription(experience.getLongDescription())
                .price(experience.getPrice())
                .imageUrl(experience.getImageUrl())
                .durationHours(experience.getDurationHours())
                .category(experience.getCategory())
                .difficulty(experience.getDifficulty())
                .active(experience.isActive())
                .createdAt(experience.getCreatedAt())
                .build();
    }

    private PublicExperienceResponse mapToPublicResponse(Experience experience) {
        return PublicExperienceResponse.builder()
                .id(experience.getId())
                .title(experience.getTitle())
                .shortDescription(experience.getShortDescription())
                .longDescription(experience.getLongDescription())
                .price(experience.getPrice())
                .imageUrl(experience.getImageUrl())
                .durationHours(experience.getDurationHours())
                .category(experience.getCategory())
                .difficulty(experience.getDifficulty())
                .build();
    }
}
