import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Phone,
  Search,
  Users2,
  XCircle,
} from "lucide-react";

import { page } from "../lib/motion";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { useAuth } from "../store/auth";
import { fetchStaff } from "../lib/staffApi";
import { fetchServices, type Service } from "../lib/servicesApi";
import {
  cancelBooking,
  confirmBooking,
  doneBooking,
  fetchBookings,
  noShowBooking,
  type Booking,
  type BookingStatus,
} from "../lib/calendarApi";
import { cn } from "../lib/cn";
import { getErrorMessage } from "../lib/http";
import { useLanguage, type Locale } from "../contexts/LanguageContext";

type Column = {
  key: BookingStatus;
  title: string;
  subtitle: string;
  headerTone: string;
  badgeTone: string;
};

type FiltersState = {
  search: string;
  status: "" | BookingStatus;
  staff_id: string;
};

const tasksCopy = {
  hy: { badge: "Այցերի կառավարում", title: "Այցերի վահանակ", intro: "Սպասող, հաստատված, ավարտված և չեղարկված այցերը՝ մեկ հստակ աշխատանքային տեսքում։", pending: "Սպասող", pendingSub: "Սպասում է հաստատման", confirmed: "Հաստատված", confirmedSub: "Առաջիկա այցեր", done: "Ավարտված", doneSub: "Փակված այցեր", noShow: "Չկայացած", noShowSub: "Բաց թողած այցեր", cancelled: "Չեղարկված", archive: "Արխիվ", all: "Բոլորը", today: "Այսօր", openCalendar: "Բացել օրացույցը", search: "Փնտրել պացիենտ, ծառայություն կամ բժիշկ", allStatuses: "Բոլոր կարգավիճակները", allStaff: "Բոլոր մասնագետները", allDoctors: "Բոլոր բժիշկները", clear: "Մաքրել", updated: "Այցը թարմացվեց", updateFailed: "Չհաջողվեց թարմացնել այցը", loadFailed: "Չհաջողվեց բեռնել այցերը։ Կրկին փորձեք։", empty: "Այցեր դեռ չկան", emptyText: "Ընտրված ժամանակահատվածում այցեր չկան։", emptyColumn: "Այս փուլում այց չկա", confirm: "Հաստատել", finish: "Ավարտել", cancel: "Չեղարկել", markNoShow: "Նշել չկայացած", service: "Ծառայություն", specialist: "Մասնագետ", doctor: "Բժիշկ", noStaff: "Մասնագետ նշված չէ", noDoctor: "Բժիշկ նշված չէ" },
  ru: { badge: "Управление визитами", title: "Панель визитов", intro: "Ожидающие, подтвержденные, завершенные и отмененные визиты в одном рабочем представлении.", pending: "Ожидает", pendingSub: "Ждет подтверждения", confirmed: "Подтвержден", confirmedSub: "Ближайшие визиты", done: "Завершен", doneSub: "Закрытые визиты", noShow: "Неявка", noShowSub: "Пропущенные визиты", cancelled: "Отменен", archive: "Архив", all: "Все", today: "Сегодня", openCalendar: "Открыть календарь", search: "Найти пациента, услугу или врача", allStatuses: "Все статусы", allStaff: "Все специалисты", allDoctors: "Все врачи", clear: "Очистить", updated: "Визит обновлен", updateFailed: "Не удалось обновить визит", loadFailed: "Не удалось загрузить визиты. Попробуйте снова.", empty: "Визитов пока нет", emptyText: "В выбранном периоде визитов нет.", emptyColumn: "На этом этапе визитов нет", confirm: "Подтвердить", finish: "Завершить", cancel: "Отменить", markNoShow: "Неявка", service: "Услуга", specialist: "Специалист", doctor: "Врач", noStaff: "Специалист не указан", noDoctor: "Врач не указан" },
  en: { badge: "Visit management", title: "Visit board", intro: "Pending, confirmed, completed and cancelled visits in one clear workspace.", pending: "Pending", pendingSub: "Awaiting confirmation", confirmed: "Confirmed", confirmedSub: "Upcoming visits", done: "Completed", doneSub: "Closed visits", noShow: "No-show", noShowSub: "Missed visits", cancelled: "Cancelled", archive: "Archive", all: "All", today: "Today", openCalendar: "Open calendar", search: "Search patient, service or doctor", allStatuses: "All statuses", allStaff: "All specialists", allDoctors: "All doctors", clear: "Clear", updated: "Visit updated", updateFailed: "Could not update the visit", loadFailed: "Could not load visits. Please try again.", empty: "No visits yet", emptyText: "There are no visits in the selected period.", emptyColumn: "No visits at this stage", confirm: "Confirm", finish: "Complete", cancel: "Cancel", markNoShow: "Mark no-show", service: "Service", specialist: "Specialist", doctor: "Doctor", noStaff: "No specialist assigned", noDoctor: "No doctor assigned" },
} satisfies Record<Locale, Record<string, string>>;

