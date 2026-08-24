package com.hms.booking_service.dto;

public record CheckOutRequest(
        String checkedBy,
        String remarks
) {}
