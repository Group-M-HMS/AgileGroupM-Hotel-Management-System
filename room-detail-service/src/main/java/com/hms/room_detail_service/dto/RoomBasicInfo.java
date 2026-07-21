package com.hms.room_detail_service.dto;

public record RoomBasicInfo (
        Long id,
        String name,
        String description,
        Integer maxOccupancy
) {
}
