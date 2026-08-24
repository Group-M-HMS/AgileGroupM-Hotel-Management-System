package com.hms.booking_service.dto;

import java.math.BigDecimal;

public record DashboardMetricsResponse(
        RevenueMetric revenue,
        OccupancyMetric occupancy,
        CheckInMetric checkIns,
        ActivityMetric activity,
        RoomStatusCounts roomStatusCounts
) {
    public record RevenueMetric(
            BigDecimal monthlyRevenue,
            BigDecimal lastMonthRevenue,
            double growthPercentage,
            String currency
    ) {}

    public record OccupancyMetric(
            int occupancyPercentage,
            int inServiceRooms,
            int totalRooms,
            int availableRooms
    ) {}

    public record CheckInMetric(
            int todayTotalArrivals,
            int arrivedTodayCount,
            int pendingArrivalsCount,
            int todayTotalDepartures,
            int departedTodayCount
    ) {}

    public record ActivityMetric(
            long pendingAlerts,
            long totalBookings,
            long activeStays,
            long confirmedBookings
    ) {}

    public record RoomStatusCounts(
            int available,
            int occupied,
            int cleaning,
            int maintenance
    ) {}
}
