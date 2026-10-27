import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Ban,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  MapPin,
  Settings2,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "../components/ui/Card";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { fetchDashboardSummary } from "../lib/dashboardApi";
import { card, cardTransition, page } from "../lib/motion";
import { useAuth } from "../store/auth";

const copy = {
  hy: {
    eyebrow: "Բժշկական աշխատանքային միջավայր", welcome: "Բարի վերադարձ",
    intro: "Կառավարեք այցերը, բժիշկներին և պացիենտների հոսքը մեկ պարզ ու վստահելի միջավայրում։",
    eyebrowServices: "Աշխատանքային միջավայր", introServices: "Կառավարեք ամրագրումները, թիմը և հաճախորդներին մեկ պարզ ու վստահելի միջավայրում։",
    calendar: "Բացել օրացույցը", settings: "Կարգավորումներ", loadError: "Չհաջողվեց բեռնել վահանակի տվյալները։ Կրկին փորձեք։",
    today: "Այսօրվա այցեր", nextWeek: "Առաջիկա 7 օրը", missed: "Չեղարկված / չկայացած", doctors: "Բժիշկներ և թիմ", staff: "Աշխատակիցներ",
    services: "Բժշկական ծառայություններ", genericServices: "Ծառայություններ", locations: "Մասնաճյուղեր", confirmed: "հաստատված", pending: "սպասող",
    scheduledVisits: "պլանավորված այց", lostSlots: "այսօրվա ազատված ժամերը", planUsage: "Պլանի օգտագործում", unlimited: "անսահմանափակ",
    setupTitle: "Արագ մեկնարկ", setupText: "Ավարտեք այս երեք քայլը, որպեսզի առցանց գրանցումն ամբողջությամբ աշխատի։",
    addService: "Ավելացնել ծառայություն", addServiceText: "Նշեք տևողությունը, գինը և մասնաճյուղը։",
    addDoctor: "Ավելացնել բժիշկ", addDoctorText: "Ստեղծեք բժիշկ և սահմանեք ընդունելության ժամերը։",
    addStaff: "Ավելացնել աշխատակից", addStaffText: "Ստեղծեք աշխատակից և սահմանեք աշխատաժամերը։",
    publish: "Հրապարակել էջը", publishText: "Ստուգեք հասցեն, քարտեզը և հանրային տեսանելիությունը։", done: "Պատրաստ է", start: "Սկսել",
    quickActions: "Արագ գործողություններ", visitsBoard: "Այցերի վահանակ", bookingsBoard: "Ամրագրումների վահանակ",
    upcoming: "Առաջիկա այցեր", upcomingServices: "Առաջիկա ամրագրումներ", upcomingText: "Մոտակա գրանցումները՝ մեկ հայացքով։",
    emptyUpcoming: "Առաջիկա այց դեռ չկա։ Հրապարակեք ամրագրման էջը կամ ստեղծեք այց օրացույցից։", noService: "Ծառայություն նշված չէ",
    highlights: "Վերջին 30 օրը", topDoctor: "Ամենաբեռնված բժիշկ", topStaff: "Ամենաբեռնված աշխատակից", topService: "Ամենապահանջված ծառայություն",
    noData: "Դեռ տվյալ չկա", revenue: "Այսօրվա հաստատված եկամուտ", branchLoad: "Այցերն ըստ մասնաճյուղի",
    noBranchData: "Մասնաճյուղերի վիճակագրությունը կերևա առաջին այցերից հետո։",
    statuses: { confirmed: "Հաստատված", completed: "Ավարտված", pending: "Սպասման մեջ", cancelled: "Չեղարկված", no_show: "Չկայացած" },
  },
  ru: {
    eyebrow: "Медицинское рабочее пространство", welcome: "С возвращением",
    intro: "Управляйте визитами, врачами и потоком пациентов в одном простом и надежном пространстве.",
    eyebrowServices: "Рабочее пространство", introServices: "Управляйте записями, командой и клиентами в одном простом и надежном пространстве.",
    calendar: "Открыть календарь", settings: "Настройки", loadError: "Не удалось загрузить данные панели. Попробуйте еще раз.",
    today: "Визиты сегодня", nextWeek: "Ближайшие 7 дней", missed: "Отменено / не состоялось", doctors: "Врачи и команда", staff: "Сотрудники",
    services: "Медицинские услуги", genericServices: "Услуги", locations: "Филиалы", confirmed: "подтверждено", pending: "ожидает",
    scheduledVisits: "запланировано", lostSlots: "освободившиеся часы сегодня", planUsage: "Использование тарифа", unlimited: "без ограничений",
    setupTitle: "Быстрый запуск", setupText: "Завершите три шага, чтобы онлайн-запись работала полностью.",
    addService: "Добавить услугу", addServiceText: "Укажите длительность, цену и филиал.",
    addDoctor: "Добавить врача", addDoctorText: "Создайте врача и задайте часы приема.",
    addStaff: "Добавить сотрудника", addStaffText: "Создайте сотрудника и задайте рабочие часы.",
    publish: "Опубликовать страницу", publishText: "Проверьте адрес, карту и публичную видимость.", done: "Готово", start: "Начать",
    quickActions: "Быстрые действия", visitsBoard: "Панель визитов", bookingsBoard: "Панель записей",
    upcoming: "Ближайшие визиты", upcomingServices: "Ближайшие записи", upcomingText: "Следующие записи — одним взглядом.",
    emptyUpcoming: "Ближайших визитов пока нет. Опубликуйте страницу записи или создайте визит в календаре.", noService: "Услуга не указана",
    highlights: "Последние 30 дней", topDoctor: "Самый загруженный врач", topStaff: "Самый загруженный сотрудник", topService: "Самая востребованная услуга",
    noData: "Данных пока нет", revenue: "Подтвержденный доход сегодня", branchLoad: "Визиты по филиалам",
    noBranchData: "Статистика филиалов появится после первых визитов.",
    statuses: { confirmed: "Подтверждено", completed: "Завершено", pending: "Ожидает", cancelled: "Отменено", no_show: "Не состоялось" },
  },
  en: {
    eyebrow: "Medical workspace", welcome: "Welcome back",
    intro: "Manage visits, doctors and patient flow in one clear and dependable workspace.",
    eyebrowServices: "Workspace", introServices: "Manage bookings, your team and clients in one clear and dependable workspace.",
    calendar: "Open calendar", settings: "Settings", loadError: "Dashboard data could not be loaded. Please try again.",
    today: "Today's visits", nextWeek: "Next 7 days", missed: "Cancelled / no-show", doctors: "Doctors & team", staff: "Staff",
    services: "Medical services", genericServices: "Services", locations: "Locations", confirmed: "confirmed", pending: "pending",
    scheduledVisits: "scheduled visits", lostSlots: "released slots today", planUsage: "Plan usage", unlimited: "unlimited",
    setupTitle: "Quick setup", setupText: "Complete these three steps to make online booking fully operational.",
    addService: "Add a service", addServiceText: "Set its duration, price and location.",
    addDoctor: "Add a doctor", addDoctorText: "Create a doctor and define consultation hours.",
    addStaff: "Add a staff member", addStaffText: "Create a staff member and set working hours.",
    publish: "Publish your page", publishText: "Review the address, map and public visibility.", done: "Ready", start: "Start",
    quickActions: "Quick actions", visitsBoard: "Visit board", bookingsBoard: "Booking board",
    upcoming: "Upcoming visits", upcomingServices: "Upcoming bookings", upcomingText: "Your next appointments at a glance.",
    emptyUpcoming: "No upcoming visits yet. Publish the booking page or create a visit from the calendar.", noService: "No service selected",
    highlights: "Last 30 days", topDoctor: "Busiest doctor", topStaff: "Busiest staff member", topService: "Most requested service",
    noData: "No data yet", revenue: "Confirmed revenue today", branchLoad: "Visits by location",
    noBranchData: "Location statistics will appear after the first visits.",
    statuses: { confirmed: "Confirmed", completed: "Completed", pending: "Pending", cancelled: "Cancelled", no_show: "No-show" },
  },
} as const;