function buildColumns(text: Record<string, string>): Column[] {
  return [
    { key: "pending", title: text.pending, subtitle: text.pendingSub, headerTone: "border-amber-200 bg-amber-50", badgeTone: "bg-amber-100 text-amber-700" },
    { key: "confirmed", title: text.confirmed, subtitle: text.confirmedSub, headerTone: "border-sky-200 bg-sky-50", badgeTone: "bg-sky-100 text-sky-700" },
    { key: "done", title: text.done, subtitle: text.doneSub, headerTone: "border-emerald-200 bg-emerald-50", badgeTone: "bg-emerald-100 text-emerald-700" },
    { key: "no_show", title: text.noShow, subtitle: text.noShowSub, headerTone: "border-rose-200 bg-rose-50", badgeTone: "bg-rose-100 text-rose-700" },
    { key: "cancelled", title: text.cancelled, subtitle: text.archive, headerTone: "border-slate-200 bg-slate-100", badgeTone: "bg-slate-200 text-slate-700" },
  ];
}

const emptyFilters: FiltersState = {
  search: "",
  status: "",
  staff_id: "",
};

function ymd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number) {
  const x = new Date(date);
  x.setDate(x.getDate() + days);
  return x;
}

function parseDateTime(value: string) {
  return new Date(value.replace(" ", "T"));
}

