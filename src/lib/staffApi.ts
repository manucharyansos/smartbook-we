import { api } from "./api";
import { resolveMediaUrl } from "./mediaUrl";

export type StaffRole = "owner" | "manager" | "staff" | "super_admin";

export type StaffUser = {
    id: number;
    name: string;
    email: string | null;
    phone?: string | null;
    whatsapp_phone?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    role: StaffRole;
    business_id: number | null;
    is_active: boolean;
    show_in_public_team: boolean;
    is_bookable: boolean;
    deactivated_at: string | null;
};

export async function fetchStaff() {
    const res = await api.get("/staff?only_active=false");
    return (res.data.data as StaffUser[]).map((item) => ({ ...item, avatar_url: resolveMediaUrl(item.avatar_url) }));
}

export async function createStaff(payload: {
    name: string;
    email: string;
    password: string;
    role?: "staff" | "manager";
    phone?: string | null;
    whatsapp_phone?: string | null;
    bio?: string | null;
    show_in_public_team?: boolean;
    is_bookable?: boolean;
}) {
    const res = await api.post("/staff", payload);
    const item = res.data.data as StaffUser;
    return { ...item, avatar_url: resolveMediaUrl(item.avatar_url) };
}

export async function deactivateStaff(id: number) {
    const res = await api.patch(`/staff/${id}/deactivate`);
    return res.data;
}

export async function activateStaff(id: number) {
    const res = await api.patch(`/staff/${id}/activate`);
    return res.data;
}
export async function updateStaff(id: number, payload: Partial<{
    name: string;
    role: 'staff' | 'manager' | 'owner';
    phone: string | null;
    whatsapp_phone: string | null;
    avatar_url: string | null;
    bio: string | null;
    show_in_public_team: boolean;
    is_bookable: boolean;
}>) {
    const res = await api.patch(`/staff/${id}`, payload);
    const item = res.data.data as StaffUser;
    return { ...item, avatar_url: resolveMediaUrl(item.avatar_url) };
}
