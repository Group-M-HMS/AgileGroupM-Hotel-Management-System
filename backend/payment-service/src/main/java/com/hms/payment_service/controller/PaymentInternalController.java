package com.hms.payment_service.controller;

import com.hms.payment_service.dto.RefundBookingResponse;
import com.hms.payment_service.exception.UnauthorizedException;
import com.hms.payment_service.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/** Service-to-service endpoints for booking-service, guarded by X-Internal-Secret (fails closed if unset). */
@RestController
@RequestMapping("/api/v1/payments/internal")
@Tag(name = "Payment Service (Internal)", description = "Service-to-service endpoints, not customer-facing")
public class PaymentInternalController {

    private final PaymentService paymentService;
    private final byte[] internalSecret;

    public PaymentInternalController(PaymentService paymentService,
                                     @Value("${internal.service-secret}") String internalSecret) {
        this.paymentService = paymentService;
        this.internalSecret = internalSecret.getBytes(StandardCharsets.UTF_8);
    }

    @Operation(summary = "[internal] Fully refund the paid charge for a booking (idempotent)")
    @PostMapping("/booking/{bookingId}/refund")
    public RefundBookingResponse refundBooking(
            @RequestHeader(value = "X-Internal-Secret", required = false) String providedSecret,
            @PathVariable Long bookingId) {
        if (internalSecret.length == 0 || providedSecret == null
                || !MessageDigest.isEqual(internalSecret, providedSecret.getBytes(StandardCharsets.UTF_8))) {
            throw new UnauthorizedException("Invalid internal secret");
        }
        return paymentService.refundBooking(bookingId);
    }
}
