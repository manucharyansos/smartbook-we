import { api } from "./api";

function normalizeTime(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const time = value.trim();
    if (!time) return undefined;
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time.slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    return time.slice(0, 5);
}

export type BusinessSettings = {
    name: string;
    slug: string;
    business_type: 'beauty' | 'dental' | 'services' | 'healthcare';
    vertical?: 'services' | 'healthcare' | null;
    phone: string | null;
    address: string | null;
    timezone: string;
    slot_step_minutes: number;
    work_start?: string;
    work_end?: string;
    is_onboarding_completed?: boolean;
};

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
    const r = await api.get("/business/settings");
    return {
        ...r.data.data,
        work_start: normalizeTime(r.data.data?.work_start),
        work_end: normalizeTime(r.data.data?.work_end),
    };
}

export async function updateBusinessSettings(payload: Partial<{
    phone: string | null;
    address: string | null;
    timezone: string;
    slot_step_minutes: number;
    work_start: string;
    work_end: string;
}>): Promise<BusinessSettings> {
    const normalizedPayload = {
        ...payload,
        ...(Object.prototype.hasOwnProperty.call(payload, 'work_start') ? { work_start: normalizeTime(payload.work_start) ?? null } : {}),
        ...(Object.prototype.hasOwnProperty.call(payload, 'work_end') ? { work_end: normalizeTime(payload.work_end) ?? null } : {}),
    };
    const r = await api.patch("/business/settings", normalizedPayload);
    return {
        ...r.data.data,
        work_start: normalizeTime(r.data.data?.work_start),
        work_end: normalizeTime(r.data.data?.work_end),
    };
}
