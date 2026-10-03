package com.hms.booking_service.controller;

import com.hms.booking_service.dto.BookingConfirmPaymentRequest;
import com.hms.booking_service.dto.BookingConfirmPaymentResponse;
import com.hms.booking_service.dto.BookingInternalResponse;
import com.hms.booking_service.exception.UnauthorizedException;
import com.hms.booking_service.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings/internal")
@Tag(name = "Booking Service (Internal)", description = "Service-to-service endpoints, not customer-facing")
public class BookingInternalController {

    private final BookingService bookingService;
    private final String internalSecret;

    public BookingInternalController(BookingService bookingService,
                                      @Value("${internal.service-secret}") String internalSecret) {
        this.bookingService = bookingService;
        this.internalSecret = internalSecret;
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "[internal] Fetch booking amount/status for Payment Service")
    public ResponseEntity<BookingInternalResponse> getBookingInternal(
            @RequestHeader(value = "X-Internal-Secret", required = false) String providedSecret,
            @PathVariable Long bookingId) {

        requireValidInternalSecret(providedSecret);
        return ResponseEntity.ok(bookingService.getBookingInternal(bookingId));
    }

    @GetMapping("/booked-room-ids")
    @Operation(summary = "[internal] Room ids held by a non-cancelled booking overlapping [from, to), for Room Service search")
    public ResponseEntity<List<Long>> getBookedRoomIds(
            @RequestHeader(value = "X-Internal-Secret", required = false) String providedSecret,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        requireValidInternalSecret(providedSecret);
        return ResponseEntity.ok(bookingService.getBookedRoomIds(from, to));
    }

    @PostMapping("/{bookingId}/confirm-payment")
    @Operation(summary = "[internal] Called by Payment Service once Stripe confirms payment succeeded")
    public ResponseEntity<BookingConfirmPaymentResponse> confirmPayment(
            @RequestHeader(value = "X-Internal-Secret", required = false) String providedSecret,
            @PathVariable Long bookingId,
            @RequestBody BookingConfirmPaymentRequest request) {

        requireValidInternalSecret(providedSecret);
        return ResponseEntity.ok(bookingService.confirmPayment(bookingId, request));
    }

    /** NIBM2-468 applied to the internal contract: reject unauthenticated service calls. */
    private void requireValidInternalSecret(String providedSecret) {
        if (providedSecret == null || !providedSecret.equals(internalSecret)) {
            throw new UnauthorizedException("Missing or invalid internal service credentials");
        }
    }
}
