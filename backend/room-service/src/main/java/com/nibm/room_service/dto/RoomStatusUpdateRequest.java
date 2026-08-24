package com.nibm.room_service.dto;

import com.nibm.room_service.entity.RoomStatus;
import jakarta.validation.constraints.NotNull;

public record RoomStatusUpdateRequest(
        @NotNull(message = "Room status is required")
        RoomStatus status,

        String remarks,

        String changedBy,

        String guestName
) {}
