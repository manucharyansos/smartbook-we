import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Users,
  Scissors,
  ArrowRight,
  Clock3,
  Sparkles,
  ClipboardList,
  MapPin,
  Ban,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { page, card, cardTransition } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { fetchDashboardSummary } from "../lib/dashboardApi";

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div className="h-full" variants={card} initial="initial" animate="animate" transition={cardTransition}>
      <Card className="h-full min-h-[164px] rounded-[20px] border border-slate-200 bg-white/95 p-3.5 shadow-sm backdrop-blur sm:min-h-[176px] sm:p-5">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 text-[13px] font-medium leading-[1.35rem] text-slate-500 sm:text-sm">{title}</div>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-md sm:h-11 sm:w-11 sm:rounded-2xl">
            {icon}
            </div>
          </div>
          <div className="mt-auto pt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{value}</div>
          <div className="mt-1 min-h-10 text-[11px] leading-5 text-slate-500 sm:text-sm">{subtitle}</div>
        </div>
      </Card>
    </motion.div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("hy-AM", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatLimit(current: number, limit: number | null) {
  if (!limit) return `${current} / Անսահման`;
  return `${current} / ${limit}`;
}

function statusLabel(status: string) {
  switch (status) {
    case "confirmed":
      return "Հաստատված";
    case "done":
    case "completed":
      return "Ավարտված";
    case "pending":
      return "Սպասման մեջ";
    case "cancelled":
      return "Չեղարկված";
    case "no_show":
      return "Չեկած";
    default:
      return status;
  }
}

export default function Dashboard() {
  const dashboardQ = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 30_000,
  });

  const loading = dashboardQ.isLoading;
  const data = dashboardQ.data;

  return (
    <motion.div {...page} className="admin-page space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="vizit-preserve-dark overflow-hidden rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.25),transparent_26%),linear-gradient(135deg,#111827_0%,#312e81_58%,#4c1d95_100%)] p-5 text-white shadow-[0_18px_55px_rgba(49,46,129,0.18)] sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
              <Sparkles className="h-4 w-4" />
              Vizit վահանակ
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Բարի վերադարձ</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
              Արագ ստուգիր հիմնական ցուցանիշները, առաջիկա ամրագրումները և plan usage-ը։
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/app/calendar"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Բացել օրացույցը
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/app/settings"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Կարգավորումներ
            </Link>
          </div>
        </div>
      </motion.div>

      {dashboardQ.isError ? (
        <Card className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          Չհաջողվեց բեռնել վահանակի տվյալները։ Փորձիր կրկին։
        </Card>
      ) : null}

      {loading ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-[28px] border border-slate-200 bg-white/80" />
            ))}
          </div>

          <div className="grid gap-6 2xl:grid-cols-2">
            <div className="h-[320px] animate-pulse rounded-[30px] border border-slate-200 bg-white/80" />
            <div className="h-[320px] animate-pulse rounded-[30px] border border-slate-200 bg-white/80" />
          </div>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            <StatCard
              title="Այսօրվա ամրագրումներ"
              value={data.today.total}
              subtitle={`${data.today.confirmed} հաստատված • ${data.today.pending} սպասող`}
              icon={<CalendarDays className="h-5 w-5" />}
            />
            <StatCard
              title="Առաջիկա 7 օրը"
              value={data.upcoming.next_7_days}
              subtitle="Արդեն ամրագրված այցեր"
              icon={<Clock3 className="h-5 w-5" />}
            />
            <StatCard
              title="Չեղարկված / no-show այսօր"
              value={data.today.cancelled}
              subtitle="Այսօրվա կորած slot-երը"
              icon={<Ban className="h-5 w-5" />}
            />
            <StatCard
              title="Աշխատակիցներ"
              value={data.counts.staff}
              subtitle={`Plan usage: ${formatLimit(data.usage.staff.current, data.usage.staff.limit)}`}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Ծառայություններ"
              value={data.counts.services}
              subtitle={`Plan usage: ${formatLimit(data.usage.services.current, data.usage.services.limit)}`}
              icon={<Scissors className="h-5 w-5" />}
            />
            <StatCard
              title="Մասնաճյուղեր"
              value={data.counts.locations}
              subtitle={`Plan usage: ${formatLimit(data.usage.locations.current, data.usage.locations.limit)}`}
              icon={<MapPin className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
            <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
              <Card className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">Արագ գործողություններ</div>
                    <div className="mt-1 text-sm text-slate-500">Core բաժինները՝ առանց ցրվելու</div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { to: "/app/calendar", label: "Օրացույց", icon: CalendarDays },
                    { to: "/app/services", label: "Ծառայություններ", icon: Scissors },
                    { to: "/app/staff", label: "Աշխատակիցներ", icon: Users },
                    { to: "/app/tasks", label: "Ամրագրումներ", icon: ClipboardList },
                    { to: "/app/settings", label: "Կարգավորումներ", icon: Sparkles },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-violet-200 hover:bg-violet-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-sm font-medium text-slate-800">{item.label}</div>
                        </div>

                        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-violet-600" />
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
              <Card className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">30 օրվա highlights</div>
                    <div className="mt-1 text-sm text-slate-500">Ով և ինչն է ամենաշատ booking բերել</div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Top staff</div>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{data.highlights_30d.top_staff?.name ?? "Դեռ տվյալ չկա"}</div>
                          <div className="text-xs text-slate-500">Ամենաբեռնված աշխատակից</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{data.highlights_30d.top_staff?.bookings ?? 0}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Top service</div>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{data.highlights_30d.top_service?.name ?? "Դեռ տվյալ չկա"}</div>
                        <div className="text-xs text-slate-500">Ամենաշատ booking ստացած ծառայություն</div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{data.highlights_30d.top_service?.bookings ?? 0}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">Այսօրվա confirmed revenue</span>
                      <span className="text-base font-semibold text-slate-900">{Number(data.today.revenue ?? 0).toLocaleString("hy-AM")} {data.currency}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
              <Card className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">Առաջիկա այցեր</div>
                    <div className="mt-1 text-sm text-slate-500">Հաջորդ booking-ները, որ owner-ը պետք է տեսնի մի հայացքով</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {data.upcoming.rows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Առաջիկա booking դեռ չկա։ Սա նորմալ է միայն եթե նոր ես սկսում, հակառակ դեպքում booking flow-ը պետք է ստուգել։
                    </div>
                  ) : (
                    data.upcoming.rows.map((row) => (
                      <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{row.client_name}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {row.service?.name ?? "Ծառայություն չկա"}
                              {row.staff?.name ? ` • ${row.staff.name}` : ""}
                              {row.location?.name ? ` • ${row.location.name}` : ""}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-slate-900">{formatDateTime(row.starts_at)}</div>
                            <div className="mt-1 text-xs text-slate-500">{statusLabel(row.status)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
              <Card className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">Booking-ներ ըստ մասնաճյուղի</div>
                    <div className="mt-1 text-sm text-slate-500">Վերջին 30 օրվա բեռնվածության բաժանումը</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {data.highlights_30d.bookings_by_location.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Location analytics դեռ դատարկ է։ Եթե multi-location business է, սա պետք է լցվի booking data-ով։
                    </div>
                  ) : (
                    data.highlights_30d.bookings_by_location.map((row) => {
                      const max = data.highlights_30d.bookings_by_location[0]?.bookings || 1;
                      const width = Math.max(8, Math.round((row.bookings / max) * 100));
                      return (
                        <div key={row.location_id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{row.location_name}</div>
                              <div className="mt-1 text-xs text-slate-500">30 օր</div>
                            </div>
                            <div className="text-sm font-semibold text-slate-900">{row.bookings}</div>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
