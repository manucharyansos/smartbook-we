// src/admin/services/adminAnalyticsApi.ts
import { adminApi } from "./adminApi";

export type Period = "7_days" | "30_days" | "90_days" | "12_months" | "custom";

export type DashboardFilters = {
    period?: Period;
    from?: string;
    to?: string;
    business_id?: number;
};

export type RevenueExportPayload = {
    period?: Period;
    from?: string;
    to?: string;
    group_by?: "day" | "week" | "month";
    business_id?: number;
};

export type BusinessesExportPayload = {
    status?: "active" | "suspended" | "pending";
    business_type?: "beauty" | "dental";
    from?: string;
    to?: string;
    search?: string;
    sort_by?: "created_at" | "name" | "status" | "users_count" | "bookings_count" | "total_revenue";
    sort_order?: "asc" | "desc";
};

export const adminAnalyticsService = {
    getDashboard: async (filters: DashboardFilters = {}) => {
        const res = await adminApi.get("/analytics/dashboard", { params: filters });
        return res.data;
    },

    exportBusinesses: async (payload: BusinessesExportPayload = {}) => {
        const res = await adminApi.post("/analytics/export/businesses", payload, {
            responseType: "blob",
        });
        return res;
    },

    exportRevenue: async (payload: RevenueExportPayload = {}) => {
        const res = await adminApi.post("/analytics/export/revenue", payload, {
            responseType: "blob",
        });
        return res;
    },
};