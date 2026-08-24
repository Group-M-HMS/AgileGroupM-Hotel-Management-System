package com.hms.booking_service.dto;

public record GuestRequestStatsResponse(
        long total,
        long pending,
        long approved,
        long dismissed
) {}
