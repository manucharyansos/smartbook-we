import { api } from "./api";

export type BusinessSettings = {
    name: string;
    slug: string;
    business_type: 'beauty' | 'dental';
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
    return r.data.data;
}

export async function updateBusinessSettings(payload: Partial<{
    phone: string | null;
    address: string | null;
    timezone: string;
    slot_step_minutes: number;
    work_start: string;
    work_end: string;
}>): Promise<BusinessSettings> {
    const r = await api.patch("/business/settings", payload);
    return r.data.data;
}