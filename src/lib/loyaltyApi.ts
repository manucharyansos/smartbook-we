import { api } from './api';

export type LoyaltyProgram = {
  id: number;
  business_id: number;
  is_enabled: boolean;
  currency_unit: number;
  points_per_currency_unit: number;
  redeem_points_step: number;
  redeem_currency_amount: number;
  max_redeem_percent: number;
  allow_gift_card_with_points: boolean;
  points_expire_after_days: number;
  min_booking_amount: number;
  notes?: string | null;
};

export type LoyaltyClient = {
  id: number;
  name: string;
  phone: string | null;
  points: number;
  lifetime_earned: number;
};

export type LoyaltyLedgerEntry = {
  id: number;
  business_id: number;
  client_id: number;
  booking_id: number | null;
  delta_points: number;
  entry_type: string;
  reason: string | null;
  expires_at: string | null;
  created_by: number | null;
  created_at: string;
  meta?: Record<string, unknown> | null;
};

export type LoyaltySummary = {
  members: number;
  outstanding_points: number;
  lifetime_earned: number;
  expiring_in_30_days: number;
};

export async function fetchLoyaltyProgram(): Promise<LoyaltyProgram> {
  const r = await api.get('/loyalty/program');
  return r.data.data as LoyaltyProgram;
}

export async function updateLoyaltyProgram(payload: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
  const r = await api.put('/loyalty/program', payload);
  return r.data.data as LoyaltyProgram;
}

export async function fetchLoyaltyClients(q = ''): Promise<LoyaltyClient[]> {
  const r = await api.get('/loyalty/clients', { params: q ? { q } : {} });
  return r.data.data as LoyaltyClient[];
}

export async function fetchLoyaltySummary(): Promise<LoyaltySummary> {
  const r = await api.get('/loyalty/summary');
  return r.data.data as LoyaltySummary;
}

export async function fetchLoyaltyClientLedger(clientId: number): Promise<LoyaltyLedgerEntry[]> {
  const r = await api.get(`/loyalty/clients/${clientId}/ledger`);
  return r.data.data as LoyaltyLedgerEntry[];
}

export async function adjustLoyaltyClient(clientId: number, delta_points: number, reason?: string) {
  const r = await api.post(`/loyalty/clients/${clientId}/adjust`, { delta_points, reason });
  return r.data.data;
}

export async function previewLoyalty(clientId: number, gross_amount: number, requested_points: number) {
  const r = await api.post('/loyalty/preview', { client_id: clientId, gross_amount, requested_points });
  return r.data.data as { balance: number; applied_points: number; discount_amount: number };
}
