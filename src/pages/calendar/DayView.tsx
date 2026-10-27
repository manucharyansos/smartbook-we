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

function MetricTile({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "amber" | "sky" | "emerald" }) {
    const toneClass = {
        default: "border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[var(--vz-text)]",
        amber: "border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)] text-[var(--vz-warning)]",
        sky: "border-[var(--vz-info-line)] bg-[var(--vz-info-soft)] text-[var(--vz-info)]",
        emerald: "border-[var(--vz-success-line)] bg-[var(--vz-success-soft)] text-[var(--vz-success)]",
    }[tone];

    return (
        <div className={cn("rounded-2xl border px-4 py-3", toneClass)}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--vz-muted)]">{label}</div>
            <div className="mt-1 text-lg font-semibold">{value}</div>
        </div>
    );
}

function bookingStatusUi(status: Booking["status"]) {
    switch (status) {
        case "pending":
            return {
                label: "Սպասում է",
                chip: "border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)] text-[var(--vz-warning)]",
                card: "bg-[var(--vz-highlight-soft)] border-[var(--vz-warning-line)]",
                dot: "bg-[var(--vz-highlight)]",
            };
        case "confirmed":
            return {
                label: "Հաստատված",
                chip: "border-[var(--vz-info-line)] bg-[var(--vz-info-soft)] text-[var(--vz-info)]",
                card: "border-[var(--vz-info-line)] bg-[var(--vz-primary)]",
                dot: "bg-[var(--vz-primary)]",
            };
        case "done":
            return {
                label: "Կատարված",
                chip: "border-[var(--vz-success-line)] bg-[var(--vz-success-soft)] text-[var(--vz-success)]",
                card: "bg-[var(--vz-accent-soft)] border-[var(--vz-success-line)]",
                dot: "bg-[var(--vz-success)]",
            };
        case "cancelled":
            return {
                label: "Չեղարկված",
                chip: "border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)]",
                card: "bg-[var(--vz-surface-2)] border-[var(--vz-line)] opacity-80",
                dot: "bg-[var(--vz-line-strong)]",
            };
        default:
            return {
                label: status,
                chip: "border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)]",
                card: "border-[var(--vz-line)] bg-[var(--vz-surface)]",
                dot: "bg-[var(--vz-line-strong)]",
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
    locationLabel?: string;
    revenue?: number;
    compact?: boolean;
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
                            locationLabel,
                            revenue = 0,
                            compact = false,
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

    const dayRevenue = revenue || dayBookings.reduce((sum, booking) => sum + Number(booking.items?.reduce((inner, item) => inner + Number(item.price ?? item.service?.price ?? 0), 0) ?? 0), 0);
    const dayPending = dayBookings.filter((booking) => booking.status === "pending").length;
    const dayConfirmed = dayBookings.filter((booking) => booking.status === "confirmed").length;

    return (
        <div className={cn("border border-white/70 bg-[var(--vz-surface)] shadow-sm", compact ? "rounded-[26px] p-3" : "rounded-[30px] p-4 sm:p-5")}>
            <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", compact ? "mb-3" : "mb-5")}>
                <div>
                    {!compact ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--vz-accent-text)]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Օրվա տեսք
                        </div>
                    ) : null}
                    <h3 className={cn("font-semibold tracking-tight text-[var(--vz-text)]", compact ? "text-base" : "mt-3 text-xl")}>
                        {compact ? date : formatDateLabel(date)}
                    </h3>
                    {locationLabel ? (
                        <div className={cn("inline-flex items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 py-1.5 text-xs font-medium text-[var(--vz-text-secondary)]", compact ? "mt-1" : "mt-2")}>
                            {locationLabel}
                        </div>
                    ) : null}
                </div>

{compact ? (
                    <div className="flex flex-wrap gap-2 text-[11px] font-medium text-[var(--vz-text-secondary)]">
                        <span className="rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 py-1.5">{dayBookings.length} booking</span>
                        <span className="rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 py-1.5">{dayBlocks.length} block</span>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-4 py-2 text-sm text-[var(--vz-text-secondary)]">
                        {dayBookings.length} ամրագրում • {dayBlocks.length} block
                    </div>
                )}
            </div>

{!compact ? (
                <>
                    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <MetricTile label="Booking" value={dayBookings.length} />
                        <MetricTile label="Pending" value={dayPending} tone="amber" />
                        <MetricTile label="Confirmed" value={dayConfirmed} tone="sky" />
                        <MetricTile label="Revenue" value={`${dayRevenue} AMD`} tone="emerald" />
                    </div>

                    {(dayBookings.length || dayBlocks.length) ? (
                        <div className="mb-5 space-y-3 rounded-[28px] border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-[var(--vz-text)]">Օրվա agenda</div>
                        <div className="text-xs text-[var(--vz-muted)]">Միևնույն ամփոփումը, ինչ desktop-ում</div>
                    </div>
                    {dayBlocks.map((block) => (
                        <button
                            key={`agenda-block-${block.id}`}
                            type="button"
                            onClick={() => onBlockClick?.(block)}
                            className="bg-[var(--vz-danger-soft)] flex w-full items-start gap-3 rounded-2xl border border-[var(--vz-danger-line)] px-4 py-3 text-left"
                        >
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--vz-surface)] text-[var(--vz-danger)] shadow-sm">
                                <Ban className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-[var(--vz-text)]">{block.reason || "Փակ է"}</div>
                                <div className="mt-1 text-sm text-[var(--vz-text-secondary)]">{block.starts_at.slice(11, 16)} – {block.ends_at.slice(11, 16)}</div>
                            </div>
                        </button>
                    ))}
                    {dayBookings.map((booking) => {
                        const bookingUi = bookingStatusUi(booking.status);
                        return (
                            <button
                                key={`agenda-booking-${booking.id}`}
                                type="button"
                                onClick={() => onBookingClick?.(booking)}
                                className={cn(
                                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm",
                                    bookingUi.card
                                )}
                            >
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--vz-surface)] text-[var(--vz-text-secondary)] shadow-sm">
                                    <Clock3 className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={cn("h-2.5 w-2.5 rounded-full", bookingUi.dot)} />
                                        <div className="truncate font-semibold text-[var(--vz-text)]">{booking.client_name}</div>
                                        <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium", bookingUi.chip)}>{bookingUi.label}</span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--vz-text-secondary)]">
                                        <div className="inline-flex items-center gap-2">
                                            <Clock3 className="h-3.5 w-3.5 text-[var(--vz-muted)]" />
                                            {booking.starts_at.slice(11, 16)} – {booking.ends_at.slice(11, 16)}
                                        </div>
                                        <div className="inline-flex items-center gap-2">
                                            <Scissors className="h-3.5 w-3.5 text-[var(--vz-muted)]" />
                                            {serviceName(booking.service_id)}
                                        </div>
                                        {booking.staff_id ? (
                                            <div className="inline-flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 text-[var(--vz-muted)]" />
                                                {staffName(booking.staff_id)}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                        </div>
                    ) : null}
                </>
            ) : null}

            <div className={cn("space-y-3", compact && "space-y-2")}>
{!compact ? (
                    <div className="flex items-center justify-between gap-3 pb-1">
                        <div className="text-sm font-semibold text-[var(--vz-text)]">Ժամային ցանց</div>
                        <div className="text-xs text-[var(--vz-muted)]">Նմանեցված desktop agenda-ին</div>
                    </div>
                ) : null}
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
                            className={cn("grid gap-3", compact ? "grid-cols-[48px_1fr]" : "grid-cols-[72px_1fr]")}
                        >
                            <div className={cn("text-right font-medium text-[var(--vz-muted)]", compact ? "pt-1.5 text-[11px]" : "pt-2 text-sm")}>
                                {slot}
                            </div>

                            <div>
                                {!booking && !block ? (
                                    <button
                                        type="button"
                                        onClick={() => onSelectSlot?.(date, slot)}
                                        className={cn("group flex w-full items-center justify-between border border-dashed border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-left transition hover:border-[var(--vz-primary)] hover:bg-[var(--vz-accent-soft)]", compact ? "min-h-[42px] rounded-[18px] px-3 py-2.5" : "min-h-[54px] rounded-2xl px-4 py-3")}
                                    >
                                        <div className="flex items-center gap-3">
<div className={cn("grid place-items-center bg-[var(--vz-surface)] text-[var(--vz-accent-text)] shadow-sm", compact ? "h-8 w-8 rounded-lg" : "h-9 w-9 rounded-xl")}>
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            <div>
<div className={cn("font-medium text-[var(--vz-text)]", compact ? "text-[13px]" : "text-sm")}>Ազատ slot</div>
                                                {!compact ? <div className="text-xs text-[var(--vz-muted)]">Tap արա՝ նոր ամրագրում ստեղծելու համար</div> : null}
                                            </div>
                                        </div>

{!compact ? <span className="text-xs font-medium text-[var(--vz-accent-text)] opacity-0 transition group-hover:opacity-100 sm:opacity-100">Ավելացնել</span> : null}
                                    </button>
                                ) : null}

                                {block && isFirstBlockSlot && !uniqueRenderedBlockIds.has(block.id) ? (
                                    (() => {
                                        uniqueRenderedBlockIds.add(block.id);
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => onBlockClick?.(block)}
                                                className={cn("bg-[var(--vz-danger-soft)] flex w-full items-start gap-3 border border-[var(--vz-danger-line)] text-left transition hover:shadow-sm", compact ? "rounded-[18px] px-3 py-3" : "rounded-2xl px-4 py-4")}
                                            >
<div className={cn("grid shrink-0 place-items-center bg-[var(--vz-surface)] text-[var(--vz-danger)] shadow-sm", compact ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl")}>
                                                    <Ban className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="font-semibold text-[var(--vz-text)]">
                                                            {block.reason || "Փակ է"}
                                                        </div>
                                                        <span className="rounded-full border border-[var(--vz-danger-line)] bg-[var(--vz-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--vz-danger)]">
                                                            Block
                                                        </span>
                                                    </div>

                                                    <div className="mt-1 text-sm text-[var(--vz-text-secondary)]">
                                                        {block.starts_at.slice(11, 16)} – {block.ends_at.slice(11, 16)}
                                                    </div>

{!compact ? <div className="mt-2 text-xs text-[var(--vz-muted)]">Tap արա՝ block-ը ջնջելու համար</div> : null}
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
                                                    "flex w-full items-start gap-3 border text-left shadow-sm transition hover:shadow-md",
                                                    compact ? "rounded-[18px] px-3 py-3" : "rounded-2xl px-4 py-4",
                                                    bookingUi?.card
                                                )}
                                            >
<div className={cn("grid shrink-0 place-items-center bg-[var(--vz-surface)] text-[var(--vz-text-secondary)] shadow-sm", compact ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl")}>
                                                    <Clock3 className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={cn("h-2.5 w-2.5 rounded-full", bookingUi?.dot)} />
                                                        <div className="truncate font-semibold text-[var(--vz-text)]">
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

<div className={cn("mt-2 flex flex-wrap text-[var(--vz-text-secondary)]", compact ? "gap-x-3 gap-y-1 text-[12px]" : "gap-x-4 gap-y-2 text-sm")}>
                                                        <div className="inline-flex items-center gap-2">
                                                            <Clock3 className="h-3.5 w-3.5 text-[var(--vz-muted)]" />
                                                            {booking.starts_at.slice(11, 16)} – {booking.ends_at.slice(11, 16)}
                                                        </div>

                                                        <div className="inline-flex items-center gap-2">
                                                            <Scissors className="h-3.5 w-3.5 text-[var(--vz-muted)]" />
                                                            {serviceName(booking.service_id)}
                                                        </div>

                                                        {booking.staff_id ? (
                                                            <div className="inline-flex items-center gap-2">
                                                                <User className="h-3.5 w-3.5 text-[var(--vz-muted)]" />
                                                                {staffName(booking.staff_id)}
                                                            </div>
                                                        ) : null}

{!compact ? <div className="inline-flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[var(--vz-muted)]" />{booking.client_phone}</div> : null}
                                                    </div>

{!compact && (!canSeeAll && booking.staff_id ? null : (booking.notes ? <div className="mt-2 line-clamp-2 text-xs text-[var(--vz-muted)]">{booking.notes}</div> : null))}
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