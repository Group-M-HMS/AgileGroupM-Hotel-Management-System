package com.hms.booking_service.service;

import com.hms.booking_service.client.RoomServiceClient;
import com.hms.booking_service.dto.DashboardMetricsResponse;
import com.hms.booking_service.dto.DashboardMetricsResponse.*;
import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.entity.BookingStatus;
import com.hms.booking_service.entity.RequestStatus;
import com.hms.booking_service.repository.BookingRepository;
import com.hms.booking_service.repository.GuestRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Aggregates live hotel KPI metrics for the Admin Dashboard overview.
 * Subtask: NIBM2-552
 */
@Service
public class DashboardMetricsService {

    private final BookingRepository bookingRepository;
    private final RoomServiceClient roomServiceClient;
    private final GuestRequestRepository guestRequestRepository;

    public DashboardMetricsService(BookingRepository bookingRepository,
                                   RoomServiceClient roomServiceClient,
                                   GuestRequestRepository guestRequestRepository) {
        this.bookingRepository = bookingRepository;
        this.roomServiceClient = roomServiceClient;
        this.guestRequestRepository = guestRequestRepository;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsResponse getMetrics() {
        LocalDate today = LocalDate.now();

        // 1. Revenue Calculations
        LocalDateTime startOfThisMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfNextMonth = startOfThisMonth.plusMonths(1);
        LocalDateTime startOfLastMonth = startOfThisMonth.minusMonths(1);

        BigDecimal thisMonthRevenue = bookingRepository.sumRevenueBetween(startOfThisMonth, startOfNextMonth);
        BigDecimal lastMonthRevenue = bookingRepository.sumRevenueBetween(startOfLastMonth, startOfThisMonth);

        double growth = 0.0;
        if (lastMonthRevenue != null && lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = thisMonthRevenue.subtract(lastMonthRevenue);
            growth = diff.divide(lastMonthRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        RevenueMetric revenue = new RevenueMetric(
                thisMonthRevenue != null ? thisMonthRevenue : BigDecimal.ZERO,
                lastMonthRevenue != null ? lastMonthRevenue : BigDecimal.ZERO,
                Math.round(growth * 10.0) / 10.0,
                "USD"
        );

        // 2. Room Operational Status & Occupancy
        RoomStatusCounts roomCounts = roomServiceClient.getRoomStatusCounts();
        int totalRooms = roomCounts.available() + roomCounts.occupied() + roomCounts.cleaning() + roomCounts.maintenance();
        if (totalRooms == 0) totalRooms = 50; // default resort room count fallback

        int inService = roomCounts.occupied() + roomCounts.cleaning() + roomCounts.maintenance();
        int occupancyPercent = (int) Math.round(((double) inService / totalRooms) * 100);

        OccupancyMetric occupancy = new OccupancyMetric(
                occupancyPercent,
                inService,
                totalRooms,
                roomCounts.available()
        );

        // 3. Today's Check-ins & Departures
        List<Booking> todayArrivals = bookingRepository.findByCheckInDateAndStatusNot(today, BookingStatus.CANCELLED);
        int arrivedCount = (int) todayArrivals.stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN || b.getStatus() == BookingStatus.CHECKED_OUT)
                .count();
        int pendingArrivals = todayArrivals.size() - arrivedCount;

        List<Booking> todayDepartures = bookingRepository.findByCheckOutDateAndStatusNot(today, BookingStatus.CANCELLED);
        int departedCount = (int) todayDepartures.stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT)
                .count();

        CheckInMetric checkIns = new CheckInMetric(
                todayArrivals.size(),
                arrivedCount,
                pendingArrivals,
                todayDepartures.size(),
                departedCount
        );

        // 4. Activity & Alerts
        long totalBookings = bookingRepository.count();
        long activeStays = bookingRepository.countByStatus(BookingStatus.CHECKED_IN);
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long pendingAlerts = guestRequestRepository.countByStatus(RequestStatus.PENDING);

        ActivityMetric activity = new ActivityMetric(
                pendingAlerts,
                totalBookings,
                activeStays,
                confirmedBookings
        );

        return new DashboardMetricsResponse(revenue, occupancy, checkIns, activity, roomCounts);
    }
}
