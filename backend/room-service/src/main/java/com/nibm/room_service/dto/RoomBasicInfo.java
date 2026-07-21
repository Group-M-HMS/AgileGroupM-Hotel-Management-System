package com.nibm.room_service.dto;

public record RoomBasicInfo (
        Long id,
        String name,
        String description,
        Integer maxOccupancy
) {
}
