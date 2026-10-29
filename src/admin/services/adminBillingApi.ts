import { adminApi } from "./adminApi";

export type BillingSummary = {
  range: { from: string; to: string };
  currency: string;
  income: { period: number; period_online: number; period_manual: number; today: number; this_month: number; all_time: number; paid_invoices_period: number };
  mrr: number;
  pending: { invoices: number; amount: number };
  review_required: number;
  subscriptions: { active: number; trialing: number; expired: number; suspended: number; canceled: number; trials_ending_7d: number; renewals_due_7d: number };
  provider: {
    default: string; display_name: string; checkout_available: boolean; connection_status: string; last_callback_at: string | null;
    idram: { ready: boolean; can_verify_callbacks: boolean; merchant_account: string | null; live_enabled: boolean; result_url: string; success_url: string; fail_url: string };
  };
};

export type AdminTransaction = {
  id: number; invoice_id: number; provider: string; reference: string; provider_payment_id: string | null; status: string;
  amount: number; currency: string; payer_account: string | null; requires_manual_review: boolean;
  review_resolved: { at: string; admin_id: number; note: string } | null; duplicate_payment_received: boolean;
  created_at: string | null; paid_at: string | null; failed_at: string | null;
  business: { id: number; name: string; slug: string } | null;
  invoice: { id: number; status: string; amount: number; billing_cycle: string | null } | null;
};

export type AdminInvoice = {
  id: number; status: string; amount: number; currency: string; billing_cycle: string; payment_method: string | null; note: string | null;
  created_at: string | null; paid_at: string | null; cancelled_at: string | null;
  business: { id: number; name: string; slug: string; business_type: string | null; vertical: string | null; status: string } | null;
  plan: { id: number; name: string; code: string } | null;
  transaction: AdminTransaction | null; attempts: number | null;
};

export type Paginated<T> = { data: T[]; current_page: number; last_page: number; total: number };

export const adminBillingApi = {
  summary: async (params?: { from?: string; to?: string }) => (await adminApi.get<{ data: BillingSummary }>("/billing/summary", { params })).data.data,
  invoices: async (params: { status?: string; search?: string; business_id?: number; page?: number }) =>
    (await adminApi.get<{ data: Paginated<AdminInvoice> }>("/billing/invoices", { params })).data.data,
  transactions: async (params: { review?: boolean; status?: string; page?: number }) =>
    (await adminApi.get<{ data: Paginated<AdminTransaction> }>("/billing/transactions", { params: { ...params, review: params.review ? 1 : undefined } })).data.data,
  approve: async (id: number, note: string) => (await adminApi.post(`/billing/invoices/${id}/approve`, { note })).data.data as AdminInvoice,
  cancel: async (id: number, note?: string) => (await adminApi.post(`/billing/invoices/${id}/cancel`, { note })).data.data as AdminInvoice,
  resolveReview: async (id: number, note: string) => (await adminApi.post(`/billing/transactions/${id}/resolve-review`, { note })).data.data as AdminTransaction,
};
