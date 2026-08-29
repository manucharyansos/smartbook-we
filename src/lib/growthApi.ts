import { api } from "./api";

export type WaitlistStatus = "waiting" | "offered" | "booked" | "cancelled" | "expired";

export type WaitlistEntry = {
  id: number;
  service_id: number;
  staff_id: number | null;
  location_id: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  desired_date: string;
  window_start: string | null;
  window_end: string | null;
  party_size: number;
  status: WaitlistStatus;
  offered_starts_at: string | null;
  offered_ends_at: string | null;
  offer_expires_at: string | null;
  notes: string | null;
  service: { id: number; name: string; booking_mode: "individual" | "group"; capacity: number } | null;
  staff: { id: number; name: string } | null;
  offered_staff: { id: number; name: string } | null;
  created_at: string | null;
};

export async function fetchWaitlist(params?: { status?: WaitlistStatus | ""; date?: string }) {
  const response = await api.get("/waitlist", { params });
  return (response.data.data ?? []) as WaitlistEntry[];
}

export async function offerWaitlistEntry(id: number, payload: { staff_id: number; starts_at: string }) {
  const response = await api.post(`/waitlist/${id}/offer`, payload);
  return response.data.data as WaitlistEntry;
}

export async function updateWaitlistEntry(id: number, payload: { status: "waiting" | "cancelled"; notes?: string | null }) {
  const response = await api.patch(`/waitlist/${id}`, payload);
  return response.data.data as WaitlistEntry;
}

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";
export type CampaignSegment = "all" | "new" | "returning" | "inactive" | "vip";

export type MarketingCampaign = {
  id: number;
  name: string;
  channel: "email";
  segment: CampaignSegment;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  last_error: string | null;
  deliveries_count?: number;
  created_at: string;
};

export type CampaignPayload = {
  name: string;
  segment: CampaignSegment;
  subject: string;
  body: string;
  scheduled_for?: string | null;
};

export type MarketingDelivery = {
  id: number;
  email: string;
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
  error: string | null;
};

export async function fetchCampaigns() {
  const response = await api.get("/marketing/campaigns");
  return (response.data.data ?? []) as MarketingCampaign[];
}

export async function createCampaign(payload: CampaignPayload) {
  const response = await api.post("/marketing/campaigns", payload);
  return response.data as { data: MarketingCampaign; meta: { recipient_count: number } };
}

export async function updateCampaign(id: number, payload: CampaignPayload) {
  const response = await api.put(`/marketing/campaigns/${id}`, payload);
  return response.data as { data: MarketingCampaign; meta: { recipient_count: number } };
}

export async function sendCampaign(id: number) {
  const response = await api.post(`/marketing/campaigns/${id}/send`);
  return response.data.data as MarketingCampaign;
}

export async function cancelCampaign(id: number) {
  const response = await api.post(`/marketing/campaigns/${id}/cancel`);
  return response.data.data as MarketingCampaign;
}

export async function fetchCampaignDeliveries(id: number) {
  const response = await api.get(`/marketing/campaigns/${id}/deliveries`);
  return (response.data.data ?? []) as MarketingDelivery[];
}

export async function unsubscribeMarketing(delivery: number, token: string) {
  const response = await api.post(`/public/marketing/unsubscribe/${delivery}`, { token });
  return response.data as { ok: boolean; message: string };
}
