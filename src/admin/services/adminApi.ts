
import axios from "axios";

export const adminApi = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/admin`,
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