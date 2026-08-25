package com.hms.booking_service.controller;

import com.hms.booking_service.dto.*;
import com.hms.booking_service.entity.BookingStatus;
import com.hms.booking_service.service.BookingAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Staff-only admin console endpoints for the Bookings page.
 * NIBM2-577, 580, 583, 622.
 *
 * Auth: Spring Security requires a Firebase ID token with the "admin" custom claim on
 * everything under /api/admin/** (see SecurityConfig/FirebaseTokenFilter).
 */
@RestController
@RequestMapping("/api/admin/bookings")
@Tag(name = "Booking Service (Admin)", description = "Staff-only booking ledger, check-in/out, walk-ins")
public class BookingAdminController {

    private final BookingAdminService bookingAdminService;

    public BookingAdminController(BookingAdminService bookingAdminService) {
        this.bookingAdminService = bookingAdminService;
    }

    @GetMapping
    @Operation(summary = "NIBM2-577: search/filter/paginate the full booking ledger")
    public ResponseEntity<ApiResponse<PagedResponse<AdminBookingSummary>>> searchBookings(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String guestId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(
                bookingAdminService.searchBookings(q, status, guestId, page, size)));
    }

    @GetMapping("/schedule")
    @Operation(summary = "NIBM2-583: bookings overlapping a date range, for the calendar timeline")
    public ResponseEntity<ApiResponse<List<ScheduleEntry>>> getSchedule(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {

        return ResponseEntity.ok(ApiResponse.ok(bookingAdminService.getSchedule(from, to)));
    }

    @PostMapping("/walk-in")
    @Operation(summary = "NIBM2-622: front-desk booking, no customer account required")
    public ResponseEntity<ApiResponse<CreateBookingResponse>> createWalkInBooking(
            @Valid @RequestBody WalkInBookingRequest request) {

        CreateBookingResponse response = bookingAdminService.createWalkInBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PostMapping("/{bookingId}/check-in")
    @Operation(summary = "NIBM2-580/619: CONFIRMED -> CHECKED_IN, syncs room to OCCUPIED")
    public ResponseEntity<ApiResponse<BookingStatusChangeResponse>> checkIn(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingAdminService.checkIn(bookingId)));
    }

    @PostMapping("/{bookingId}/check-out")
    @Operation(summary = "NIBM2-580/619: CHECKED_IN -> CHECKED_OUT, syncs room to CLEANING")
    public ResponseEntity<ApiResponse<BookingStatusChangeResponse>> checkOut(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingAdminService.checkOut(bookingId)));
    }

    @PostMapping("/{bookingId}/cancel")
    @Operation(summary = "Staff-side cancel with mandatory reason")
    public ResponseEntity<ApiResponse<BookingStatusChangeResponse>> adminCancel(
            @PathVariable Long bookingId,
            @Valid @RequestBody CancelBookingRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                bookingAdminService.adminCancel(bookingId, request.reason())));
    }
}
