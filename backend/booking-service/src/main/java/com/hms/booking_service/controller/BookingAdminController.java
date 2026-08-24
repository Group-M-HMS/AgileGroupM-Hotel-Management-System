package com.hms.booking_service.controller;

import com.hms.booking_service.dto.*;
import com.hms.booking_service.entity.BookingStatus;
import com.hms.booking_service.exception.AdminUnauthorizedException;
import com.hms.booking_service.service.BookingAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Staff-only admin console endpoints for the Bookings page.
 * NIBM2-577, 580, 583, 622.
 *
 * Auth: X-Admin-Secret header, TEMPORARY stopgap - see "Before you start"
 * at the top of this guide. Do not treat this as real security; replace
 * with Firebase admin claim verification before any real deployment.
 */
@RestController
@RequestMapping("/api/admin/bookings")
@Tag(name = "Booking Service (Admin)", description = "Staff-only booking ledger, check-in/out, walk-ins")
public class BookingAdminController {

    private final BookingAdminService bookingAdminService;
    private final String adminSecret;

    public BookingAdminController(BookingAdminService bookingAdminService,
                                   @Value("${admin.shared-secret}") String adminSecret) {
        this.bookingAdminService = bookingAdminService;
        this.adminSecret = adminSecret;
    }

    @GetMapping
    @Operation(summary = "NIBM2-577: search/filter/paginate the full booking ledger")
    public ResponseEntity<ApiResponse<PagedResponse<AdminBookingSummary>>> searchBookings(
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String guestId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        requireAdmin(secret);
        return ResponseEntity.ok(ApiResponse.ok(
                bookingAdminService.searchBookings(q, status, guestId, page, size)));
    }

    @GetMapping("/schedule")
    @Operation(summary = "NIBM2-583: bookings overlapping a date range, for the calendar timeline")
    public ResponseEntity<ApiResponse<List<ScheduleEntry>>> getSchedule(
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {

        requireAdmin(secret);
        return ResponseEntity.ok(ApiResponse.ok(bookingAdminService.getSchedule(from, to)));
    }

    @PostMapping("/walk-in")
    @Operation(summary = "NIBM2-622: front-desk booking, no customer account required")
    public ResponseEntity<ApiResponse<CreateBookingResponse>> createWalkInBooking(
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret,
            @Valid @RequestBody WalkInBookingRequest request) {

        requireAdmin(secret);
        CreateBookingResponse response = bookingAdminService.createWalkInBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PostMapping("/{bookingId}/check-in")
    @Operation(summary = "NIBM2-580/619: CONFIRMED -> CHECKED_IN, syncs room to OCCUPIED")
    public ResponseEntity<ApiResponse<BookingStatusChangeResponse>> checkIn(
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret,
            @PathVariable Long bookingId) {

        requireAdmin(secret);
        return ResponseEntity.ok(ApiResponse.ok(bookingAdminService.checkIn(bookingId)));
    }

    @PostMapping("/{bookingId}/check-out")
    @Operation(summary = "NIBM2-580/619: CHECKED_IN -> CHECKED_OUT, syncs room to CLEANING")
    public ResponseEntity<ApiResponse<BookingStatusChangeResponse>> checkOut(
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret,
            @PathVariable Long bookingId) {

        requireAdmin(secret);
        return ResponseEntity.ok(ApiResponse.ok(bookingAdminService.checkOut(bookingId)));
    }

    @PostMapping("/{bookingId}/cancel")
    @Operation(summary = "Staff-side cancel with mandatory reason")
    public ResponseEntity<ApiResponse<BookingStatusChangeResponse>> adminCancel(
            @RequestHeader(value = "X-Admin-Secret", required = false) String secret,
            @PathVariable Long bookingId,
            @Valid @RequestBody CancelBookingRequest request) {

        requireAdmin(secret);
        return ResponseEntity.ok(ApiResponse.ok(
                bookingAdminService.adminCancel(bookingId, request.reason())));
    }

    private void requireAdmin(String providedSecret) {
        if (providedSecret == null || !providedSecret.equals(adminSecret)) {
            throw new AdminUnauthorizedException("Missing or invalid admin credentials");
        }
    }
}
