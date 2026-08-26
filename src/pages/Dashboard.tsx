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
    calendar: "Բացել օրացույցը", settings: "Կարգավորումներ", loadError: "Չհաջողվեց բեռնել վահանակի տվյալները։ Կրկին փորձեք։",
    today: "Այսօրվա այցեր", nextWeek: "Առաջիկա 7 օրը", missed: "Չեղարկված / չկայացած", doctors: "Բժիշկներ և թիմ", staff: "Աշխատակիցներ",
    services: "Բժշկական ծառայություններ", genericServices: "Ծառայություններ", locations: "Մասնաճյուղեր", confirmed: "հաստատված", pending: "սպասող",
    scheduledVisits: "պլանավորված այց", lostSlots: "այսօրվա ազատված ժամերը", planUsage: "Պլանի օգտագործում", unlimited: "անսահմանափակ",
    setupTitle: "Արագ մեկնարկ", setupText: "Ավարտեք այս երեք քայլը, որպեսզի առցանց գրանցումն ամբողջությամբ աշխատի։",
    addService: "Ավելացնել ծառայություն", addServiceText: "Նշեք տևողությունը, գինը և մասնաճյուղը։",
    addDoctor: "Ավելացնել բժիշկ", addDoctorText: "Ստեղծեք բժիշկ և սահմանեք ընդունելության ժամերը։",
    publish: "Հրապարակել էջը", publishText: "Ստուգեք հասցեն, քարտեզը և հանրային տեսանելիությունը։", done: "Պատրաստ է", start: "Սկսել",
    quickActions: "Արագ գործողություններ", visitsBoard: "Այցերի վահանակ", upcoming: "Առաջիկա այցեր", upcomingText: "Մոտակա գրանցումները՝ մեկ հայացքով։",
    emptyUpcoming: "Առաջիկա այց դեռ չկա։ Հրապարակեք ամրագրման էջը կամ ստեղծեք այց օրացույցից։", noService: "Ծառայություն նշված չէ",
    highlights: "Վերջին 30 օրը", topDoctor: "Ամենաբեռնված բժիշկ", topStaff: "Ամենաբեռնված աշխատակից", topService: "Ամենապահանջված ծառայություն",
    noData: "Դեռ տվյալ չկա", revenue: "Այսօրվա հաստատված եկամուտ", branchLoad: "Այցերն ըստ մասնաճյուղի",
    noBranchData: "Մասնաճյուղերի վիճակագրությունը կերևա առաջին այցերից հետո։",
    statuses: { confirmed: "Հաստատված", completed: "Ավարտված", pending: "Սպասման մեջ", cancelled: "Չեղարկված", no_show: "Չկայացած" },
  },
  ru: {
    eyebrow: "Медицинское рабочее пространство", welcome: "С возвращением",
    intro: "Управляйте визитами, врачами и потоком пациентов в одном простом и надежном пространстве.",
    calendar: "Открыть календарь", settings: "Настройки", loadError: "Не удалось загрузить данные панели. Попробуйте еще раз.",
    today: "Визиты сегодня", nextWeek: "Ближайшие 7 дней", missed: "Отменено / не состоялось", doctors: "Врачи и команда", staff: "Сотрудники",
    services: "Медицинские услуги", genericServices: "Услуги", locations: "Филиалы", confirmed: "подтверждено", pending: "ожидает",
    scheduledVisits: "запланировано", lostSlots: "освободившиеся часы сегодня", planUsage: "Использование тарифа", unlimited: "без ограничений",
    setupTitle: "Быстрый запуск", setupText: "Завершите три шага, чтобы онлайн-запись работала полностью.",
    addService: "Добавить услугу", addServiceText: "Укажите длительность, цену и филиал.",
    addDoctor: "Добавить врача", addDoctorText: "Создайте врача и задайте часы приема.",
    publish: "Опубликовать страницу", publishText: "Проверьте адрес, карту и публичную видимость.", done: "Готово", start: "Начать",
    quickActions: "Быстрые действия", visitsBoard: "Панель визитов", upcoming: "Ближайшие визиты", upcomingText: "Следующие записи — одним взглядом.",
    emptyUpcoming: "Ближайших визитов пока нет. Опубликуйте страницу записи или создайте визит в календаре.", noService: "Услуга не указана",
    highlights: "Последние 30 дней", topDoctor: "Самый загруженный врач", topStaff: "Самый загруженный сотрудник", topService: "Самая востребованная услуга",
    noData: "Данных пока нет", revenue: "Подтвержденный доход сегодня", branchLoad: "Визиты по филиалам",
    noBranchData: "Статистика филиалов появится после первых визитов.",
    statuses: { confirmed: "Подтверждено", completed: "Завершено", pending: "Ожидает", cancelled: "Отменено", no_show: "Не состоялось" },
  },
  en: {
    eyebrow: "Medical workspace", welcome: "Welcome back",
    intro: "Manage visits, doctors and patient flow in one clear and dependable workspace.",
    calendar: "Open calendar", settings: "Settings", loadError: "Dashboard data could not be loaded. Please try again.",
    today: "Today's visits", nextWeek: "Next 7 days", missed: "Cancelled / no-show", doctors: "Doctors & team", staff: "Staff",
    services: "Medical services", genericServices: "Services", locations: "Locations", confirmed: "confirmed", pending: "pending",
    scheduledVisits: "scheduled visits", lostSlots: "released slots today", planUsage: "Plan usage", unlimited: "unlimited",
    setupTitle: "Quick setup", setupText: "Complete these three steps to make online booking fully operational.",
    addService: "Add a service", addServiceText: "Set its duration, price and location.",
    addDoctor: "Add a doctor", addDoctorText: "Create a doctor and define consultation hours.",
    publish: "Publish your page", publishText: "Review the address, map and public visibility.", done: "Ready", start: "Start",
    quickActions: "Quick actions", visitsBoard: "Visit board", upcoming: "Upcoming visits", upcomingText: "Your next appointments at a glance.",
    emptyUpcoming: "No upcoming visits yet. Publish the booking page or create a visit from the calendar.", noService: "No service selected",
    highlights: "Last 30 days", topDoctor: "Busiest doctor", topStaff: "Busiest staff member", topService: "Most requested service",
    noData: "No data yet", revenue: "Confirmed revenue today", branchLoad: "Visits by location",
    noBranchData: "Location statistics will appear after the first visits.",
    statuses: { confirmed: "Confirmed", completed: "Completed", pending: "Pending", cancelled: "Cancelled", no_show: "No-show" },
  },
} as const;

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
      <Card className="vizit-dashboard-metric h-full rounded-[24px] border border-[#d39a43]/20 bg-[#fffdf9]/95 p-4 shadow-[0_14px_36px_rgba(70,34,49,0.07)] dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90 sm:p-5">
        <div className="flex min-h-[132px] flex-col">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[13px] font-semibold leading-5 text-[#746777] dark:text-[#cbbdca]">{title}</span>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#d39a43]/20 bg-[#f8eee4] text-[#6d2a63] dark:bg-white/10 dark:text-[#efcb87]">{icon}</span>
          </div>
          <strong className="mt-auto pt-4 font-serif text-3xl text-[#321c37] dark:text-[#fff8f2]">{value}</strong>
          <span className="mt-1 text-[11px] leading-5 text-[#8a7888] dark:text-[#cbbdca] sm:text-xs">{subtitle}</span>
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
    { to: "/app/tasks", label: text.visitsBoard, icon: ClipboardList },
  ];

  return (
    <motion.div {...page} className="admin-page vizit-dashboard space-y-4">
      <section className="vizit-dashboard-hero relative overflow-hidden rounded-[28px] border border-[#d39a43]/25 bg-[radial-gradient(circle_at_88%_10%,rgba(232,194,174,0.62),transparent_28%),linear-gradient(135deg,#fffdf9_0%,#f8eee4_64%,#f0ddcf_100%)] p-5 shadow-[0_22px_65px_rgba(70,34,49,0.10)] dark:border-[#e7bc6b]/16 dark:bg-[radial-gradient(circle_at_88%_10%,rgba(109,42,99,0.38),transparent_30%),linear-gradient(135deg,#2f182e,#1d121f)] sm:p-8">
        <div className="absolute -bottom-20 -right-14 h-56 w-56 rounded-full border border-[#d39a43]/20" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d39a43]/25 bg-white/65 px-3 py-1.5 text-xs font-bold text-[#6d2a63] backdrop-blur dark:bg-white/8 dark:text-[#efcb87]">
              {isHealthcare ? <Stethoscope className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}{isHealthcare ? text.eyebrow : "Vizit SaaS"}
            </span>
            <h1 className="mt-4 font-serif text-[2rem] font-semibold tracking-[-0.035em] text-[#2b0d35] dark:text-[#fff8f2] sm:text-[2.7rem]">{text.welcome}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#746777] dark:text-[#cbbdca] sm:text-base">{text.intro}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/app/calendar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2b0d35] to-[#6d2a63] px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(74,22,74,.20)]">{text.calendar}<ArrowRight className="h-4 w-4" /></Link>
            <Link to="/app/settings" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d39a43]/25 bg-white/65 px-5 text-sm font-bold text-[#4c394f] backdrop-blur dark:bg-white/8 dark:text-[#fff8f2]"><Settings2 className="h-4 w-4" />{text.settings}</Link>
          </div>
        </div>
      </section>

      {dashboardQ.isError ? <Card className="rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-rose-700">{text.loadError}</Card> : null}
      {dashboardQ.isLoading ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-[24px] border border-[#d39a43]/15 bg-[#fffdf9]/80 dark:bg-white/5" />)}</div>
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
            <Card className="vizit-dashboard-panel rounded-[28px] border border-[#d39a43]/20 bg-[#fffdf9]/95 p-5 shadow-[0_16px_45px_rgba(70,34,49,.07)] dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90 sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-serif text-xl font-semibold text-[#321c37] dark:text-[#fff8f2]">{text.setupTitle}</h2><p className="mt-1 text-sm leading-6 text-[#746777] dark:text-[#cbbdca]">{text.setupText}</p></div><BadgeCheck className="h-6 w-6 text-[#c58b35]" /></div>
              <div className="mt-5 grid gap-3">
                {[
                  { ready: data.counts.services > 0, to: "/app/services?new=1", icon: Stethoscope, title: text.addService, description: text.addServiceText },
                  { ready: data.counts.staff > 0, to: "/app/staff?new=1", icon: UserPlus, title: text.addDoctor, description: text.addDoctorText },
                  { ready: data.counts.locations > 0, to: "/app/settings", icon: MapPin, title: text.publish, description: text.publishText },
                ].map((step) => (
                  <Link key={step.to} to={step.to} className="group flex items-center gap-3 rounded-[20px] border border-[#d39a43]/16 bg-[#fff8ef] p-3.5 transition hover:-translate-y-0.5 hover:border-[#d39a43]/40 dark:bg-white/5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#6d2a63] shadow-sm dark:bg-white/10 dark:text-[#efcb87]">{step.ready ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}</span>
                    <span className="min-w-0 flex-1"><strong className="block text-sm text-[#442044] dark:text-white">{step.title}</strong><small className="mt-1 block text-xs leading-5 text-[#786675] dark:text-[#cbbdca]">{step.description}</small></span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#a66f28] dark:bg-white/10 dark:text-[#efcb87]">{step.ready ? text.done : text.start}</span>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="vizit-dashboard-panel rounded-[28px] border border-[#d39a43]/20 bg-[#fffdf9]/95 p-5 shadow-[0_16px_45px_rgba(70,34,49,.07)] dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90 sm:p-6">
              <h2 className="font-serif text-xl font-semibold text-[#321c37] dark:text-[#fff8f2]">{text.quickActions}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {quickActions.map((item) => <Link key={item.to} to={item.to} className="group rounded-[20px] border border-[#d39a43]/16 bg-[#fff8ef] p-4 transition hover:-translate-y-0.5 hover:border-[#d39a43]/40 dark:bg-white/5"><item.icon className="h-5 w-5 text-[#6d2a63] dark:text-[#efcb87]" /><span className="mt-4 block text-xs font-bold leading-5 text-[#442044] dark:text-white">{item.label}</span></Link>)}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
            <Card className="vizit-dashboard-panel rounded-[28px] border border-[#d39a43]/20 bg-[#fffdf9]/95 p-5 dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90 sm:p-6">
              <h2 className="font-serif text-xl font-semibold text-[#321c37] dark:text-[#fff8f2]">{text.upcoming}</h2><p className="mt-1 text-sm text-[#746777] dark:text-[#cbbdca]">{text.upcomingText}</p>
              <div className="mt-5 grid gap-3">
                {data.upcoming.rows.length === 0 ? <div className="rounded-[20px] border border-dashed border-[#d39a43]/25 bg-[#fff8ef] px-4 py-8 text-sm leading-6 text-[#746777] dark:bg-white/5 dark:text-[#cbbdca]">{text.emptyUpcoming}</div> : data.upcoming.rows.map((row) => (
                  <div key={row.id} className="flex flex-col gap-2 rounded-[20px] border border-[#d39a43]/16 bg-[#fff8ef] p-4 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><strong className="block truncate text-sm text-[#442044] dark:text-white">{row.client_name}</strong><span className="mt-1 block truncate text-xs text-[#786675] dark:text-[#cbbdca]">{row.service?.name ?? text.noService}{row.staff?.name ? ` · ${row.staff.name}` : ""}</span></div>
                    <div className="shrink-0 sm:text-right"><strong className="block text-sm text-[#442044] dark:text-white">{formatDateTime(row.starts_at, locale)}</strong><span className="mt-1 block text-xs text-[#a66f28] dark:text-[#efcb87]">{statusLabel(row.status)}</span></div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="vizit-dashboard-panel rounded-[28px] border border-[#d39a43]/20 bg-[#fffdf9]/95 p-5 dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90 sm:p-6">
              <h2 className="font-serif text-xl font-semibold text-[#321c37] dark:text-[#fff8f2]">{text.highlights}</h2>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[20px] bg-[#fff8ef] p-4 dark:bg-white/5"><span className="text-xs text-[#786675] dark:text-[#cbbdca]">{isHealthcare ? text.topDoctor : text.topStaff}</span><div className="mt-2 flex items-center justify-between gap-3"><strong className="truncate text-sm text-[#442044] dark:text-white">{data.highlights_30d.top_staff?.name ?? text.noData}</strong><span className="font-bold text-[#6d2a63] dark:text-[#efcb87]">{data.highlights_30d.top_staff?.bookings ?? 0}</span></div></div>
                <div className="rounded-[20px] bg-[#fff8ef] p-4 dark:bg-white/5"><span className="text-xs text-[#786675] dark:text-[#cbbdca]">{text.topService}</span><div className="mt-2 flex items-center justify-between gap-3"><strong className="truncate text-sm text-[#442044] dark:text-white">{data.highlights_30d.top_service?.name ?? text.noData}</strong><span className="font-bold text-[#6d2a63] dark:text-[#efcb87]">{data.highlights_30d.top_service?.bookings ?? 0}</span></div></div>
                <div className="rounded-[20px] border border-[#d39a43]/18 bg-gradient-to-r from-[#2b0d35] to-[#6d2a63] p-4 text-white"><span className="text-xs text-white/70">{text.revenue}</span><strong className="mt-2 block font-serif text-xl">{Number(data.today.revenue ?? 0).toLocaleString(localeCode(locale))} {data.currency}</strong></div>
              </div>
            </Card>
          </div>

          <Card className="vizit-dashboard-panel rounded-[28px] border border-[#d39a43]/20 bg-[#fffdf9]/95 p-5 dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90 sm:p-6">
            <div className="flex items-center gap-3"><Activity className="h-5 w-5 text-[#c58b35]" /><h2 className="font-serif text-xl font-semibold text-[#321c37] dark:text-[#fff8f2]">{text.branchLoad}</h2></div>
            {data.highlights_30d.bookings_by_location.length === 0 ? <p className="mt-5 rounded-[20px] border border-dashed border-[#d39a43]/25 bg-[#fff8ef] px-4 py-7 text-sm text-[#746777] dark:bg-white/5 dark:text-[#cbbdca]">{text.noBranchData}</p> : <div className="mt-5 grid gap-3 md:grid-cols-2">{data.highlights_30d.bookings_by_location.map((row) => { const max = data.highlights_30d.bookings_by_location[0]?.bookings || 1; return <div key={row.location_id} className="rounded-[20px] bg-[#fff8ef] p-4 dark:bg-white/5"><div className="flex justify-between gap-3 text-sm"><strong className="text-[#442044] dark:text-white">{row.location_name}</strong><span className="font-bold text-[#6d2a63] dark:text-[#efcb87]">{row.bookings}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eadbce] dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#d39a43] to-[#6d2a63]" style={{ width: `${Math.max(8, Math.round((row.bookings / max) * 100))}%` }} /></div></div>; })}</div>}
          </Card>
        </>
      ) : null}
    </motion.div>
  );
}
