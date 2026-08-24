package com.hms.booking_service.controller;

import com.hms.booking_service.dto.ApiResponse;
import com.hms.booking_service.dto.GlobalSearchResponse;
import com.hms.booking_service.service.GlobalSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Global Search", description = "Multi-entity cross-search across rooms, guests, and bookings")
public class GlobalSearchController {

    private final GlobalSearchService globalSearchService;

    public GlobalSearchController(GlobalSearchService globalSearchService) {
        this.globalSearchService = globalSearchService;
    }

    /**
     * Cross-entity global search across rooms, guests, and bookings.
     * Subtask: NIBM2-611, NIBM2-612
     */
    @GetMapping({"/api/admin/search", "/api/v1/search", "/api/search"})
    @Operation(summary = "Global search across rooms, guests, and bookings")
    public ResponseEntity<ApiResponse<GlobalSearchResponse>> search(
            @RequestParam(name = "q", required = false, defaultValue = "") String query,
            @RequestParam(name = "limit", required = false, defaultValue = "5") int limit) {

        GlobalSearchResponse response = globalSearchService.search(query, limit);
        return ResponseEntity.ok(ApiResponse.ok("Search results retrieved successfully", response));
    }
}