function formatShortDate(value: string, locale: Locale) {
  try {
    return parseDateTime(value).toLocaleDateString(locale === "hy" ? "hy-AM" : locale === "ru" ? "ru-RU" : "en-US", {
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return value.slice(5, 10);
  }
}

function formatTime(value: string) {
  return value.slice(11, 16);
}

function statusLabel(status: BookingStatus, columns: Column[]) {
  return columns.find((col) => col.key === status)?.title ?? status;
}

function statusUi(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "confirmed":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "done":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "no_show":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "cancelled":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function bookingActionLabel(status: BookingStatus, text: Record<string, string>) {
  switch (status) {
    case "confirmed":
      return text.confirm;
    case "done":
      return text.finish;
    case "cancelled":
      return text.cancel;
    case "no_show":
      return text.markNoShow;
    default:
      return status;
  }
}

function bookingTransitions(status: BookingStatus): BookingStatus[] {
  switch (status) {
    case "pending":
      return ["confirmed", "cancelled"];
    case "confirmed":
      return ["done", "no_show", "cancelled"];
    default:
      return [];
  }
}

function bookingServicesTitle(booking: Booking, serviceById: Map<number, Service>, serviceLabel: string) {
  const names = booking.items?.length
    ? booking.items
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((item) => item.service?.name ?? serviceById.get(item.service_id)?.name ?? "")
        .filter(Boolean)
    : [serviceById.get(booking.service_id)?.name ?? `${serviceLabel} #${booking.service_id}`];

  return names.join(" + ");
}

function initials(name?: string) {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "NA"
  );
}

function timePillTone(booking: Booking) {
  const start = parseDateTime(booking.starts_at);
  const now = new Date();
  const diff = start.getTime() - now.getTime();
  const hours = diff / 3_600_000;

  if (booking.status === "cancelled") return "bg-slate-200 text-slate-600";
  if (booking.status === "done") return "bg-emerald-100 text-emerald-700";
  if (booking.status === "no_show") return "bg-rose-100 text-rose-700";
  if (hours < 0) return "bg-rose-100 text-rose-700";
  if (hours < 24) return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function SummaryChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
      <span className="text-slate-400">{icon}</span>
      <span>{label}</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function BookingCard({
  booking,
  serviceById,
  staffName,
  onMove,
  text,
  columns,
  locale,
  isHealthcare,
}: {
  booking: Booking;
  serviceById: Map<number, Service>;
  staffName: string;
  onMove: (booking: Booking, status: BookingStatus) => void;
  text: Record<string, string>;
  columns: Column[];
  locale: Locale;
  isHealthcare: boolean;
}) {
  const transitions = bookingTransitions(booking.status);

  return (
    <div className="rounded-[12px] border border-[#d7d7d7] bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold text-slate-900">{booking.client_name}</div>
          <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-slate-500">{bookingServicesTitle(booking, serviceById, text.service)}</div>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", statusUi(booking.status))}>
          {statusLabel(booking.status, columns)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
          <Clock3 className="h-3.5 w-3.5" /> {formatTime(booking.starts_at)}
        </span>
        {booking.client_phone ? (
          <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
            <Phone className="h-3.5 w-3.5" />
            <span className="max-w-[110px] truncate">{booking.client_phone}</span>
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold", timePillTone(booking))}>
          {formatShortDate(booking.starts_at, locale)}
        </span>

        <div className="flex items-center gap-2">
          {transitions.map((nextStatus) => (
            <button
              key={nextStatus}
              type="button"
              onClick={() => onMove(booking, nextStatus)}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-200"
              title={bookingActionLabel(nextStatus, text)}
            >
              {bookingActionLabel(nextStatus, text)}
              <ArrowRight className="h-3 w-3" />
            </button>
          ))}

          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9eaec] text-[10px] font-semibold text-slate-700">
            {initials(staffName || (isHealthcare ? text.doctor : text.specialist))}
          </div>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-slate-400">{staffName || (isHealthcare ? text.noDoctor : text.noStaff)}</div>
    </div>
  );
}

export default function Tasks() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { locale } = useLanguage();
  const text = tasksCopy[locale];
  const vertical = String(user?.vertical ?? user?.business_type ?? "").toLowerCase();
  const isHealthcare = ["healthcare", "dental", "clinic", "medical", "doctor", "health"].includes(vertical);
  const columns = useMemo(() => buildColumns(text), [text]);
  const isStaff = user?.role === "staff";

  const [filters, setFilters] = useState<FiltersState>(emptyFilters);
  const [toast, setToast] = useState<{ open: boolean; text: string; type: "success" | "error" }>({
    open: false,
    text: "",
    type: "success",
  });

  const from = ymd(addDays(new Date(), -14));
  const to = ymd(addDays(new Date(), 45));

  const bookingsQ = useQuery({
    queryKey: ["booking-board", from, to],
    queryFn: () => fetchBookings(from, to),
  });
  const staffQ = useQuery({ queryKey: ["staff", "booking-board"], queryFn: () => fetchStaff(), enabled: !isStaff });
  const servicesQ = useQuery({ queryKey: ["services", "booking-board"], queryFn: () => fetchServices() });

  const staff = useMemo(() => staffQ.data ?? [], [staffQ.data]);
  const services = useMemo(() => servicesQ.data ?? [], [servicesQ.data]);
  const serviceById = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);
  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member.name])), [staff]);

  function showToast(text: string, type: "success" | "error" = "success") {
    setToast({ open: true, text, type });
    window.setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 2200);
  }

  const actionMut = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: BookingStatus }) => {
      if (status === "confirmed") return confirmBooking(id);
      if (status === "done") return doneBooking(id);
      if (status === "no_show") return noShowBooking(id);
      if (status === "cancelled") return cancelBooking(id);
      return null;
    },
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({ queryKey: ["booking-board"] });
      await qc.invalidateQueries({ queryKey: ["bookings"] });
      showToast(`${text.updated}: ${statusLabel(variables.status, columns)}`);
    },
    onError: (error) => showToast(getErrorMessage(error, text.updateFailed), "error"),
  });

  const bookings = useMemo(() => {
    const rows = bookingsQ.data ?? [];
    const query = filters.search.trim().toLowerCase();
    return rows.filter((booking) => {
      if (filters.status && booking.status !== filters.status) return false;
      if (filters.staff_id && String(booking.staff_id ?? "") !== filters.staff_id) return false;
      if (!query) return true;
      const haystack = [
        booking.client_name,
        booking.client_phone,
        booking.notes ?? "",
        booking.staff_id ? staffById.get(booking.staff_id) ?? "" : "",
        bookingServicesTitle(booking, serviceById, text.service),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [bookingsQ.data, filters, staffById, serviceById, text.service]);

  const grouped = useMemo(() => {
    const groups: Record<BookingStatus, Booking[]> = {
      pending: [],
      confirmed: [],
      done: [],
      cancelled: [],
      no_show: [],
    };
    for (const booking of bookings) groups[booking.status].push(booking);
    return groups;
  }, [bookings]);

  const boardSummary = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "pending").length,
      confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
      today: bookings.filter((booking) => booking.starts_at.slice(0, 10) === ymd(new Date())).length,
    }),
    [bookings]
  );

  return (
    <motion.div {...page} className="admin-page space-y-4">
      <div className="flex flex-col gap-4 overflow-hidden rounded-[28px] border border-[#d39a43]/22 bg-[radial-gradient(circle_at_90%_0%,rgba(232,194,174,.58),transparent_32%),linear-gradient(135deg,#fffdf9,#f8eee4)] px-4 py-5 shadow-[0_20px_55px_rgba(70,34,49,.08)] dark:border-[#e7bc6b]/15 dark:bg-[radial-gradient(circle_at_90%_0%,rgba(109,42,99,.34),transparent_34%),linear-gradient(135deg,#2f182e,#1d121f)] sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              <CalendarDays className="h-3.5 w-3.5" /> {text.badge}
            </div>
            <h1 className="mt-3 font-serif text-2xl font-semibold text-slate-950 sm:text-3xl">{text.title}</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">{text.intro}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SummaryChip icon={<Users2 className="h-4 w-4" />} label={text.all} value={boardSummary.total} />
            <SummaryChip icon={<Clock3 className="h-4 w-4" />} label={text.pending} value={boardSummary.pending} />
            <SummaryChip icon={<CheckCircle2 className="h-4 w-4" />} label={text.confirmed} value={boardSummary.confirmed} />
            <SummaryChip icon={<CalendarDays className="h-4 w-4" />} label={text.today} value={boardSummary.today} />
            <Link
              to="/app/calendar"
              className="inline-flex items-center gap-2 rounded-xl bg-[#24364b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d2b3c]"
            >
              <CalendarDays className="h-4 w-4" /> {text.openCalendar}
            </Link>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[1.7fr_1fr_1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              placeholder={text.search}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm"
            />
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as FiltersState["status"] }))}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
          >
            <option value="">{text.allStatuses}</option>
            {columns.map((col) => (
              <option key={col.key} value={col.key}>
                {col.title}
              </option>
            ))}
          </select>
          <select
            value={filters.staff_id}
            onChange={(e) => setFilters((p) => ({ ...p, staff_id: e.target.value }))}
            disabled={isStaff}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm disabled:bg-slate-50"
          >
            <option value="">{isHealthcare ? text.allDoctors : text.allStaff}</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={() => setFilters(emptyFilters)}>
            {text.clear}
          </Button>
        </div>
      </div>

      {bookingsQ.isLoading || servicesQ.isLoading || (!isStaff && staffQ.isLoading) ? (
        <div className="flex min-h-[260px] items-center justify-center">
          <Spinner size={28} />
        </div>
      ) : bookingsQ.isError ? (
        <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
          {text.loadFailed}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={XCircle} title={text.empty} description={text.emptyText} />
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {columns.map((col) => (
              <section key={col.key} className="w-[288px] shrink-0 rounded-[10px] border border-[#cfcfcf] bg-[#dfdfdf] p-2 shadow-sm">
                <div className={cn("rounded-[10px] border px-3 py-2.5 shadow-sm", col.headerTone)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">{col.title} ({grouped[col.key].length})</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{col.subtitle}</div>
                    </div>
                    <span className={cn("inline-flex min-w-[34px] items-center justify-center rounded-full px-2 py-1 text-[10px] font-bold", col.badgeTone)}>
                      {grouped[col.key].length}
                    </span>
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  {grouped[col.key].length ? (
                    grouped[col.key].map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        serviceById={serviceById}
                        staffName={booking.staff_id ? staffById.get(booking.staff_id) ?? "" : ""}
                        onMove={(row, status) => actionMut.mutate({ id: row.id, status })}
                        text={text}
                        columns={columns}
                        locale={locale}
                        isHealthcare={isHealthcare}
                      />
                    ))
                  ) : (
                    <div className="rounded-[12px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-400">
                      {text.emptyColumn}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      <Toast open={toast.open} text={toast.text} type={toast.type} />
    </motion.div>
  );
}
