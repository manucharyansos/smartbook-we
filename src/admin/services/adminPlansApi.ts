import { adminApi } from "./adminApi";
import type { Plan } from "../components/PlanModal";

export const adminPlansApi = {
    list: (showHidden?: boolean) =>
        adminApi.get("/plans", { params: { show_hidden: showHidden } }),

    get: (id: number) =>
        adminApi.get(`/plans/${id}`),

    create: (data: Plan) =>
        adminApi.post("/plans", data),

    update: (id: number, data: Plan) =>
        adminApi.put(`/plans/${id}`, data),

    delete: (id: number) =>
        adminApi.delete(`/plans/${id}`),

    reorder: (plans: { id: number; sort_order: number }[]) =>
        adminApi.post("/plans/reorder", { plans }),
};