// Token classes shared by the dashboard panels (light and dark themes).
const panel = "rounded-[20px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-5 shadow-[var(--vz-shadow-sm)] sm:p-6";
const panelTitle = "text-lg font-semibold text-[var(--vz-text)]";
const tile = "rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)]";
const iconTile = "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--vz-accent-soft)] text-[var(--vz-accent-text)]";

function localeCode(locale: Locale) {
  return locale === "hy" ? "hy-AM" : locale === "ru" ? "ru-RU" : "en-US";
}

function formatDateTime(value: string | null | undefined, locale: Locale) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(localeCode(locale), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function MetricCard({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle: string; icon: React.ReactNode }) {
  return (
    <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition} className="h-full">
      <Card className="h-full rounded-[20px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-4 shadow-[var(--vz-shadow-sm)] sm:p-5">
        <div className="flex min-h-[108px] flex-col">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[13px] font-medium leading-5 text-[var(--vz-text-secondary)]">{title}</span>
            <span className={iconTile}>{icon}</span>
          </div>
          <strong className="mt-auto pt-4 text-3xl font-semibold tabular-nums text-[var(--vz-text)]">{value}</strong>
          <span className="mt-1 text-xs leading-5 text-[var(--vz-muted)]">{subtitle}</span>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const { user } = useAuth();
  const vertical = String(user?.vertical ?? user?.business_type ?? "").toLowerCase();
  const isHealthcare = ["healthcare", "dental", "clinic", "medical", "doctor", "health"].includes(vertical);
  const dashboardQ = useQuery({ queryKey: ["dashboard-summary"], queryFn: fetchDashboardSummary, staleTime: 30_000 });
  const data = dashboardQ.data;
  const formatLimit = (current: number, limit: number | null) => `${current} / ${limit || text.unlimited}`;
  const statusLabel = (status: string) => {
    const key = status === "done" ? "completed" : status;
    return text.statuses[key as keyof typeof text.statuses] ?? status;
  };
  const quickActions = [
    { to: "/app/calendar", label: text.calendar, icon: CalendarDays },
    { to: "/app/services?new=1", label: isHealthcare ? text.services : text.genericServices, icon: Stethoscope },
    { to: "/app/staff?new=1", label: isHealthcare ? text.doctors : text.staff, icon: UserPlus },
    { to: "/app/tasks", label: isHealthcare ? text.visitsBoard : text.bookingsBoard, icon: ClipboardList },
  ];

  return (
    <motion.div {...page} className="admin-page vizit-dashboard space-y-4">
      <section className="vizit-cover relative overflow-hidden rounded-[24px] bg-[var(--vz-cover)] p-6 text-[var(--vz-cover-text)] sm:p-8">
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-[rgb(255_255_255/0.15)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[rgb(255_255_255/0.06)]" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--vz-highlight)] px-3 py-1.5 text-xs font-semibold text-[#2A1300]">
              {isHealthcare ? <Stethoscope className="h-4 w-4" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              {isHealthcare ? text.eyebrow : text.eyebrowServices}
            </span>
            <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.02em] text-[var(--vz-cover-text)] sm:text-[34px]">
              {text.welcome}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--vz-cover-muted)] sm:text-base">{isHealthcare ? text.intro : text.introServices}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/app/calendar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FFFFFF] px-5 text-sm font-semibold text-[#0F766E] transition hover:bg-[#F0F8F6]">
              {text.calendar}<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/app/settings" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[rgb(255_255_255/0.35)] px-5 text-sm font-semibold text-[#FFFFFF] transition hover:bg-[rgb(255_255_255/0.1)]">
              <Settings2 className="h-4 w-4" aria-hidden="true" />{text.settings}
            </Link>
          </div>
        </div>
      </section>

      {dashboardQ.isError ? <div className="rounded-[20px] bg-[var(--vz-danger-soft)] p-5 text-sm font-medium text-[var(--vz-danger)]" role="alert">{text.loadError}</div> : null}
      {dashboardQ.isLoading ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-[20px] border border-[var(--vz-line)] bg-[var(--vz-surface-2)]" />)}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            <MetricCard title={text.today} value={data.today.total} subtitle={`${data.today.confirmed} ${text.confirmed} · ${data.today.pending} ${text.pending}`} icon={<CalendarDays className="h-5 w-5" />} />
            <MetricCard title={text.nextWeek} value={data.upcoming.next_7_days} subtitle={text.scheduledVisits} icon={<Clock3 className="h-5 w-5" />} />
            <MetricCard title={text.missed} value={data.today.cancelled} subtitle={text.lostSlots} icon={<Ban className="h-5 w-5" />} />
            <MetricCard title={isHealthcare ? text.doctors : text.staff} value={data.counts.staff} subtitle={`${text.planUsage}: ${formatLimit(data.usage.staff.current, data.usage.staff.limit)}`} icon={<Users className="h-5 w-5" />} />
            <MetricCard title={isHealthcare ? text.services : text.genericServices} value={data.counts.services} subtitle={`${text.planUsage}: ${formatLimit(data.usage.services.current, data.usage.services.limit)}`} icon={<Stethoscope className="h-5 w-5" />} />
            <MetricCard title={text.locations} value={data.counts.locations} subtitle={`${text.planUsage}: ${formatLimit(data.usage.locations.current, data.usage.locations.limit)}`} icon={<MapPin className="h-5 w-5" />} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
            <Card className={panel}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className={panelTitle}>{text.setupTitle}</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--vz-muted)]">{text.setupText}</p>
                </div>
                <BadgeCheck className="h-6 w-6 shrink-0 text-[var(--vz-highlight)]" aria-hidden="true" />
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  { ready: data.counts.services > 0, to: "/app/services?new=1", icon: Stethoscope, title: text.addService, description: text.addServiceText },
                  { ready: data.counts.staff > 0, to: "/app/staff?new=1", icon: UserPlus, title: isHealthcare ? text.addDoctor : text.addStaff, description: isHealthcare ? text.addDoctorText : text.addStaffText },
                  { ready: data.counts.locations > 0, to: "/app/settings", icon: MapPin, title: text.publish, description: text.publishText },
                ].map((step) => (
                  <Link key={step.to} to={step.to} className={`${tile} group flex items-center gap-3 p-3.5 transition hover:border-[var(--vz-line-strong)] hover:bg-[var(--vz-surface-pressed)]`}>
                    <span className={step.ready ? "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--vz-success-soft)] text-[var(--vz-success)]" : iconTile}>
                      {step.ready ? <Check className="h-5 w-5" aria-hidden="true" /> : <step.icon className="h-5 w-5" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm font-semibold text-[var(--vz-text)]">{step.title}</strong>
                      <small className="mt-0.5 block text-xs leading-5 text-[var(--vz-muted)]">{step.description}</small>
                    </span>
                    <span className={step.ready
                      ? "rounded-full bg-[var(--vz-success-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--vz-success)]"
                      : "rounded-full bg-[var(--vz-highlight-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--vz-highlight-text)]"}
                    >
                      {step.ready ? text.done : text.start}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className={panel}>
              <h2 className={panelTitle}>{text.quickActions}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {quickActions.map((item) => (
                  <Link key={item.to} to={item.to} className={`${tile} group p-4 transition hover:border-[var(--vz-line-strong)] hover:bg-[var(--vz-surface-pressed)]`}>
                    <span className={iconTile}><item.icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="mt-3 block text-sm font-semibold leading-5 text-[var(--vz-text)]">{item.label}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
            <Card className={panel}>
              <h2 className={panelTitle}>{isHealthcare ? text.upcoming : text.upcomingServices}</h2>
              <p className="mt-1 text-sm text-[var(--vz-muted)]">{text.upcomingText}</p>
              <div className="mt-5 grid gap-3">
                {data.upcoming.rows.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--vz-line-strong)] bg-[var(--vz-surface-2)] px-4 py-8 text-sm leading-6 text-[var(--vz-muted)]">{text.emptyUpcoming}</div>
                ) : data.upcoming.rows.map((row) => (
                  <div key={row.id} className={`${tile} flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between`}>
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-semibold text-[var(--vz-text)]">{row.client_name}</strong>
                      <span className="mt-1 block truncate text-xs text-[var(--vz-muted)]">{row.service?.name ?? text.noService}{row.staff?.name ? ` · ${row.staff.name}` : ""}</span>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <strong className="block text-sm font-semibold text-[var(--vz-text)]">{formatDateTime(row.starts_at, locale)}</strong>
                      <span className="mt-1 block text-xs font-medium text-[var(--vz-accent-text)]">{statusLabel(row.status)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={panel}>
              <h2 className={panelTitle}>{text.highlights}</h2>
              <div className="mt-5 grid gap-3">
                <div className={`${tile} p-4`}>
                  <span className="text-xs text-[var(--vz-muted)]">{isHealthcare ? text.topDoctor : text.topStaff}</span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <strong className="truncate text-sm font-semibold text-[var(--vz-text)]">{data.highlights_30d.top_staff?.name ?? text.noData}</strong>
                    <span className="font-semibold tabular-nums text-[var(--vz-accent-text)]">{data.highlights_30d.top_staff?.bookings ?? 0}</span>
                  </div>
                </div>
                <div className={`${tile} p-4`}>
                  <span className="text-xs text-[var(--vz-muted)]">{text.topService}</span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <strong className="truncate text-sm font-semibold text-[var(--vz-text)]">{data.highlights_30d.top_service?.name ?? text.noData}</strong>
                    <span className="font-semibold tabular-nums text-[var(--vz-accent-text)]">{data.highlights_30d.top_service?.bookings ?? 0}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-[var(--vz-cover)] p-4 text-[var(--vz-cover-text)]">
                  <span className="text-xs text-[var(--vz-cover-muted)]">{text.revenue}</span>
                  <strong className="mt-2 block text-xl font-semibold tabular-nums">{Number(data.today.revenue ?? 0).toLocaleString(localeCode(locale))} {data.currency}</strong>
                </div>
              </div>
            </Card>
          </div>

          <Card className={panel}>
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-[var(--vz-accent-text)]" aria-hidden="true" />
              <h2 className={panelTitle}>{text.branchLoad}</h2>
            </div>
            {data.highlights_30d.bookings_by_location.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-[var(--vz-line-strong)] bg-[var(--vz-surface-2)] px-4 py-7 text-sm text-[var(--vz-muted)]">{text.noBranchData}</p>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {data.highlights_30d.bookings_by_location.map((row) => {
                  const max = data.highlights_30d.bookings_by_location[0]?.bookings || 1;
                  return (
                    <div key={row.location_id} className={`${tile} p-4`}>
                      <div className="flex justify-between gap-3 text-sm">
                        <strong className="font-semibold text-[var(--vz-text)]">{row.location_name}</strong>
                        <span className="font-semibold tabular-nums text-[var(--vz-accent-text)]">{row.bookings}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--vz-surface-pressed)]">
                        <div className="h-full rounded-full bg-[var(--vz-primary)]" style={{ width: `${Math.max(8, Math.round((row.bookings / max) * 100))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      ) : null}
    </motion.div>
  );
}
