import axios from "axios";
import { useAuth } from "../store/auth";
import { API_BASE_URL } from "./apiBase";

export const api = axios.create({
    baseURL: API_BASE_URL,
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

        if (status === 401 && useAuth.getState().token) {
            const audience = useAuth.getState().user?.audience;
            const requestUrl = String(error?.config?.url ?? "");
            const isClientRequest = audience === "client" || requestUrl.startsWith("/client/");

            try {
                useAuth.getState().clear();
            } catch {
                // A storage cleanup failure must not block the login redirect.
            }

            const loginPath = isClientRequest ? "/client/login" : "/login";
            if (typeof window !== "undefined" && window.location.pathname !== loginPath) {
                window.location.replace(loginPath);
            }
        }

        if (
            status === 403 &&
            code === "onboarding_required" &&
            useAuth.getState().token &&
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/app/onboarding")
        ) {
            window.location.replace("/app/onboarding");
        }

        return Promise.reject(error);
    }
);
