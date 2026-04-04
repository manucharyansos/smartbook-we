import axios from "axios";
import { useAuth } from "../store/auth";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = useAuth.getState().token;
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const code = error?.response?.data?.code;

        if (status === 401) {
            try {
                useAuth.getState().clear();
            } catch {}

            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.replace("/login");
            }
        }

        if (
            status === 403 &&
            code === "onboarding_required" &&
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/app/onboarding")
        ) {
            window.location.replace("/app/onboarding");
        }

        return Promise.reject(error);
    }
);
