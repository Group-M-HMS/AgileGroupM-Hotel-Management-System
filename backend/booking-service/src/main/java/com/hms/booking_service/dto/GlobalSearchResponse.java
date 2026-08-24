package com.hms.booking_service.dto;

import java.util.List;

public record GlobalSearchResponse(
        String query,
        int totalMatches,
        List<SearchRoomResult> rooms,
        List<SearchGuestResult> guests,
        List<SearchBookingResult> bookings
) {
    public record SearchRoomResult(
            Long id,
            String number,
            String title,
            String bedType,
            String roomType,
            String status
    ) {}

    public record SearchGuestResult(
            String id,
            String name,
            String email,
            String phone
    ) {}

    public record SearchBookingResult(
            Long id,
            String ref,
            String guestName,
            String roomTitle,
            String status,
            String checkInDate,
            String checkOutDate
    ) {}
}
