import { api } from "@/lib/api.ts";

export type BusinessType = "beauty" | "dental";

export type PublicPlan = {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    price: number | null;
    monthly_price?: number | null;
    currency?: string | null;
    period?: string | null;
    staff_limit?: number | null;
    services_limit?: number | null;
    locations?: number | null;
    features?: Record<string, unknown> | null;
    is_custom?: boolean;
    self_serve?: boolean;
    pricing_model?: {
        staff_based: boolean;
        owners_unlimited: boolean;
        managers_unlimited: boolean;
    } | null;
    yearly_offer?: {
        enabled: boolean;
        price: number | null;
        months_charged: number;
        months_free: number;
        discount_amount: number;
    } | null;
};

export const plansApi = {
    list: (_businessType?: BusinessType, showHidden?: boolean) =>
        api.get<{ data: PublicPlan[] }>("/plans", {
            params: {
                business_type: _businessType ?? undefined,
                show_hidden: showHidden,
            },
        }),
};

export const publicPlansApi = {
    list: (_businessType?: BusinessType) =>
        api.get<{ data: PublicPlan[] }>("/plans", {
            params: { business_type: _businessType ?? undefined },
        }),
};
