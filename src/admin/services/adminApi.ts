
import axios from "axios";
import { API_BASE_URL } from "../../lib/apiBase";

export const adminApi = axios.create({
    baseURL: `${API_BASE_URL}/admin`,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

adminApi.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin");
            window.location.href = "/admin/login";
        }
        return Promise.reject(err);
    }
);

export const adminService = {
    login: (email: string, password: string) =>
        adminApi.post("/login", { email, password }),

    me: () => adminApi.get("/me"),

    logout: () => adminApi.post("/logout"),
};

/** "HTTP 404 · message" so a screenshot of an admin error shows the real cause. */
export function adminErrorText(error: unknown, fallback: string): string {
    const response = (error as { response?: { status?: number; data?: { message?: string; debug?: string } } })?.response;
    if (!response) return `${fallback} (սերվերի հետ կապ չկա)`;
    if (response.data?.debug) return `${fallback} · HTTP ${response.status} · ${response.data.debug}`;
    const hint = response.status === 404 ? "API-ն թարմացված չէ կամ route cache-ը մաքրված չէ"
        : response.status === 403 ? "այս ադմին դերը հասանելիություն չունի"
        : response.status === 500 ? "սերվերի սխալ, տես storage/logs/laravel.log"
        : response.data?.message;
    return `${fallback} · HTTP ${response.status}${hint ? ` · ${hint}` : ""}`;
}

export type SystemStatus = { commit: string | null; pending_migrations: string[]; config_cached: boolean; routes_cached: boolean; environment: string; database: string; server_time: string };
export const fetchSystemStatus = async () => (await adminApi.get<{ data: SystemStatus }>("/system")).data.data;
