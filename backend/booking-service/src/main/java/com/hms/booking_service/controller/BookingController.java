package com.hms.booking_service.controller;

import com.hms.booking_service.dto.*;
import com.hms.booking_service.exception.UnauthorizedException;
import com.hms.booking_service.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Booking Service", description = "Creates and manages hotel bookings and check-in/out operations")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Create a booking")
    public ResponseEntity<ApiResponse<CreateBookingResponse>> createBooking(
            @RequestHeader(value = "X-User-Id", required = false) String customerId,
            @Valid @RequestBody CreateBookingRequest request) {

        requireAuthenticated(customerId);
        CreateBookingResponse response = bookingService.createBooking(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Booking created successfully.", response));
    }

    @GetMapping("/my")
    @Operation(summary = "Get the logged-in customer's bookings")
    public ResponseEntity<ApiResponse<List<BookingSummary>>> getMyBookings(
            @RequestHeader(value = "X-User-Id", required = false) String customerId) {

        requireAuthenticated(customerId);
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getMyBookings(customerId)));
    }

    @GetMapping("/my/{bookingId}")
    @Operation(summary = "Get a specific booking's details")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> getBookingDetails(
            @RequestHeader(value = "X-User-Id", required = false) String customerId,
            @PathVariable Long bookingId) {

        requireAuthenticated(customerId);
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingDetail(customerId, bookingId)));
    }

    /**
     * Check-in guest for confirmed reservation.
     * Subtask: NIBM2-558, NIBM2-609
     */
    @PostMapping("/{bookingId}/check-in")
    @Operation(summary = "Check in a guest for a reservation")
    public ResponseEntity<ApiResponse<CheckInOutResponse>> checkInGuest(
            @PathVariable Long bookingId,
            @RequestBody(required = false) CheckInRequest request) {

        CheckInOutResponse response = bookingService.checkInBooking(bookingId, request);
        return ResponseEntity.ok(ApiResponse.ok(response.message(), response));
    }

    /**
     * Check-out guest and queue room for cleaning.
     * Subtask: NIBM2-558, NIBM2-609
     */
    @PostMapping("/{bookingId}/check-out")
    @Operation(summary = "Check out a guest from a reservation")
    public ResponseEntity<ApiResponse<CheckInOutResponse>> checkOutGuest(
            @PathVariable Long bookingId,
            @RequestBody(required = false) CheckOutRequest request) {

        CheckInOutResponse response = bookingService.checkOutBooking(bookingId, request);
        return ResponseEntity.ok(ApiResponse.ok(response.message(), response));
    }

    @PostMapping("/{bookingId}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<ApiResponse<CancelBookingResponse>> cancelBooking(
            @RequestHeader(value = "X-User-Id", required = false) String customerId,
            @PathVariable Long bookingId,
            @Valid @RequestBody CancelBookingRequest request) {

        requireAuthenticated(customerId);
        CancelBookingResponse response = bookingService.cancelBooking(customerId, bookingId, request);
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled successfully.", response));
    }

    /** NIBM2-468: reject any booking-confirmation-adjacent request without an authenticated session. */
    private void requireAuthenticated(String customerId) {
        if (customerId == null || customerId.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }
    }
}
