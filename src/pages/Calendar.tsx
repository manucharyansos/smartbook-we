import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type EventResizeDoneArg } from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { motion, AnimatePresence } from "framer-motion";
import {
    Ban,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Filter,
    Plus,
    Crown,
    User,
    Layers3,
    Clock3,
    CheckCircle2,
    Search,
    CalendarRange,
    Users2,
    Scissors,
    X,
    Phone,
    NotebookText,
    Sparkles,
    Pencil,
    Save,
    RotateCcw,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Toast } from "../components/ui/Toast";
import { cn } from "../lib/cn";
import { page } from "../lib/motion";
import { useAuth } from "../store/auth";
import { fetchServices, type Service } from "../lib/servicesApi";
import { fetchStaff, type StaffUser } from "../lib/staffApi";
import { fetchBusinessSettings } from "../lib/businessSettingsApi";
import {
    fetchBookings,
    createBooking,
    createBookingLines,
    updateBooking,
    updateBookingTime,
    cancelBooking,
    confirmBooking,
    doneBooking,
    noShowBooking,
    type Booking,
    type BookingStatus,
} from "../lib/calendarApi";
import { fetchBlocks, createBlock, deleteBlock, type Block } from "../lib/calendarBlocksApi";
import { fetchClients, type ClientRow } from "../lib/clientsApi";
import { fetchAvailabilityDay, type Slot } from "../lib/availabilityApi";

type DraftBooking = {
    startsAt: Date;
    endsAt: Date;
};

type LineDraft = {
    key: string;
    service_id: number;
    staff_id: number | "";
    starts_at: string;
};

type DraftBlock = {
    scope: "business" | "staff";
    staffId: number | "";
    date: string;
    mode: "allday" | "duration";
    startTime: string;
    durationMin: number;
    reason: string;
};

type ActionBooking = Booking | null;

type ConfirmState =
    | { type: "block"; block: Block }
    | { type: "booking-cancel"; booking: Booking }
    | null;

type BookingMode = "single" | "multi" | "lines";
type ViewMode = "day" | "week";

function parseLocalDateTime(dt?: string | null): Date | null {
    if (!dt) return null;
    if (dt.includes("T")) {
        const x = new Date(dt);
        return isNaN(x.getTime()) ? null : x;
    }
    const parts = dt.split(" ");
    if (parts.length < 2) return null;
    const [d, t] = parts;
    const [y, m, day] = d.split("-").map(Number);
    const [hh, mm, ss] = t.split(":").map(Number);
    if (!y || !m || !day || hh === undefined || mm === undefined) return null;
    const x = new Date();
    x.setFullYear(y, m - 1, day);
    x.setHours(hh, mm, ss ?? 0, 0);
    return x;
}

function ymd(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function hm(date: Date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60_000);
}

function toStartsAtValue(date: Date) {
    return `${ymd(date)} ${hm(date)}`;
}

function startOfWeekMonday(d: Date) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = (day + 6) % 7;
    x.setDate(x.getDate() - diff);
    x.setHours(0, 0, 0, 0);
    return x;
}

function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function addMonths(d: Date, n: number) {
    const x = new Date(d);
    x.setMonth(x.getMonth() + n);
    return x;
}

function rangeForWeek(viewDate: Date) {
    const start = startOfWeekMonday(viewDate);
    const end = addDays(start, 7);
    return { start, end };
}

function weekdayShort(date: Date) {
    try {
        return date.toLocaleDateString("hy-AM", { weekday: "short" });
    } catch {
        return ymd(date);
    }
}


function startOfMonth(d: Date) {
    const x = new Date(d.getFullYear(), d.getMonth(), 1);
    x.setHours(0, 0, 0, 0);
    return x;
}


function monthMatrix(viewDate: Date) {
    const first = startOfMonth(viewDate);
    const start = startOfWeekMonday(first);
    return Array.from({ length: 6 }).map((_, weekIndex) =>
        Array.from({ length: 7 }).map((__, dayIndex) => addDays(start, weekIndex * 7 + dayIndex))
    );
}

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "ST";
}

function formatMoney(value: number) {
    try {
        return new Intl.NumberFormat("ru-RU").format(value);
    } catch {
        return String(value);
    }
}

function eventColor(status: Booking["status"]) {
    switch (status) {
        case "pending":
            return {
                outer: "border-[#efd7a2] bg-[#fbf2dc]",
                badge: "bg-[#f4e2b2] text-[#7a5a13]",
            };
        case "confirmed":
            return {
                outer: "border-[#b9dec4] bg-[#e8f4eb]",
                badge: "bg-[#cfe8d5] text-[#2f6b3f]",
            };
        case "done":
            return {
                outer: "border-[#bfd8ea] bg-[#eaf4fb]",
                badge: "bg-[#d4e8f6] text-[#2d5876]",
            };
        case "cancelled":
            return {
                outer: "border-slate-200 bg-slate-50 opacity-75",
                badge: "bg-slate-100 text-slate-600",
            };
        case "no_show":
            return {
                outer: "border-[#efc0bf] bg-[#fae8e7]",
                badge: "bg-[#f4d3d1] text-[#8f4a49]",
            };
        default:
            return {
                outer: "border-slate-200 bg-white",
                badge: "bg-slate-100 text-slate-600",
            };
    }
}


function bookingStatusLabel(status: Booking["status"]) {
    switch (status) {
        case "pending":
            return "Սպասում է";
        case "confirmed":
            return "Հաստատված";
        case "done":
            return "Ավարտված";
        case "cancelled":
            return "Չեղարկված";
        case "no_show":
            return "Չի եկել";
        default:
            return status;
    }
}

function bookingStatusTone(status: Booking["status"]) {
    switch (status) {
        case "pending":
            return "border-[#efd7a2] bg-[#fbf2dc] text-[#7a5a13]";
        case "confirmed":
            return "border-[#b9dec4] bg-[#e8f4eb] text-[#2f6b3f]";
        case "done":
            return "border-[#bfd8ea] bg-[#eaf4fb] text-[#2d5876]";
        case "cancelled":
            return "border-slate-200 bg-slate-100 text-slate-600";
        case "no_show":
            return "border-[#efc0bf] bg-[#fae8e7] text-[#8f4a49]";
        default:
            return "border-slate-200 bg-slate-100 text-slate-600";
    }
}


function bookingSourceLabel(source?: string | null) {
    switch (source) {
        case "website":
            return "Website";
        case "instagram":
            return "Instagram";
        case "facebook":
            return "Facebook";
        case "whatsapp":
            return "WhatsApp";
        case "admin":
            return "Admin";
        case "partner":
            return "Partner";
        case "widget":
            return "Widget";
        case "qr":
            return "QR";
        case "returning_client":
            return "Returning";
        default:
            return "—";
    }
}

function bookingSourceTone(source?: string | null) {
    switch (source) {
        case "instagram":
            return "bg-[#fcecf4] text-[#a44972] border-[#f4d1e2]";
        case "facebook":
            return "bg-[#eef5fb] text-[#3e6a8b] border-[#d8e7f4]";
        case "whatsapp":
            return "bg-[#eaf7ee] text-[#2f6b3f] border-[#cee8d6]";
        case "website":
            return "bg-[#eff5fb] text-[#37627c] border-[#d7e6f3]";
        case "admin":
            return "bg-[#f0ebfa] text-[#6346a8] border-[#ddd2f6]";
        case "partner":
            return "bg-[#fbf2e4] text-[#8a6522] border-[#f0dfbb]";
        default:
            return "bg-slate-50 text-slate-600 border-slate-200";
    }
}

function formatShortDateLabel(date: Date) {
    try {
        return date.toLocaleDateString("hy-AM", { month: "short", day: "numeric" });
    } catch {
        return ymd(date);
    }
}

function formatWeekRangeLabel(days: Date[]) {
    if (!days.length) return "Շաբաթ";
    const first = days[0];
    const last = days[days.length - 1];
    try {
        const firstLabel = first.toLocaleDateString("hy-AM", { month: "short", day: "numeric" });
        const lastLabel = last.toLocaleDateString("hy-AM", { month: "short", day: "numeric" });
        return `${firstLabel} — ${lastLabel}`;
    } catch {
        return `${ymd(first)} — ${ymd(last)}`;
    }
}

