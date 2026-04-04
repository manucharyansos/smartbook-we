// src/admin/types/admin.types.ts
export interface Admin {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'super_admin' | 'admin' | 'support' | 'finance';
    is_active: boolean;
    last_login_at?: string;
    last_login_ip?: string;
    created_at: string;
    updated_at: string;
}

export interface AdminLog {
    id: number;
    admin_id: number;
    admin?: Admin;
    action: string;
    model_type?: string;
    model_id?: number;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export interface Business {
    id: number;
    name: string;
    slug: string;
    business_type: 'beauty' | 'dental';
    email?: string;
    phone?: string;
    address?: string;
    status: 'active' | 'suspended' | 'pending';
    work_start?: string;
    work_end?: string;
    timezone?: string;
    is_onboarding_completed?: boolean;
    created_at: string;
    users_count?: number;
    bookings_count?: number;
    total_revenue?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'owner' | 'manager' | 'staff';
    is_active: boolean;
    business_id: number;
    business?: Business;
    created_at: string;
    bookings_count?: number;
}

export interface Plan {
    id: number;
    name: string;
    code: string;
    price: number;
    currency: string;
    seats: number;
    duration_days: number;
    is_active: boolean;
}

export interface Subscription {
    id: number;
    business_id: number;
    plan_id: number;
    plan?: Plan;
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';
    trial_ends_at?: string;
    current_period_starts_at?: string;
    current_period_ends_at?: string;
    canceled_at?: string;
    is_active: boolean;
}

export interface Invoice {
    id: number;
    business_id: number;
    plan_id: number;
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    payment_method?: string;
    note?: string;
    paid_at?: string;
    cancelled_at?: string;
    created_at: string;
    business?: Business;
    plan?: Plan;
}

export interface DashboardStats {
    businesses: {
        total: number;
        active: number;
        suspended: number;
        pending: number;
        new: number;
        growth: number;
    };
    users: {
        total: number;
        owners: number;
        managers: number;
        staff: number;
        new: number;
        growth: number;
    };
    bookings: {
        period_total: number;
        today: number;
        trend: number;
    };
    revenue: {
        period_total: number;
        today: number;
        all_time_total: number;
        trend: number;
        currency: string;
    };
    subscriptions: {
        active: number;
        trialing: number;
        canceled: number;
        mrr: number;
    };
    recent_businesses: Array<{
        id: number;
        name: string;
        business_type: 'beauty' | 'dental';
        status: 'active' | 'suspended' | 'pending';
        users_count: number;
        bookings_count: number;
    }>;
}

export interface BusinessDetailsResponse {
    business: Business;
    owner?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        is_active: boolean;
    };
    subscription?: Subscription;
    plan?: Plan;
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
        currency: 'AMD';
    };
    users?: User[];
    recent_bookings?: Array<{
        id: number;
        client_name: string;
        starts_at: string;
        status: string;
    }>;
}