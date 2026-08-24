package com.nibm.room_service.dto;

import com.nibm.room_service.entity.RoomStatus;

import java.time.LocalDateTime;

public record RoomStatusUpdateResponse(
        Long roomId,
        String roomNumber,
        String title,
        RoomStatus previousStatus,
        RoomStatus currentStatus,
        String guestName,
        String updatedBy,
        String remarks,
        LocalDateTime timestamp
) {}
