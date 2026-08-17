import { api } from "@/lib/api";

export type BillingMeResponse = {
  is_billable: boolean;
  reason: string | null;
  next_action: string | null;
  business: {
    id: number;
    name: string;
    slug: string;
    business_type: string;
    billing_status: string;
    suspended_at?: string | null;
  };
  seats: {
    active_staff: number;
    staff_limit: number | null;
    owners_unlimited?: boolean;
    managers_unlimited?: boolean;
  };
  usage?: {
    active_staff: number;
    staff_limit: number | null;
    services_count: number;
    services_limit: number | null;
    locations_count: number;
    locations_limit: number | null;
  };

  individual_offers?: Array<{
    id: number;
    title: string;
    base_plan: {
      id: number;
      code: string;
      name: string;
      staff_limit: number;
      services_limit?: number | null;
      locations?: number | null;
      currency: string;
    };
    effective_monthly_price: number;
    effective_yearly_price: number;
    discount_amount: number;
    discount_type?: string | null;
    discount_value?: number | null;
    billing_cycles_limit?: number | null;
    used_billing_cycles?: number;
    remaining_billing_cycles?: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    note?: string | null;
  }>;

  payment_provider?: {
    default: "idbank" | "idbank_mock";
    mode: string;
    live_ready: boolean;
  } | null;
  pricing?: {
    currency: string;
    base_monthly_price: number;
    base_yearly_price: number;
    effective_monthly_price: number;
    effective_yearly_price: number;
    discount_amount: number;
    has_override: boolean;
    override?: {
      id: number;
      custom_monthly_price?: number | null;
      custom_yearly_price?: number | null;
      discount_type?: string | null;
      discount_value?: number | null;
      billing_cycles_limit?: number | null;
      used_billing_cycles?: number;
      remaining_billing_cycles?: number | null;
      starts_at?: string | null;
      ends_at?: string | null;
      note?: string | null;
    } | null;
  } | null;
  subscription: null | {
    status: string;
    billing_cycle?: "monthly" | "yearly";
    trial_ends_at?: string | null;
    current_period_ends_at?: string | null;
    plan: null | {
      code: string;
      name: string;
      price: number;
      monthly_price: number;
      yearly_price: number;
      currency: string;
      staff_limit: number;
      services_limit?: number | null;
      locations?: number | null;
      duration_days?: number;
      features?: Record<string, boolean | number | string | null>;
    };
  };
};

export async function fetchBillingMe(): Promise<BillingMeResponse> {
  const r = await api.get("/billing/me");
  return r.data.data as BillingMeResponse;
}
