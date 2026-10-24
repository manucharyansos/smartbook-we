import axios from "axios";
import { api } from "./api";
import { API_BASE_URL } from "./apiBase";
import { resolveMediaUrl } from "./mediaUrl";

const publicApi = axios.create({ baseURL: API_BASE_URL });
export type GalleryItem = { id: number; url: string; kind: "image" | "video"; caption?: string | null; sort_order: number };
export type RentalRates = { hourly_price: number | null; min_minutes: number; max_minutes: number; buffer_minutes: number; slot_step_minutes: number; currency?: string };
export type RentalSettings = RentalRates & { gallery: GalleryItem[] };
export type RentalSlot = { starts_at: string; ends_at: string; price: number; currency: string };
export type RentalBooking = {
  id: number; booking_code: string; client_name: string; client_phone: string; client_email?: string | null;
  starts_at: string; ends_at: string; status: string; final_price: number; paid_amount: number;
  outstanding_amount: number; currency: string; notes?: string | null; is_expired?: boolean;
  payments: { id: number; amount: number; status: string; provider: string; created_at: string }[];
};
export type RentalSummary = {
  bookings_count: number; pending_count: number; cancelled_count: number; booked_amount: number; completed_amount: number;
  received_amount: number; refunded_amount: number; net_received: number; outstanding_amount: number; refund_due: number;
  booked_minutes: number; available_minutes: number; occupancy_percent: number; monthly_subscription: number;
  daily: { date: string; count: number; amount: number }[];
};
export type RentalCreate = { starts_at: string; duration_minutes: number; client_name: string; client_phone: string; client_email?: string; notes?: string };
export const rentalApi = {
  settings: async (): Promise<RentalSettings> => (await api.get("/rental/settings")).data.data,
  saveSettings: async (data: RentalRates) => (await api.put("/rental/settings", data)).data.data,
  upload: async (file: File, caption?: string): Promise<GalleryItem> => {
    const form = new FormData(); form.append("file", file); if (caption) form.append("caption", caption);
    return (await api.post("/rental/gallery", form)).data.data;
  },
  updateMedia: async (id: number, data: { caption?: string; sort_order?: number }) => api.patch(`/rental/gallery/${id}`, data),
  deleteMedia: async (id: number) => api.delete(`/rental/gallery/${id}`),
  bookings: async (from: string, to: string): Promise<RentalBooking[]> => (await api.get("/rental/bookings", { params: { from, to } })).data.data,
  create: async (data: RentalCreate) => (await api.post("/rental/bookings", data)).data.data,
  update: async (id: number, data: { status?: string; starts_at?: string; notes?: string | null }) => api.patch(`/rental/bookings/${id}`, data),
  payment: async (id: number, amount: number, operation: "payment" | "refund", idempotencyKey: string) =>
    api.post(`/rental/bookings/${id}/payments`, { amount, operation, idempotency_key: idempotencyKey }),
  summary: async (from: string, to: string): Promise<RentalSummary> => (await api.get("/rental/summary", { params: { from, to } })).data.data,
  slots: async (slug: string, date: string, minutes: number): Promise<RentalSlot[]> =>
    (await publicApi.get(`/public/businesses/${encodeURIComponent(slug)}/rental-availability`, { params: { date, duration_minutes: minutes } })).data.data,
  publicCreate: async (slug: string, data: RentalCreate & { legal_accepted: boolean; terms_version: string; privacy_version: string }) =>
    (await publicApi.post(`/public/businesses/${encodeURIComponent(slug)}/bookings`, data)).data,
  reschedule: async (code: string, token: string, startsAt: string) =>
    (await publicApi.post(`/public/bookings/${encodeURIComponent(code)}/reschedule`, { starts_at: startsAt }, { headers: { "X-Guest-Token": token } })).data,
  rescheduleSlots: async (code: string, token: string, date: string): Promise<RentalSlot[]> =>
    (await publicApi.get(`/public/bookings/${encodeURIComponent(code)}/reschedule-options`, { params: { date }, headers: { "X-Guest-Token": token } })).data.data,
};

export const galleryUrl = (item: GalleryItem) => resolveMediaUrl(item.url) ?? item.url;
export function rentalToday(timezone = "Asia/Yerevan"): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export const isRentalBusiness = (user: { vertical?: string | null; business_type?: string | null } | null | undefined) =>
  (user?.vertical ?? user?.business_type) === "rentals";
