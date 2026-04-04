// src/admin/services/adminAdminsApi.ts
import { adminApi } from "./adminApi";
import type { Admin } from "../types/admin.types";

export const adminAdminsApi = {
    list: (params?: any) => adminApi.get<{ data: Admin[] }>("/admins", { params }),

    get: (id: number) => adminApi.get<{ data: Admin }>(`/admins/${id}`),

    create: (data: Partial<Admin>) => adminApi.post("/admins", data),

    update: (id: number, data: Partial<Admin>) => adminApi.put(`/admins/${id}`, data),

    delete: (id: number) => adminApi.delete(`/admins/${id}`),

    toggleActive: (id: number) => adminApi.patch(`/admins/${id}/toggle-active`),

    updatePassword: (id: number, password: string, password_confirmation: string) =>
        adminApi.post(`/admins/${id}/password`, { password, password_confirmation }),
};