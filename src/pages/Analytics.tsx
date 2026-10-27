import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, CalendarDays, DollarSign, Filter, RefreshCcw, ShieldBan, Users, Wallet, Star, Layers3, type LucideIcon } from "lucide-react";
import { BarChart, Bar, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

import { Card } from "../components/ui/Card";
import { page } from "../lib/motion";
import {
  fetchAnalyticsOverview,
  fetchClientInsights,
  fetchRevenue,
  fetchServiceStats,
  fetchSourceStats,
  fetchStaffStats,
} from "../lib/analyticsApi";

const sourceOptions = [
  { value: "", label: "Բոլոր աղբյուրները" },
  { value: "website", label: "Website" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "admin", label: "Admin" },
  { value: "partner", label: "Partner" },
  { value: "widget", label: "Widget" },
  { value: "qr", label: "QR" },
  { value: "returning_client", label: "Returning client" },
];

const colors = ["#7c3aed", "#10b981", "#f59e0b", "#0ea5e9", "#f43f5e", "#6366f1", "#14b8a6", "#64748b"];

function formatMoney(value: number, currency = "AMD") {
  try {
    return new Intl.NumberFormat("hy-AM").format(value) + ` ${currency === "AMD" ? "֏" : currency}`;
  } catch {
    return `${value} ${currency}`;
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("hy-AM", { month: "short", day: "numeric" });
}

function StatCard({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="rounded-[28px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-[var(--vz-muted)]">{label}</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-[var(--vz-text)]">{value}</div>
          {sub ? <div className="mt-2 text-xs text-[var(--vz-muted)]">{sub}</div> : null}
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--vz-accent-soft)] text-[var(--vz-accent-text)]"><Icon className="h-5 w-5" /></div>
      </div>
    </Card>
  );
}

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [months, setMonths] = useState(12);
  const [source, setSource] = useState("");

  const params = { source: source || undefined };

  const overviewQ = useQuery({ queryKey: ["analytics", "overview", params], queryFn: () => fetchAnalyticsOverview(params) });
  const revenueQ = useQuery({ queryKey: ["analytics", "revenue", months, params], queryFn: () => fetchRevenue(months, params) });
  const servicesQ = useQuery({ queryKey: ["analytics", "services", days, params], queryFn: () => fetchServiceStats({ days, ...params }) });
  const staffQ = useQuery({ queryKey: ["analytics", "staff", days, params], queryFn: () => fetchStaffStats({ days, ...params }) });
  const sourcesQ = useQuery({ queryKey: ["analytics", "sources", days, params], queryFn: () => fetchSourceStats({ days, ...params }) });
  const clientsQ = useQuery({ queryKey: ["analytics", "clients", days, params], queryFn: () => fetchClientInsights({ days, ...params }) });

  const currency = overviewQ.data?.currency || revenueQ.data?.currency || "AMD";
  const metrics30 = overviewQ.data?.metrics_30d;
  const sourceRows = sourcesQ.data?.rows ?? [];
  const topSource = sourceRows[0];
  const statusRows = overviewQ.data?.status_breakdown ?? [];

  const revenueData = useMemo(
    () => (revenueQ.data?.months ?? []).map((row) => ({ name: row.year_month?.slice(5) ?? row.year_month, revenue: row.revenue, bookings: row.bookings })),
    [revenueQ.data],
  );

  return (
    <motion.div {...page} className="admin-page space-y-4">
      <div className="rounded-[22px] border border-[var(--vz-line)] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_35%),white] p-5 shadow-[0_12px_34px_rgba(15,23,42,0.055)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--vz-accent-text)]">
              <BarChart3 className="h-4 w-4" /> Խորացված վերլուծություն
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--vz-text)]">Անալիտիկա</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--vz-text-secondary)]">Եկամուտ, աղբյուրներ, վերադարձող և կորցրած հաճախորդներ, VIP-ներ ու սև ցուցակ՝ մեկ էջում։</p>
          </div>
          <div className="grid gap-2 grid-cols-1 xs:grid-cols-3 sm:grid-cols-3">
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-3 text-sm">
              <option value={7}>7 օր</option>
              <option value={30}>30 օր</option>
              <option value={90}>90 օր</option>
            </select>
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-3 text-sm">
              <option value={6}>6 ամիս</option>
              <option value={12}>12 ամիս</option>
              <option value={24}>24 ամիս</option>
            </select>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--vz-muted)]" />
              <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] py-3 pl-11 pr-4 text-sm">
                {sourceOptions.map((item) => <option key={item.value || "all"} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Այսօր ամրագրումներ" value={overviewQ.data?.today.bookings ?? 0} />
        <StatCard icon={DollarSign} label="Այսօր եկամուտ" value={formatMoney(overviewQ.data?.today.revenue ?? 0, currency)} />
        <StatCard icon={Users} label="Վերջին 7 օրում" value={overviewQ.data?.last_7_days.bookings ?? 0} sub={`${overviewQ.data?.last_7_days.unique_clients ?? 0} unique clients`} />
        <StatCard icon={Wallet} label="Թոփ source" value={topSource ? `${topSource.source}` : "—"} sub={topSource ? `${topSource.bookings} bookings` : "Աղբյուրներ դեռ չկան"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard icon={RefreshCcw} label="Վերադարձող հաճախորդներ" value={clientsQ.data?.returning_clients ?? 0} sub={`${clientsQ.data?.rebooking_rate ?? 0}% rebooking`} />
        <StatCard icon={Users} label="Նոր հաճախորդներ" value={clientsQ.data?.new_clients ?? 0} sub={`${clientsQ.data?.active_clients ?? 0} active in window`} />
        <StatCard icon={AlertTriangle} label="Կորցրած հաճախորդներ" value={clientsQ.data?.lost_clients ?? 0} sub={`${clientsQ.data?.lost_threshold_days ?? 60} օր inactivity`} />
        <StatCard icon={Star} label="VIP հաճախորդներ" value={clientsQ.data?.vip_clients ?? 0} />
        <StatCard icon={ShieldBan} label="Blacklisted" value={clientsQ.data?.blacklisted_clients ?? 0} />
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="30 օրվա միջին չեկ" value={formatMoney(metrics30?.avg_ticket ?? 0, currency)} sub={`${metrics30?.paid_bookings ?? 0} paid bookings`} />
        <StatCard icon={CalendarDays} label="Completion rate" value={`${metrics30?.completion_rate ?? 0}%`} sub={`${metrics30?.done_bookings ?? 0} done`} />
        <StatCard icon={AlertTriangle} label="Cancellation rate" value={`${metrics30?.cancellation_rate ?? 0}%`} sub={`${metrics30?.cancelled_bookings ?? 0} cancelled`} />
        <StatCard icon={AlertTriangle} label="No-show rate" value={`${metrics30?.no_show_rate ?? 0}%`} sub={`${metrics30?.no_show_bookings ?? 0} no-show`} />
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-sm">
          <div className="text-lg font-semibold text-[var(--vz-text)]">Եկամտի դինամիկա</div>
          <div className="mt-2 text-sm text-[var(--vz-muted)]">Եկամուտ + ամրագրումներ ըստ ամիսների</div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Եկամուտ" stroke="#7c3aed" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="bookings" name="Ամրագրումներ" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-sm">
          <div className="text-lg font-semibold text-[var(--vz-text)]">Ամրագրման աղբյուրներ</div>
          <div className="mt-2 text-sm text-[var(--vz-muted)]">Որտեղից են գալիս booking-ները</div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceRows} dataKey="bookings" nameKey="source" innerRadius={62} outerRadius={100} paddingAngle={2}>
                  {sourceRows.map((_, idx) => <Cell key={idx} fill={colors[idx % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <Card className="rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-sm">
          <div className="text-lg font-semibold text-[var(--vz-text)]">Թոփ ծառայություններ</div>
          <div className="mt-2 text-sm text-[var(--vz-muted)]">{days} օրվա կտրվածքով</div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servicesQ.data?.top ?? []} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="service_name" type="category" tick={{ fontSize: 12 }} width={110} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#7c3aed" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-sm">
          <div className="text-lg font-semibold text-[var(--vz-text)]">Մասնագետների արդյունքները</div>
          <div className="mt-2 text-sm text-[var(--vz-muted)]">Թիմի բեռնվածությունն ու եկամուտը ըստ աշխատակցի</div>
          <div className="mt-6 space-y-3">
            {(staffQ.data?.rows ?? []).slice(0, 8).map((row) => (
              <div key={row.staff_id} className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-[var(--vz-text)]">{row.staff_name}</div>
                    <div className="mt-1 text-xs text-[var(--vz-muted)]">{row.bookings} ամրագրում</div>
                  </div>
                  <div className="text-sm font-semibold text-[var(--vz-accent-text)]">{formatMoney(row.revenue, currency)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <Card className="rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-semibold text-[var(--vz-text)]"><Layers3 className="h-5 w-5 text-[var(--vz-accent-text)]" /> Հաճախորդների խմբեր</div>
          <div className="mt-2 text-sm text-[var(--vz-muted)]">VIP, խմբեր և կարգավիճակների վերլուծություն</div>
          <div className="mt-5 space-y-3">
            {(clientsQ.data?.group_rows ?? []).length ? (clientsQ.data?.group_rows ?? []).map((row) => (
              <div key={row.group_name} className="flex items-center justify-between rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-4 py-3">
                <div className="font-medium text-[var(--vz-text)]">{row.group_name}</div>
                <div className="text-sm text-[var(--vz-text-secondary)]">{row.clients} հաճախորդ</div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-[var(--vz-line)] px-4 py-6 text-sm text-[var(--vz-muted)]">Խմբավորված հաճախորդներ դեռ չկան։</div>}

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)] px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--vz-warning)]">VIP</div>
                <div className="mt-1 text-2xl font-semibold text-[var(--vz-warning)]">{clientsQ.data?.vip_clients ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--vz-danger)]">Blacklist</div>
                <div className="mt-1 text-2xl font-semibold text-[var(--vz-danger)]">{clientsQ.data?.blacklisted_clients ?? 0}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-sm">
          <div className="text-lg font-semibold text-[var(--vz-text)]">Booking statuses</div>
          <div className="mt-2 text-sm text-[var(--vz-muted)]">Current selection-ի status distribution</div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <Card className="rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-sm">
          <div className="text-lg font-semibold text-[var(--vz-text)]">Sources table</div>
          <div className="mt-4 overflow-x-auto rounded-[24px] border border-[var(--vz-line)]">
            <table className="min-w-full divide-y divide-[var(--vz-line)] text-sm">
              <thead className="bg-[var(--vz-surface-2)] text-left text-[var(--vz-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Ամրագրումներ</th>
                  <th className="px-4 py-3 font-medium">Եկամուտ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vz-line)] bg-[var(--vz-surface)]">
                {sourceRows.map((row) => (
                  <tr key={row.source}>
                    <td className="px-4 py-3 font-medium text-[var(--vz-text)]">{row.source}</td>
                    <td className="px-4 py-3 text-[var(--vz-text-secondary)]">{row.bookings}</td>
                    <td className="px-4 py-3 text-[var(--vz-text-secondary)]">{formatMoney(row.revenue, currency)}</td>
                  </tr>
                ))}
                {!sourceRows.length ? <tr><td colSpan={3} className="px-4 py-6 text-center text-[var(--vz-muted)]">Դեռ տվյալներ չկան</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-sm">
          <div className="text-lg font-semibold text-[var(--vz-text)]">Կորցրած հաճախորդներ</div>
          <div className="mt-2 text-sm text-[var(--vz-muted)]">Վերջին {clientsQ.data?.lost_threshold_days ?? 60} օրում ակտիվություն չունեցող հաճախորդներ</div>
          <div className="mt-4 space-y-3">
            {(clientsQ.data?.lost_rows ?? []).length ? (clientsQ.data?.lost_rows ?? []).map((row) => (
              <div key={row.client_id} className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-[var(--vz-text)]">{row.name}</div>
                    <div className="mt-1 text-xs text-[var(--vz-muted)]">Վերջին այց՝ {formatDateTime(row.last_booking_at)}</div>
                  </div>
                  <div className="text-right text-sm text-[var(--vz-text-secondary)]">
                    <div>{row.total_bookings} այց</div>
                    <div className="mt-1 font-semibold text-[var(--vz-accent-text)]">{formatMoney(row.total_spent, currency)}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {row.group_name ? <span className="rounded-full bg-[var(--vz-info-soft)] px-2.5 py-1 font-medium text-[var(--vz-info)]">{row.group_name}</span> : null}
                  {row.is_vip ? <span className="rounded-full bg-[var(--vz-warning-soft)] px-2.5 py-1 font-medium text-[var(--vz-warning)]">VIP</span> : null}
                  {row.is_blacklisted ? <span className="rounded-full bg-[var(--vz-danger-soft)] px-2.5 py-1 font-medium text-[var(--vz-danger)]">Blacklist</span> : null}
                </div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-[var(--vz-line)] px-4 py-6 text-sm text-[var(--vz-muted)]">Կորցրած հաճախորդներ այս պահին չկան։</div>}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
