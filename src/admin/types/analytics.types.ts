export type DashboardResponse = {
  success: boolean;
  data: {
    period: string;
    date_range: { start: string; end: string };
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
      completed: number;
      canceled: number;
      no_show: number;
      average_daily: number;
      completion_rate: number;
      cancellation_rate: number;
      no_show_rate: number;
    };
    revenue: {
      period_total: number;
      today: number;
      all_time_total: number;
      trend: number;
      average_booking_value: number;
      average_business_revenue: number;
    };
    subscriptions: {
      active: number;
      trialing: number;
      canceled: number;
      mrr: number;
      arr: number;
      expiring_trials_7d: number;
      renewals_due_30d: number;
    };
    operations: {
      active_businesses_with_bookings: number;
      avg_staff_per_business: number;
      avg_bookings_per_active_business: number;
    };
    recent_businesses: Array<{
      id: number;
      name: string;
      business_type: 'beauty' | 'dental' | 'clinic' | string;
      status: 'active' | 'suspended' | 'pending' | string;
      users_count: number;
      bookings_count: number;
    }>;
    top_businesses: Array<{
      id: number;
      name: string;
      slug: string;
      business_type: string;
      status: string;
      bookings_count: number;
      active_staff_count: number;
      revenue: number;
    }>;
    business_mix: Array<{
      business_type: string;
      total: number;
      active: number;
      bookings: number;
      revenue: number;
    }>;
    top_sources: Array<{
      source: string;
      total: number;
      revenue: number;
    }>;
    charts: {
      group_by: 'day' | 'week' | 'month';
      revenue: Array<{ period: string; bookings: number; revenue: number }>;
      bookings: Array<{ period: string; bookings: number }>;
    };
    currency: 'AMD';
  };
};
