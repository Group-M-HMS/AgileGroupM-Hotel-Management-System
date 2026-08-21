package com.hms.booking_service.entity;

public enum BookingStatus {
    PENDING,
    CONFIRMED,
    CHECKED_IN,   // NIBM2-619 - new
    CHECKED_OUT,  // NIBM2-619 - new
    CANCELLED
}
