package com.hms.booking_service.exception;

public class BookingNotFoundException extends RuntimeException {
    public BookingNotFoundException(Long bookingId) {
        super("Booking not found: " + bookingId);
    }
}
