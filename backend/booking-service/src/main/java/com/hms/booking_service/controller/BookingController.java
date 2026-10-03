package com.hms.booking_service.controller;

import com.hms.booking_service.dto.*;
import com.google.firebase.auth.FirebaseToken;
import com.hms.booking_service.exception.UnauthorizedException;
import com.hms.booking_service.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
            @Valid @RequestBody CreateBookingRequest request) {

        String customerId = currentUid();
        CreateBookingResponse response = bookingService.createBooking(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Booking created successfully.", response));
    }

    @GetMapping("/my")
    @Operation(summary = "Get the logged-in customer's bookings")
    public ResponseEntity<ApiResponse<List<BookingSummary>>> getMyBookings() {

        String customerId = currentUid();
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getMyBookings(customerId)));
    }

    @GetMapping("/my/{bookingId}")
    @Operation(summary = "Get a specific booking's details")
    public ResponseEntity<ApiResponse<BookingDetailResponse>> getBookingDetails(
            @PathVariable Long bookingId) {

        String customerId = currentUid();
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingDetail(customerId, bookingId)));
    }

    /** Owner-scoped amount/status lookup, called by payment-service with the customer's own token. */
    @GetMapping("/my/{bookingId}/payable")
    @Operation(summary = "Get id/owner/amount/status of one of the caller's bookings (for payment)")
    public ResponseEntity<BookingInternalResponse> getPayable(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingService.getOwnedBookingForPayment(currentUid(), bookingId));
    }

    @PostMapping("/{bookingId}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<ApiResponse<CancelBookingResponse>> cancelBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody CancelBookingRequest request) {

        String customerId = currentUid();
        CancelBookingResponse response = bookingService.cancelBooking(customerId, bookingId, request);
        return ResponseEntity.ok(ApiResponse.ok(response.message(), response));
    }

    /** The caller's Firebase UID from the verified ID token (set by FirebaseTokenFilter); 401 otherwise. */
    private static String currentUid() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof FirebaseToken token
                && token.getUid() != null && !token.getUid().isBlank()) {
            return token.getUid();
        }
        throw new UnauthorizedException("Authentication required");
    }
}
