// src/lib/availabilityApi.ts
import { api } from "./api";

export type Slot = {
  starts_at: string;
  ends_at: string;
  staff_id?: number;
  staff_name?: string | null;
  smart_score?: number;
  smart_reason?: string | null;
  is_recommended?: boolean;
  recommendation_rank?: number | null;
};

export async function fetchAvailabilityDay(params: {
  service_id?: number;
  service_ids?: number[];
  staff_id?: number;
  date: string;
}) {
  const token = localStorage.getItem("token");

  const r = await api.get<Slot[]>("/availability", {
    params: { ...params, _t: Date.now() },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return Array.isArray(r.data) ? r.data : [];
}
