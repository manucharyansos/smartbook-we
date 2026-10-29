import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Eye, Globe2, MousePointerClick, RefreshCcw, Smartphone, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { AdminStatCard } from "../components/AdminStatCard";
import { adminApi, adminErrorText } from "../services/adminApi";

type Row = { label: string | null; total: number; visitors: number };
type SiteAnalytics = {
  range: { from: string; to: string; days: number };
  totals: { views: number; visitors: number; today_visitors: number; app_opens: number; bookings_created: number; online_bookings: number };
  series: { date: string; visitors: number; views: number }[];
  events: Record<string, number>;
  top_pages: Row[]; referrers: Row[]; campaigns: Row[]; devices: Row[]; sources: Row[];
  top_businesses: { id: number; name: string; slug: string | null; total: number; visitors: number }[];
};

const eventLabels: Record<string, string> = {
  page_view: "Էջի դիտում", screen_view: "Հավելվածի էկրան", app_open: "Հավելվածի բացում", business_view: "Բիզնեսի էջ",
  booking_started: "Ամրագրում սկսել", booking_created: "Ամրագրում ուղարկել", signup_started: "Գրանցում սկսել",
  signup_completed: "Գրանցվել", search: "Որոնում", map_open: "Քարտեզ", contact_click: "Կապ", directions_click: "Ճանապարհ",
};
const labelMap: Record<string, string> = { mobile: "Հեռախոս", tablet: "Պլանշետ", desktop: "Համակարգիչ", web: "Կայք" };
const pageNames: Record<string, string> = { "/": "Գլխավոր", "/pricing": "Գներ", "/business": "Բիզնեսների համար", "/register": "Գրանցում", "/login": "Մուտք", "/map": "Քարտեզ", "/contact": "Կապ", "/about": "Մեր մասին" };
const fmt = (value: number) => new Intl.NumberFormat("hy-AM").format(value);

function List({ title, rows, render, empty = "Տվյալներ չկան" }: { title: string; rows: Row[]; render?: (label: string | null) => string; empty?: string }) {
  const max = Math.max(1, ...rows.map((row) => row.total));
  return (
    <Card className="space-y-3 p-5">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {!rows.length ? <p className="text-sm text-slate-500">{empty}</p> : rows.map((row) => (
        <div key={String(row.label)} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate text-slate-700">{render ? render(row.label) : row.label ?? "—"}</span><span className="shrink-0 font-medium">{fmt(row.total)} <span className="font-normal text-slate-400">· {fmt(row.visitors)} այց.</span></span></div>
          <div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[var(--vz-primary)]" style={{ width: `${Math.round(row.total / max * 100)}%` }} /></div>
        </div>
      ))}
    </Card>
  );
}

export default function AdminSiteAnalytics() {
  const [days, setDays] = useState(30);
  const q = useQuery({ queryKey: ["admin", "site-analytics", days], queryFn: async () => (await adminApi.get<{ data: SiteAnalytics }>("/site-analytics", { params: { days } })).data.data, staleTime: 60_000 });
  const data = q.data;
  const funnel = ["business_view", "booking_started", "booking_created", "signup_started", "signup_completed"];

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={<><Globe2 className="h-4 w-4" /> Կայք և հավելված</>}
        title="Այցելություններ"
        description="Քանի մարդ է բացել կայքն ու հավելվածը, որ էջերն ու բիզնեսներն են դիտել, որտեղից են եկել և ինչ գործողություններ են արել։ Տվյալներն անանուն են. IP հասցեներ և cookie-ներ չեն պահվում։"
        actions={<div className="flex flex-wrap gap-2">
          {[1, 7, 30, 90].map((value) => <Button key={value} size="sm" variant={days === value ? "primary" : "secondary"} onClick={() => setDays(value)}>{value === 1 ? "Այսօր" : `${value} օր`}</Button>)}
          <Button size="sm" variant="secondary" onClick={() => void q.refetch()} aria-label="Թարմացնել"><RefreshCcw className={cn("h-4 w-4", q.isFetching && "animate-spin")} /></Button>
        </div>}
      />
      {q.isError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{adminErrorText(q.error, "Չհաջողվեց բեռնել այցելությունները")}</div> : null}
      {q.isLoading ? <p role="status" className="py-10 text-center text-sm text-slate-500">Բեռնվում է…</p> : null}
      {data ? <>
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <AdminStatCard title="Այցելուներ" value={fmt(data.totals.visitors)} hint={`${fmt(data.totals.today_visitors)} այսօր · օրական եզակի այցելուների գումարը`} icon={Users} tone="emerald" />
          <AdminStatCard title="Էջերի դիտումներ" value={fmt(data.totals.views)} hint={data.totals.visitors ? `${(data.totals.views / data.totals.visitors).toFixed(1)} էջ մեկ այցելուի հաշվով` : undefined} icon={Eye} tone="violet" />
          <AdminStatCard title="Հավելվածի բացումներ" value={fmt(data.totals.app_opens)} icon={Smartphone} tone="sky" />
          <AdminStatCard title="Նոր ամրագրումներ" value={fmt(data.totals.bookings_created)} hint={`${fmt(data.totals.online_bookings)} օնլայն (կայք/հավելված)`} icon={CalendarCheck} tone="amber" />
        </div>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Օր առ օր</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} stroke="#64748b" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} width={36} />
                <Tooltip formatter={(value, name) => [fmt(Number(value ?? 0)), name === "visitors" ? "Այցելուներ" : "Դիտումներ"]} />
                <Area type="monotone" dataKey="views" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                <Area type="monotone" dataKey="visitors" stroke="#0F766E" fill="#0F766E" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900"><MousePointerClick className="h-4 w-4" /> Գործողություններ</h2>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {funnel.map((key) => <div key={key} className="rounded-2xl border border-slate-200 p-3"><div className="text-xs text-slate-500">{eventLabels[key]}</div><div className="text-xl font-semibold">{fmt(data.events[key] ?? 0)}</div></div>)}
          </div>
          <p className="text-xs text-slate-500">«Ամրագրում ուղարկել»-ը հաշվում է կայքի ձևից ուղարկված ամրագրումները։ «Նոր ամրագրումներ»-ը վերցված է բազայից և ներառում է բոլոր աղբյուրները։</p>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="space-y-3 p-5">
            <h2 className="text-base font-semibold text-slate-900">Ամենադիտված բիզնեսները</h2>
            {!data.top_businesses.length ? <p className="text-sm text-slate-500">Տվյալներ չկան</p> : data.top_businesses.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 text-sm">
                <Link to={`/admin/businesses/${row.id}`} className="min-w-0 truncate font-medium text-violet-700 hover:underline">{row.name}</Link>
                <span className="shrink-0">{fmt(row.total)} <span className="text-slate-400">· {fmt(row.visitors)} այց.</span></span>
              </div>
            ))}
          </Card>
          <List title="Ամենադիտված էջերը" rows={data.top_pages} render={(label) => (label && pageNames[label]) || label || "—"} />
          <List title="Որտեղից են եկել" rows={data.referrers} empty="Ուղիղ այցելություններ կամ աղբյուրը հայտնի չէ" />
          <List title="Գովազդային արշավներ (utm_source)" rows={data.campaigns} empty="utm_source-ով հղումներ դեռ չկան" />
          <List title="Սարքեր" rows={data.devices} render={(label) => (label && labelMap[label]) || "—"} />
          <List title="Կայք / հավելված" rows={data.sources} render={(label) => label === "mobile" ? "Հավելված" : "Կայք"} />
        </div>
      </> : null}
    </div>
  );
}
