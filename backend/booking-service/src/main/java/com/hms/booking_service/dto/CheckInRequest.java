package com.hms.booking_service.dto;

public record CheckInRequest(
        String checkedBy,
        String remarks,
        String guestName
) {}
