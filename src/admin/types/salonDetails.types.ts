export type BeautyStatus = "active" | "suspended" | "pending";
export type SubscriptionStatus = "active" | "trialing" | "canceled" | "past_due" | "incomplete" | string;

export type BeautyDetailsResponse = {
    success: boolean;
    data: {
        beauty: {
            id: number;
            name: string;
            slug: string;
            phone?: string | null;
            address?: string | null;
            timezone?: string | null;
            status: BeautyStatus;
            is_onboarding_completed: boolean;
            work_start?: string | null;
            work_end?: string | null;
            slot_step_minutes?: number | null;
            created_at?: string | null;
            updated_at?: string | null;
        };

        owner: null | {
            id: number;
            name: string;
            email: string;
            phone?: string | null;
            is_active: boolean;
            created_at?: string | null;
        };

        subscription: null | {
            id: number;
            status: SubscriptionStatus;
            trial_ends_at?: string | null;
            current_period_starts_at?: string | null;
            current_period_ends_at?: string | null;
            canceled_at?: string | null;
            provider?: string | null;
            is_active: boolean;
        };

        plan: null | {
            id: number;
            name: string;
            price: number;
            interval: string;
            seats?: number | null;
        };

        seats: {
            used: number;
            limit: number | null;
            has_available: boolean;
        };

        stats: {
            users_total: number;
            bookings_total: number;
            bookings_last_30_days: number;
            revenue_total: number;
            revenue_last_30_days: number;
            currency: "AMD";
        };
    };
};