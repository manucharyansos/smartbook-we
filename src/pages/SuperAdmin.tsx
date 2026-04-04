import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building2, Loader2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

type DashboardData = {
  businesses: { total: number; active: number; suspended: number; pending: number };
  users: { total: number; owners: number; managers: number; staff: number };
  bookings: { period_total: number; today: number };
  revenue: { period_total: number; today: number; all_time_total: number };
  subscriptions: { active: number; trialing: number; canceled: number; mrr: number };
};

type Business = {
  id: number;
  name: string;
  slug: string;
  business_type: "beauty" | "dental";
  status: "active" | "suspended" | "pending";
  users_count?: number;
  bookings_count?: number;
};

async function fetchDashboard(): Promise<DashboardData> {
  const r = await api.get("/admin/analytics/dashboard");
  return r.data.data as DashboardData;
}

async function fetchBusinesses(): Promise<Business[]> {
  const r = await api.get("/admin/businesses");
  return r.data.data as Business[];
}

export default function SuperAdmin() {
  const dashboardQ = useQuery({ queryKey: ["admin", "dashboard", "summary"], queryFn: fetchDashboard, staleTime: 30_000 });
  const businessesQ = useQuery({ queryKey: ["admin", "businesses", "summary"], queryFn: fetchBusinesses, staleTime: 30_000 });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHero
        eyebrow={<><ShieldCheck className="h-4 w-4" /> Admin operations</>}
        title="Super admin overview"
        description="Legacy super-admin billing էջը վերափոխվել է աշխատող admin analytics + businesses endpoints-ի վրա հիմնված overview-ի։"
      />

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {dashboardQ.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[28px] border border-slate-200 bg-white/80" />
          ))
        ) : (
          <>
            <Card>
              <div className="flex items-center gap-2 text-sm text-slate-500"><Building2 className="h-4 w-4 text-violet-600" /> Businesses</div>
              <div className="mt-3 text-3xl font-semibold text-slate-950">{dashboardQ.data?.businesses.total ?? 0}</div>
              <div className="mt-2 text-sm text-slate-500">Active: {dashboardQ.data?.businesses.active ?? 0} • Suspended: {dashboardQ.data?.businesses.suspended ?? 0}</div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-sm text-slate-500"><Users className="h-4 w-4 text-violet-600" /> Users</div>
              <div className="mt-3 text-3xl font-semibold text-slate-950">{dashboardQ.data?.users.total ?? 0}</div>
              <div className="mt-2 text-sm text-slate-500">Owners: {dashboardQ.data?.users.owners ?? 0} • Staff: {dashboardQ.data?.users.staff ?? 0}</div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-sm text-slate-500"><TrendingUp className="h-4 w-4 text-violet-600" /> Revenue</div>
              <div className="mt-3 text-3xl font-semibold text-slate-950">{(dashboardQ.data?.revenue.period_total ?? 0).toLocaleString("hy-AM")}</div>
              <div className="mt-2 text-sm text-slate-500">Այսօր: {(dashboardQ.data?.revenue.today ?? 0).toLocaleString("hy-AM")}</div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-sm text-slate-500"><ShieldCheck className="h-4 w-4 text-violet-600" /> Subscriptions</div>
              <div className="mt-3 text-3xl font-semibold text-slate-950">{dashboardQ.data?.subscriptions.active ?? 0}</div>
              <div className="mt-2 text-sm text-slate-500">Trialing: {dashboardQ.data?.subscriptions.trialing ?? 0} • MRR: {(dashboardQ.data?.subscriptions.mrr ?? 0).toLocaleString("hy-AM")}</div>
            </Card>
          </>
        )}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-950">Բիզնեսների արագ ցուցակ</div>
            <div className="text-sm text-slate-500">Վերջին ստուգման համար աշխատող endpoints-ով</div>
          </div>
          {businessesQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}
        </div>

        {businessesQ.data && businessesQ.data.length > 0 ? (
          <div className="space-y-3">
            {businessesQ.data.slice(0, 8).map((business) => (
              <div key={business.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-slate-900">#{business.id} • {business.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{business.slug} • {business.business_type}</div>
                </div>
                <div className="text-sm text-slate-500">Users: {business.users_count ?? 0} • Bookings: {business.bookings_count ?? 0} • Status: {business.status}</div>
              </div>
            ))}
          </div>
        ) : businessesQ.isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Բեռնում ենք բիզնեսները…</div>
        ) : (
          <EmptyState icon={Building2} title="Բիզնեսներ չեն գտնվել" description="Երբ admin list endpoint-ը վերադարձնի տվյալներ, այստեղ կերևա summary ցուցակը։" className="border-0 shadow-none" />
        )}
      </Card>
    </motion.div>
  );
}
