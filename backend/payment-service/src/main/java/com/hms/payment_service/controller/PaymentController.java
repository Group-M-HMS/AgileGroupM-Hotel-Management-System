package com.hms.payment_service.controller;

import com.hms.payment_service.dto.*;
import com.hms.payment_service.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Callers authenticate with their Firebase ID token ({@code Authorization: Bearer}); it is forwarded
 * to booking-service, which decides whether the booking belongs to them. There is deliberately no
 * payment-history endpoint here: it used to trust a caller-supplied X-User-Id and nothing used it.
 */
@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payment Service", description = "Handles all payments via Stripe")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    @Operation(summary = "Create a Stripe PaymentIntent for one of the caller's bookings")
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        CreatePaymentResponse response = paymentService.createPayment(request, idempotencyKey, authorization);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Confirm a Stripe payment and complete the booking")
    public ResponseEntity<ApiResponse<ConfirmPaymentResponse>> confirmPayment(
            @Valid @RequestBody ConfirmPaymentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        ConfirmPaymentResponse response = paymentService.confirmPayment(request, authorization);
        return ResponseEntity.ok(ApiResponse.ok("Payment successful.", response));
    }
}
