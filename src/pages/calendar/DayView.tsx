import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    CalendarDays,
    Clock3,
    Phone,
    Scissors,
    User,
    Ban,
    Plus,
} from "lucide-react";

import { cn } from "../../lib/cn";
import type { Booking } from "../../lib/calendarApi";
import type { Block } from "../../lib/calendarBlocksApi";

function minutesFromHm(hm: string) {
    const [h, m] = hm.split(":").map(Number);
    return h * 60 + m;
}

function pad(n: number) {
    return String(n).padStart(2, "0");
}

function hmFromMinutes(total: number) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${pad(h)}:${pad(m)}`;
}

function formatDateLabel(date: string) {
    const d = new Date(`${date}T00:00:00`);
    try {
        return d.toLocaleDateString("hy-AM", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    } catch {
        return date;
    }
}

function bookingStatusUi(status: Booking["status"]) {
    switch (status) {
        case "pending":
            return {
                label: "Սպասում է",
                chip: "border-amber-200 bg-amber-50 text-amber-700",
                card: "border-amber-200/70 bg-gradient-to-r from-amber-50 to-yellow-50",
                dot: "bg-amber-400",
            };
        case "confirmed":
            return {
                label: "Հաստատված",
                chip: "border-sky-200 bg-sky-50 text-sky-700",
                card: "border-sky-200/70 bg-gradient-to-r from-sky-50 to-indigo-50",
                dot: "bg-sky-500",
            };
        case "done":
            return {
                label: "Կատարված",
                chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
                card: "border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-green-50",
                dot: "bg-emerald-500",
            };
        case "cancelled":
            return {
                label: "Չեղարկված",
                chip: "border-slate-200 bg-slate-50 text-slate-600",
                card: "border-slate-200/70 bg-gradient-to-r from-slate-50 to-gray-50 opacity-80",
                dot: "bg-slate-400",
            };
        default:
            return {
                label: status,
                chip: "border-slate-200 bg-slate-50 text-slate-600",
                card: "border-slate-200/70 bg-white",
                dot: "bg-slate-400",
            };
    }
}

type Props = {
    date: string;
    bookings: Booking[];
    blocks?: Block[];
    serviceName: (id: number) => string;
    staffName: (id: number | null) => string;
    canSeeAll?: boolean;
    startHour?: number;
    endHour?: number;
    slotMinutes?: number;
    onSelectSlot?: (date: string, time: string) => void;
    onBookingClick?: (booking: Booking) => void;
    onBlockClick?: (block: Block) => void;
};

export function DayView({
                            date,
                            bookings,
                            blocks = [],
                            serviceName,
                            staffName,
                            canSeeAll = true,
                            startHour = 9,
                            endHour = 20,
                            slotMinutes = 30,
                            onSelectSlot,
                            onBookingClick,
                            onBlockClick,
                        }: Props) {
    const dayBookings = useMemo(() => {
        return bookings
            .filter((b) => b.starts_at.slice(0, 10) === date)
            .sort((a, z) => a.starts_at.localeCompare(z.starts_at));
    }, [bookings, date]);

    const dayBlocks = useMemo(() => {
        return blocks
            .filter((b) => b.starts_at.slice(0, 10) === date)
            .sort((a, z) => a.starts_at.localeCompare(z.starts_at));
    }, [blocks, date]);

    const slots = useMemo(() => {
        const start = startHour * 60;
        const end = endHour * 60;
        const result: string[] = [];

        for (let i = start; i < end; i += slotMinutes) {
            result.push(hmFromMinutes(i));
        }

        return result;
    }, [startHour, endHour, slotMinutes]);

    function findBookingAt(slotHm: string) {
        const slotMin = minutesFromHm(slotHm);

        return dayBookings.find((b) => {
            const s = minutesFromHm(b.starts_at.slice(11, 16));
            const e = minutesFromHm(b.ends_at.slice(11, 16));
            return slotMin >= s && slotMin < e;
        });
    }

    function findBlockAt(slotHm: string) {
        const slotMin = minutesFromHm(slotHm);

        return dayBlocks.find((b) => {
            const s = minutesFromHm(b.starts_at.slice(11, 16));
            const e = minutesFromHm(b.ends_at.slice(11, 16));
            return slotMin >= s && slotMin < e;
        });
    }

    const uniqueRenderedBookingIds = new Set<number>();
    const uniqueRenderedBlockIds = new Set<number>();

    return (
        <div className="rounded-[30px] border border-white/70 bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Day view
                    </div>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                        {formatDateLabel(date)}
                    </h3>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                    {dayBookings.length} ամրագրում • {dayBlocks.length} block
                </div>
            </div>

            <div className="space-y-3">
                {slots.map((slot, idx) => {
                    const booking = findBookingAt(slot);
                    const block = findBlockAt(slot);

                    const isFirstBookingSlot =
                        booking && booking.starts_at.slice(11, 16) === slot;
                    const isFirstBlockSlot =
                        block && block.starts_at.slice(11, 16) === slot;

                    const bookingUi = booking ? bookingStatusUi(booking.status) : null;

                    return (
                        <motion.div
                            key={`${date}-${slot}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.01, duration: 0.22 }}
                            className="grid grid-cols-[72px_1fr] gap-3"
                        >
                            <div className="pt-2 text-right text-sm font-medium text-slate-500">
                                {slot}
                            </div>

                            <div>
                                {!booking && !block ? (
                                    <button
                                        type="button"
                                        onClick={() => onSelectSlot?.(date, slot)}
                                        className="group flex min-h-[54px] w-full items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-left transition hover:border-violet-300 hover:bg-violet-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-violet-600 shadow-sm">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">
                                                    Ազատ slot
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Tap արա՝ նոր ամրագրում ստեղծելու համար
                                                </div>
                                            </div>
                                        </div>

                                        <span className="text-xs font-medium text-violet-700 opacity-0 transition group-hover:opacity-100">
                                            Ավելացնել
                                        </span>
                                    </button>
                                ) : null}

                                {block && isFirstBlockSlot && !uniqueRenderedBlockIds.has(block.id) ? (
                                    (() => {
                                        uniqueRenderedBlockIds.add(block.id);
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => onBlockClick?.(block)}
                                                className="flex w-full items-start gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 px-4 py-4 text-left transition hover:shadow-sm"
                                            >
                                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-rose-500 shadow-sm">
                                                    <Ban className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="font-semibold text-slate-900">
                                                            {block.reason || "Փակ է"}
                                                        </div>
                                                        <span className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-medium text-rose-700">
                                                            Block
                                                        </span>
                                                    </div>

                                                    <div className="mt-1 text-sm text-slate-600">
                                                        {block.starts_at.slice(11, 16)} – {block.ends_at.slice(11, 16)}
                                                    </div>

                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Tap արա՝ block-ը ջնջելու համար
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })()
                                ) : null}

                                {booking && isFirstBookingSlot && !uniqueRenderedBookingIds.has(booking.id) ? (
                                    (() => {
                                        uniqueRenderedBookingIds.add(booking.id);
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => onBookingClick?.(booking)}
                                                className={cn(
                                                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left shadow-sm transition hover:shadow-md",
                                                    bookingUi?.card
                                                )}
                                            >
                                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-700 shadow-sm">
                                                    <Clock3 className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={cn("h-2.5 w-2.5 rounded-full", bookingUi?.dot)} />
                                                        <div className="truncate font-semibold text-slate-900">
                                                            {booking.client_name}
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                                                                bookingUi?.chip
                                                            )}
                                                        >
                                                            {bookingUi?.label}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                                                        <div className="inline-flex items-center gap-2">
                                                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                                            {booking.starts_at.slice(11, 16)} – {booking.ends_at.slice(11, 16)}
                                                        </div>

                                                        <div className="inline-flex items-center gap-2">
                                                            <Scissors className="h-3.5 w-3.5 text-slate-400" />
                                                            {serviceName(booking.service_id)}
                                                        </div>

                                                        {booking.staff_id ? (
                                                            <div className="inline-flex items-center gap-2">
                                                                <User className="h-3.5 w-3.5 text-slate-400" />
                                                                {staffName(booking.staff_id)}
                                                            </div>
                                                        ) : null}

                                                        <div className="inline-flex items-center gap-2">
                                                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                            {booking.client_phone}
                                                        </div>
                                                    </div>

                                                    {!canSeeAll && booking.staff_id ? null : (
                                                        booking.notes ? (
                                                            <div className="mt-2 line-clamp-2 text-xs text-slate-500">
                                                                {booking.notes}
                                                            </div>
                                                        ) : null
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })()
                                ) : null}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}