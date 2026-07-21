package com.hms.room_detail_service.exception;

import org.springframework.web.bind.annotation.RestControllerAdvice;

public class RoomNotFoundException extends RuntimeException {
    public RoomNotFoundException(Long roomId) {
        super("Room not found: " + roomId);
    };
}
