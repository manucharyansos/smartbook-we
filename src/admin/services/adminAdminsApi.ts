// src/admin/services/adminAdminsApi.ts
import { adminApi } from "./adminApi";
import type { Admin } from "../types/admin.types";

export type AdminCreatePayload = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: Admin['role'];
    is_active: boolean;
};

export type AdminUpdatePayload = Pick<Admin, 'name' | 'email' | 'role' | 'is_active'>;

export const adminAdminsApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) => adminApi.get<{ data: Admin[] }>("/admins", { params }),

    get: (id: number) => adminApi.get<{ data: Admin }>(`/admins/${id}`),

    create: (data: AdminCreatePayload) => adminApi.post("/admins", data),

    update: (id: number, data: AdminUpdatePayload) => adminApi.put(`/admins/${id}`, data),

    delete: (id: number) => adminApi.delete(`/admins/${id}`),

    toggleActive: (id: number) => adminApi.patch(`/admins/${id}/toggle-active`),

    updatePassword: (id: number, password: string, password_confirmation: string) =>
        adminApi.post(`/admins/${id}/password`, { password, password_confirmation }),
};
