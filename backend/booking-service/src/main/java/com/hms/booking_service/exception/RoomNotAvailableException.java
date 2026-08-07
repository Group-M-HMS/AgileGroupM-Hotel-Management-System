package com.hms.booking_service.exception;


public class RoomNotAvailableException extends RuntimeException {
    public RoomNotAvailableException(Long roomId) {
        super("Room " + roomId + " is not available for the selected dates");
    }
}
