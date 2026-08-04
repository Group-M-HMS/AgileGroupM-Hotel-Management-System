package com.nibm.user_service.controller;

import com.google.firebase.auth.FirebaseToken;
import com.nibm.user_service.dto.BookingDto;
import com.nibm.user_service.service.BookingHistoryService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingHistoryController {

    private final BookingHistoryService bookingHistoryService;

    public BookingHistoryController(BookingHistoryService bookingHistoryService) {
        this.bookingHistoryService = bookingHistoryService;
    }

    @GetMapping("/upcoming")
    public List<BookingDto> getUpcoming() {
        return bookingHistoryService.getUpcomingReservations(currentEmail());
    }

    @GetMapping("/past")
    public List<BookingDto> getPast() {
        return bookingHistoryService.getPastReservations(currentEmail());
    }

    @GetMapping("/itinerary/{bookingId}")
    public BookingDto getItinerary(@PathVariable Long bookingId) {
        return bookingHistoryService.getBookingForItinerary(currentEmail(), bookingId);
    }

    private String currentEmail() {
        FirebaseToken token = (FirebaseToken) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return token.getEmail();
    }
}
