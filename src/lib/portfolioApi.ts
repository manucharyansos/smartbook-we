import { api } from "./api";
import { resolveMediaUrl } from "./mediaUrl";

export type PortfolioItem = {
    id: number;
    url: string | null;
    caption: string | null;
    sort_order: number;
    staff_id: number | null;
    service_id: number | null;
    staff: { id: number; name: string } | null;
    service: { id: number; name: string } | null;
    created_at?: string | null;
};

export type PortfolioTags = { caption?: string | null; staff_id?: number | null; service_id?: number | null };

function normalize(item: PortfolioItem): PortfolioItem {
    return { ...item, url: resolveMediaUrl(item.url) };
}

export async function fetchPortfolio(): Promise<{ items: PortfolioItem[]; limit: number }> {
    const { data } = await api.get("/portfolio");
    return { items: (data.data as PortfolioItem[]).map(normalize), limit: Number(data.meta?.limit ?? 60) };
}

export async function uploadPortfolioItem(file: File, tags: PortfolioTags): Promise<PortfolioItem> {
    const form = new FormData();
    form.append("file", file);
    if (tags.caption) form.append("caption", tags.caption);
    if (tags.staff_id) form.append("staff_id", String(tags.staff_id));
    if (tags.service_id) form.append("service_id", String(tags.service_id));
    const { data } = await api.post("/portfolio", form, { headers: { "Content-Type": "multipart/form-data" } });
    return normalize(data.data);
}

export async function updatePortfolioItem(id: number, tags: PortfolioTags): Promise<PortfolioItem> {
    const { data } = await api.patch(`/portfolio/${id}`, tags);
    return normalize(data.data);
}

export async function reorderPortfolio(ids: number[]): Promise<PortfolioItem[]> {
    const { data } = await api.put("/portfolio/order", { ids });
    return (data.data as PortfolioItem[]).map(normalize);
}

export async function deletePortfolioItem(id: number): Promise<void> {
    await api.delete(`/portfolio/${id}`);
}
