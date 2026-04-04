import { api } from "./api";

export type BillingMeResponse = {
  data: {
    business_id: number;
    billing_status: string;
    subscription: {
      id: number;
      status: string;
      plan_id: number | null;
      plan_code: string | null;
      plan_name: string | null;
      starts_at: string | null;
      ends_at: string | null;
      renews_at: string | null;
      billing_cycle: "monthly" | "yearly" | string;
    } | null;
    latest_invoice: BillingInvoice | null;
  };
};

export type BillingInvoice = {
  id: number;
  business_id: number;
  plan_id: number;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string | null;
  note?: string | null;
  billing_cycle?: "monthly" | "yearly" | string | null;
  created_at?: string | null;
  plan?: {
    id: number;
    code: string;
    name: string;
    price: number;
    currency: string;
  } | null;
};

export type BillingInvoicesResponse = {
  data: BillingInvoice[];
};

export async function fetchBillingMe(): Promise<BillingMeResponse> {
  const { data } = await api.get("/billing/me");
  return data;
}

export async function fetchInvoices(): Promise<BillingInvoicesResponse> {
  const { data } = await api.get("/billing/invoices");
  return data;
}

export async function requestUpgrade(payload: {
  plan_code: string;
  billing_cycle?: "monthly" | "yearly";
  payment_method?: string | null;
  note?: string | null;
}) {
  const { data } = await api.post("/billing/upgrade-request", payload);
  return data;
}