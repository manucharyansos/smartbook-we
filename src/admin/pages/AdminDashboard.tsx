import { useEffect, useMemo, useState } from 'react';
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
import { Toast } from '@/components/ui/Toast';
import { adminBillingApi } from '../services/adminBillingApi';
import { adminErrorText, fetchSystemStatus } from '../services/adminApi';
import { adminLabel, verticalLabel } from '../lib/labels';

function fmtAMD(n: number) {
  return `${new Intl.NumberFormat('hy-AM').format(n)} ֏`;
}

function businessTypeLabel(type?: string, vertical?: string | null) {
  return verticalLabel(vertical, type);
}

function sourceLabel(source: string) {
  const known: Record<string, string> = { unknown: 'Անհայտ', website: 'Կայք', mobile: 'Հավելված', manual: 'Ձեռքով', widget: 'Վիջեթ', telegram: 'Telegram', marketplace: 'Որոնում' };
  return known[source] ?? source.replace(/_/g, ' ');
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DashboardFilters>({ period: '30_days' });
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'analytics-dashboard', filters],
    queryFn: async () => (await adminAnalyticsService.getDashboard(filters)) as DashboardResponse,
    staleTime: 60_000,
  });

  const stats = data?.data;
  const billingQ = useQuery({ queryKey: ['admin', 'billing', 'summary'], queryFn: () => adminBillingApi.summary(), staleTime: 60_000 });
  const billing = billingQ.data;
  const systemQ = useQuery({ queryKey: ['admin', 'system'], queryFn: fetchSystemStatus, staleTime: 60_000, retry: false });
  const system = systemQ.data;

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
        hint: `${stats.users.owners} սեփականատեր · ${stats.users.managers} մենեջեր · ${stats.users.staff} աշխատակից`,
        icon: Users,
        tone: 'sky' as const,
        trend: stats.users.growth,
      },
      {
        title: 'Ամրագրումներ',
        value: stats.bookings.period_total,
        hint: `${stats.bookings.today} այսօր · ${stats.bookings.completion_rate}% հաստատված`,
        icon: CalendarCheck,
        tone: 'emerald' as const,
        trend: stats.bookings.trend,
      },
      {
        title: 'Բիզնեսների շրջանառություն',
        value: fmtAMD(stats.revenue.period_total),
        hint: `Հաճախորդների ամրագրումներ, ոչ Vizit-ի եկամուտ · միջինը ${fmtAMD(stats.revenue.average_booking_value)}`,
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
      setToast({ text: 'Եկամուտների CSV ֆայլը պատրաստ է', type: 'success' });
    } catch {
      setToast({ text: 'Չհաջողվեց ներբեռնել եկամուտների CSV ֆայլը', type: 'error' });
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
      <div role="alert" className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-rose-700">{adminErrorText(error, 'Չհաջողվեց բեռնել վահանակի տվյալները')}</div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHero
        eyebrow={<><ShieldCheck className="h-4 w-4" /> Vizit-ի վահանակ</>}
        title="Ընդհանուր պատկեր"
        description={`Ժամանակահատված՝ ${stats.date_range.start} — ${stats.date_range.end}։ Vizit-ի եկամուտը, բիզնեսները, ամրագրումները և բաժանորդագրությունները։`}
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

      {system && system.pending_migrations.length ? (
        <div role="alert" className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Սերվերում կան չարված միգրացիաներ ({system.pending_migrations.length})։ Գործարկիր <code>php artisan migrate --force</code> և <code>php artisan optimize:clear</code>։</div>
      ) : null}
      {billingQ.isError ? <div role="alert" className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{adminErrorText(billingQ.error, 'Vizit-ի եկամուտը չբեռնվեց')}</div> : null}
      {billing ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <AdminStatCard title="Vizit-ի եկամուտ այս ամիս" value={fmtAMD(billing.income.this_month)} hint={`${fmtAMD(billing.income.all_time)} ընդհանուր · Idram ${billing.provider.idram.ready ? 'միացված' : 'միացված չէ'}`} icon={CircleDollarSign} tone="emerald" />
          <AdminStatCard title="Ամսական կրկնվող եկամուտ" value={fmtAMD(billing.mrr)} hint={`${billing.subscriptions.active} վճարված · ${billing.subscriptions.trialing} փորձաշրջանում`} icon={DollarSign} tone="violet" />
          <AdminStatCard title="Չվճարված հաշիվներ" value={billing.pending.invoices} hint={fmtAMD(billing.pending.amount)} icon={Clock3} tone="amber" />
          <button type="button" onClick={() => navigate('/admin/payments')} className="text-left"><AdminStatCard title="Պահանջում է ստուգում" value={billing.review_required} hint="Բացել վճարումների էջը" icon={AlarmClockCheck} tone={billing.review_required ? 'rose' : 'slate'} /></button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {cards.map((card) => (
          <AdminStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Card className="rounded-[28px] p-5 xl:col-span-1">
          <div className="text-sm font-medium text-slate-500">Ամրագրումների վիճակ</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Հաստատված/ավարտված</span><span>{stats.bookings.completed}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Չեղարկված</span><span>{stats.bookings.canceled}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Չեկած</span><span>{stats.bookings.no_show}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Օրական միջինը</span><span>{stats.bookings.average_daily}</span></div>
          </div>
        </Card>

        <Card className="rounded-[28px] p-5 xl:col-span-1">
          <div className="text-sm font-medium text-slate-500">Բաժանորդագրություններ</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Ամսական եկամուտ</span><span>{fmtAMD(stats.subscriptions.mrr)}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Տարեկան եկամուտ</span><span>{fmtAMD(stats.subscriptions.arr)}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Փորձաշրջանն ավարտվում է 7 օրում</span><span>{stats.subscriptions.expiring_trials_7d}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"><span>Երկարաձգում 30 օրում</span><span>{stats.subscriptions.renewals_due_30d}</span></div>
          </div>
        </Card>

        <Card className="rounded-[28px] p-5 xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-violet-100 bg-violet-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-700"><BarChart3 className="h-4 w-4" /> Ակտիվ բիզնեսներ</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">{stats.operations.active_businesses_with_bookings}</div>
              <p className="mt-1 text-sm text-slate-500">Ժամանակահատվածում ամրագրում ունեցած բիզնեսներ</p>
            </div>
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700"><Clock3 className="h-4 w-4" /> Միջին աշխատակից</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">{stats.operations.avg_staff_per_business}</div>
              <p className="mt-1 text-sm text-slate-500">Ակտիվ աշխատակիցներ մեկ բիզնեսի հաշվով</p>
            </div>
            <div className="rounded-[24px] border border-amber-100 bg-amber-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700"><AlarmClockCheck className="h-4 w-4" /> Միջին ամրագրում</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">{stats.operations.avg_bookings_per_active_business}</div>
              <p className="mt-1 text-sm text-slate-500">Ամրագրումներ մեկ ակտիվ բիզնեսի հաշվով</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Card className="rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-950">Շրջանառության դինամիկա</div>
              <div className="text-sm text-slate-500">Բիզնեսների հաճախորդների ամրագրումներից</div>
            </div>
            <div className="bb-stat-pill">Միջին՝ {fmtAMD(stats.revenue.average_booking_value)}</div>
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
              <div className="text-sm text-slate-500">Հաստատված {stats.bookings.completion_rate}% · Չեղարկված {stats.bookings.cancellation_rate}%</div>
            </div>
            <div className="bb-stat-pill">Այսօր {stats.bookings.today}</div>
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
            <div className="text-lg font-semibold text-slate-950">Ամրագրման աղբյուրներ</div>
            <CircleDollarSign className="h-5 w-5 text-violet-500" />
          </div>
          <div className="space-y-3">
            {stats.top_sources.length ? stats.top_sources.map((item) => (
              <div key={item.source} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium capitalize text-slate-900">{sourceLabel(item.source)}</div>
                  <div className="text-sm text-slate-500">{item.total} ամրագրում</div>
                </div>
                <div className="mt-2 text-sm text-slate-500">{fmtAMD(item.revenue)}</div>
              </div>
            )) : <EmptyState icon={TrendingUp} title="Տվյալներ չկան" description="Ամրագրումների աղբյուրները կերևան այստեղ։" className="border-0 shadow-none" />}
          </div>
        </Card>

        <Card className="rounded-[30px] p-6 xl:col-span-1">
          <div className="mb-4 text-lg font-semibold text-slate-950">Բիզնեսներն ըստ տեսակի</div>
          <div className="space-y-3">
            {stats.business_mix.length ? stats.business_mix.map((item) => (
              <div key={item.business_type} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-slate-900">{businessTypeLabel(item.business_type)}</div>
                  <div className="text-sm text-slate-500">{item.total} բիզնես</div>
                </div>
                <div className="mt-2 text-sm text-slate-500">{item.active} ակտիվ · {item.bookings} ամրագրում · {fmtAMD(item.revenue)}</div>
              </div>
            )) : <EmptyState icon={Building2} title="Տվյալներ չկան" description="Բիզնեսների բաշխվածությունը կերևա այստեղ։" className="border-0 shadow-none" />}
          </div>
        </Card>

        <Card className="rounded-[30px] p-6 xl:col-span-1">
          <div className="mb-4 text-lg font-semibold text-slate-950">Այլ ցուցանիշներ</div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">Չեկածների տոկոս <span className="float-right font-medium text-slate-900">{stats.bookings.no_show_rate}%</span></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">Միջին շրջանառություն մեկ բիզնեսի <span className="float-right font-medium text-slate-900">{fmtAMD(stats.revenue.average_business_revenue)}</span></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">Փորձաշրջանում <span className="float-right font-medium text-slate-900">{stats.subscriptions.trialing}</span></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">Չեղարկված բաժանորդագրություններ <span className="float-right font-medium text-slate-900">{stats.subscriptions.canceled}</span></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Card className="rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-950">Ամենաակտիվ բիզնեսները</div>
              <div className="text-sm text-slate-500">Ըստ ժամանակահատվածի շրջանառության և ամրագրումների</div>
            </div>
          </div>
          <div className="space-y-3">
            {stats.top_businesses.map((business) => (
              <button key={business.id} onClick={() => navigate(`/admin/businesses/${business.id}`)} className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-slate-900">{business.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{business.slug} · {businessTypeLabel(business.business_type, (business as { vertical?: string | null }).vertical)}</div>
                </div>
                <div className="text-sm text-slate-500">{business.bookings_count} ամրագրում · {business.active_staff_count} աշխատակից · {fmtAMD(business.revenue)}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-950">Վերջին ավելացված բիզնեսներ</div>
              <div className="text-sm text-slate-500">Նոր գրանցված բիզնեսները</div>
            </div>
          </div>
          <div className="space-y-3">
            {stats.recent_businesses.map((business) => (
              <button key={business.id} onClick={() => navigate(`/admin/businesses/${business.id}`)} className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-slate-900">{business.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{businessTypeLabel(business.business_type, (business as { vertical?: string | null }).vertical)} · {adminLabel(business.status)}</div>
                </div>
                <div className="text-sm text-slate-500">{business.users_count} օգտատեր · {business.bookings_count} ամրագրում</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
      <div className="text-xs text-slate-400">{system ? `API ${system.commit ?? '—'} · ${system.database} · ${system.environment}${system.routes_cached ? ' · route cache' : ''}` : systemQ.isError ? adminErrorText(systemQ.error, 'Համակարգի վիճակը հասանելի չէ') : null}</div>
      <Toast open={!!toast} text={toast?.text || ''} type={toast?.type} />
    </motion.div>
  );
}
