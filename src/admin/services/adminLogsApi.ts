import { adminApi } from "./adminApi";
import type { AdminLog } from "../types/admin.types";

export const adminLogsApi = {
  list: (params?: Record<string, unknown>) => adminApi.get<{ data: AdminLog[] }>("/logs", { params }),
  get: (id: number) => adminApi.get<{ data: AdminLog }>(`/logs/${id}`),
  getAdminLogs: (adminId: number) => adminApi.get(`/logs/admin/${adminId}`),
};
