import { api } from "./api";
import { resolveMediaUrl } from "./mediaUrl";

export type Service = {
    id: number;
    name: string;
    duration_minutes: number;
    price: number | null;
    currency?: string | null;
    is_active: boolean;
    image_url?: string | null;
    location_id?: number | null;
    location?: { id: number; name?: string | null; address?: string | null; is_primary?: boolean } | null;
    created_at?: string;
    updated_at?: string;
};

export async function fetchServices(params?: any): Promise<Service[]> {
    const query = params && typeof params === "object" && "location_id" in params
        ? { location_id: (params as { location_id?: number }).location_id }
        : undefined;
    const res = await api.get("/services", { params: query });
    return (res.data.data ?? []).map((item: Service) => ({ ...item, image_url: resolveMediaUrl(item.image_url) }));
}

export async function createService(payload: {
    name: string;
    duration_minutes: number;
    price?: number | null;
    currency?: string | null;
    is_active?: boolean;
    image_url?: string | null;
    location_id?: number | null;
}) {
    const res = await api.post("/services", payload);
    const item = res.data.data as Service;
    return { ...item, image_url: resolveMediaUrl(item.image_url) };
}

export async function updateService(id: number, payload: Partial<{
    name: string;
    duration_minutes: number;
    price: number | null;
    currency: string | null;
    is_active: boolean;
    image_url: string | null;
    location_id: number | null;
}>) {
    const res = await api.put(`/services/${id}`, payload);
    const item = res.data.data as Service;
    return { ...item, image_url: resolveMediaUrl(item.image_url) };
}

export async function deleteService(id: number) {
    await api.delete(`/services/${id}`);
    return true;
}
