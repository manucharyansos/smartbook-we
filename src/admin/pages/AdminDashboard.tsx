import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, CalendarCheck, Download, DollarSign, RefreshCcw, ShieldCheck, TrendingUp, Users, BarChart3, CircleDollarSign, Clock3, AlarmClockCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

import { adminAnalyticsService, type DashboardFilters } from '../services/adminAnalyticsApi';
import type { DashboardResponse } from '../types/analytics.types';
import { downloadBlob, filenameFromContentDisposition } from '../lib/download';
import { PageHero } from '@/components/ui/PageHero';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdminStatCard } from '../components/AdminStatCard';

function fmtAMD(n: number) {
  return `${new Intl.NumberFormat('hy-AM').format(n)} ֏`;
}

function businessTypeLabel(type?: string) {
  if (type === 'beauty') return 'Beauty';
  if (type === 'dental' || type === 'clinic') return 'Clinic';
  return 'Other';
}

function sourceLabel(source: string) {
  return source === 'unknown' ? 'Unknown' : source.replace(/_/g, ' ');
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DashboardFilters>({ period: '30_days' });
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'analytics-dashboard', filters],
    queryFn: async () => (await adminAnalyticsService.getDashboard(filters)) as DashboardResponse,
    staleTime: 60_000,
  });

  const stats = data?.data;

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: 'Բիզնեսներ',
        value: stats.businesses.total,
        hint: `${stats.businesses.active} ակտիվ · ${stats.businesses.suspended} կասեցված · ${stats.businesses.new} նոր`,
        icon: Building2,
        tone: 'violet' as const,
        trend: stats.businesses.growth,
      },
      {
        title: 'Օգտատերեր',
        value: stats.users.total,
        hint: `${stats.users.staff} staff · ${stats.users.owners} owner · ${stats.users.managers} manager`,
        icon: Users,
        tone: 'sky' as const,
        trend: stats.users.growth,
      },
      {
        title: 'Ամրագրումներ',
        value: stats.bookings.period_total,
        hint: `${stats.bookings.today} այսօր · completion ${stats.bookings.completion_rate}%`,
        icon: CalendarCheck,
        tone: 'emerald' as const,
        trend: stats.bookings.trend,
      },
      {
        title: 'Եկամուտ',
        value: fmtAMD(stats.revenue.period_total),
        hint: `${fmtAMD(stats.revenue.today)} այսօր · avg ticket ${fmtAMD(stats.revenue.average_booking_value)}`,
        icon: DollarSign,
        tone: 'amber' as const,
        trend: stats.revenue.trend,
      },
    ];
  }, [stats]);

  const handleExportRevenue = async () => {
    if (!stats || exporting) return;
    setExporting(true);
    try {
      const res = await adminAnalyticsService.exportRevenue({
        period: filters.period,
        from: filters.from,
        to: filters.to,
        group_by: stats.charts.group_by,
      });
      const cd = res.headers?.['content-disposition'] || res.headers?.['Content-Disposition'];
      const filename = filenameFromContentDisposition(cd) || `revenue_${stats.date_range.start}_${stats.date_range.end}.csv`;
      downloadBlob(res.data, filename);
    } catch {
      alert('Չհաջողվեց ներբեռնել եկամուտների CSV ֆայլը');
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-[32px] border border-slate-200 bg-white/80" />
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-[28px] border border-slate-200 bg-white/80" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-rose-700">Չհաջողվեց բեռնել analytics-ը</div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHero
        eyebrow={<><ShieldCheck className="h-4 w-4" /> Platform analytics</>}
        title="Super admin analytics"
        description={`Տվյալները՝ ${stats.date_range.start} — ${stats.date_range.end}. Այստեղ տեսնում ես platform health, source mix, top businesses և recurring revenue ազդակները։`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filters.period}
              onChange={(e) => setFilters({ period: e.target.value as DashboardFilters['period'] })}
              className="bb-input h-11 min-w-[170px]"
            >
              <option value="7_days">Վերջին 7 օր</option>
              <option value="30_days">Վերջին 30 օր</option>
              <option value="90_days">Վերջին 90 օր</option>
              <option value="12_months">Վերջին 12 ամիս</option>
            </select>
            <Button variant="secondary" onClick={() => refetch()} className="gap-2">
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Թարմացնել
            </Button>
            <Button variant="secondary" onClick={handleExportRevenue} loading={exporting} className="gap-2">
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {cards.map((card) => (
          <AdminStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Card className="rounded-[28px] p-5 xl:col-span-1">
          <div className="text-sm font-medium text-slate-500">Booking health</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Completed</span><span>{stats.bookings.completed}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Cancelled</span><span>{stats.bookings.canceled}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>No-show</span><span>{stats.bookings.no_show}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Average daily</span><span>{stats.bookings.average_daily}</span></div>
          </div>
        </Card>

        <Card className="rounded-[28px] p-5 xl:col-span-1">
          <div className="text-sm font-medium text-slate-500">Subscription signals</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>MRR</span><span>{fmtAMD(stats.subscriptions.mrr)}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>ARR</span><span>{fmtAMD(stats.subscriptions.arr)}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Trials ending 7d</span><span>{stats.subscriptions.expiring_trials_7d}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Renewals due 30d</span><span>{stats.subscriptions.renewals_due_30d}</span></div>
          </div>
        </Card>

        <Card className="rounded-[28px] p-5 xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-violet-100 bg-violet-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-700"><BarChart3 className="h-4 w-4" /> Active businesses</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">{stats.operations.active_businesses_with_bookings}</div>
              <p className="mt-1 text-sm text-slate-500">Պարբերության ընթացքում booking ունեցող բիզնեսներ</p>
            </div>
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700"><Clock3 className="h-4 w-4" /> Avg staff</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">{stats.operations.avg_staff_per_business}</div>
              <p className="mt-1 text-sm text-slate-500">Միջին ակտիվ staff մեկ ակտիվ բիզնեսի վրա</p>
            </div>
            <div className="rounded-[24px] border border-amber-100 bg-amber-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700"><AlarmClockCheck className="h-4 w-4" /> Avg bookings</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">{stats.operations.avg_bookings_per_active_business}</div>
              <p className="mt-1 text-sm text-slate-500">Միջին booking ակտիվ բիզնեսի վրա</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Card className="rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-950">Եկամուտների դինամիկա</div>
              <div className="text-sm text-slate-500">Trend ըստ {stats.charts.group_by}</div>
            </div>
            <div className="bb-stat-pill">Avg ticket {fmtAMD(stats.revenue.average_booking_value)}</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.charts.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-950">Ամրագրումների դինամիկա</div>
              <div className="text-sm text-slate-500">Completion {stats.bookings.completion_rate}% · Cancel {stats.bookings.cancellation_rate}%</div>
            </div>
            <div className="bb-stat-pill">Today {stats.bookings.today}</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.bookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <Card className="rounded-[30px] p-6 xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-950">Source mix</div>
            <CircleDollarSign className="h-5 w-5 text-violet-500" />
          </div>
          <div className="space-y-3">
            {stats.top_sources.length ? stats.top_sources.map((item) => (
              <div key={item.source} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium capitalize text-slate-900">{sourceLabel(item.source)}</div>
                  <div className="text-sm text-slate-500">{item.total} bookings</div>
                </div>
                <div className="mt-2 text-sm text-slate-500">Revenue {fmtAMD(item.revenue)}</div>
              </div>
            )) : <EmptyState icon={TrendingUp} title="Source data չկա" description="Երբ source tracking data լինի, այստեղ կտեսնես ամենաուժեղ ալիքները։" className="border-0 shadow-none" />}
          </div>
        </Card>

        <Card className="rounded-[30px] p-6 xl:col-span-1">
          <div className="mb-4 text-lg font-semibold text-slate-950">Business mix</div>
          <div className="space-y-3">
            {stats.business_mix.length ? stats.business_mix.map((item) => (
              <div key={item.business_type} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-slate-900">{businessTypeLabel(item.business_type)}</div>
                  <div className="text-sm text-slate-500">{item.total} businesses</div>
                </div>
                <div className="mt-2 text-sm text-slate-500">{item.active} active · {item.bookings} bookings · {fmtAMD(item.revenue)}</div>
              </div>
            )) : <EmptyState icon={Building2} title="Mix data չկա" description="Business type breakdown-ը կերևա այստեղ։" className="border-0 shadow-none" />}
          </div>
        </Card>

        <Card className="rounded-[30px] p-6 xl:col-span-1">
          <div className="mb-4 text-lg font-semibold text-slate-950">Platform signals</div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">No-show rate <span className="float-right font-medium text-slate-900">{stats.bookings.no_show_rate}%</span></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">Avg revenue per active business <span className="float-right font-medium text-slate-900">{fmtAMD(stats.revenue.average_business_revenue)}</span></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">Trialing subscriptions <span className="float-right font-medium text-slate-900">{stats.subscriptions.trialing}</span></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">Canceled subscriptions <span className="float-right font-medium text-slate-900">{stats.subscriptions.canceled}</span></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Card className="rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-950">Top businesses</div>
              <div className="text-sm text-slate-500">Ըստ պարբերության եկամտի և booking ակտիվության</div>
            </div>
          </div>
          <div className="space-y-3">
            {stats.top_businesses.map((business) => (
              <button key={business.id} onClick={() => navigate(`/admin/businesses/${business.id}`)} className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-slate-900">{business.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{business.slug} · {businessTypeLabel(business.business_type)}</div>
                </div>
                <div className="text-sm text-slate-500">{business.bookings_count} bookings · {business.active_staff_count} staff · {fmtAMD(business.revenue)}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-950">Վերջին ավելացված բիզնեսներ</div>
              <div className="text-sm text-slate-500">Onboarding և activation flow-ի արագ ստուգման համար</div>
            </div>
          </div>
          <div className="space-y-3">
            {stats.recent_businesses.map((business) => (
              <button key={business.id} onClick={() => navigate(`/admin/businesses/${business.id}`)} className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-slate-900">{business.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{businessTypeLabel(business.business_type)} · {business.status}</div>
                </div>
                <div className="text-sm text-slate-500">{business.users_count} users · {business.bookings_count} bookings</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
