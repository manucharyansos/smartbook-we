import { api } from "./api";

function normalizeTime(value: unknown): string | null {
    if (typeof value !== 'string') return value == null ? null : String(value).slice(0, 5);
    const time = value.trim();
    if (!time) return null;
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time.slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    return time.slice(0, 5);
}

function normalizeDay(value: unknown): ScheduleDay {
    const day = value && typeof value === "object" ? value as Record<string, unknown> : {};
    return {
        weekday: Number(day.weekday ?? 1),
        is_closed: Boolean(day.is_closed),
        start: normalizeTime(day.start),
        end: normalizeTime(day.end),
        break_start: normalizeTime(day.break_start),
        break_end: normalizeTime(day.break_end),
    };
}

export type ScheduleDay = {
    weekday: number; // 1..7 (Mon..Sun)
    is_closed: boolean;
    start: string | null;       // "09:00"
    end: string | null;         // "18:00"
    break_start: string | null; // "13:00"
    break_end: string | null;   // "14:00"
};

export type ScheduleResponse = {
    timezone?: string | null;
    days: ScheduleDay[];
};

export async function fetchSchedule(): Promise<ScheduleResponse> {
    const r = await api.get("/schedule", { params: { _t: Date.now() } });
    const raw = r.data.data ?? r.data; // safe
    return {
        ...raw,
        days: Array.isArray(raw?.days ?? raw)
            ? ((raw?.days ?? raw) as unknown[]).map(normalizeDay)
            : [],
    };
}

export async function updateSchedule(payload: { days: ScheduleDay[] }) {
    const normalizedPayload = {
        days: payload.days.map((day) => ({
            ...day,
            start: normalizeTime(day.start),
            end: normalizeTime(day.end),
            break_start: normalizeTime(day.break_start),
            break_end: normalizeTime(day.break_end),
        })),
    };
    const r = await api.put("/schedule", normalizedPayload);
    return r.data.data ?? r.data;
}
