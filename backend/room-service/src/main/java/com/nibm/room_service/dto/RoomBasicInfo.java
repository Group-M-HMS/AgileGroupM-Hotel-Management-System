package com.nibm.room_service.dto;

public record RoomBasicInfo (
        Long id,
        String name,
        String description,
        Integer maxOccupancy,
        Integer sizeSqm,
        Integer bedCount,
        String bedType,
        Float rating,
        Integer reviewCount
) {}
