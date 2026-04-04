import { api } from "./api";

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
    return r.data.data ?? r.data; // safe
}

export async function updateSchedule(payload: { days: ScheduleDay[] }) {
    const r = await api.put("/schedule", payload);
    return r.data.data ?? r.data;
}