package com.hms.booking_service.controller;

import com.hms.booking_service.dto.ApiResponse;
import com.hms.booking_service.dto.DashboardMetricsResponse;
import com.hms.booking_service.service.DashboardMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Admin Dashboard Metrics", description = "Operational KPIs, occupancy rates, and revenue analytics")
public class DashboardMetricsController {

    private final DashboardMetricsService dashboardMetricsService;

    public DashboardMetricsController(DashboardMetricsService dashboardMetricsService) {
        this.dashboardMetricsService = dashboardMetricsService;
    }

    /**
     * Fetch executive dashboard KPIs (revenue, occupancy rate, today's arrivals, pending alerts).
     * Subtask: NIBM2-552
     */
    @GetMapping({"/api/admin/metrics", "/api/v1/admin/metrics", "/api/admin/dashboard/stats"})
    @Operation(summary = "Get admin dashboard KPI metrics and analytics")
    public ResponseEntity<ApiResponse<DashboardMetricsResponse>> getMetrics() {
        DashboardMetricsResponse metrics = dashboardMetricsService.getMetrics();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard metrics retrieved successfully", metrics));
    }
}
