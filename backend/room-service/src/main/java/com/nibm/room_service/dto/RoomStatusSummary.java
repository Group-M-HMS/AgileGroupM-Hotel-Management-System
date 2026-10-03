package com.nibm.room_service.dto;

import com.nibm.room_service.entity.RoomStatus;

/** Minimal per-unit view for booking-service (dashboard counts, global search). */
public record RoomStatusSummary(
        Long id,
        String roomNumber,
        String title,
        String bedType,
        String roomType,
        RoomStatus status
) {}
