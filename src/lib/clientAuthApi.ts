import { api } from "./api";

export async function fetchClientMe() {
  const r = await api.get("/client/auth/me");
  return r.data.user;
}
