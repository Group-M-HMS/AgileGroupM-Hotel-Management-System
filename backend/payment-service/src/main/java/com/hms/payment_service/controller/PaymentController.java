package com.hms.payment_service.controller;

import com.hms.payment_service.dto.*;
import com.hms.payment_service.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payment Service", description = "Handles all payments via Stripe")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    @Operation(summary = "Create a Stripe PaymentIntent for a booking")
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,

            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {

        CreatePaymentResponse response = paymentService.createPayment(request, idempotencyKey);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Confirm a Stripe payment and complete the booking")
    public ResponseEntity<ApiResponse<ConfirmPaymentResponse>> confirmPayment(
            @Valid @RequestBody ConfirmPaymentRequest request) {

        ConfirmPaymentResponse response = paymentService.confirmPayment(request);
        return ResponseEntity.ok(ApiResponse.ok("Payment successful.", response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get the logged-in customer's payment history")
    public ResponseEntity<ApiResponse<java.util.List<PaymentHistoryItem>>> getPaymentHistory(

            @RequestHeader("X-User-Id") Long customerId) {

        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentHistory(customerId)));
    }
}
