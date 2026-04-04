import { api } from "./api";

export type AnalyticsOverview = {
  business?: { id: number; name: string; type?: string };
  today: { bookings: number; revenue: number };
  last_7_days: { bookings: number; revenue: number; unique_clients?: number };
  trend: Array<{ date: string; bookings: number; revenue: number }>;
  source_breakdown?: Array<{ source: string; bookings: number; revenue: number }>;
  status_breakdown?: Array<{ status: string; count: number }>;
  metrics_30d?: {
    window_bookings: number;
    paid_bookings: number;
    window_revenue: number;
    avg_ticket: number;
    done_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    no_show_bookings: number;
    completion_rate: number;
    cancellation_rate: number;
    no_show_rate: number;
  };
  currency: string;
};

export type RevenueData = {
  months: Array<{ year_month: string; revenue: number; bookings: number }>;
  currency: string;
};

export type ServiceStats = {
  top: Array<{ service_id: number; service_name: string; bookings: number; revenue: number }>;
  currency: string;
};

export type StaffStats = {
  rows: Array<{ staff_id: number; staff_name: string; bookings: number; revenue: number }>;
  currency: string;
};

export type SourceStats = {
  rows: Array<{ source: string; bookings: number; revenue: number }>;
  currency: string;
};

export type ClientInsights = {
  window_days: number;
  lost_threshold_days: number;
  active_clients: number;
  new_clients: number;
  returning_clients: number;
  lost_clients: number;
  vip_clients: number;
  blacklisted_clients: number;
  rebooking_rate: number;
  group_rows: Array<{ group_name: string; clients: number }>;
  status_rows?: Array<{ status: string; count: number }>;
  lost_rows: Array<{
    client_id: number;
    name: string;
    phone?: string | null;
    group_name?: string | null;
    is_vip?: boolean;
    is_blacklisted?: boolean;
    last_booking_at?: string | null;
    total_spent: number;
    total_bookings: number;
  }>;
};

export async function fetchAnalyticsOverview(params?: { source?: string; staff_id?: number | null }) {
  const r = await api.get("/analytics/overview", { params });
  return r.data.data as AnalyticsOverview;
}

export async function fetchRevenue(months: number, params?: { source?: string; staff_id?: number | null }) {
  const r = await api.get("/analytics/revenue", { params: { months, ...params } });
  return r.data.data as RevenueData;
}

export async function fetchServiceStats(params?: { days?: number; source?: string; staff_id?: number | null }) {
  const r = await api.get("/analytics/services", { params });
  return r.data.data as ServiceStats;
}

export async function fetchStaffStats(params?: { days?: number; source?: string; staff_id?: number | null }) {
  const r = await api.get("/analytics/staff", { params });
  return r.data.data as StaffStats;
}

export async function fetchSourceStats(params?: { days?: number; source?: string; staff_id?: number | null }) {
  const r = await api.get("/analytics/sources", { params });
  return r.data.data as SourceStats;
}

export async function fetchClientInsights(params?: { days?: number; lost_days?: number; source?: string; staff_id?: number | null }) {
  const r = await api.get("/analytics/clients", { params });
  return r.data.data as ClientInsights;
}
