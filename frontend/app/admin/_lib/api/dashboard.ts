import { bookingAdminFetch } from './config';

export interface DashboardMetrics {
  monthlyRevenue: number;
  lastMonthRevenue: number;
  growthPercentage: number;
  occupancyPercentage: number;
  inServiceRooms: number;
  totalRooms: number;
  availableRooms: number;
  todayTotalArrivals: number;
  arrivedTodayCount: number;
  pendingArrivalsCount: number;
  pendingAlerts: number;
}

interface DashboardMetricsResponseDto {
  revenue: { monthlyRevenue: number; lastMonthRevenue: number; growthPercentage: number; currency: string };
  occupancy: { occupancyPercentage: number; inServiceRooms: number; totalRooms: number; availableRooms: number };
  checkIns: {
    todayTotalArrivals: number;
    arrivedTodayCount: number;
    pendingArrivalsCount: number;
    todayTotalDepartures: number;
    departedTodayCount: number;
  };
  activity: { pendingAlerts: number; totalBookings: number; activeStays: number; confirmedBookings: number };
  roomStatusCounts: { available: number; occupied: number; cleaning: number; maintenance: number };
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const dto = await bookingAdminFetch<DashboardMetricsResponseDto>('/api/admin/metrics');
  return {
    monthlyRevenue: dto.revenue.monthlyRevenue,
    lastMonthRevenue: dto.revenue.lastMonthRevenue,
    growthPercentage: dto.revenue.growthPercentage,
    occupancyPercentage: dto.occupancy.occupancyPercentage,
    inServiceRooms: dto.occupancy.inServiceRooms,
    totalRooms: dto.occupancy.totalRooms,
    availableRooms: dto.occupancy.availableRooms,
    todayTotalArrivals: dto.checkIns.todayTotalArrivals,
    arrivedTodayCount: dto.checkIns.arrivedTodayCount,
    pendingArrivalsCount: dto.checkIns.pendingArrivalsCount,
    pendingAlerts: dto.activity.pendingAlerts,
  };
}
