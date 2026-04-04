import { api } from "./api";

export type Block = {
    id: number;
    starts_at: string;
    ends_at: string;
    reason?: string | null;
    staff_id?: number | null;
};

export async function fetchBlocks(from: string, to: string, staff_id?: number) {
    try {
        const r = await api.get("/calendar/blocks", {
            params: { from, to, ...(staff_id ? { staff_id } : {}) },
        });
        return (r.data.data ?? r.data ?? []) as Block[];
    } catch (err: any) {
        const status = err?.response?.status;
        const code = err?.response?.data?.code;
        // ✅ If the plan does not include "blocks", just behave as if there are no blocks.
        if (status === 403 && code === "feature_not_allowed") {
            return [];
        }
        throw err;
    }
}

export async function createBlock(payload: {
    starts_at: string;
    ends_at: string;
    reason?: string | null;
    staff_id?: number | null;
}) {
    const r = await api.post("/calendar/blocks", payload);
    return (r.data.data ?? r.data) as Block;
}

export async function deleteBlock(id: number) {
    await api.delete(`/calendar/blocks/${id}`);
}