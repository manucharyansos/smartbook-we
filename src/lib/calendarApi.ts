import { api } from "./api";

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled" | "no_show";

export type Booking = {
  id: number;
  booking_code?: string | null;
  party_size?: number;
  recurrence_id?: string | null;
  recurrence_frequency?: "weekly" | "biweekly" | "monthly" | null;
  recurrence_index?: number;
  recurrence_count?: number;
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
  final_price?: number | null;
  currency?: string | null;
  items?: Array<{
    id: number;
    service_id: number;
    position: number;
    duration_minutes: number;
    price: number | null;
    currency?: string | null;
    service?: { id: number; name: string; duration_minutes: number; price: number | null };
  }>;
  location_id?: number | null;
  location?: { id: number; name?: string | null; address?: string | null; is_primary?: boolean } | null;
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
  location_id?: number;
  redeem_points?: number;
  gift_card_code?: string;
  gift_card_amount?: number;
  party_size?: number;
  recurrence_frequency?: "weekly" | "biweekly" | "monthly";
  recurrence_count?: number;
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
  location_id?: number;
  redeem_points?: number;
  gift_card_code?: string;
  gift_card_amount?: number;
};

export async function fetchBookings(from: string, to: string, params?: { location_id?: number }): Promise<Booking[]> {
  const r = await api.get("/calendar", { params: { from, to, ...params } });
  return (r.data?.data ?? []) as Booking[];
}

export async function fetchBlocks(from: string, to: string, params?: { location_id?: number }): Promise<BookingBlock[]> {
  const r = await api.get("/calendar/blocks", { params: { from, to, ...params } });
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
    location_id: number | null;
  }>
) {
  const r = await api.put(`/bookings/${id}`, payload);
  return r.data?.data ?? r.data;
}

export async function cancelBooking(id: number): Promise<Booking> {
  const r = await api.patch<{
    ok: boolean;
    cancelled_booking_id: number;
    data: Booking;
  }>(`/bookings/${id}/cancel`);

  const cancelledId = Number(r.data?.cancelled_booking_id);
  const booking = r.data?.data;
  if (!r.data?.ok || cancelledId !== id || Number(booking?.id) !== id) {
    throw new Error("Սերվերը չի հաստատել ընտրված ամրագրման չեղարկումը։ Փոփոխություն չի ցուցադրվի։");
  }

  return booking;
}

export async function cancelBookingRecurrence(id: number, scope: "future" | "all" = "future") {
  const response = await api.patch(`/bookings/${id}/recurrence/cancel`, { scope });
  return response.data as { ok: boolean; cancelled_booking_ids: number[]; recurrence_id: string };
}

export async function doneBooking(id: number) {
  const r = await api.patch<{ ok?: boolean; data: Booking }>(`/bookings/${id}/done`);
  return requireExactBooking(r.data?.data, id);
}

export async function noShowBooking(id: number) {
  const r = await api.patch<{ ok?: boolean; data: Booking }>(`/bookings/${id}/no-show`);
  return requireExactBooking(r.data?.data, id);
}

export async function confirmBooking(id: number) {
  const r = await api.patch<{ ok?: boolean; data: Booking }>(`/bookings/${id}/confirm`);
  return requireExactBooking(r.data?.data, id);
}

export async function updateBookingTime(
  id: number,
  payload: { starts_at: string; ends_at: string }
) {
  const r = await api.patch<{ ok?: boolean; data: Booking }>(`/bookings/${id}/time`, payload);
  return requireExactBooking(r.data?.data, id);
}

function requireExactBooking(booking: Booking | undefined, expectedId: number): Booking {
  if (!booking || Number(booking.id) !== expectedId) {
    throw new Error("Սերվերը չի վերադարձրել ընտրված ամրագրումը։");
  }
  return booking;
}

export async function createBlock(payload: {
  staff_id?: number | null;
  title?: string;
  starts_at: string;
  ends_at: string;
  is_all_day?: boolean;
  location_id?: number | null;
}): Promise<BookingBlock> {
  const r = await api.post("/calendar/blocks", payload);
  return r.data?.data as BookingBlock;
}

export async function deleteBlock(id: number): Promise<void> {
  await api.delete(`/calendar/blocks/${id}`);
}
