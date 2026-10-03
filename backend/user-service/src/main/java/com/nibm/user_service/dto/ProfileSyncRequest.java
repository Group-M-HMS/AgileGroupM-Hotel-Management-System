package com.nibm.user_service.dto;

import jakarta.validation.constraints.Size;
public record ProfileSyncRequest(
        @Size(max = 100, message = "First name must be at most 100 characters") String firstName,
        @Size(max = 100, message = "Last name must be at most 100 characters") String lastName,
        @Size(max = 30, message = "Phone must be at most 30 characters") String phone) {}