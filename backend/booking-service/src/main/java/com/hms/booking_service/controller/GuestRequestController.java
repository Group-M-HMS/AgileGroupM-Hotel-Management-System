package com.hms.booking_service.controller;

import com.hms.booking_service.dto.*;
import com.hms.booking_service.service.GuestRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/alerts")
@Tag(name = "Guest Requests & Activity Alerts", description = "In-room guest requests, payment logs, and activity notifications")
public class GuestRequestController {

    private final GuestRequestService guestRequestService;

    public GuestRequestController(GuestRequestService guestRequestService) {
        this.guestRequestService = guestRequestService;
    }

    /**
     * List activity alerts with optional status (pending, approved, dismissed) or kind filter.
     * Subtask: NIBM2-613, NIBM2-614
     */
    @GetMapping
    @Operation(summary = "List activity alerts and guest requests")
    public ResponseEntity<ApiResponse<List<GuestRequestResponse>>> listAlerts(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "kind", required = false) String kind) {

        List<GuestRequestResponse> alerts = guestRequestService.listAlerts(status, kind);
        return ResponseEntity.ok(ApiResponse.ok("Alerts retrieved successfully", alerts));
    }

    /**
     * Get aggregate statistics for activity alerts.
     * Subtask: NIBM2-613
     */
    @GetMapping("/stats")
    @Operation(summary = "Get alert counts (pending, approved, dismissed)")
    public ResponseEntity<ApiResponse<GuestRequestStatsResponse>> getStats() {
        GuestRequestStatsResponse stats = guestRequestService.getStats();
        return ResponseEntity.ok(ApiResponse.ok("Alert statistics retrieved successfully", stats));
    }

    /**
     * Submit an in-room request or activity alert.
     * Subtask: NIBM2-613, NIBM2-614
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create guest request or activity alert")
    public ResponseEntity<ApiResponse<GuestRequestResponse>> createRequest(
            @Valid @RequestBody CreateGuestRequestDto dto) {

        GuestRequestResponse response = guestRequestService.createRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Guest request created successfully", response));
    }

    /**
     * Approve or dismiss an alert.
     * Subtask: NIBM2-613
     */
    @PatchMapping("/{id}/resolve")
    @Operation(summary = "Resolve alert (approve or dismiss)")
    public ResponseEntity<ApiResponse<GuestRequestResponse>> resolveRequest(
            @PathVariable Long id,
            @Valid @RequestBody ResolveGuestRequestDto dto) {

        GuestRequestResponse response = guestRequestService.resolveRequest(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Alert resolved successfully", response));
    }
}
