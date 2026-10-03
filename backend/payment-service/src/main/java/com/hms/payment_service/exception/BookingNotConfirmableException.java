package com.hms.payment_service.exception;

/** Booking-service refused to confirm the booking (e.g. cancelled). Final, so the payment is refunded. */
public class BookingNotConfirmableException extends RuntimeException {
    public BookingNotConfirmableException(Long bookingId, int httpStatus) {
        super("Booking " + bookingId + " could not be confirmed (booking-service answered " + httpStatus + ")");
    }
}
