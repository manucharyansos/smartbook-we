import type { Booking } from "../../lib/calendarApi";
import type { Service } from "../../lib/servicesApi";

export function parseLocalDateTime(dt?: string | null): Date | null {
    if (!dt) return null;
    if (dt.includes("T")) {
        const x = new Date(dt);
        return isNaN(x.getTime()) ? null : x;
    }
    const parts = dt.split(" ");
    if (parts.length < 2) return null;
    const [d, t] = parts;
    const [y, m, day] = d.split("-").map(Number);
    const [hh, mm, ss] = t.split(":").map(Number);
    if (!y || !m || !day || hh === undefined || mm === undefined) return null;
    const x = new Date();
    x.setFullYear(y, m - 1, day);
    x.setHours(hh, mm, ss ?? 0, 0);
    return x;
}

export function ymd(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function hm(date: Date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

export function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60_000);
}

export function toStartsAtValue(date: Date) {
    return `${ymd(date)} ${hm(date)}`;
}

export function startOfWeekMonday(d: Date) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = (day + 6) % 7;
    x.setDate(x.getDate() - diff);
    x.setHours(0, 0, 0, 0);
    return x;
}

export function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

export function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

export function addMonths(d: Date, n: number) {
    const x = new Date(d);
    x.setMonth(x.getMonth() + n);
    return x;
}

export function rangeForWeek(viewDate: Date) {
    const start = startOfWeekMonday(viewDate);
    const end = addDays(start, 7);
    return { start, end };
}

export function weekdayShort(date: Date) {
    try {
        return date.toLocaleDateString("hy-AM", { weekday: "short" });
    } catch {
        return ymd(date);
    }
}

function startOfMonth(d: Date) {
    const x = new Date(d.getFullYear(), d.getMonth(), 1);
    x.setHours(0, 0, 0, 0);
    return x;
}

export function monthMatrix(viewDate: Date) {
    const first = startOfMonth(viewDate);
    const start = startOfWeekMonday(first);
    return Array.from({ length: 6 }).map((_, weekIndex) =>
        Array.from({ length: 7 }).map((__, dayIndex) => addDays(start, weekIndex * 7 + dayIndex))
    );
}

export function initials(name: string) {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("") || "ST"
    );
}

export function formatMoney(value: number) {
    try {
        return new Intl.NumberFormat("ru-RU").format(value);
    } catch {
        return String(value);
    }
}

export function eventColor(status: Booking["status"]) {
    switch (status) {
        case "pending":
            return { outer: "border-[var(--vz-line)] bg-[var(--vz-surface-2)]", badge: "bg-[var(--vz-surface-2)] text-[var(--vz-highlight-text)]" };
        case "confirmed":
            return { outer: "border-[var(--vz-line)] bg-[var(--vz-surface-2)]", badge: "bg-[var(--vz-success-soft)] text-[var(--vz-success)]" };
        case "done":
            return { outer: "border-[var(--vz-line)] bg-[var(--vz-info-soft)]", badge: "bg-[var(--vz-info-soft)] text-[var(--vz-info)]" };
        case "cancelled":
            return { outer: "border-[var(--vz-line)] bg-[var(--vz-surface-2)] opacity-75", badge: "bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)]" };
        case "no_show":
            return { outer: "border-[var(--vz-line)] bg-[var(--vz-danger-soft)]", badge: "bg-[#f4d3d1] text-[var(--vz-danger)]" };
        default:
            return { outer: "border-[var(--vz-line)] bg-[var(--vz-surface)]", badge: "bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)]" };
    }
}

export function bookingStatusLabel(status: Booking["status"]) {
    switch (status) {
        case "pending":
            return "Սպասում է";
        case "confirmed":
            return "Հաստատված";
        case "done":
            return "Ավարտված";
        case "cancelled":
            return "Չեղարկված";
        case "no_show":
            return "Չի եկել";
        default:
            return status;
    }
}

export function bookingStatusTone(status: Booking["status"]) {
    switch (status) {
        case "pending":
            return "border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[var(--vz-highlight-text)]";
        case "confirmed":
            return "border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[var(--vz-success)]";
        case "done":
            return "border-[var(--vz-line)] bg-[var(--vz-info-soft)] text-[var(--vz-info)]";
        case "cancelled":
            return "border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)]";
        case "no_show":
            return "border-[var(--vz-line)] bg-[var(--vz-danger-soft)] text-[var(--vz-danger)]";
        default:
            return "border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)]";
    }
}

export function bookingSourceLabel(source?: string | null) {
    switch (source) {
        case "website":
            return "Website";
        case "instagram":
            return "Instagram";
        case "facebook":
            return "Facebook";
        case "whatsapp":
            return "WhatsApp";
        case "admin":
            return "Admin";
        case "partner":
            return "Partner";
        case "widget":
            return "Widget";
        case "qr":
            return "QR";
        case "returning_client":
            return "Returning";
        default:
            return "—";
    }
}

export function bookingSourceTone(source?: string | null) {
    switch (source) {
        case "instagram":
            return "bg-[var(--vz-surface-2)] text-[var(--vz-accent-text)] border-[var(--vz-line)]";
        case "facebook":
            return "bg-[var(--vz-surface-2)] text-[var(--vz-info)] border-[var(--vz-line)]";
        case "whatsapp":
            return "bg-[var(--vz-surface-2)] text-[var(--vz-success)] border-[var(--vz-line)]";
        case "website":
            return "bg-[var(--vz-surface-2)] text-[var(--vz-info)] border-[var(--vz-line)]";
        case "admin":
            return "bg-[var(--vz-surface-2)] text-[var(--vz-accent-text)] border-[var(--vz-line)]";
        case "partner":
            return "bg-[var(--vz-surface-2)] text-[var(--vz-highlight-text)] border-[var(--vz-line)]";
        default:
            return "bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)] border-[var(--vz-line)]";
    }
}

export function formatShortDateLabel(date: Date) {
    try {
        return date.toLocaleDateString("hy-AM", { month: "short", day: "numeric" });
    } catch {
        return ymd(date);
    }
}

export function formatWeekRangeLabel(days: Date[]) {
    if (!days.length) return "Շաբաթ";
    const first = days[0];
    const last = days[days.length - 1];
    try {
        const firstLabel = first.toLocaleDateString("hy-AM", { month: "short", day: "numeric" });
        const lastLabel = last.toLocaleDateString("hy-AM", { month: "short", day: "numeric" });
        return `${firstLabel} — ${lastLabel}`;
    } catch {
        return `${ymd(first)} — ${ymd(last)}`;
    }
}

export function formatDateTimeLabel(value?: string | null) {
    const date = parseLocalDateTime(value);
    if (!date) return "—";
    try {
        return date.toLocaleString("hy-AM", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
        return value ?? "—";
    }
}

export function adminSlotKey(slot: { starts_at: string; staff_id?: number | null }) {
    return `${slot.starts_at}|${slot.staff_id ?? "na"}`;
}

export function hmToMinutes(value: string) {
    const [hours, minutes] = value.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
}

export function minutesFromDate(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
}

export function staffAvatarName(name?: string | null) {
    return name?.trim() || "Staff";
}

export function bookingServiceTitle(booking: Booking, serviceById: Map<number, Service>) {
    const titles = booking.items?.length
        ? booking.items
              .slice()
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((item) => item.service?.name ?? serviceById.get(item.service_id)?.name ?? "")
              .filter(Boolean)
        : [serviceById.get(booking.service_id)?.name ?? `Service #${booking.service_id}`];

    return titles.join(" + ");
}
