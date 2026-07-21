package com.hms.pricing_service.exception;

public class RoomNotFoundException extends RuntimeException  {
    public RoomNotFoundException(Long roomId) {
        super("Room not found: " + roomId);
    }
}