function formatDateTimeLabel(value?: string | null) {
    const date = parseLocalDateTime(value);
    if (!date) return "—";
    try {
        return date.toLocaleString("hy-AM", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
        return value ?? "—";
    }
}

function BookingDetailsDrawer({
                                  booking,
                                  serviceById,
                                  staffById,
                                  options,
                                  onClose,
                                  onChoose,
                                  onUpdate,
                                  onShift,
                                  saving = false,
                              }: {
    booking: Booking | null;
    serviceById: Map<number, Service>;
    staffById: Map<number, StaffUser>;
    options: Array<{ key: string; title: string; description?: string; danger?: boolean }>;
    onClose: () => void;
    onChoose: (key: string) => void;
    onUpdate: (payload: { id: number; client_name: string; client_phone: string; notes: string | null; status: BookingStatus; staff_id: number | null; starts_at: string }) => void;
    onShift: (booking: Booking, deltaMinutes: number) => void;
    saving?: boolean;
}) {
    const items = booking?.items?.length
        ? booking.items
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((item) => ({
                id: item.id,
                name: item.service?.name ?? serviceById.get(item.service_id)?.name ?? `Ծառայություն #${item.service_id}`,
                duration: item.duration_minutes ?? item.service?.duration_minutes ?? 0,
                price: item.price ?? item.service?.price ?? null,
            }))
        : booking
            ? [{
                id: booking.id,
                name: serviceById.get(booking.service_id)?.name ?? `Ծառայություն #${booking.service_id}`,
                duration: serviceById.get(booking.service_id)?.duration_minutes ?? 0,
                price: serviceById.get(booking.service_id)?.price ?? null,
            }]
            : [];

    const totalPrice = items.reduce((sum, item) => sum + Number(item.price ?? 0), 0);
    const staffName = booking?.staff_id ? staffById.get(booking.staff_id)?.name : null;
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        client_name: '',
        client_phone: '',
        notes: '',
        status: 'confirmed' as BookingStatus,
        staff_id: '' as number | '',
        date: '',
        time: '',
    });

    useEffect(() => {
        if (!booking) return;
        const dt = parseLocalDateTime(booking.starts_at);
        setEditing(false);
        setForm({
            client_name: booking.client_name ?? '',
            client_phone: booking.client_phone ?? '',
            notes: booking.notes ?? '',
            status: booking.status,
            staff_id: booking.staff_id ?? '',
            date: dt ? ymd(dt) : '',
            time: dt ? hm(dt) : '',
        });
    }, [booking]);

    function saveEdit() {
        if (!booking || !form.client_name.trim() || !form.client_phone.trim() || !form.date || !form.time) return;
        onUpdate({
            id: booking.id,
            client_name: form.client_name.trim(),
            client_phone: form.client_phone.trim(),
            notes: form.notes.trim() || null,
            status: form.status,
            staff_id: form.staff_id ? Number(form.staff_id) : null,
            starts_at: `${form.date} ${form.time}`,
        });
    }

    return (
        <AnimatePresence>
            {booking ? (
                <>
                    <motion.button
                        type="button"
                        className="fixed inset-0 z-40 bg-white/45 "
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.aside
                        data-booking-id={booking.id}
                        initial={{ x: 420, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 420, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 28 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-[#fbfaf8] shadow-[0_18px_48px_rgba(15,23,42,0.12)] sm:max-w-[460px]"
                    >
                        <div className="border-b border-slate-200 bg-[#faf8f4] px-5 py-5 text-slate-900">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Ամրագրման տվյալներ · #{booking.booking_code || booking.id}
                                    </div>
                                    <div className="mt-2 text-2xl font-semibold tracking-tight">{booking.client_name}</div>
                                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                        <Phone className="h-4 w-4" /> {booking.client_phone}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditing((v) => !v)}
                                        className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition hover:bg-white/15"
                                        title={editing ? 'Չեղարկել խմբագրումը' : 'Խմբագրել'}
                                    >
                                        {editing ? <RotateCcw className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition hover:bg-white/15"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", bookingStatusTone(booking.status))}>
                  {bookingStatusLabel(booking.status)}
                </span>
                                {staffName ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{staffName}</span> : null}
                                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', bookingSourceTone(booking.source))}>{bookingSourceLabel(booking.source)}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {editing ? (
                                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-950">Խմբագրել ամրագրումը</div>
                                            <div className="mt-1 text-xs text-slate-500">Փոխիր հաճախորդին, ժամը, մասնագետին կամ կարգավիճակը։</div>
                                        </div>
                                        <Button size="sm" onClick={saveEdit} loading={saving}><Save className="h-4 w-4" /> Պահպանել</Button>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <CreateField label="Հաճախորդի անուն"><input value={form.client_name} onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                        <CreateField label="Հեռախոս"><input value={form.client_phone} onChange={(e) => setForm((p) => ({ ...p, client_phone: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                        <CreateField label="Ամսաթիվ"><input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                        <CreateField label="Ժամ"><input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                        <CreateField label="Աշխատակից"><select value={form.staff_id} onChange={(e) => setForm((p) => ({ ...p, staff_id: e.target.value ? Number(e.target.value) : '' }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"><option value="">Առանց ընտրության</option>{Array.from(staffById.values()).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></CreateField>
                                        <CreateField label="Կարգավիճակ"><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as BookingStatus }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"><option value="pending">Սպասող</option><option value="confirmed">Հաստատված</option><option value="done">Ավարտված</option><option value="cancelled">Չեղարկված</option><option value="no_show">Չներկայացած</option></select></CreateField>
                                    </div>
                                    <CreateField label="Նշումներ"><textarea rows={4} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        {[{ delta: -30, label: '-30ր' }, { delta: -15, label: '-15ր' }, { delta: 15, label: '+15ր' }, { delta: 30, label: '+30ր' }].map((step) => (
                                            <Button key={step.label} variant="secondary" size="sm" onClick={() => onShift(booking, step.delta)}>{step.label}</Button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            <div className="grid gap-4 sm:grid-cols-2 mt-0">
                                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Սկիզբ</div>
                                    <div className="mt-2 text-sm font-semibold text-slate-900">{formatDateTimeLabel(booking.starts_at)}</div>
                                </div>
                                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ավարտ</div>
                                    <div className="mt-2 text-sm font-semibold text-slate-900">{formatDateTimeLabel(booking.ends_at)}</div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                                    <Scissors className="h-4 w-4 text-violet-600" /> Ծառայություններ
                                </div>
                                <div className="mt-3 divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="font-medium text-slate-900">{item.name}</div>
                                                    <div className="mt-1 text-xs text-slate-500">{item.duration} րոպե</div>
                                                </div>
                                                {item.price != null ? <div className="text-sm font-semibold text-violet-700">{item.price} AMD</div> : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">Ընդհանուր արժեքը՝ {totalPrice} AMD</div>
                            </div>

                            {booking.notes ? (
                                <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><NotebookText className="h-4 w-4 text-slate-600" /> Նշումներ</div>
                                    <div className="mt-3 text-sm leading-6 text-slate-600">{booking.notes}</div>
                                </div>
                            ) : null}

                            <div className="mt-5 border-t border-slate-200 pt-5">
                                <div className="text-sm font-semibold text-slate-950">Արագ գործողություններ</div>
                                <div className="mt-3 grid gap-2">
                                    {options.map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => onChoose(option.key)}
                                            className={cn(
                                                'rounded-2xl border px-4 py-3 text-left transition',
                                                option.danger
                                                    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-200 hover:bg-violet-50'
                                            )}
                                        >
                                            <div className="font-medium">{option.title}</div>
                                            {option.description ? <div className="mt-1 text-xs text-current/70">{option.description}</div> : null}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </>
            ) : null}
        </AnimatePresence>
    );
}

function CreateField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block text-sm text-slate-600">
            <div className="mb-2 font-medium text-slate-600">{label}</div>
            {children}
        </label>
    );
}

function ModeCard({
                      active,
                      icon,
                      title,
                      description,
                      color,
                      onClick,
                  }: {
    active: boolean;
    icon: ReactNode;
    title: string;
    description: string;
    color: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "group rounded-[22px] border p-4 text-left transition-all duration-200",
                active
                    ? "border-transparent bg-white text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            )}
        >
            <div className="flex items-start gap-3">
                <div className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-slate-900 shadow-sm",
                    color,
                    !active && "opacity-95"
                )}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className={cn("text-sm font-semibold", active ? "text-slate-900" : "text-slate-900")}>{title}</div>
                    <div className={cn("mt-1 text-sm leading-6", active ? "text-slate-500" : "text-slate-500")}>{description}</div>
                </div>
            </div>
        </button>
    );
}

function SmartSlotPicker({
                             slots,
                             activeKey,
                             onSelect,
                             showStaff = false,
                         }: {
    slots: Slot[];
    activeKey: string;
    onSelect: (slot: Slot) => void;
    showStaff?: boolean;
}) {
    if (!slots.length) return null;

    return (
        <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-violet-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Sparkles className="h-4 w-4" />
                Խելացի առաջարկներ
            </div>
            <div className="mt-1 text-sm leading-6 text-slate-600">
                Համակարգը նախընտրում է այն ժամերը, որոնք օրացույցում ավելի քիչ բացեր են թողնում։
            </div>
            <div className="mt-3 grid gap-2 2xl:grid-cols-3">
                {slots.map((slot) => {
                    const slotKey = `${slot.starts_at}|${slot.staff_id ?? "na"}`;
                    const active = activeKey === slotKey;
                    return (
                        <button
                            key={slotKey}
                            type="button"
                            onClick={() => onSelect(slot)}
                            className={cn(
                                "rounded-2xl border px-3 py-3 text-left transition-all",
                                active
                                    ? "border-emerald-400 bg-emerald-100 shadow-sm"
                                    : "border-white/80 bg-white hover:border-emerald-300 hover:bg-white"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-slate-900">
                                    {slot.starts_at.slice(11, 16)}
                                    {showStaff && slot.staff_name ? ` · ${slot.staff_name}` : ""}
                                </div>
                                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-slate-900">
                  #{slot.recommendation_rank ?? "★"}
                </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{slot.smart_reason || "Առաջարկվող slot"}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function adminSlotKey(slot: Slot) {
    return `${slot.starts_at}|${slot.staff_id ?? "na"}`;
}

function hmToMinutes(value: string) {
    const [hours, minutes] = value.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
}

function minutesFromDate(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
}

function staffAvatarName(name?: string | null) {
    return name?.trim() || "Մասնագետ";
}

function bookingServiceTitle(booking: Booking, serviceById: Map<number, Service>) {
    const titles = booking.items?.length
        ? booking.items
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((item) => item.service?.name ?? serviceById.get(item.service_id)?.name ?? "")
            .filter(Boolean)
        : [serviceById.get(booking.service_id)?.name ?? `Ծառայություն #${booking.service_id}`];

    return titles.join(" + ");
}

type BookingColumnLayout = { column: number; columns: number };

function layoutOverlappingBookings(bookings: Booking[]): Map<number, BookingColumnLayout> {
    const sorted = bookings
        .slice()
        .sort((a, b) => {
            const startCompare = a.starts_at.localeCompare(b.starts_at);
            return startCompare || a.ends_at.localeCompare(b.ends_at) || a.id - b.id;
        });
    const result = new Map<number, BookingColumnLayout>();
    let group: Booking[] = [];
    let groupEnd = Number.NEGATIVE_INFINITY;

    const flushGroup = () => {
        if (!group.length) return;
        const columnEnds: number[] = [];
        const assignments = new Map<number, number>();

        for (const booking of group) {
            const start = parseLocalDateTime(booking.starts_at)?.getTime() ?? 0;
            const end = parseLocalDateTime(booking.ends_at)?.getTime() ?? start + 1;
            let column = columnEnds.findIndex((columnEnd) => columnEnd <= start);
            if (column < 0) {
                column = columnEnds.length;
                columnEnds.push(end);
            } else {
                columnEnds[column] = end;
            }
            assignments.set(booking.id, column);
        }

        const columns = Math.max(columnEnds.length, 1);
        for (const booking of group) {
            result.set(booking.id, { column: assignments.get(booking.id) ?? 0, columns });
        }
        group = [];
        groupEnd = Number.NEGATIVE_INFINITY;
    };

    for (const booking of sorted) {
        const start = parseLocalDateTime(booking.starts_at)?.getTime() ?? 0;
        const end = parseLocalDateTime(booking.ends_at)?.getTime() ?? start + 1;
        if (group.length && start >= groupEnd) flushGroup();
        group.push(booking);
        groupEnd = Math.max(groupEnd, end);
    }
    flushGroup();

    return result;
}

function SonlineMobileSchedule({
                                   weekDays,
                                   datePick,
                                   bookings,
                                   blocks,
                                   serviceById,
                                   staffById,
                                   selectedDateRevenue,
                                   viewMode,
                                   activeFilterCount,
                                   onPickDate,
                                   onOpenCreate,
                                   onBookingClick,
                                   onBlockClick,
                                   onOpenFilters,
                                   onJumpToToday,
                               }: {
    weekDays: Date[];
    datePick: string;
    bookings: Booking[];
    blocks: Block[];
    serviceById: Map<number, Service>;
    staffById: Map<number, StaffUser>;
    selectedDateRevenue: number;
    viewMode: ViewMode;
    activeFilterCount: number;
    onPickDate: (value: string) => void;
    onOpenCreate: (date: string, time: string) => void;
    onBookingClick: (booking: Booking) => void;
    onBlockClick: (block: Block) => void;
    onOpenFilters: () => void;
    onJumpToToday: () => void;
}) {
    const dayBookings = useMemo(
        () => bookings.filter((booking) => booking.starts_at.slice(0, 10) === datePick).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
        [bookings, datePick]
    );
    const dayBlocks = useMemo(
        () => blocks.filter((block) => block.starts_at.slice(0, 10) === datePick).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
        [blocks, datePick]
    );
    const currentRangeLabel = viewMode === "week"
        ? formatWeekRangeLabel(weekDays)
        : formatShortDateLabel(parseLocalDateTime(`${datePick} 12:00:00`) ?? new Date());
    const jumpButtonLabel = viewMode === "week" ? "Այս շաբաթ" : "Այսօր";
    const footerModeLabel = viewMode === "week" ? "Շաբաթ" : "Օր";

    return (
        <div className="space-y-4 pb-4">
            <div className="overflow-hidden rounded-[30px] border border-[#e7dfd6] bg-white text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
                <div className="border-b border-[#eee6dc] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Օրվա ամրագրումներ</div>
                            <div className="mt-1 text-lg font-semibold text-slate-950">{formatDateTimeLabel(`${datePick} 10:00`)?.split(',')[0] ?? datePick}</div>
                            <div className="mt-1 text-xs text-slate-500">{dayBookings.length} ամրագրում • {formatMoney(selectedDateRevenue)} դր</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenCreate(datePick, "10:00")}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 px-4 py-4">
                    <div className="rounded-[22px] border border-[#eee6dc] bg-[#fcfbf8] px-3 py-3">
                        <div className="text-[11px] text-slate-400">Ամրագրումներ</div>
                        <div className="mt-1 text-2xl font-semibold">{dayBookings.length}</div>
                    </div>
                    <div className="rounded-[22px] border border-[#eee6dc] bg-[#fcfbf8] px-3 py-3">
                        <div className="text-[11px] text-slate-400">Շրջանառություն</div>
                        <div className="mt-1 text-2xl font-semibold">{formatMoney(selectedDateRevenue)}</div>
                    </div>
                </div>
            </div>

            <div className="-mx-1 overflow-x-auto">
                <div className="flex min-w-max gap-2 px-1 pb-1">
                    {weekDays.map((day) => {
                        const key = ymd(day);
                        const active = key === datePick;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onPickDate(key)}
                                className={cn(
                                    "min-w-[78px] rounded-[20px] border px-3 py-2.5 text-center transition",
                                    active
                                        ? "border-[#24364b] bg-[#24364b] text-white shadow-sm"
                                        : "border-[#e7dfd6] bg-white text-slate-700"
                                )}
                            >
                                <div className="text-[11px] font-medium opacity-80">{weekdayShort(day)}</div>
                                <div className="mt-1 text-base font-semibold">{String(day.getDate()).padStart(2, "0")}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {dayBlocks.length ? (
                <div className="space-y-2">
                    {dayBlocks.map((block) => (
                        <button
                            key={block.id}
                            type="button"
                            onClick={() => onBlockClick(block)}
                            className="flex w-full items-center justify-between rounded-[22px] border border-[#efc0bf] bg-[#fae8e7] px-4 py-3 text-left"
                        >
                            <div>
                                <div className="text-sm font-semibold text-[#8f4a49]">{block.reason || "Փակ ժամ"}</div>
                                <div className="mt-1 text-xs text-[#8f4a49]">{block.starts_at.slice(11, 16)} – {block.ends_at.slice(11, 16)}</div>
                            </div>
                            <Ban className="h-4 w-4 text-[#8f4a49]" />
                        </button>
                    ))}
                </div>
            ) : null}

            <div className="space-y-3">
                {dayBookings.length ? (
                    dayBookings.map((booking) => {
                        const serviceLabel = bookingServiceTitle(booking, serviceById);
                        const staffName = booking.staff_id ? staffById.get(booking.staff_id)?.name ?? "—" : "—";
                        return (
                            <button
                                key={booking.id}
                                type="button"
                                data-booking-id={booking.id}
                                onClick={() => onBookingClick(booking)}
                                className="w-full rounded-[24px] border border-[#e7dfd6] bg-white px-4 py-4 text-left shadow-[0_10px_22px_rgba(15,23,42,0.05)] transition hover:border-violet-200"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-[15px] font-semibold text-slate-950">{booking.client_name}</div>
                                        <div className="mt-1 text-sm text-slate-500">{serviceLabel}</div>
                                    </div>
                                    <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", bookingStatusTone(booking.status))}>
                    {bookingStatusLabel(booking.status)}
                  </span>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f2ee] px-2.5 py-1"><Clock3 className="h-3.5 w-3.5" /> {booking.starts_at.slice(11, 16)} – {booking.ends_at.slice(11, 16)}</span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f2ee] px-2.5 py-1"><User className="h-3.5 w-3.5" /> {staffName}</span>
                                    {booking.client_phone ? <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f2ee] px-2.5 py-1"><Phone className="h-3.5 w-3.5" /> {booking.client_phone}</span> : null}
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="rounded-[24px] border border-dashed border-[#e7dfd6] bg-white px-4 py-8 text-center text-sm text-slate-500">
                        Այս օրը ամրագրում չկա։
                    </div>
                )}
            </div>

            <div className="sticky bottom-[76px] z-20 px-1 pt-1">
                <div className="mx-auto flex max-w-sm items-center justify-between rounded-[28px] border border-[#e7dfd6] bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur">
                    <button type="button" onClick={onJumpToToday} className="flex flex-col items-center gap-1 text-[11px] text-slate-500">
                        <CalendarDays className="h-4 w-4" /> {jumpButtonLabel}
                    </button>
                    <button type="button" onClick={() => onOpenCreate(datePick, "10:00")} className="grid h-12 w-12 place-items-center rounded-full bg-[#24364b] text-white shadow-[0_12px_28px_rgba(36,54,75,0.28)] transition hover:-translate-y-0.5">
                        <Plus className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={onOpenFilters} className="flex flex-col items-center gap-1 text-[11px] text-slate-500">
                        <Filter className="h-4 w-4" /> {activeFilterCount ? `Ֆիլտր ${activeFilterCount}` : footerModeLabel}
                    </button>
                </div>
                <div className="mt-2 text-center text-[11px] text-slate-500">{currentRangeLabel}</div>
            </div>
        </div>
    );
}

function SonlineDesktopDayColumns({
                                      date,
                                      bookings,
                                      blocks,
                                      staff,
                                      serviceById,
                                      onBookingClick,
                                      onSelectSlot,
                                      onBlockClick,
                                      workStart,
                                      workEnd,
                                      slotMinutes,
                                  }: {
    date: string;
    bookings: Booking[];
    blocks: Block[];
    staff: StaffUser[];
    serviceById: Map<number, Service>;
    onBookingClick: (booking: Booking) => void;
    onSelectSlot: (date: string, time: string) => void;
    onBlockClick: (block: Block) => void;
    workStart: string;
    workEnd: string;
    slotMinutes: number;
}) {
    const startMinutes = hmToMinutes(workStart);
    const endMinutes = hmToMinutes(workEnd);
    const pxPerMinute = 1.15;
    const bodyHeight = Math.max(620, (endMinutes - startMinutes) * pxPerMinute);
    const timeMarks = useMemo(() => {
        const values: number[] = [];
        for (let mark = startMinutes; mark <= endMinutes; mark += 60) values.push(mark);
        return values;
    }, [startMinutes, endMinutes]);
    const slotMarks = useMemo(() => {
        const values: number[] = [];
        for (let mark = startMinutes; mark < endMinutes; mark += slotMinutes) values.push(mark);
        return values;
    }, [startMinutes, endMinutes, slotMinutes]);

    const dayBookings = useMemo(
        () => bookings.filter((booking) => booking.starts_at.slice(0, 10) === date),
        [bookings, date]
    );
    const dayBlocks = useMemo(
        () => blocks.filter((block) => block.starts_at.slice(0, 10) === date),
        [blocks, date]
    );
    const unassignedBookings = dayBookings.filter((booking) => !booking.staff_id);
    const columns = staff.length ? [...staff] : [];
    const showUnassigned = unassignedBookings.length > 0;
    const totalColumns = Math.max(columns.length + (showUnassigned ? 1 : 0), 1);

    return (
        <div className="overflow-hidden rounded-[30px] border border-[#e7dfd6] bg-white shadow-[0_16px_44px_rgba(15,23,42,0.07)]">
            <div className="border-b border-[#eee6dc] bg-[#fcfbf8] px-4 py-4 text-slate-900">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Էլեկտրոնային մատյան</div>
                        <div className="mt-1 text-lg font-semibold">{date}</div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#e7dfd6] bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                        <Users2 className="h-3.5 w-3.5" /> {dayBookings.length} այց
                    </div>
                </div>
            </div>

            <div className="overflow-auto">
                <div className="min-w-[980px]">
                    <div className="grid border-b border-[#eee6dc] bg-[#faf8f5]" style={{ gridTemplateColumns: `84px repeat(${totalColumns}, minmax(220px, 1fr))` }}>
                        <div className="border-r border-[#eee6dc] px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ժամ</div>
                        {showUnassigned ? (
                            <div className="flex items-center gap-3 border-r border-[#eee6dc] px-4 py-3">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e7dfd6] bg-white text-[11px] font-semibold text-slate-700">NA</div>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-950">Առանց մասնագետի</div>
                                    <div className="text-[11px] text-slate-500">{unassignedBookings.length} այց</div>
                                </div>
                            </div>
                        ) : null}
                        {columns.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 border-r border-[#eee6dc] px-4 py-3 last:border-r-0">
                                <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[#e7dfd6] bg-white text-sm font-semibold text-slate-700">
                                    {member.avatar_url ? <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" /> : initials(staffAvatarName(member.name))}
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-950">{member.name}</div>
                                    <div className="text-[11px] text-slate-500">{dayBookings.filter((booking) => booking.staff_id === member.id).length} այց</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: `84px repeat(${totalColumns}, minmax(220px, 1fr))` }}>
                        <div className="relative border-r border-[#eee6dc] bg-[#faf8f5]" style={{ height: bodyHeight }}>
                            {timeMarks.map((mark) => (
                                <div key={mark} className="absolute inset-x-0" style={{ top: (mark - startMinutes) * pxPerMinute }}>
                                    <div className="-translate-y-1/2 px-3 text-[11px] font-medium text-slate-400">
                                        {`${String(Math.floor(mark / 60)).padStart(2, "0")}:${String(mark % 60).padStart(2, "0")}`}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {[...(showUnassigned ? [{ id: -1, name: 'Առանց staff', avatar_url: null } as unknown as StaffUser] : []), ...columns].map((member) => {
                            const memberId = (member as StaffUser).id === -1 ? null : (member as StaffUser).id;
                            const memberBookings = dayBookings.filter((booking) => memberId === null ? !booking.staff_id : booking.staff_id === memberId);
                            const memberBlocks = dayBlocks.filter((block) => memberId === null ? !block.staff_id : !block.staff_id || block.staff_id === memberId);
                            const bookingLayout = layoutOverlappingBookings(memberBookings);

                            return (
                                <div key={memberId ?? 'na'} className="relative border-r border-[#eee6dc] last:border-r-0 bg-white" style={{ height: bodyHeight }}>
                                    {slotMarks.map((mark) => (
                                        <button
                                            key={mark}
                                            type="button"
                                            onClick={() => onSelectSlot(date, `${String(Math.floor(mark / 60)).padStart(2, "0")}:${String(mark % 60).padStart(2, "0")}`)}
                                            className="absolute inset-x-0 z-0 border-t border-[#f1ece6] text-left transition hover:bg-[#f6f3ef]"
                                            style={{ top: (mark - startMinutes) * pxPerMinute, height: slotMinutes * pxPerMinute }}
                                        />
                                    ))}

                                    {memberBlocks.map((block) => {
                                        const startDate = parseLocalDateTime(block.starts_at);
                                        const endDate = parseLocalDateTime(block.ends_at);
                                        if (!startDate || !endDate) return null;
                                        const top = Math.max(0, (minutesFromDate(startDate) - startMinutes) * pxPerMinute);
                                        const height = Math.max(26, (minutesFromDate(endDate) - minutesFromDate(startDate)) * pxPerMinute);
                                        return (
                                            <button
                                                key={`block-${block.id}`}
                                                type="button"
                                                onClick={() => onBlockClick(block)}
                                                className="absolute left-1.5 right-1.5 z-10 rounded-[16px] border border-[#efc0bf] bg-[#fae8e7] px-3 py-2 text-left text-xs font-semibold text-[#8f4a49]"
                                                style={{ top, height }}
                                            >
                                                <div>{block.reason || "Փակ ժամ"}</div>
                                            </button>
                                        );
                                    })}

                                    {memberBookings.map((booking) => {
                                        const startDate = parseLocalDateTime(booking.starts_at);
                                        const endDate = parseLocalDateTime(booking.ends_at);
                                        if (!startDate || !endDate) return null;
                                        const top = Math.max(0, (minutesFromDate(startDate) - startMinutes) * pxPerMinute + 3);
                                        const height = Math.max(56, (minutesFromDate(endDate) - minutesFromDate(startDate)) * pxPerMinute - 6);
                                        const ui = eventColor(booking.status);
                                        const layout = bookingLayout.get(booking.id) ?? { column: 0, columns: 1 };
                                        const columnWidth = 100 / layout.columns;
                                        return (
                                            <button
                                                key={booking.id}
                                                type="button"
                                                data-booking-id={booking.id}
                                                onClick={() => onBookingClick(booking)}
                                                className={cn("absolute z-20 overflow-hidden rounded-[16px] border px-3 py-2 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)]", ui.outer)}
                                                style={{
                                                    top,
                                                    height,
                                                    left: `calc(${layout.column * columnWidth}% + 6px)`,
                                                    width: `calc(${columnWidth}% - 9px)`,
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{booking.starts_at.slice(11, 16)} – {booking.ends_at.slice(11, 16)}</div>
                                                        <div className="mt-1 truncate text-[12px] font-semibold text-slate-900">{booking.client_name}</div>
                                                        <div className="mt-0.5 truncate text-[11px] text-slate-600">{bookingServiceTitle(booking, serviceById)}</div>
                                                    </div>
                                                    <span className={cn("rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide", ui.badge)}>
                                                        {bookingStatusLabel(booking.status)}
                                                    </span>
                                                </div>
                                                {booking.client_phone ? <div className="mt-2 truncate text-[10px] text-slate-500">{booking.client_phone}</div> : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Calendar() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const businessId = user?.business_id ?? null;
    const isStaff = user?.role === "staff";
    const canManageAllBookings = user?.role === "owner" || user?.role === "manager" || user?.role === "super_admin";
    const canManageBlocks = user?.role === "owner" || user?.role === "manager";

    const [viewDate, setViewDate] = useState<Date>(() => new Date());
    const [datePick, setDatePick] = useState<string>(() => ymd(new Date()));
    const [isMobile, setIsMobile] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("day");

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [staffFilter, setStaffFilter] = useState<number[]>([]);
    const [serviceFilter, setServiceFilter] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCancelled, setShowCancelled] = useState(false);

    const [blockOpen, setBlockOpen] = useState(false);
    const [blockDraft, setBlockDraft] = useState<DraftBlock>(() => ({
        scope: "staff",
        staffId: "",
        date: ymd(new Date()),
        mode: "duration",
        startTime: "13:00",
        durationMin: 60,
        reason: "Ընդմիջում",
    }));

    const [createOpen, setCreateOpen] = useState(false);
    const [bookingMode, setBookingMode] = useState<BookingMode>("single");
    const [draft, setDraft] = useState<DraftBooking | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [bookingSource, setBookingSource] = useState<string>('admin');
    const [clientLookup, setClientLookup] = useState("");
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [serviceIds, setServiceIds] = useState<number[]>([]);
    const [servicePick, setServicePick] = useState<number | "">("");
    const [staffId, setStaffId] = useState<number | "">("");
    const [lineDrafts, setLineDrafts] = useState<LineDraft[]>([]);
    const [notes, setNotes] = useState("");
    const [redeemPoints, setRedeemPoints] = useState('');
    const [giftCardCode, setGiftCardCode] = useState('');
    const [giftCardAmount, setGiftCardAmount] = useState('');

    const [selectedBooking, setSelectedBooking] = useState<ActionBooking>(null);
    const [confirmState, setConfirmState] = useState<ConfirmState>(null);
    const [toast, setToast] = useState<{ open: boolean; text: string; type: "success" | "error" }>({ open: false, text: "", type: "success" });

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 1024);
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const { start, end } = useMemo(() => {
        if (viewMode === "day") {
            const day = startOfDay(viewDate);
            return { start: day, end: day };
        }
        const range = rangeForWeek(viewDate);
        return { start: range.start, end: addDays(range.end, -1) };
    }, [viewDate, viewMode]);
    const from = ymd(start);
    const to = ymd(end);

    const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(startOfWeekMonday(viewDate), i)), [viewDate]);

    const settingsQ = useQuery({ queryKey: ["business-settings", businessId], queryFn: () => fetchBusinessSettings(), enabled: !!businessId, staleTime: 60_000 });
    const servicesQ = useQuery({ queryKey: ["services", businessId], queryFn: () => fetchServices(), enabled: !!businessId, staleTime: 60_000 });
    const staffQ = useQuery({ queryKey: ["staff", businessId], queryFn: () => fetchStaff(), enabled: !!businessId, staleTime: 60_000 });
    const clientsQ = useQuery({
        queryKey: ["clients", "calendar-picker", clientLookup],
        queryFn: () => fetchClients({ search: clientLookup || undefined, per_page: 8 }),
        enabled: createOpen && !!businessId,
        staleTime: 20_000,
    });
    const smartAvailabilityDate = draft ? ymd(draft.startsAt) : "";
    const smartAvailabilityQ = useQuery({
        queryKey: ["calendar-smart-availability", businessId, bookingMode, smartAvailabilityDate, staffId || "any", serviceIds.join(",")],
        queryFn: () =>
            fetchAvailabilityDay({
                service_id: bookingMode === "single" ? serviceIds[0] : undefined,
                service_ids: bookingMode === "single" ? undefined : serviceIds,
                staff_id: staffId ? Number(staffId) : undefined,
                date: smartAvailabilityDate,
            }),
        enabled:
            createOpen &&
            !!businessId &&
            !!smartAvailabilityDate &&
            bookingMode !== "lines" &&
            (bookingMode === "single" ? serviceIds.length === 1 : serviceIds.length > 0),
        staleTime: 10_000,
    });
    const bookingsQ = useQuery({ queryKey: ["bookings", businessId, from, to], queryFn: () => fetchBookings(from, to), enabled: !!businessId, staleTime: 10_000 });
    const blocksQ = useQuery({ queryKey: ["blocks", businessId, from, to], queryFn: () => fetchBlocks(from, to), enabled: !!businessId && canManageBlocks, staleTime: 10_000 });

    const settings = settingsQ.data ?? null;
    const services = (servicesQ.data ?? []) as Service[];
    const staff = (staffQ.data ?? []) as StaffUser[];
    const bookings = useMemo(() => {
        const unique = new Map<number, Booking>();
        for (const booking of (bookingsQ.data ?? []) as Booking[]) {
            if (!unique.has(Number(booking.id))) unique.set(Number(booking.id), booking);
        }
        return Array.from(unique.values());
    }, [bookingsQ.data]);
    const blocks = (blocksQ.data ?? []) as Block[];
    const clientSuggestions = (clientsQ.data?.data ?? []) as ClientRow[];
    const smartSlots = (smartAvailabilityQ.data ?? []) as Slot[];
    const recommendedSmartSlots = useMemo(() => smartSlots.filter((slot) => slot.is_recommended).slice(0, 3), [smartSlots]);
    const activeSmartSlotKey = useMemo(() => {
        if (!draft) return "";
        const starts = `${ymd(draft.startsAt)} ${hm(draft.startsAt)}:00`;
        const matched = smartSlots.find((slot) => slot.starts_at === starts && (!staffId || !slot.staff_id || slot.staff_id === Number(staffId)));
        return matched ? adminSlotKey(matched) : "";
    }, [draft, smartSlots, staffId]);
    const selectedSmartSlot = useMemo(() => smartSlots.find((slot) => adminSlotKey(slot) === activeSmartSlotKey) ?? null, [smartSlots, activeSmartSlotKey]);
    const hasMatchingSmartSlot = bookingMode === "lines" ? true : !!activeSmartSlotKey;

    useEffect(() => {
        if (isStaff && user?.id) {
            setStaffFilter([user.id]);
            setStaffId(user.id);
            setBlockDraft((p) => ({ ...p, staffId: user.id, scope: "staff" }));
        }
    }, [isStaff, user?.id]);

    const serviceById = useMemo(() => {
        const m = new Map<number, Service>();
        for (const s of services) m.set(s.id, s);
        return m;
    }, [services]);

    const staffById = useMemo(() => {
        const m = new Map<number, StaffUser>();
        for (const s of staff) m.set(s.id, s);
        return m;
    }, [staff]);

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            if (!showCancelled && b.status === "cancelled") return false;
            if (staffFilter.length && b.staff_id && !staffFilter.includes(b.staff_id)) return false;
            if (serviceFilter.length) {
                const ids = (b.items?.length ? b.items.map((it) => it.service_id) : [b.service_id]).filter(Boolean) as number[];
                if (!ids.some((id) => serviceFilter.includes(id))) return false;
            }
            return true;
        });
    }, [bookings, showCancelled, staffFilter, serviceFilter]);

    const visibleBookings = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return filteredBookings;

        return filteredBookings.filter((booking) => {
            const serviceNames = booking.items?.length
                ? booking.items.map((item) => item.service?.name ?? serviceById.get(item.service_id)?.name ?? "")
                : [serviceById.get(booking.service_id)?.name ?? ""];
            const haystack = [
                booking.client_name,
                booking.client_phone,
                booking.notes ?? "",
                booking.staff_id ? staffById.get(booking.staff_id)?.name ?? "" : "",
                ...serviceNames,
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(query);
        });
    }, [filteredBookings, searchTerm, serviceById, staffById]);

    useEffect(() => {
        if (!draft || !serviceIds.length) {
            setLineDrafts([]);
            return;
        }

        setLineDrafts((prev) => {
            let cursor = new Date(draft.startsAt);
            return serviceIds.map((serviceId, index) => {
                const existing = prev.find((item) => item.service_id === serviceId && !serviceIds.slice(0, index).includes(item.service_id));
                const serviceMeta = serviceById.get(serviceId);
                const fallbackStartsAt = toStartsAtValue(cursor);
                cursor = addMinutes(cursor, Number(serviceMeta?.duration_minutes ?? 30) || 30);

                return {
                    key: existing?.key ?? `${serviceId}-${index}`,
                    service_id: serviceId,
                    staff_id: isStaff ? (user?.id ?? "") : existing?.staff_id ?? (staffId || ""),
                    starts_at: existing?.starts_at ?? fallbackStartsAt,
                };
            });
        });
    }, [draft, serviceIds, serviceById, isStaff, staffId, user?.id]);

    useEffect(() => {
        if (bookingMode === "single" && serviceIds.length > 1) {
            setServiceIds((prev) => prev.slice(0, 1));
        }
    }, [bookingMode, serviceIds.length]);

    const filteredBlocks = useMemo(() => {
        return blocks.filter((bl) => {
            if (!staffFilter.length) return true;
            if (!bl.staff_id) return true;
            return staffFilter.includes(bl.staff_id);
        });
    }, [blocks, staffFilter]);

    const events = useMemo(() => {
        const bookingEvents = visibleBookings
            .map((b) => {
                const primary = serviceById.get(b.service_id);
                const servicesForTitle = (
                    b.items?.length
                        ? b.items
                            .slice()
                            .sort((a, z) => (a.position ?? 0) - (z.position ?? 0))
                            .map((it) => it.service?.name ?? serviceById.get(it.service_id)?.name)
                            .filter(Boolean)
                        : [primary?.name]
                ).filter(Boolean) as string[];
                const st = b.staff_id ? staffById.get(b.staff_id) : null;

                const startDate = parseLocalDateTime(b.starts_at);
                const endDate = parseLocalDateTime(b.ends_at);
                if (!startDate || !endDate) return null;

                return {
                    id: `b:${b.id}`,
                    title: `${servicesForTitle.join(" + ") || "Ծառայություն"} · ${b.client_name ?? "—"}`,
                    start: startDate,
                    end: endDate,
                    extendedProps: {
                        type: "booking" as const,
                        booking: b,
                        staffName: st?.name ?? "",
                        serviceName: servicesForTitle.join(" + "),
                    },
                };
            })
            .filter(Boolean) as any[];

        const blockEvents = filteredBlocks
            .map((bl) => {
                const startDate = parseLocalDateTime(bl.starts_at);
                const endDate = parseLocalDateTime(bl.ends_at);
                if (!startDate || !endDate) return null;

                return {
                    id: `x:${bl.id}`,
                    title: bl.reason ?? "Փակ է",
                    start: startDate,
                    end: endDate,
                    display: "background",
                    overlap: false,
                    backgroundColor: "rgba(244,63,94,0.12)",
                    borderColor: "rgba(244,63,94,0.18)",
                    extendedProps: { type: "block" as const, block: bl },
                };
            })
            .filter(Boolean) as any[];

        return [...blockEvents, ...bookingEvents];
    }, [visibleBookings, filteredBlocks, serviceById, staffById]);

    function resetCreateState() {
        setCreateOpen(false);
        setBookingMode("single");
        setDraft(null);
        setSelectedClientId(null);
        setClientLookup("");
        setClientName("");
        setClientPhone("");
        setServiceIds([]);
        setServicePick("");
        setLineDrafts([]);
        if (!isStaff) setStaffId("");
        setNotes("");
        setRedeemPoints('');
        setGiftCardCode('');
        setGiftCardAmount('');
    }

    const createMut = useMutation({
        mutationFn: createBooking,
        onSuccess: async () => {
            resetCreateState();
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
    });

    const createLinesMut = useMutation({
        mutationFn: createBookingLines,
        onSuccess: async () => {
            resetCreateState();
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
    });

    const updateBookingMut = useMutation({
        mutationFn: (p: { id: number; client_name: string; client_phone: string; notes: string | null; status: BookingStatus; staff_id: number | null; starts_at: string }) => updateBooking(p.id, {
            client_name: p.client_name,
            client_phone: p.client_phone,
            notes: p.notes,
            status: p.status,
            staff_id: p.staff_id,
            starts_at: p.starts_at,
        }),
        onSuccess: async (updated) => {
            setSelectedBooking((prev) => prev && prev.id === updated.id ? updated : prev);
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
    });

    const moveMut = useMutation({
        mutationFn: (p: { id: number; starts_at: string; ends_at: string }) => updateBookingTime(p.id, p),
        onSuccess: async (updated) => {
            setSelectedBooking((prev) => prev && prev.id === updated.id ? updated : prev);
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
    });

    const cancelMut = useMutation({
        mutationFn: cancelBooking,
        onSuccess: async (cancelledBooking) => {
            setConfirmState(null);
            setSelectedBooking((current) => current?.id === cancelledBooking.id ? null : current);
            showCalendarToast(`#${cancelledBooking.booking_code || cancelledBooking.id} ամրագրումը չեղարկվեց`);
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
        onError: (error) => {
            showCalendarToast(error instanceof Error ? error.message : "Չհաջողվեց չեղարկել ամրագրումը", "error");
        },
    });

    const confirmMut = useMutation({
        mutationFn: confirmBooking,
        onSuccess: async (updatedBooking) => {
            setSelectedBooking(null);
            showCalendarToast(`#${updatedBooking.booking_code || updatedBooking.id} ամրագրումը հաստատվեց`);
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
        onError: () => showCalendarToast("Չհաջողվեց հաստատել ամրագրումը", "error"),
    });

    const doneMut = useMutation({
        mutationFn: doneBooking,
        onSuccess: async (updatedBooking) => {
            setSelectedBooking(null);
            showCalendarToast(`#${updatedBooking.booking_code || updatedBooking.id} ամրագրումը նշվեց ավարտված`);
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
        onError: () => showCalendarToast("Չհաջողվեց ավարտել ամրագրումը", "error"),
    });

    const noShowMut = useMutation({
        mutationFn: noShowBooking,
        onSuccess: async (updatedBooking) => {
            setSelectedBooking(null);
            showCalendarToast(`#${updatedBooking.booking_code || updatedBooking.id} ամրագրումը նշվեց չներկայացած`);
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
        onError: () => showCalendarToast("Չհաջողվեց փոխել ամրագրման կարգավիճակը", "error"),
    });

    const createBlockMut = useMutation({
        mutationFn: createBlock,
        onSuccess: async () => {
            setBlockOpen(false);
            await qc.invalidateQueries({ queryKey: ["blocks", businessId] });
        },
    });

    const deleteBlockMut = useMutation({
        mutationFn: deleteBlock,
        onSuccess: async () => {
            setConfirmState(null);
            await qc.invalidateQueries({ queryKey: ["blocks", businessId] });
        },
    });

    const isLoading = settingsQ.isLoading || servicesQ.isLoading || staffQ.isLoading || bookingsQ.isLoading || (canManageBlocks && blocksQ.isLoading);

    const slotMinutes = Math.max(5, Number(settings?.slot_step_minutes ?? 30));
    const workStart = String(settings?.work_start ?? "09:00").slice(0,5);
    const workEnd = String(settings?.work_end ?? "18:00").slice(0,5);
    const slotMinTime = `${workStart}:00`;
    const slotMaxTime = `${workEnd}:00`;
    const hasBusinessContextBlock = !businessId;

    function openCreateWithRange(sel: { start: Date; end: Date }) {
        if (isStaff && !user?.id) return;

        const endSafe = sel.end && sel.end > sel.start ? sel.end : new Date(sel.start.getTime() + 30 * 60_000);
        setBookingMode("single");
        setDraft({ startsAt: sel.start, endsAt: endSafe });
        setCreateOpen(true);
        setSelectedClientId(null);
        setClientLookup("");
        setClientName("");
        setClientPhone("");
        setNotes("");
        setRedeemPoints('');
        setGiftCardCode('');
        setGiftCardAmount('');
        setServicePick("");
        setLineDrafts([]);
        setServiceIds([]);

        if (services.length === 1) setServiceIds([services[0].id]);
        if (serviceFilter.length === 1) setServiceIds([serviceFilter[0]]);
        if (staff.length === 1 && !isStaff) setStaffId(staff[0].id);
        if (!isStaff && staffFilter.length === 1) setStaffId(staffFilter[0]);
        if (isStaff && user?.id) setStaffId(user.id);
    }

    function openCreateFromSlot(date: string, time: string) {
        const startDate = parseLocalDateTime(`${date} ${time}:00`);
        if (!startDate) return;
        const endDate = new Date(startDate.getTime() + 30 * 60_000);
        openCreateWithRange({ start: startDate, end: endDate });
    }

    function onSelect(arg: DateSelectArg) {
        if (!businessId) return;
        openCreateWithRange({ start: arg.start, end: arg.end });
    }

    function onEventClick(arg: EventClickArg) {
        const type = (arg.event.extendedProps as any)?.type as "booking" | "block" | undefined;
        if (type === "block") {
            const bl = (arg.event.extendedProps as any)?.block as Block | undefined;
            if (!bl || !canManageBlocks) return;
            setConfirmState({ type: "block", block: bl });
            return;
        }

        const b = (arg.event.extendedProps as any)?.booking as Booking | undefined;
        if (!b) return;
        setSelectedBooking(b);
    }

    function showCalendarToast(textValue: string, type: "success" | "error" = "success") {
        setToast({ open: true, text: textValue, type });
        window.setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 2200);
    }

    function onEventDrop(arg: EventDropArg) {
        const type = (arg.event.extendedProps as any)?.type as string | undefined;
        if (type === "block") {
            arg.revert();
            return;
        }
        const rawId = String(arg.event.id);
        const id = Number(rawId.replace(/^b:/, ""));
        const startDt = arg.event.start;
        const endDt = arg.event.end;
        if (!startDt || !endDt) return;

        moveMut.mutate(
            {
                id,
                starts_at: `${ymd(startDt)} ${hm(startDt)}:00`,
                ends_at: `${ymd(endDt)} ${hm(endDt)}:00`,
            },
            {
                onSuccess: () => showCalendarToast("Ամրագրումը տեղափոխվեց"),
                onError: () => {
                    arg.revert();
                    showCalendarToast("Չհաջողվեց տեղափոխել ամրագրումը", "error");
                },
            }
        );
    }

    function onEventResize(arg: EventResizeDoneArg) {
        const type = (arg.event.extendedProps as any)?.type as string | undefined;
        if (type === "block") {
            arg.revert();
            return;
        }

        const rawId = String(arg.event.id);
        const id = Number(rawId.replace(/^b:/, ""));
        const startDt = arg.event.start;
        const endDt = arg.event.end;
        if (!startDt || !endDt) {
            arg.revert();
            return;
        }

        moveMut.mutate(
            {
                id,
                starts_at: `${ymd(startDt)} ${hm(startDt)}:00`,
                ends_at: `${ymd(endDt)} ${hm(endDt)}:00`,
            },
            {
                onSuccess: () => showCalendarToast("Տևողությունը թարմացվեց"),
                onError: () => {
                    arg.revert();
                    showCalendarToast("Չհաջողվեց փոխել տևողությունը", "error");
                },
            }
        );
    }

    function navRange(delta: number) {
        const next = addDays(viewDate, viewMode === "day" ? delta : delta * 7);
        setViewDate(next);
        setDatePick(ymd(next));
    }

    function navMonth(deltaMonths: number) {
        const next = addMonths(viewDate, deltaMonths);
        setViewDate(next);
        setDatePick(ymd(next));
    }

    function jumpToPickedDate(v: string) {
        setDatePick(v);
        const [y, m, d] = v.split("-").map(Number);
        const dt = new Date();
        dt.setFullYear(y, (m ?? 1) - 1, d ?? 1);
        dt.setHours(0, 0, 0, 0);
        setViewDate(dt);
    }

    function resetFilters() {
        setServiceFilter([]);
        if (isStaff && user?.id) setStaffFilter([user.id]);
        else setStaffFilter([]);
    }

    function submitBlock() {
        const { scope, staffId: sid, date, mode, startTime, durationMin, reason } = blockDraft;
        const staff_id = scope === "business" ? null : sid ? Number(sid) : null;
        if (!date) return;

        let starts_at = "";
        let ends_at = "";

        if (mode === "allday") {
            starts_at = `${date} 00:00`;
            ends_at = `${date} 23:59`;
        } else {
            const startDt = parseLocalDateTime(`${date} ${startTime}:00`);
            if (!startDt) return;
            const endDt = new Date(startDt.getTime() + Math.max(1, durationMin || 1) * 60_000);
            starts_at = `${ymd(startDt)} ${hm(startDt)}`;
            ends_at = `${ymd(endDt)} ${hm(endDt)}`;
        }

        createBlockMut.mutate({ staff_id, reason: reason?.trim() || "Փակ է", starts_at, ends_at });
    }

    function updateLineDraft(key: string, patch: Partial<LineDraft>) {
        setLineDrafts((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
    }

    function selectClientFromBase(client: ClientRow) {
        setSelectedClientId(client.id);
        setClientLookup(client.name ?? "");
        setClientName(client.name ?? "");
        setClientPhone(client.phone ?? "");
        if (!notes.trim() && client.notes) setNotes(client.notes);
    }

    function handleSmartSlotSelect(slot: Slot) {
        const nextStart = parseLocalDateTime(slot.starts_at);
        const nextEnd = parseLocalDateTime(slot.ends_at);
        if (!nextStart || !nextEnd) return;

        setDraft({ startsAt: nextStart, endsAt: nextEnd });
        if (!isStaff && slot.staff_id) {
            setStaffId(slot.staff_id);
        }
    }

    function updateDraftDate(nextDate: string) {
        if (!draft) return;
        const parsed = parseLocalDateTime(`${nextDate} ${hm(draft.startsAt)}:00`);
        if (!parsed) return;
        setDraft({ startsAt: parsed, endsAt: addMinutes(parsed, selectedServicesMeta.totalDuration || 30) });
    }

    function updateDraftTime(slotKeyValue: string) {
        const matched = smartSlots.find((slot) => adminSlotKey(slot) === slotKeyValue);
        if (matched) {
            handleSmartSlotSelect(matched);
            return;
        }
        if (!draft) return;
        const rawTime = slotKeyValue.includes('|') ? slotKeyValue.split('|')[0] : slotKeyValue;
        const timeValue = rawTime.includes(' ') ? rawTime.slice(11, 16) : rawTime;
        const parsed = parseLocalDateTime(`${ymd(draft.startsAt)} ${timeValue}:00`);
        if (!parsed) return;
        setDraft({ startsAt: parsed, endsAt: addMinutes(parsed, selectedServicesMeta.totalDuration || 30) });
    }

    useEffect(() => {
        if (!createOpen || bookingMode === "lines" || !smartSlots.length || hasMatchingSmartSlot) return;
        const preferred = recommendedSmartSlots[0] ?? smartSlots[0];
        if (preferred) handleSmartSlotSelect(preferred);
    }, [createOpen, bookingMode, smartSlots, recommendedSmartSlots, hasMatchingSmartSlot]);

    function submitCreateBooking() {
        if (!draft) return;
        if (!clientName.trim() || !clientPhone.trim()) return;

        if (bookingMode === "single") {
            const resolvedStaffId = Number(staffId || selectedSmartSlot?.staff_id || 0);
            if (!serviceIds.length || !resolvedStaffId) return;
            createMut.mutate({
                service_ids: [serviceIds[0]],
                staff_id: resolvedStaffId,
                starts_at: `${ymd(draft.startsAt)} ${hm(draft.startsAt)}`,
                client_name: clientName.trim(),
                client_phone: clientPhone.trim(),
                client_id: selectedClientId ?? undefined,
                notes: notes.trim() || null,
                source: bookingSource,
                redeem_points: redeemPoints ? Number(redeemPoints) : undefined,
                gift_card_code: giftCardCode.trim() || undefined,
                gift_card_amount: giftCardAmount ? Number(giftCardAmount) : undefined,
            });
            return;
        }

        if (bookingMode === "multi") {
            const resolvedStaffId = Number(staffId || selectedSmartSlot?.staff_id || 0);
            if (serviceIds.length < 2 || !resolvedStaffId) return;
            createMut.mutate({
                service_ids: serviceIds,
                staff_id: resolvedStaffId,
                starts_at: `${ymd(draft.startsAt)} ${hm(draft.startsAt)}`,
                client_name: clientName.trim(),
                client_phone: clientPhone.trim(),
                client_id: selectedClientId ?? undefined,
                notes: notes.trim() || null,
                source: bookingSource,
                redeem_points: redeemPoints ? Number(redeemPoints) : undefined,
                gift_card_code: giftCardCode.trim() || undefined,
                gift_card_amount: giftCardAmount ? Number(giftCardAmount) : undefined,
            });
            return;
        }

        const preparedLines = lineDrafts
            .filter((line) => !!line.service_id)
            .map((line) => ({
                service_id: Number(line.service_id),
                staff_id: Number(isStaff ? user?.id : line.staff_id || 0),
                starts_at: line.starts_at,
            }));

        if (!preparedLines.length || preparedLines.length !== serviceIds.length) return;
        if (preparedLines.some((line) => !line.staff_id || !line.starts_at)) return;

        createLinesMut.mutate({
            lines: preparedLines,
            client_name: clientName.trim(),
            client_phone: clientPhone.trim(),
            client_id: selectedClientId ?? undefined,
            notes: notes.trim() || null,
            source: bookingSource,
        });
    }

    const selectedServicesMeta = useMemo(() => {
        const selected = serviceIds.map((id) => serviceById.get(id)).filter(Boolean) as Service[];
        const totalDuration = selected.reduce((sum, item) => sum + Number(item.duration_minutes ?? 0), 0);
        const totalPrice = selected.reduce((sum, item) => sum + Number(item.price ?? 0), 0);
        return { selected, totalDuration, totalPrice };
    }, [serviceIds, serviceById]);

    const createDisabled = useMemo(() => {
        if (!draft || !clientName.trim() || !clientPhone.trim()) return true;
        if (bookingMode === "single") return serviceIds.length !== 1 || !(staffId || selectedSmartSlot?.staff_id) || !hasMatchingSmartSlot;
        if (bookingMode === "multi") return serviceIds.length < 2 || !(staffId || selectedSmartSlot?.staff_id) || !hasMatchingSmartSlot;
        if (!serviceIds.length || !lineDrafts.length || lineDrafts.length !== serviceIds.length) return true;
        return lineDrafts.some((line) => !line.starts_at || !(isStaff ? user?.id : line.staff_id));
    }, [draft, clientName, clientPhone, bookingMode, serviceIds, staffId, lineDrafts, isStaff, user?.id, hasMatchingSmartSlot]);

    const bookingActionOptions = useMemo(() => {
        if (!selectedBooking) return [];
        const options = [] as Array<{ key: string; title: string; description?: string; danger?: boolean }>;

        if (selectedBooking.status === "pending") {
            options.push({ key: "confirm", title: "Հաստատել ամրագրումը", description: "Նշել որպես հաստատված" });
            options.push({ key: "cancel", title: "Չեղարկել ամրագրումը", description: "Նշել որպես չեղարկված", danger: true });
        }
        if (selectedBooking.status === "confirmed") {
            options.push({ key: "done", title: "Նշել որպես կատարված", description: "Փակել որպես ավարտված" });
            options.push({ key: "no_show", title: "Նշել որպես չներկայացած", description: "Հաճախորդը չի եկել այցին", danger: true });
            options.push({ key: "cancel", title: "Չեղարկել ամրագրումը", description: "Նշել որպես չեղարկված", danger: true });
        }
        if (selectedBooking.status === "done" || selectedBooking.status === "cancelled" || selectedBooking.status === "no_show") {
            options.push({ key: "close", title: "Փակել", description: "Միայն դիտել տվյալները" });
        }
        return options;
    }, [selectedBooking]);
    const searchPlaceholder = canManageAllBookings ? "Փնտրել հաճախորդ կամ աշխատակից" : "Փնտրել իմ հաճախորդներին";
    const cancellationDescription = confirmState?.type === "booking-cancel"
        ? [
            `#${confirmState.booking.booking_code || confirmState.booking.id}`,
            confirmState.booking.client_name,
            formatDateTimeLabel(confirmState.booking.starts_at),
            bookingServiceTitle(confirmState.booking, serviceById),
            confirmState.booking.staff_id ? staffById.get(confirmState.booking.staff_id)?.name : "Առանց մասնագետի",
        ].filter(Boolean).join(" · ")
        : undefined;

    const monthDays = useMemo(() => monthMatrix(viewDate), [viewDate]);
    const monthLabel = useMemo(() => {
        try {
            return viewDate.toLocaleDateString("hy-AM", { month: "long", year: "numeric" });
        } catch {
            return `${viewDate.getMonth() + 1}/${viewDate.getFullYear()}`;
        }
    }, [viewDate]);

    const stats = useMemo(() => {
        const todayKey = ymd(new Date());
        const dayBookings = visibleBookings.filter((booking) => booking.starts_at.slice(0, 10) === todayKey);
        return {
            total: visibleBookings.length,
            pending: visibleBookings.filter((b) => b.status === "pending").length,
            confirmed: visibleBookings.filter((b) => b.status === "confirmed").length,
            todayRevenue: dayBookings.reduce((sum, booking) => {
                const itemsSum = booking.items?.reduce((inner, item) => inner + Number(item.price ?? item.service?.price ?? 0), 0) ?? 0;
                const fallback = Number(serviceById.get(booking.service_id)?.price ?? 0);
                return sum + (itemsSum || fallback);
            }, 0),
        };
    }, [visibleBookings, serviceById]);

    const selectedDateBookings = useMemo(() => {
        return visibleBookings
            .filter((booking) => booking.starts_at.slice(0, 10) === datePick)
            .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }, [visibleBookings, datePick]);

    const selectedDateBlocks = useMemo(() => {
        return filteredBlocks
            .filter((block) => block.starts_at.slice(0, 10) === datePick)
            .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }, [filteredBlocks, datePick]);

    const visibleStaff = useMemo(() => {
        return (canManageAllBookings ? staff : staff.filter((member) => member.id === user?.id)).filter((member) => member.is_active !== false);
    }, [canManageAllBookings, staff, user?.id]);

    const activeFilterCount = staffFilter.length + serviceFilter.length;

    const selectedDateRevenue = useMemo(() => {
        return selectedDateBookings.reduce((sum, booking) => {
            const itemsSum = booking.items?.reduce((inner, item) => inner + Number(item.price ?? item.service?.price ?? 0), 0) ?? 0;
            const fallback = Number(serviceById.get(booking.service_id)?.price ?? 0);
            return sum + (itemsSum || fallback);
        }, 0);
    }, [selectedDateBookings, serviceById]);

    const weekOverview = useMemo(() => {
        const days = rangeForWeek(viewDate);
        return Array.from({ length: 7 }).map((_, index) => {
            const day = addDays(days.start, index);
            const key = ymd(day);
            const bookings = visibleBookings.filter((booking) => booking.starts_at.slice(0, 10) === key);
            const revenue = bookings.reduce((sum, booking) => {
                const itemsSum = booking.items?.reduce((inner, item) => inner + Number(item.price ?? item.service?.price ?? 0), 0) ?? 0;
                const fallback = Number(serviceById.get(booking.service_id)?.price ?? 0);
                return sum + (itemsSum || fallback);
            }, 0);
            return { day, key, bookings: bookings.length, revenue };
        });
    }, [serviceById, viewDate, visibleBookings]);

    const rangeLabel = useMemo(() => {
        if (viewMode === "day") return from;
        return `${from} → ${to}`;
    }, [from, to, viewMode]);

    return (
        <motion.div {...page} className="admin-page space-y-3">
            <div className="overflow-hidden rounded-[24px] border border-[#e7dfd6] bg-white shadow-[0_14px_38px_rgba(15,23,42,0.06)] sm:rounded-[30px]">
                <div className="space-y-3 bg-[#fcfbf8] p-3 sm:space-y-4 sm:p-5 lg:p-6">
                    <div className="flex items-center justify-between gap-2">
                        {/* Title - compact on mobile */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#24364b] text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div>
                                <div className="hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 sm:block">Vizit</div>
                                <h1 className="text-lg font-semibold tracking-tight text-slate-950 sm:mt-1 sm:text-2xl">Օրացույց</h1>
                            </div>
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Day/Week toggle */}
                            <div className="inline-flex items-center rounded-xl border border-[#e7dfd6] bg-white p-0.5 shadow-sm sm:rounded-2xl sm:p-1">
                                {[
                                    { key: "day", label: "Օր" },
                                    { key: "week", label: "Շաբաթ" },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setViewMode(item.key as ViewMode)}
                                        className={cn(
                                            "rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm",
                                            viewMode === item.key ? "bg-[#24364b] text-white" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>


                            {/* Filter - icon only on mobile */}
                            <button
                                type="button"
                                onClick={() => setFiltersOpen(true)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7dfd6] bg-white shadow-sm transition hover:bg-slate-50 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                                title="Ֆիլտրեր"
                            >
                                <Filter className="h-4 w-4 text-slate-600 shrink-0" />
                                <span className="hidden sm:ml-1.5 sm:inline text-sm font-medium text-slate-700">
        Ֆիլտրեր
    </span>
                            </button>

                            {/* Nav prev/next */}
                            <div className="flex items-center gap-0.5 rounded-xl border border-[#e7dfd6] bg-white p-0.5 shadow-sm sm:gap-1 sm:rounded-2xl sm:p-1">
                                <button type="button" onClick={() => navRange(-1)} className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-slate-100 sm:h-9 sm:w-9 sm:rounded-xl">
                                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                                </button>
                                <button type="button" onClick={() => navRange(1)} className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-slate-100 sm:h-9 sm:w-9 sm:rounded-xl">
                                    <ChevronRight className="h-4 w-4 text-slate-600" />
                                </button>
                            </div>

                            {/* Block - hidden on mobile unless manager */}
                            {canManageBlocks && (
                                <button type="button" onClick={() => setBlockOpen(true)}
                                    className="hidden h-9 items-center gap-2 rounded-xl border border-[#e7dfd6] bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
                                >
                                    <Ban className="h-4 w-4" /> Block
                                </button>
                            )}

                            {/* New booking CTA */}
                            <button
                                type="button"
                                onClick={() => openCreateWithRange({ start: new Date(), end: new Date(new Date().getTime() + 30 * 60_000) })}
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#24364b] px-2.5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(36,54,75,0.18)] transition hover:bg-[#1d2b3c] sm:gap-2 sm:px-4"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Նոր ամրագրում</span>
                                <span className="sm:hidden">Ավ.</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-2xl border border-[#e7dfd6] bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                                <span className="font-semibold text-slate-900">{viewMode === "day" ? "Օր" : "Շաբաթ"}</span> · {rangeLabel}
                            </div>
                            {isStaff ? (
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd2f6] bg-[#f0ebfa] px-3 py-2 text-xs font-semibold text-[#6346a8]">
                                    <User className="h-3.5 w-3.5" /> միայն քո ամրագրումները
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#e7dfd6] bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                                    <Crown className="h-3.5 w-3.5 text-violet-600" /> բոլոր աշխատակիցները
                                </div>
                            )}
                            {visibleStaff.slice(0, 3).map((member) => (
                                <div key={member.id} className="inline-flex items-center gap-2 rounded-full border border-[#e7dfd6] bg-white px-2.5 py-1.5 text-xs text-slate-600 shadow-sm">
                                    <div className="grid h-6 w-6 place-items-center overflow-hidden rounded-full border border-[#e7dfd6] bg-[#f7f3ee] text-[10px] font-semibold text-slate-700">
                                        {member.avatar_url ? <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" /> : initials(member.name)}
                                    </div>
                                    <span className="max-w-[92px] truncate">{member.name}</span>
                                </div>
                            ))}
                            {visibleStaff.length > 3 ? (
                                <div className="inline-flex items-center rounded-full border border-[#e7dfd6] bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                                    +{visibleStaff.length - 3}
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-slate-600">Jump to</label>
                            <input
                                type="date"
                                value={datePick}
                                onChange={(e) => jumpToPickedDate(e.target.value)}
                                className="rounded-2xl border border-[#e7dfd6] bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                            />
                        </div>
                    </div>

                </div>
            </div>

            {hasBusinessContextBlock && (
                <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    Մուտք չկա business context-ին։ Խնդրում եմ նորից login արա կամ ավարտիր onboarding-ը։
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-4">
                    <div className="h-24 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
                    <div className="h-[520px] animate-pulse rounded-[28px] border border-slate-200 bg-white" />
                </div>
            ) : isMobile ? (
                <SonlineMobileSchedule
                    weekDays={weekDays}
                    datePick={datePick}
                    bookings={visibleBookings}
                    blocks={filteredBlocks}
                    serviceById={serviceById}
                    staffById={staffById}
                    selectedDateRevenue={selectedDateRevenue}
                    viewMode={viewMode}
                    activeFilterCount={activeFilterCount}
                    onPickDate={setDatePick}
                    onOpenCreate={openCreateFromSlot}
                    onBookingClick={(booking) => setSelectedBooking(booking)}
                    onBlockClick={(block) => canManageBlocks && setConfirmState({ type: "block", block })}
                    onOpenFilters={() => setFiltersOpen(true)}
                    onJumpToToday={() => jumpToPickedDate(ymd(new Date()))}
                />
            ) : (
                <div className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)]">
                    <Card className="overflow-hidden rounded-[28px] border border-[#e9e2d8] bg-white p-0 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                        <div className="space-y-3 p-3">
                            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <button type="button" onClick={() => navMonth(-1)} className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-700">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <div className="text-sm font-semibold capitalize text-slate-900">{monthLabel}</div>
                                    <button type="button" onClick={() => navMonth(1)} className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-700">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    {["Ե", "ԵՔ", "Չ", "Հ", "Ո", "Շ", "Կ"].map((label) => (
                                        <div key={label} className="py-1">{label}</div>
                                    ))}
                                </div>

                                <div className="mt-2 space-y-1">
                                    {monthDays.map((week, idx) => (
                                        <div key={idx} className="grid grid-cols-7 gap-1">
                                            {week.map((day) => {
                                                const dayKey = ymd(day);
                                                const isActive = dayKey === datePick;
                                                const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                                                const hasItems = visibleBookings.some((booking) => booking.starts_at.slice(0, 10) === dayKey);
                                                return (
                                                    <button
                                                        key={dayKey}
                                                        type="button"
                                                        onClick={() => jumpToPickedDate(dayKey)}
                                                        className={cn(
                                                            "relative flex h-9 items-center justify-center rounded-xl text-xs font-medium transition",
                                                            isActive
                                                                ? "bg-[#24364b] text-white shadow-sm"
                                                                : isCurrentMonth
                                                                    ? "bg-white text-slate-700 hover:bg-violet-50"
                                                                    : "bg-transparent text-slate-300 hover:bg-slate-100"
                                                        )}
                                                    >
                                                        {day.getDate()}
                                                        {hasItems ? <span className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", isActive ? "bg-white" : "bg-violet-400")} /> : null}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        <CalendarRange className="h-4 w-4 text-violet-500" /> Օրվա ամփոփում
                                    </div>
                                    <div className="mt-3 text-2xl font-semibold text-slate-950">{selectedDateBookings.length}</div>
                                    <div className="mt-1 text-sm text-slate-500">ամրագրում ընտրված օրվա համար</div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                            <span>Սպասում են</span>
                                            <span className="font-semibold text-amber-600">{selectedDateBookings.filter((b) => b.status === "pending").length}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                            <span>Block-եր</span>
                                            <span className="font-semibold text-rose-600">{selectedDateBlocks.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        <Users2 className="h-4 w-4 text-violet-500" /> Ֆիլտրեր
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {staffFilter.slice(0, 3).map((id) => (
                                            <span key={id} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                                                {staffById.get(id)?.name ?? `#${id}`}
                                            </span>
                                        ))}
                                        {serviceFilter.slice(0, 2).map((id) => (
                                            <span key={id} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                                                {serviceById.get(id)?.name ?? `#${id}`}
                                            </span>
                                        ))}
                                        {!activeFilterCount ? <span className="text-sm text-slate-500">Ֆիլտրեր չկան</span> : null}
                                    </div>
                                    <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setFiltersOpen(true)}>
                                        <Filter className="h-4 w-4" /> Կառավարել ֆիլտրերը
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="overflow-hidden rounded-[28px] border border-[#e9e2d8] bg-white p-0 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                        <div className="border-b border-[#eee6dc] bg-[#fcfbf8] px-4 py-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Ամրագրումների օրացույց</div>
                                    <div className="mt-1 text-lg font-semibold text-slate-950">{viewMode === "day" ? datePick : "Շաբաթվա տեսք"}</div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="calendar-search-field min-w-[220px] max-w-[320px] flex-1 lg:flex-none">
                                        <Search className="h-4 w-4 text-slate-400" />
                                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={searchPlaceholder} className="w-full border-0 bg-transparent p-0 text-sm text-slate-600 outline-none placeholder:text-slate-400" />
                                    </label>
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e7dfd6] bg-white px-3 py-2 text-xs font-medium text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={showCancelled}
                                            onChange={(event) => setShowCancelled(event.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-violet-600"
                                        />
                                        Ցույց տալ չեղարկվածները
                                    </label>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#e7dfd6] bg-white px-3 py-2 text-xs font-medium text-slate-500">
                                        <Users2 className="h-3.5 w-3.5" /> {visibleBookings.length} ամրագրում
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-4">
                                <div className="rounded-[18px] border border-[#eee6dc] bg-white px-4 py-3">
                                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Բոլորը</div>
                                    <div className="mt-1 text-xl font-semibold text-slate-950">{stats.total}</div>
                                </div>
                                <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                                    <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Հաստատված</div>
                                    <div className="mt-1 text-xl font-semibold text-emerald-700">{stats.confirmed}</div>
                                </div>
                                <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3">
                                    <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Սպասող</div>
                                    <div className="mt-1 text-xl font-semibold text-amber-700">{stats.pending}</div>
                                </div>
                                <div className="rounded-[18px] border border-sky-200 bg-sky-50 px-4 py-3">
                                    <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">Այսօրվա շրջանառություն</div>
                                    <div className="mt-1 text-xl font-semibold text-sky-700">{formatMoney(stats.todayRevenue)} դր</div>
                                </div>
                            </div>

                            {viewMode === "week" ? (
                                <div className="mt-4 grid gap-2 xl:grid-cols-7">
                                    {weekOverview.map((item) => {
                                        const active = item.key === datePick;
                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => setDatePick(item.key)}
                                                className={cn(
                                                    "rounded-[18px] border px-3 py-3 text-left transition",
                                                    active ? "border-violet-300 bg-violet-50 shadow-sm" : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                                                )}
                                            >
                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{weekdayShort(item.day)}</div>
                                                <div className="mt-1 text-lg font-semibold text-slate-950">{item.day.getDate()}</div>
                                                <div className="mt-2 text-xs text-slate-500">{item.bookings} ամրագրում</div>
                                                <div className="mt-1 text-xs font-medium text-slate-700">{formatMoney(item.revenue)} դր</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>

                        <div className="p-3 sm:p-2">
                            {viewMode === "day" ? (
                                <SonlineDesktopDayColumns
                                    date={datePick}
                                    bookings={visibleBookings}
                                    blocks={filteredBlocks}
                                    staff={visibleStaff}
                                    serviceById={serviceById}
                                    onBookingClick={(booking) => setSelectedBooking(booking)}
                                    onSelectSlot={openCreateFromSlot}
                                    onBlockClick={(block) => canManageBlocks && setConfirmState({ type: "block", block })}
                                    workStart={workStart}
                                    workEnd={workEnd}
                                    slotMinutes={slotMinutes}
                                />
                            ) : (
                                <div className="calendar-shell calendar-shell-desktop">
                                    <FullCalendar
                                        plugins={[timeGridPlugin, interactionPlugin]}
                                        key={`${viewMode}-${from}`}
                                        initialView="timeGridWeek"
                                        initialDate={viewDate}
                                        headerToolbar={false}
                                        firstDay={1}
                                        locale="hy-am"
                                        selectable
                                        editable
                                        selectMirror
                                        allDaySlot={false}
                                        slotMinTime={slotMinTime}
                                        slotMaxTime={slotMaxTime}
                                        slotDuration={`00:${String(slotMinutes).padStart(2, "0")}:00`}
                                        slotEventOverlap={false}
                                        eventMaxStack={3}
                                        nowIndicator
                                        dayHeaderFormat={{ weekday: "short", day: "2-digit", month: "2-digit" }}
                                        events={events}
                                        select={onSelect}
                                        eventClick={onEventClick}
                                        eventDrop={onEventDrop}
                                        eventResize={onEventResize}
                                        eventContent={(arg) => {
                                            const ext = arg.event.extendedProps as any;
                                            const booking = ext?.booking as Booking | undefined;
                                            if (!booking) {
                                                return <div className="px-2 py-1 text-[11px] font-medium text-rose-700">{arg.event.title}</div>;
                                            }
                                            const ui = eventColor(booking.status);
                                            const statusLabel = bookingStatusLabel(booking.status);
                                            return (
                                                <div data-booking-id={booking.id} className={cn("calendar-event-card rounded-[16px] border px-3 py-2 shadow-sm", ui.outer)}>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="truncate text-[10px] font-semibold leading-4 text-slate-900">{booking.client_name}</div>
                                                            <div className="mt-0.5 truncate text-[10px] leading-4 text-slate-600">{ext?.serviceName || arg.event.title}</div>
                                                        </div>
                                                        <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide", ui.badge)}>
                                                            {statusLabel}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-slate-500">
                                                        <span className="truncate">{arg.timeText}</span>
                                                        {ext?.staffName ? <span className="truncate">{ext.staffName}</span> : null}
                                                    </div>
                                                    {booking.client_phone ? <div className="mt-1 truncate text-[9px] text-slate-500">{booking.client_phone}</div> : null}
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Ֆիլտրեր">
                <div className="space-y-4">
                    {canManageAllBookings ? (
                        <div>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Աշխատակիցներ</div>
                            <div className="flex flex-wrap gap-2">
                                {staff.map((s) => {
                                    const active = staffFilter.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setStaffFilter((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]))}
                                            className={cn(
                                                "rounded-full border px-3 py-2 text-sm transition",
                                                active ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-700"
                                            )}
                                        >
                                            {s.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
                            Staff mode-ում ֆիլտրը սահմանված է քո վրա և չի փոխվում։
                        </div>
                    )}

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ծառայություններ</div>
                        <div className="flex flex-wrap gap-2">
                            {services.map((s) => {
                                const active = serviceFilter.includes(s.id);
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setServiceFilter((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]))}
                                        className={cn(
                                            "rounded-full border px-3 py-2 text-sm transition",
                                            active ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-700"
                                        )}
                                    >
                                        {s.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Button onClick={resetFilters}>Մաքրել</Button>
                        <Button variant="secondary" onClick={() => setFiltersOpen(false)}>Փակել</Button>
                    </div>
                </div>
            </Modal>

            <Modal open={blockOpen} onClose={() => setBlockOpen(false)} title="Ավելացնել block / փակ ժամ">
                <div className="space-y-4">
                    <CreateField label="Scope">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setBlockDraft((p) => ({ ...p, scope: "business" }))}
                                className={cn("rounded-2xl border px-4 py-3 text-sm transition", blockDraft.scope === "business" ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white")}
                            >
                                Ամբողջ business
                            </button>
                            <button
                                type="button"
                                onClick={() => setBlockDraft((p) => ({ ...p, scope: "staff" }))}
                                className={cn("rounded-2xl border px-4 py-3 text-sm transition", blockDraft.scope === "staff" ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white")}
                            >
                                Միայն staff
                            </button>
                        </div>
                    </CreateField>

                    {blockDraft.scope === "staff" && (
                        <CreateField label="Աշխատակից">
                            <select
                                value={blockDraft.staffId}
                                onChange={(e) => setBlockDraft((p) => ({ ...p, staffId: e.target.value ? Number(e.target.value) : "" }))}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            >
                                <option value="">Ընտրիր...</option>
                                {staff.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </CreateField>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <CreateField label="Ամսաթիվ">
                            <input type="date" value={blockDraft.date} onChange={(e) => setBlockDraft((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
                        </CreateField>
                        <CreateField label="Տեսակ">
                            <select value={blockDraft.mode} onChange={(e) => setBlockDraft((p) => ({ ...p, mode: e.target.value as "allday" | "duration" }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                                <option value="duration">Փակ ժամ</option>
                                <option value="allday">Ամբողջ օր</option>
                            </select>
                        </CreateField>
                    </div>

                    {blockDraft.mode === "duration" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <CreateField label="Սկիզբ">
                                <input type="time" value={blockDraft.startTime} onChange={(e) => setBlockDraft((p) => ({ ...p, startTime: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
                            </CreateField>
                            <CreateField label="Տևողություն (րոպե)">
                                <input type="number" min={1} value={blockDraft.durationMin} onChange={(e) => setBlockDraft((p) => ({ ...p, durationMin: Number(e.target.value) || 1 }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
                            </CreateField>
                        </div>
                    )}

                    <CreateField label="Պատճառ">
                        <input value={blockDraft.reason} onChange={(e) => setBlockDraft((p) => ({ ...p, reason: e.target.value }))} placeholder="Օր․ Ընդմիջում / Հանգիստ" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
                    </CreateField>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Button onClick={submitBlock} disabled={createBlockMut.isPending || !blockDraft.date || (blockDraft.scope === "staff" && !blockDraft.staffId && staff.length > 0)}>
                            {createBlockMut.isPending ? "Պահպանում է…" : "Պահպանել փակ ժամանակը"}
                        </Button>
                        <Button variant="secondary" onClick={() => setBlockOpen(false)}>Փակել</Button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-6 text-slate-600">
                        Փակ ժամանակը կարող է վերաբերել մեկ մասնագետի կամ ամբողջ բիզնեսին։ Այն ջնջելու համար սեղմիր օրացույցում։
                    </div>
                </div>
            </Modal>

            <Modal
                open={createOpen}
                onClose={resetCreateState}
                title="Նոր ամրագրում"
                description="Ընտրիր ծառայությունները, մասնագետին և ժամը, ապա պահպանիր ամրագրումը։"
                size="screen"
                bodyClassName="p-0"
            >
                <div className="grid min-w-0 gap-0 overflow-x-hidden xl:grid-cols-[minmax(0,1.2fr)_380px]">
                    <div className="min-w-0 space-y-6 p-5 sm:p-6">
                        {draft && (
                            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_38%),linear-gradient(135deg,#f8fafc,#ffffff)] p-5 shadow-sm">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                                            <Clock3 className="h-3.5 w-3.5" /> Ընտրված մեկնարկ
                                        </div>
                                        <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                                            {ymd(draft.startsAt)} · {hm(draft.startsAt)} – {hm(draft.endsAt)}
                                        </div>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                            Ընտրիր ամրագրման ճիշտ տեսակը, լրացրու հաճախորդի տվյալները և պահիր ամրագրումը անմիջապես calendar-ից։
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3 xl:w-[360px]">
                                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Քայլ</div>
                                            <div className="mt-1 text-lg font-semibold text-slate-950">{slotMinutes} ր</div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Աշխատաժամ</div>
                                            <div className="mt-1 text-lg font-semibold text-slate-950">{workStart}–{workEnd}</div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Տեսակ</div>
                                            <div className="mt-1 text-lg font-semibold text-slate-950">
                                                {bookingMode === "single" ? "Մեկ" : bookingMode === "multi" ? "Մի քանի" : "Առանձին"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <section className="space-y-3">
                            <div>
                                <div className="text-lg font-semibold text-slate-950">Ամրագրման տեսակ</div>
                                <div className="text-sm text-slate-500">Ընտրիր ամենապարզ համապատասխան տարբերակը։</div>
                            </div>
                            <div className="grid gap-3 xl:grid-cols-3">
                                <ModeCard
                                    active={bookingMode === "single"}
                                    icon={<CheckCircle2 className="h-5 w-5" />}
                                    title="Մեկ ծառայություն"
                                    description="Մեկ ծառայություն, մեկ աշխատակից, մեկ մեկնարկի ժամ։"
                                    color="bg-sky-500"
                                    onClick={() => {
                                        setBookingMode("single");
                                        if (serviceIds.length > 1) setServiceIds((prev) => prev.slice(0, 1));
                                    }}
                                />
                                <ModeCard
                                    active={bookingMode === "multi"}
                                    icon={<Layers3 className="h-5 w-5" />}
                                    title="Մի քանի ծառայություն"
                                    description="Մի քանի ծառայություն իրար հետևից՝ նույն աշխատակցի մոտ։"
                                    color="bg-violet-600"
                                    onClick={() => setBookingMode("multi")}
                                />
                                <ModeCard
                                    active={bookingMode === "lines"}
                                    icon={<Users2 className="h-5 w-5" />}
                                    title="Տարբեր ժամեր կամ մասնագետներ"
                                    description="Յուրաքանչյուր ծառայության համար առանձին աշխատակից և ժամ։"
                                    color="bg-amber-500"
                                    onClick={() => setBookingMode("lines")}
                                />
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-start gap-3">
                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-slate-900 shadow-sm">
                                    <Scissors className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-slate-950">Ծառայություններ և ժամեր</div>
                                    <div className="text-sm text-slate-500">
                                        {bookingMode === "single"
                                            ? "Ընտրիր մեկ ծառայություն և աշխատակցին։"
                                            : bookingMode === "multi"
                                                ? "Ավելացրու մի քանի ծառայություն նույն աշխատակցի համար․ համակարգը հաշվարկում է հերթականությունը։"
                                                : "Յուրաքանչյուր ծառայության համար ընտրիր առանձին մասնագետ և ժամ։"}
                                    </div>
                                </div>
                            </div>

                            {bookingMode === "single" ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <CreateField label="Ամսաթիվ">
                                        <input
                                            type="date"
                                            value={draft ? ymd(draft.startsAt) : ymd(new Date())}
                                            onChange={(e) => updateDraftDate(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                        />
                                    </CreateField>

                                    <CreateField label="Ժամ">
                                        <select
                                            value={activeSmartSlotKey}
                                            onChange={(e) => updateDraftTime(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                        >
                                            {!smartSlots.length && <option value="">Հասանելի ժամ չկա</option>}
                                            {smartSlots.map((slot) => (
                                                <option key={adminSlotKey(slot)} value={adminSlotKey(slot)}>
                                                    {slot.starts_at.slice(11, 16)}{!staffId && slot.staff_name ? ` · ${slot.staff_name}` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </CreateField>

                                    <CreateField label="Ծառայություն">
                                        <select
                                            value={serviceIds[0] ?? ""}
                                            onChange={(e) => setServiceIds(e.target.value ? [Number(e.target.value)] : [])}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                        >
                                            <option value="">Ընտրիր...</option>
                                            {services.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} · {s.duration_minutes} ր{typeof s.price === "number" ? ` · ${s.price} AMD` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </CreateField>

                                    <CreateField label="Աշխատակից">
                                        <select
                                            value={staffId}
                                            disabled={isStaff}
                                            onChange={(e) => setStaffId(e.target.value ? Number(e.target.value) : "")}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm disabled:bg-slate-50"
                                        >
                                            <option value="">Խելացի ընտրել / ցանկացած աշխատակից</option>
                                            {visibleStaff.map((member) => (
                                                <option key={member.id} value={member.id}>{member.name}</option>
                                            ))}
                                        </select>
                                    </CreateField>
                                    {!!recommendedSmartSlots.length && (
                                        <div className="md:col-span-2">
                                            <SmartSlotPicker
                                                slots={recommendedSmartSlots}
                                                activeKey={activeSmartSlotKey}
                                                onSelect={handleSmartSlotSelect}
                                                showStaff={!staffId}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <CreateField label="Ծառայություն ավելացնել">
                                        <select
                                            value={servicePick}
                                            onChange={(e) => {
                                                const v = e.target.value ? Number(e.target.value) : "";
                                                setServicePick(v);
                                                if (!v) return;
                                                setServiceIds((prev) => [...prev, v]);
                                                setTimeout(() => setServicePick(""), 0);
                                            }}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                        >
                                            <option value="">Ընտրիր...</option>
                                            {services.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} · {s.duration_minutes} ր{typeof s.price === "number" ? ` · ${s.price} AMD` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </CreateField>

                                    <div className="flex flex-wrap gap-2">
                                        {serviceIds.length ? serviceIds.map((id, index) => {
                                            const service = serviceById.get(id);
                                            return (
                                                <button
                                                    key={`${id}-${index}`}
                                                    type="button"
                                                    onClick={() => setServiceIds((prev) => prev.filter((_, i) => i !== index))}
                                                    className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700"
                                                >
                                                    {service?.name ?? `#${id}`}
                                                    <span className="text-violet-400">×</span>
                                                </button>
                                            );
                                        }) : <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">Առայժմ ծառայություն ընտրված չէ։</div>}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <CreateField label="Ամսաթիվ">
                                            <input
                                                type="date"
                                                value={draft ? ymd(draft.startsAt) : ymd(new Date())}
                                                onChange={(e) => updateDraftDate(e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                            />
                                        </CreateField>
                                        <CreateField label="Սկզբի ժամ">
                                            <select
                                                value={activeSmartSlotKey}
                                                onChange={(e) => updateDraftTime(e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                            >
                                                {!smartSlots.length && <option value="">Հասանելի ժամ չկա</option>}
                                                {smartSlots.map((slot) => (
                                                    <option key={adminSlotKey(slot)} value={adminSlotKey(slot)}>
                                                        {slot.starts_at.slice(11, 16)}{!staffId && slot.staff_name ? ` · ${slot.staff_name}` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </CreateField>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ծառայություններ</div>
                                            <div className="mt-1 text-xl font-semibold text-slate-950">{serviceIds.length}</div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Տևողություն</div>
                                            <div className="mt-1 text-xl font-semibold text-slate-950">{selectedServicesMeta.totalDuration || 0} ր</div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Գին</div>
                                            <div className="mt-1 text-xl font-semibold text-slate-950">{selectedServicesMeta.totalPrice || 0} AMD</div>
                                        </div>
                                    </div>

                                    {bookingMode === "multi" ? (
                                        <>
                                            <CreateField label="Ընդհանուր աշխատակից">
                                                <select
                                                    value={staffId}
                                                    disabled={isStaff}
                                                    onChange={(e) => setStaffId(e.target.value ? Number(e.target.value) : "")}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm disabled:bg-slate-50"
                                                >
                                                    <option value="">Խելացի ընտրել / ցանկացած աշխատակից</option>
                                                    {visibleStaff.map((member) => (
                                                        <option key={member.id} value={member.id}>{member.name}</option>
                                                    ))}
                                                </select>
                                            </CreateField>
                                            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
                                                Multi mode-ում ընտրված ծառայությունները կստեղծվեն մեկ booking-ի տակ՝ հերթական BookingItem-երով և նույն staff-ով։
                                            </div>
                                            {!!recommendedSmartSlots.length && (
                                                <SmartSlotPicker
                                                    slots={recommendedSmartSlots}
                                                    activeKey={activeSmartSlotKey}
                                                    onSelect={handleSmartSlotSelect}
                                                    showStaff={!staffId}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                                Lines mode-ում յուրաքանչյուր ծառայության համար կարող ես փոխել starts_at-ը և staff-ը։ Սա admin-ի advanced տարբերակն է։
                                            </div>
                                            {lineDrafts.map((line, index) => {
                                                const serviceMeta = serviceById.get(line.service_id);
                                                return (
                                                    <div key={line.key} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                            <div>
                                                                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                                                                    Քայլ {index + 1}
                                                                </div>
                                                                <div className="mt-2 text-base font-semibold text-slate-900">{serviceMeta?.name ?? `Service #${line.service_id}`}</div>
                                                                <div className="mt-1 text-sm text-slate-500">Տևողություն՝ {serviceMeta?.duration_minutes ?? 0} րոպե</div>
                                                            </div>
                                                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                                                                {line.starts_at.replace(" ", " · ")}
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                            <CreateField label="Մեկնարկի ժամ">
                                                                <input
                                                                    type="datetime-local"
                                                                    value={line.starts_at.replace(" ", "T")}
                                                                    onChange={(e) => updateLineDraft(line.key, { starts_at: e.target.value.replace("T", " ") })}
                                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                                                />
                                                            </CreateField>
                                                            <CreateField label="Աշխատակից">
                                                                <select
                                                                    value={isStaff ? user?.id ?? "" : line.staff_id}
                                                                    disabled={isStaff}
                                                                    onChange={(e) => updateLineDraft(line.key, { staff_id: e.target.value ? Number(e.target.value) : "" })}
                                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm disabled:bg-slate-50"
                                                                >
                                                                    <option value="">Ընտրիր...</option>
                                                                    {visibleStaff.map((member) => (
                                                                        <option key={member.id} value={member.id}>{member.name}</option>
                                                                    ))}
                                                                </select>
                                                            </CreateField>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-start gap-3">
                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-500 text-slate-900 shadow-sm">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-slate-950">Հաճախորդի տվյալներ</div>
                                    <div className="text-sm text-slate-500">Պահպանիր ամրագրումը հենց ներսից՝ առանց լրացուցիչ քայլերի։</div>
                                </div>
                            </div>
                            <div className="mb-4 rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                                <div className="text-sm font-semibold text-slate-900">Հաճախորդների բազայից ընտրել</div>
                                <div className="mt-1 text-xs leading-5 text-slate-500">Ընտրելիս անունն ու հեռախոսը լցվում են ավտոմատ։</div>
                                <div className="mt-3 space-y-3">
                                    <input
                                        value={clientLookup}
                                        onChange={(e) => setClientLookup(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                        placeholder="Փնտրել հաճախորդի անունով կամ հեռախոսով"
                                    />
                                    {selectedClientId ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Ընտրված հաճախորդ #{selectedClientId}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedClientId(null);
                                                    setClientLookup("");
                                                }}
                                                className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
                                            >
                                                Մաքրել ընտրությունը
                                            </button>
                                        </div>
                                    ) : null}
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {clientSuggestions.slice(0, 6).map((client) => (
                                            <button
                                                key={client.id}
                                                type="button"
                                                onClick={() => selectClientFromBase(client)}
                                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-violet-200 hover:bg-violet-50"
                                            >
                                                <div className="font-medium text-slate-900">{client.name}</div>
                                                <div className="mt-1 text-xs text-slate-500">{client.phone || "Առանց համարի"}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <CreateField label="Հաճախորդի անուն">
                                    <input value={clientName} onChange={(e) => { setClientName(e.target.value); if (selectedClientId) setSelectedClientId(null); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Օր․ Մարիամ" />
                                </CreateField>
                                <CreateField label="Հեռախոս">
                                    <input value={clientPhone} onChange={(e) => { setClientPhone(e.target.value); if (selectedClientId) setSelectedClientId(null); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="+374..." />
                                </CreateField>
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <CreateField label="Աղբյուր">
                                    <select value={bookingSource} onChange={(e) => setBookingSource(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                                        <option value="admin">Ադմին</option>
                                        <option value="website">Կայք</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="partner">Գործընկեր</option>
                                        <option value="widget">Widget</option>
                                        <option value="qr">QR</option>
                                        <option value="returning_client">Վերադարձող հաճախորդ</option>
                                    </select>
                                </CreateField>
                                <CreateField label="Նշում">
                                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Լրացուցիչ նշումներ..." />
                                </CreateField>
                            </div>
                            {bookingMode !== "lines" ? (
                                <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <summary className="cursor-pointer text-sm font-semibold text-slate-700">Զեղչ, միավորներ կամ նվերի քարտ</summary>
                                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                                        <CreateField label="Օգտագործել միավորներ">
                                            <input value={redeemPoints} onChange={(e) => setRedeemPoints(e.target.value)} type="number" min={0} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Օր. 100" />
                                        </CreateField>
                                        <CreateField label="Նվերի քարտի կոդ">
                                            <input value={giftCardCode} onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Օր. GC-AB12CD34" />
                                        </CreateField>
                                        <CreateField label="Նվերի քարտից գումար">
                                            <input value={giftCardAmount} onChange={(e) => setGiftCardAmount(e.target.value)} type="number" min={0} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Լրիվ կամ մասամբ" />
                                        </CreateField>
                                    </div>
                                </details>
                            ) : null}
                        </section>
                    </div>

                    <aside className="min-w-0 border-t border-slate-200 bg-[#fcfbf8] p-5 sm:p-6 2xl:border-l 2xl:border-t-0">
                        <div className="space-y-4 2xl:sticky 2xl:top-0">
                            <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.20)]">
                                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Ամրագրման ամփոփում</div>
                                <div className="mt-3 text-2xl font-semibold tracking-tight">
                                    {bookingMode === "single" ? "Մեկ ծառայություն" : bookingMode === "multi" ? "Մի քանի ծառայություն" : "Առանձին ժամեր կամ մասնագետներ"}
                                </div>
                                <div className="mt-2 text-sm leading-6 text-slate-500">
                                    {draft ? `${ymd(draft.startsAt)} · ${hm(draft.startsAt)}` : "Սկզբի ժամ դեռ ընտրված չէ"}
                                </div>
                                <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                                    <div className="rounded-2xl border border-slate-200 bg-[#fcfbf8] px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ծառայություններ</div>
                                        <div className="mt-1 text-xl font-semibold">{selectedServicesMeta.selected.length}</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-[#fcfbf8] px-4 py-3">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ընդհանուր տևողություն</div>
                                        <div className="mt-1 text-xl font-semibold">{selectedServicesMeta.totalDuration || 0} ր</div>
                                    </div>
                                </div>
                            </div>

                            {!!recommendedSmartSlots.length && (
                                <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-violet-50 p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                                        <Sparkles className="h-4 w-4" />
                                        Խելացի ամրագրման առաջարկներ
                                    </div>
                                    <div className="mt-1 text-sm text-slate-600">
                                        Ընտրիր առաջարկված ժամերից մեկը, որ calendar-ում անպետք բաց չմնա։
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {recommendedSmartSlots.map((slot) => (
                                            <button
                                                key={`${slot.starts_at}|${slot.staff_id ?? "na"}`}
                                                type="button"
                                                onClick={() => handleSmartSlotSelect(slot)}
                                                className={cn(
                                                    "flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                                                    activeSmartSlotKey === `${slot.starts_at}|${slot.staff_id ?? "na"}`
                                                        ? "border-emerald-400 bg-emerald-100"
                                                        : "border-white/80 bg-white hover:border-emerald-300"
                                                )}
                                            >
                                                <div>
                                                    <div className="font-semibold text-slate-900">{slot.starts_at.slice(11, 16)}{!staffId && slot.staff_name ? ` · ${slot.staff_name}` : ""}</div>
                                                    <div className="mt-1 text-xs text-slate-500">{slot.smart_reason || "Առաջարկվող ժամ"}</div>
                                                </div>
                                                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-slate-900">#{slot.recommendation_rank ?? "★"}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="text-sm font-semibold text-slate-950">Ընտրված ծառայություններ</div>
                                <div className="mt-4 space-y-3">
                                    {selectedServicesMeta.selected.length ? selectedServicesMeta.selected.map((service, index) => {
                                        const line = lineDrafts[index];
                                        const lineStaffName = line ? staffById.get(Number(isStaff ? user?.id : line.staff_id || 0))?.name : undefined;
                                        return (
                                            <div key={`${service.id}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="font-medium text-slate-900">{service.name}</div>
                                                        <div className="mt-1 text-xs text-slate-500">{service.duration_minutes} րոպե</div>
                                                    </div>
                                                    {service.price != null ? <div className="text-sm font-semibold text-violet-700">{service.price} AMD</div> : null}
                                                </div>
                                                <div className="mt-2 text-xs leading-5 text-slate-500">
                                                    {bookingMode === "lines"
                                                        ? `${line?.starts_at?.replace(" ", " · ") ?? "Ժամը ընտրված չէ"} · ${lineStaffName ?? "Աշխատակից ընտրված չէ"}`
                                                        : bookingMode === "multi"
                                                            ? `${draft ? `${ymd(draft.startsAt)} · ${hm(draft.startsAt)}` : "Ժամը ընտրված չէ"} · ${staffById.get(Number(staffId || 0))?.name ?? "Աշխատակից ընտրված չէ"}`
                                                            : `${draft ? `${ymd(draft.startsAt)} · ${hm(draft.startsAt)}` : "Ժամը ընտրված չէ"} · ${staffById.get(Number(staffId || 0))?.name ?? "Աշխատակից ընտրված չէ"}`}
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                                            Ընտրիր ծառայություններ, որ ամփոփումը լրացվի։
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                                    {bookingMode === "single"
                                        ? "Մեկ ծառայություն՝ մեկ մասնագետի մոտ։"
                                        : bookingMode === "multi"
                                            ? "Մի քանի ծառայություն իրար հետևից՝ նույն մասնագետի մոտ։"
                                            : "Յուրաքանչյուր ծառայությունն ունի իր մասնագետն ու ժամը։"}
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <Button onClick={submitCreateBooking} size="lg" disabled={createMut.isPending || createLinesMut.isPending || createDisabled}>
                                        {createMut.isPending || createLinesMut.isPending
                                            ? "Պահպանում է…"
                                            : bookingMode === "single"
                                                ? "Ստեղծել ամրագրումը"
                                                : bookingMode === "multi"
                                                    ? "Ստեղծել ընդհանուր ամրագրումը"
                                                    : "Ստեղծել ամրագրումները"}
                                    </Button>
                                    <Button variant="secondary" size="lg" onClick={resetCreateState}>Փակել</Button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </Modal>

            <BookingDetailsDrawer
                booking={selectedBooking}
                serviceById={serviceById}
                staffById={staffById}
                options={bookingActionOptions}
                saving={updateBookingMut.isPending || moveMut.isPending}
                onClose={() => setSelectedBooking(null)}
                onUpdate={(payload) => updateBookingMut.mutate(payload)}
                onShift={(booking, deltaMinutes) => {
                    const start = parseLocalDateTime(booking.starts_at);
                    const end = parseLocalDateTime(booking.ends_at);
                    if (!start || !end) return;
                    const nextStart = addMinutes(start, deltaMinutes);
                    const nextEnd = addMinutes(end, deltaMinutes);
                    moveMut.mutate({
                        id: booking.id,
                        starts_at: `${ymd(nextStart)} ${hm(nextStart)}:00`,
                        ends_at: `${ymd(nextEnd)} ${hm(nextEnd)}:00`,
                    });
                }}
                onChoose={(key) => {
                    if (!selectedBooking) return;
                    if (key === "confirm") confirmMut.mutate(selectedBooking.id);
                    if (key === "done") doneMut.mutate(selectedBooking.id);
                    if (key === "no_show") noShowMut.mutate(selectedBooking.id);
                    if (key === "cancel") setConfirmState({ type: "booking-cancel", booking: selectedBooking });
                    if (key === "close") setSelectedBooking(null);
                }}
            />

            <Toast open={toast.open} text={toast.text} type={toast.type} />

            <ConfirmModal
                open={!!confirmState}
                title={confirmState?.type === "block" ? "Ջնջե՞լ փակ ժամանակը" : "Չեղարկե՞լ հենց այս ամրագրումը"}
                description={
                    confirmState?.type === "block"
                        ? `Դուք պատրաստվում եք ջնջել «${confirmState.block.reason ?? "Փակ է"}» փակ ժամանակը։`
                        : confirmState?.type === "booking-cancel"
                            ? cancellationDescription
                            : undefined
                }
                confirmText={confirmState?.type === "block" ? "Այո, ջնջել" : "Այո, չեղարկել"}
                danger
                loading={deleteBlockMut.isPending || cancelMut.isPending}
                onClose={() => {
                    if (!deleteBlockMut.isPending && !cancelMut.isPending) setConfirmState(null);
                }}
                onConfirm={() => {
                    if (!confirmState) return;
                    if (confirmState.type === "block") deleteBlockMut.mutate(confirmState.block.id);
                    if (confirmState.type === "booking-cancel") cancelMut.mutate(confirmState.booking.id);
                }}
            />
        </motion.div>
    );
}
