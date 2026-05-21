import { useMemo } from "react";
import { Ban, CalendarDays, Clock3, Filter, Phone, Plus, User } from "lucide-react";

import { cn } from "../../lib/cn";
import type { Booking } from "../../lib/calendarApi";
import type { Block } from "../../lib/calendarBlocksApi";
import type { Service } from "../../lib/servicesApi";
import type { StaffUser } from "../../lib/staffApi";
import type { ViewMode } from "./types";
import {
    bookingServiceTitle,
    bookingStatusLabel,
    bookingStatusTone,
    formatDateTimeLabel,
    formatMoney,
    formatShortDateLabel,
    formatWeekRangeLabel,
    parseLocalDateTime,
    weekdayShort,
    ymd,
} from "./utils";

export function CalendarMobileSchedule({
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
    const dayBookings = useMemo(() => bookings.filter((booking) => booking.starts_at.slice(0, 10) === datePick).sort((a, b) => a.starts_at.localeCompare(b.starts_at)), [bookings, datePick]);
    const dayBlocks = useMemo(() => blocks.filter((block) => block.starts_at.slice(0, 10) === datePick).sort((a, b) => a.starts_at.localeCompare(b.starts_at)), [blocks, datePick]);
    const currentRangeLabel = viewMode === "week" ? formatWeekRangeLabel(weekDays) : formatShortDateLabel(parseLocalDateTime(`${datePick} 12:00:00`) ?? new Date());
    const jumpButtonLabel = viewMode === "week" ? "Այս շաբաթ" : "Այսօր";
    const footerModeLabel = viewMode === "week" ? "Շաբաթ" : "Օր";

    return (
        <div className="space-y-4 pb-24">
            <div className="overflow-hidden rounded-[30px] border border-[#e7dfd6] bg-white text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
                <div className="border-b border-[#eee6dc] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Daily schedule</div>
                            <div className="mt-1 text-lg font-semibold text-slate-950">{formatDateTimeLabel(`${datePick} 10:00`)?.split(",")[0] ?? datePick}</div>
                            <div className="mt-1 text-xs text-slate-500">{dayBookings.length} booking • {formatMoney(selectedDateRevenue)} դր</div>
                        </div>
                        <button type="button" onClick={() => onOpenCreate(datePick, "10:00")} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 px-4 py-4">
                    <div className="rounded-[22px] border border-[#eee6dc] bg-[#fcfbf8] px-3 py-3"><div className="text-[11px] text-slate-400">Ամրագրումներ</div><div className="mt-1 text-2xl font-semibold">{dayBookings.length}</div></div>
                    <div className="rounded-[22px] border border-[#eee6dc] bg-[#fcfbf8] px-3 py-3"><div className="text-[11px] text-slate-400">Շրջանառություն</div><div className="mt-1 text-2xl font-semibold">{formatMoney(selectedDateRevenue)}</div></div>
                </div>
            </div>
            <div className="-mx-1 overflow-x-auto"><div className="flex min-w-max gap-2 px-1 pb-1">{weekDays.map((day) => { const key = ymd(day); const active = key === datePick; return <button key={key} type="button" onClick={() => onPickDate(key)} className={cn("min-w-[78px] rounded-[20px] border px-3 py-2.5 text-center transition", active ? "border-[#24364b] bg-[#24364b] text-white shadow-sm" : "border-[#e7dfd6] bg-white text-slate-700")}><div className="text-[11px] font-medium opacity-80">{weekdayShort(day)}</div><div className="mt-1 text-base font-semibold">{String(day.getDate()).padStart(2, "0")}</div></button>; })}</div></div>
            {dayBlocks.length ? <div className="space-y-2">{dayBlocks.map((block) => <button key={block.id} type="button" onClick={() => onBlockClick(block)} className="flex w-full items-center justify-between rounded-[22px] border border-[#efc0bf] bg-[#fae8e7] px-4 py-3 text-left"><div><div className="text-sm font-semibold text-[#8f4a49]">{block.reason || "Փակ ժամ"}</div><div className="mt-1 text-xs text-[#8f4a49]">{block.starts_at.slice(11, 16)} – {block.ends_at.slice(11, 16)}</div></div><Ban className="h-4 w-4 text-[#8f4a49]" /></button>)}</div> : null}
            <div className="space-y-3">
                {dayBookings.length ? dayBookings.map((booking) => {
                    const serviceLabel = bookingServiceTitle(booking, serviceById);
                    const staffName = booking.staff_id ? staffById.get(booking.staff_id)?.name ?? "—" : "—";
                    return (
                        <button key={booking.id} type="button" onClick={() => onBookingClick(booking)} className="w-full rounded-[24px] border border-[#e7dfd6] bg-white px-4 py-4 text-left shadow-[0_10px_22px_rgba(15,23,42,0.05)] transition hover:border-violet-200">
                            <div className="flex items-start justify-between gap-3"><div><div className="text-[15px] font-semibold text-slate-950">{booking.client_name}</div><div className="mt-1 text-sm text-slate-500">{serviceLabel}</div></div><span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", bookingStatusTone(booking.status))}>{bookingStatusLabel(booking.status)}</span></div>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-500"><span className="inline-flex items-center gap-1 rounded-full bg-[#f5f2ee] px-2.5 py-1"><Clock3 className="h-3.5 w-3.5" /> {booking.starts_at.slice(11, 16)} – {booking.ends_at.slice(11, 16)}</span><span className="inline-flex items-center gap-1 rounded-full bg-[#f5f2ee] px-2.5 py-1"><User className="h-3.5 w-3.5" /> {staffName}</span>{booking.client_phone ? <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f2ee] px-2.5 py-1"><Phone className="h-3.5 w-3.5" /> {booking.client_phone}</span> : null}</div>
                        </button>
                    );
                }) : <div className="rounded-[24px] border border-dashed border-[#e7dfd6] bg-white px-4 py-8 text-center text-sm text-slate-500">Այս օրը ամրագրում չկա։</div>}
            </div>
            <div className="fixed inset-x-0 bottom-4 z-30 px-4">
                <div className="mx-auto flex max-w-sm items-center justify-between rounded-[28px] border border-[#e7dfd6] bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur">
                    <button type="button" onClick={onJumpToToday} className="flex flex-col items-center gap-1 text-[11px] text-slate-500"><CalendarDays className="h-4 w-4" /> {jumpButtonLabel}</button>
                    <button type="button" onClick={() => onOpenCreate(datePick, "10:00")} className="grid h-12 w-12 place-items-center rounded-full bg-[#24364b] text-white shadow-[0_12px_28px_rgba(36,54,75,0.28)] transition hover:-translate-y-0.5"><Plus className="h-5 w-5" /></button>
                    <button type="button" onClick={onOpenFilters} className="flex flex-col items-center gap-1 text-[11px] text-slate-500"><Filter className="h-4 w-4" /> {activeFilterCount ? `Ֆիլտր ${activeFilterCount}` : footerModeLabel}</button>
                </div>
                <div className="mt-2 text-center text-[11px] text-slate-500">{currentRangeLabel}</div>
            </div>
        </div>
    );
}
