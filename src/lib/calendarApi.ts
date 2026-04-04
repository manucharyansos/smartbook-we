import { api } from "./api";

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled" | "no_show";

export type Booking = {
  id: number;
  business_id?: number;
  service_id: number;
  staff_id: number | null;
  client_id?: number | null;
  client_name: string;
  client_phone: string;
  notes: string | null;
  status: BookingStatus;
  starts_at: string;
  ends_at: string;
  source?: string | null;
  items?: Array<{
    id: number;
    service_id: number;
    position: number;
    duration_minutes: number;
    price: number | null;
    currency?: string | null;
    service?: { id: number; name: string; duration_minutes: number; price: number | null };
  }>;
};

export type BookingBlock = {
  id: number;
  business_id: number;
  staff_id: number | null;
  title: string;
  starts_at: string;
  ends_at: string;
  is_all_day: boolean;
};

export type CreateBookingPayload = {
  service_id?: number;
  service_ids?: number[];
  staff_id: number;
  starts_at: string;
  client_name: string;
  client_phone: string;
  client_id?: number | null;
  notes?: string | null;
  status?: "pending" | "confirmed";
  source?: string;
};

export type CreateBookingLinesPayload = {
  lines: Array<{
    service_id: number;
    staff_id?: number;
    starts_at: string;
  }>;
  client_name: string;
  client_phone: string;
  client_id?: number | null;
  notes?: string | null;
  status?: "pending" | "confirmed";
  source?: string;
};

export async function fetchBookings(from: string, to: string): Promise<Booking[]> {
  const r = await api.get("/calendar", { params: { from, to } });
  return (r.data?.data ?? []) as Booking[];
}

export async function fetchBlocks(from: string, to: string): Promise<BookingBlock[]> {
  const r = await api.get("/calendar/blocks", { params: { from, to } });
  return (r.data?.data ?? []) as BookingBlock[];
}

export async function createBooking(payload: CreateBookingPayload) {
  const r = await api.post("/bookings", payload);
  return r.data?.data ?? r.data;
}

export async function createBookingLines(payload: CreateBookingLinesPayload) {
  const r = await api.post("/bookings/lines", payload);
  return r.data?.data ?? r.data;
}


export async function updateBooking(
  id: number,
  payload: Partial<{
    client_name: string;
    client_phone: string;
    client_id: number | null;
    starts_at: string;
    staff_id: number | null;
    status: BookingStatus;
    notes: string | null;
  }>
) {
  const r = await api.put(`/bookings/${id}`, payload);
  return r.data?.data ?? r.data;
}

export async function cancelBooking(id: number) {
  const r = await api.patch<Booking>(`/bookings/${id}/cancel`);
  return r.data;
}

export async function doneBooking(id: number) {
  const r = await api.patch<Booking>(`/bookings/${id}/done`);
  return r.data;
}

export async function noShowBooking(id: number) {
  const r = await api.patch<Booking>(`/bookings/${id}/no-show`);
  return r.data;
}

export async function confirmBooking(id: number) {
  const r = await api.patch<Booking>(`/bookings/${id}/confirm`);
  return r.data;
}

export async function updateBookingTime(
  id: number,
  payload: { starts_at: string; ends_at: string }
) {
  const r = await api.patch<Booking>(`/bookings/${id}/time`, payload);
  return r.data;
}

export async function createBlock(payload: {
  staff_id?: number | null;
  title?: string;
  starts_at: string;
  ends_at: string;
  is_all_day?: boolean;
}): Promise<BookingBlock> {
  const r = await api.post("/calendar/blocks", payload);
  return r.data?.data as BookingBlock;
}

export async function deleteBlock(id: number): Promise<void> {
  await api.delete(`/calendar/blocks/${id}`);
}
