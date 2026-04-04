// src/admin/services/adminUsersApi.ts
import { adminApi } from "./adminApi";
import type { User } from "../types/admin.types";

export const adminUsersApi = {
    list: (params?: any) => adminApi.get<{ data: User[] }>("/users", { params }),

    get: (id: number) => adminApi.get<{ data: User }>(`/users/${id}`),

    toggleActive: (id: number) => adminApi.patch(`/users/${id}/toggle-active`),

    update: (id: number, data: Partial<User>) =>
        adminApi.put(`/users/${id}`, data),
};