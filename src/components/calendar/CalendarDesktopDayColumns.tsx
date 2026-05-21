import { useMemo } from "react";
import { Users2 } from "lucide-react";

import { cn } from "../../lib/cn";
import type { Booking } from "../../lib/calendarApi";
import type { Block } from "../../lib/calendarBlocksApi";
import type { Service } from "../../lib/servicesApi";
import type { StaffUser } from "../../lib/staffApi";
import { bookingServiceTitle, bookingStatusLabel, eventColor, hmToMinutes, initials, minutesFromDate, parseLocalDateTime, staffAvatarName } from "./utils";

export function CalendarDesktopDayColumns({
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
    const timeMarks = useMemo(() => { const values: number[] = []; for (let mark = startMinutes; mark <= endMinutes; mark += 60) values.push(mark); return values; }, [startMinutes, endMinutes]);
    const slotMarks = useMemo(() => { const values: number[] = []; for (let mark = startMinutes; mark < endMinutes; mark += slotMinutes) values.push(mark); return values; }, [startMinutes, endMinutes, slotMinutes]);
    const dayBookings = useMemo(() => bookings.filter((booking) => booking.starts_at.slice(0, 10) === date), [bookings, date]);
    const dayBlocks = useMemo(() => blocks.filter((block) => block.starts_at.slice(0, 10) === date), [blocks, date]);
    const unassignedBookings = dayBookings.filter((booking) => !booking.staff_id);
    const columns = staff.length ? [...staff] : [];
    const showUnassigned = unassignedBookings.length > 0;
    const totalColumns = Math.max(columns.length + (showUnassigned ? 1 : 0), 1);

    return (
        <div className="overflow-hidden rounded-[30px] border border-[#e7dfd6] bg-white shadow-[0_16px_44px_rgba(15,23,42,0.07)]">
            <div className="border-b border-[#eee6dc] bg-[#fcfbf8] px-4 py-4 text-slate-900"><div className="flex items-center justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Electronic journal</div><div className="mt-1 text-lg font-semibold">{date}</div></div><div className="inline-flex items-center gap-2 rounded-full border border-[#e7dfd6] bg-white px-3 py-1.5 text-xs font-medium text-slate-500"><Users2 className="h-3.5 w-3.5" /> {dayBookings.length} այց</div></div></div>
            <div className="overflow-auto"><div className="min-w-[980px]">
                <div className="grid border-b border-[#eee6dc] bg-[#faf8f5]" style={{ gridTemplateColumns: `84px repeat(${totalColumns}, minmax(220px, 1fr))` }}>
                    <div className="border-r border-[#eee6dc] px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ժամ</div>
                    {showUnassigned ? <div className="flex items-center gap-3 border-r border-[#eee6dc] px-4 py-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e7dfd6] bg-white text-[11px] font-semibold text-slate-700">NA</div><div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-950">Առանց staff</div><div className="text-[11px] text-slate-500">{unassignedBookings.length} այց</div></div></div> : null}
                    {columns.map((member) => <div key={member.id} className="flex items-center gap-3 border-r border-[#eee6dc] px-4 py-3 last:border-r-0"><div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[#e7dfd6] bg-white text-sm font-semibold text-slate-700">{member.avatar_url ? <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" /> : initials(staffAvatarName(member.name))}</div><div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-950">{member.name}</div><div className="text-[11px] text-slate-500">{dayBookings.filter((booking) => booking.staff_id === member.id).length} այց</div></div></div>)}
                </div>
                <div className="grid" style={{ gridTemplateColumns: `84px repeat(${totalColumns}, minmax(220px, 1fr))` }}>
                    <div className="relative border-r border-[#eee6dc] bg-[#faf8f5]" style={{ height: bodyHeight }}>{timeMarks.map((mark) => <div key={mark} className="absolute inset-x-0" style={{ top: (mark - startMinutes) * pxPerMinute }}><div className="-translate-y-1/2 px-3 text-[11px] font-medium text-slate-400">{`${String(Math.floor(mark / 60)).padStart(2, "0")}:${String(mark % 60).padStart(2, "0")}`}</div></div>)}</div>
                    {[...(showUnassigned ? [{ id: -1, name: "Առանց staff", avatar_url: null } as unknown as StaffUser] : []), ...columns].map((member) => {
                        const memberId = (member as StaffUser).id === -1 ? null : (member as StaffUser).id;
                        const memberBookings = dayBookings.filter((booking) => memberId === null ? !booking.staff_id : booking.staff_id === memberId);
                        const memberBlocks = dayBlocks.filter((block) => memberId === null ? !block.staff_id : !block.staff_id || block.staff_id === memberId);
                        return <div key={memberId ?? "na"} className="relative border-r border-[#eee6dc] last:border-r-0 bg-white" style={{ height: bodyHeight }}>
                            {slotMarks.map((mark) => <button key={mark} type="button" onClick={() => onSelectSlot(date, `${String(Math.floor(mark / 60)).padStart(2, "0")}:${String(mark % 60).padStart(2, "0")}`)} className="absolute inset-x-0 z-0 border-t border-[#f1ece6] text-left transition hover:bg-[#f6f3ef]" style={{ top: (mark - startMinutes) * pxPerMinute, height: slotMinutes * pxPerMinute }} />)}
                            {memberBlocks.map((block) => { const startDate = parseLocalDateTime(block.starts_at); const endDate = parseLocalDateTime(block.ends_at); if (!startDate || !endDate) return null; const top = Math.max(0, (minutesFromDate(startDate) - startMinutes) * pxPerMinute); const height = Math.max(26, (minutesFromDate(endDate) - minutesFromDate(startDate)) * pxPerMinute); return <button key={`block-${block.id}`} type="button" onClick={() => onBlockClick(block)} className="absolute left-1.5 right-1.5 z-10 rounded-[16px] border border-[#efc0bf] bg-[#fae8e7] px-3 py-2 text-left text-xs font-semibold text-[#8f4a49]" style={{ top, height }}><div>{block.reason || "Փակ ժամ"}</div></button>; })}
                            {memberBookings.map((booking) => { const startDate = parseLocalDateTime(booking.starts_at); const endDate = parseLocalDateTime(booking.ends_at); if (!startDate || !endDate) return null; const top = Math.max(0, (minutesFromDate(startDate) - startMinutes) * pxPerMinute + 3); const height = Math.max(56, (minutesFromDate(endDate) - minutesFromDate(startDate)) * pxPerMinute - 6); const ui = eventColor(booking.status); return <button key={booking.id} type="button" onClick={() => onBookingClick(booking)} className={cn("absolute left-1.5 right-1.5 z-20 overflow-hidden rounded-[16px] border px-3 py-2 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)]", ui.outer)} style={{ top, height }}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{booking.starts_at.slice(11, 16)} – {booking.ends_at.slice(11, 16)}</div><div className="mt-1 truncate text-[12px] font-semibold text-slate-900">{booking.client_name}</div><div className="mt-0.5 truncate text-[11px] text-slate-600">{bookingServiceTitle(booking, serviceById)}</div></div><span className={cn("rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide", ui.badge)}>{bookingStatusLabel(booking.status)}</span></div>{booking.client_phone ? <div className="mt-2 truncate text-[10px] text-slate-500">{booking.client_phone}</div> : null}</button>; })}
                        </div>;
                    })}
                </div>
            </div></div>
        </div>
    );
}
