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
import org.springframework.web.bind.annotation.*;

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
