package com.hms.pricing_service.controller;

import com.hms.pricing_service.dto.QuoteRequest;
import com.hms.pricing_service.dto.QuoteResponse;
import com.hms.pricing_service.dto.RoomPriceResponse;
import com.hms.pricing_service.service.PricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing")
@Tag(name = "Pricing Service", description = "Answers: how much does this room cost?")
public class PricingController {
    private final PricingService pricingService;

    public PricingController(PricingService pricingService) {
        this.pricingService = pricingService;
    }

    @PostMapping("/quote")
    @Operation(summary = "Calculate a booking quote: nightly rate, nights, subtotal, tax, total")
    public ResponseEntity<QuoteResponse> calculateQuote(@Valid @RequestBody QuoteRequest request) {
        return ResponseEntity.ok(pricingService.calculateQuote(request));
    }

    @GetMapping("/rooms/{roomId}")
    @Operation(summary = "Get the current nightly rate for a room")
    public ResponseEntity<RoomPriceResponse> getCurrentRoomPrice(@PathVariable Long roomId) {
        return ResponseEntity.ok(pricingService.getCurrentRoomPrice(roomId));
    }
}
