import { api } from "./api";

export async function fetchMe() {
    const r = await api.get("/auth/me");
    return r.data.user;
}