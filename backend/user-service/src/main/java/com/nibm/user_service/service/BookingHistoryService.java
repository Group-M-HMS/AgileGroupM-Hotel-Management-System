package com.nibm.user_service.service;

import com.nibm.user_service.dto.BookingDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class BookingHistoryService {

    private final RestClient roomServiceClient;

    public BookingHistoryService(RestClient roomServiceClient) {
        this.roomServiceClient = roomServiceClient;
    }

    private List<BookingDto> fetchAllBookings(String email) {
        BookingDto[] bookings = roomServiceClient.get()
                .uri("/api/bookings?email={email}", email)
                .retrieve()
                .body(BookingDto[].class);
        return bookings != null ? List.of(bookings) : List.of();
    }

    public List<BookingDto> getUpcomingReservations(String email) {
        LocalDate today = LocalDate.now();
        return fetchAllBookings(email).stream()
                .filter(b -> !b.checkOut().isBefore(today)) // NIBM2-358: upcoming = checkout today or later
                .sorted(Comparator.comparing(BookingDto::checkIn)) // date order
                .toList();
    }

    public List<BookingDto> getPastReservations(String email) {
        LocalDate today = LocalDate.now();
        return fetchAllBookings(email).stream()
                .filter(b -> b.checkOut().isBefore(today)) // NIBM2-360: past = checkout already happened
                .sorted(Comparator.comparing(BookingDto::checkIn).reversed()) // most recent past stay first
                .toList();
    }

    public BookingDto getBookingForItinerary(String email, Long bookingId) {
        return fetchAllBookings(email).stream()
                .filter(b -> b.id().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No booking found matching that email and id"));
    }
}
