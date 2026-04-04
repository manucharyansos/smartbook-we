import { api } from "./api";

export type GiftCard = {
  id: number;
  business_id: number;
  code: string;
  initial_amount: number;
  balance: number;
  redeemed_total: number;
  currency: string;
  status: "active" | "redeemed" | "cancelled";
  expires_at: string | null;
  issued_to_name: string | null;
  issued_to_phone: string | null;
  purchased_by_name: string | null;
  purchased_by_phone: string | null;
  notes: string | null;
  last_redeemed_at: string | null;
  created_at: string;
};

export async function fetchGiftCards(params?: { status?: string; q?: string }) {
  const r = await api.get("/gift-cards", { params });
  return r.data.data as GiftCard[];
}

export async function createGiftCard(payload: {
  code?: string | null;
  amount: number;
  currency?: string | null;
  issued_to_name?: string | null;
  issued_to_phone?: string | null;
  purchased_by_name?: string | null;
  purchased_by_phone?: string | null;
  expires_at?: string | null; // YYYY-MM-DD
  notes?: string | null;
}) {
  const r = await api.post("/gift-cards", payload);
  return r.data.data as GiftCard;
}

export async function updateGiftCard(id: number, payload: Partial<{
  issued_to_name: string | null;
  issued_to_phone: string | null;
  purchased_by_name: string | null;
  purchased_by_phone: string | null;
  expires_at: string | null;
  notes: string | null;
  status: "active" | "cancelled";
}>) {
  const r = await api.put(`/gift-cards/${id}`, payload);
  return r.data.data as GiftCard;
}

export async function redeemGiftCard(id: number, amount: number) {
  const r = await api.patch(`/gift-cards/${id}/redeem`, { amount });
  return r.data.data as GiftCard;
}
