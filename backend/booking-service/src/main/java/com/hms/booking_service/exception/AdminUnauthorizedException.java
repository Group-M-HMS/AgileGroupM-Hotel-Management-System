package com.hms.booking_service.exception;

/**
 * TEMPORARY stopgap for admin auth - a shared secret, not real authentication.
 * Replace with Firebase ID token + admin custom claim verification before
 * this goes anywhere near production. See "Before you start" at the top of this guide.
 */
public class AdminUnauthorizedException extends RuntimeException {
    public AdminUnauthorizedException(String message) {
        super(message);
    }
}
