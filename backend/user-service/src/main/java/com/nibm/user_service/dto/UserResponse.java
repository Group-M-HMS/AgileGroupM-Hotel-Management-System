package com.nibm.user_service.dto;

import java.time.LocalDateTime;

public record UserResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        String phone,
        LocalDateTime createdAt
) {
    public UserResponse(String email, String firstName, String lastName, String phone) {
        this(null, email, firstName, lastName, phone, null);
    }
}