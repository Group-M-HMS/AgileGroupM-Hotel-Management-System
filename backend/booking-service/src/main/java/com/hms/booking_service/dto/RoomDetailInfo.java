package com.hms.booking_service.dto;

public record RoomDetailInfo(
        Long id,
        String name,
        String description,
        Integer maxOccupancy
) {
}
