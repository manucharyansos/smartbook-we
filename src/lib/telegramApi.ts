import { api } from "./api";

export type TelegramConnectionStatus = {
  available: boolean;
  connected: boolean;
  bot_url: string | null;
};

export type TelegramConnectionLink = {
  url: string;
  expires_at: string;
  connected: boolean;
};

export async function fetchTelegramConnection(): Promise<TelegramConnectionStatus> {
  const response = await api.get("/telegram/connection");
  return response.data.data;
}

export async function createTelegramConnectionLink(): Promise<TelegramConnectionLink> {
  const response = await api.post("/telegram/connection");
  return response.data.data;
}

export async function disconnectTelegram(): Promise<void> {
  await api.delete("/telegram/connection");
}
