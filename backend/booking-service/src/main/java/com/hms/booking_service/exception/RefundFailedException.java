package com.hms.booking_service.exception;

public class RefundFailedException extends RuntimeException {
    public RefundFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
