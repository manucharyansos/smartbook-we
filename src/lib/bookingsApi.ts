// src/lib/bookingsApi.ts
import { api } from "./api";

export type Role = 'owner' | 'manager' | 'staff' | 'super_admin';

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled" | "no_show";

export type Booking = {
    id: number;
    business_id: number;
    service_id: number;
    staff_id: number | null;
    client_id?: number;
    client_name: string;
    client_phone: string;
    notes: string | null;
    status: BookingStatus;
    starts_at: string;
    ends_at: string;
    final_price?: number;
    currency?: string;
    service_name?: string;
    staff_name?: string;
    service?: { id: number; name: string; duration_minutes?: number; price?: number | null } | null;
    staff?: { id: number; name: string; email?: string | null } | null;
    room_id?: number;
    booking_code?: string;
    source?: string | null;
    location_id?: number | null;
    location?: { id: number; name?: string | null; address?: string | null; is_primary?: boolean } | null;
};

export type CreateBookingPayload = {
    service_id: number;
    staff_id: number;
    starts_at: string;
    client_name: string;
    client_phone: string;
    client_id?: number;
    notes?: string | null;
    status?: "pending" | "confirmed";
    room_id?: number;
    source?: string;
    location_id?: number;
};

export async function fetchBookings(params?: {
    from?: string;
    to?: string;
    date?: string;
    week_start?: string;
    status?: string;
    staff_id?: number;
    location_id?: number;
}) {
    const r = await api.get("/bookings", { params });
    return r.data.data ?? [];
}

export async function fetchBooking(id: number): Promise<Booking> {
    const r = await api.get(`/bookings/${id}`);
    return r.data.data;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const r = await api.post("/bookings", payload);
    return r.data.data;
}

export async function updateBooking(id: number, payload: Partial<Booking>): Promise<Booking> {
    const r = await api.put(`/bookings/${id}`, payload);
    return r.data.data;
}

export async function cancelBooking(id: number): Promise<void> {
    await api.patch(`/bookings/${id}/cancel`);
}

export async function doneBooking(id: number): Promise<void> {
    await api.patch(`/bookings/${id}/done`);
}

export async function confirmBooking(id: number): Promise<void> {
    await api.patch(`/bookings/${id}/confirm`);
}

export async function updateBookingTime(id: number, starts_at: string, ends_at: string): Promise<Booking> {
    const r = await api.patch(`/bookings/${id}/time`, { starts_at, ends_at });
    return r.data.data;
}

/**
 * Fetch bookings for a specific day. This is a thin wrapper around
 * `fetchBookings` that accepts a `date` string (YYYY-MM-DD) and returns
 * a list of bookings for that date. The backend handles filtering by
 * business automatically based on the authenticated user, so no
 * additional businessId parameter is needed here.
 *
 * @param date ISO date string (YYYY-MM-DD)
 */
export async function fetchBookingsDay(date: string): Promise<Booking[]> {
    // Delegate to the generic fetchBookings function. When the `date`
    // parameter is provided, the backend returns bookings only for that
    // specific day. Return an empty array if the backend responds with
    // no data to keep the return type consistent.
    const data = await fetchBookings({ date });
    return data ?? [];
}

/**
 * Fetch bookings for a given date range (typically a week).
 * Accepts a start date and an end date (both YYYY-MM-DD) and
 * returns all bookings that start within that period. This function
 * simply forwards the call to `fetchBookings` with `from` and `to`.
 *
 * @param from ISO date string (YYYY-MM-DD) representing the start of the range
 * @param to ISO date string (YYYY-MM-DD) representing the end of the range
 */
export async function fetchBookingsWeek(from: string, to: string): Promise<Booking[]> {
    const data = await fetchBookings({ from, to });
    return data ?? [];
}

export async function noShowBooking(id: number): Promise<void> {
    await api.patch(`/bookings/${id}/no-show`);
}
