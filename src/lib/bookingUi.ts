import type { Booking, Role } from "./bookingsApi";

export function canManageBookings(role: Role) {
    return role === "owner" || role === "manager" || role === "super_admin";
}

export function canConfirm(role: Role, b: Booking) {
    return canManageBookings(role) && b.status !== "confirmed" && b.status !== "cancelled" && b.status !== "done";
}

export function canCancel(role: Role, b: Booking) {
    return canManageBookings(role) && b.status !== "cancelled" && b.status !== "done";
}

export function canDone(role: Role, b: Booking) {
    return canManageBookings(role) && b.status === "confirmed";
}

export function canEditTime(role: Role, b: Booking) {
    return canManageBookings(role) && b.status !== "cancelled" && b.status !== "done";
}

export function hhmm(dt: string) {
    // "YYYY-MM-DD HH:mm:ss" -> "HH:mm"
    return dt.slice(11, 16);
}

export function ymd(dt: string) {
    return dt.slice(0, 10);
}

// Modal input expects "YYYY-MM-DDTHH:mm"
export function toDatetimeLocal(dt: string) {
    // "2026-02-20 09:00:00" -> "2026-02-20T09:00"
    return dt.replace(" ", "T").slice(0, 16);
}

// Convert back to backend format "YYYY-MM-DD HH:mm:ss"
export function fromDatetimeLocal(v: string) {
    return v.replace("T", " ");
}
