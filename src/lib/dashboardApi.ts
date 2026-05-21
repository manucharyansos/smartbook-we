import { api } from "./api";

export type DashboardResponse = {
  data: {
    business: {
      id: number;
      name: string;
      timezone: string;
    };
    today: {
      total: number;
      confirmed: number;
      pending: number;
      cancelled: number;
      revenue: number;
    };
    upcoming: {
      next_7_days: number;
      rows: Array<{
        id: number;
        client_name: string;
        status: string;
        starts_at: string | null;
        ends_at: string | null;
        service: { id: number; name: string } | null;
        staff: { id: number; name: string } | null;
        location: { id: number; name: string } | null;
      }>;
    };
    counts: {
      staff: number;
      services: number;
      locations: number;
    };
    usage: {
      staff: { current: number; limit: number | null };
      services: { current: number; limit: number | null };
      locations: { current: number; limit: number | null };
    };
    highlights_30d: {
      top_staff: { id: number; name: string; bookings: number } | null;
      top_service: { id: number; name: string; bookings: number } | null;
      bookings_by_location: Array<{
        location_id: number;
        location_name: string;
        bookings: number;
      }>;
    };
    currency: string;
  };
};

export async function fetchDashboardSummary() {
  const r = await api.get<DashboardResponse>("/dashboard");
  return r.data.data;
}
