import { Ban, CalendarDays, ChevronLeft, ChevronRight, Crown, Filter, Plus, User } from "lucide-react";
import type { StaffUser } from "../../lib/staffApi";
import { cn } from "../../lib/cn";
import type { ViewMode } from "./types";
import { initials, ymd, weekdayShort } from "./utils";

export function CalendarHeader({
    viewMode,
    onChangeViewMode,
    onOpenFilters,
    onPrev,
    onNext,
    canManageBlocks,
    onOpenBlock,
    onOpenCreateNow,
    rangeLabel,
    isStaff,
    visibleStaff,
    datePick,
    onJumpToPickedDate,
    isMobile,
    weekDays,
}: {
    viewMode: ViewMode;
    onChangeViewMode: (mode: ViewMode) => void;
    onOpenFilters: () => void;
    onPrev: () => void;
    onNext: () => void;
    canManageBlocks: boolean;
    onOpenBlock: () => void;
    onOpenCreateNow: () => void;
    rangeLabel: string;
    isStaff: boolean;
    visibleStaff: StaffUser[];
    datePick: string;
    onJumpToPickedDate: (value: string) => void;
    isMobile: boolean;
    weekDays: Date[];
}) {
    return (
        <div className="overflow-hidden rounded-[24px] border border-[#e7dfd6] bg-white shadow-[0_14px_38px_rgba(15,23,42,0.06)] sm:rounded-[30px]">
            <div className="space-y-3 bg-[#fcfbf8] p-3 sm:space-y-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#24364b] text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl"><CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                        <div className="min-w-0"><div className="hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 sm:block">VIZIT</div><h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:mt-1 sm:text-2xl">Օրացույց</h1></div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                        <div className="inline-flex h-9 items-center rounded-xl border border-[#e7dfd6] bg-white p-0.5 shadow-sm">
                            {[{ key: "day", label: "Օր" }, { key: "week", label: "Շաբաթ" }].map((item) => <button key={item.key} type="button" onClick={() => onChangeViewMode(item.key as ViewMode)} className={cn("inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium transition sm:px-3 sm:text-sm", viewMode === item.key ? "bg-[#24364b] text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700")}>{item.label}</button>)}
                        </div>
                        <button type="button" onClick={onOpenFilters} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7dfd6] bg-white shadow-sm transition hover:bg-slate-50 sm:w-auto sm:px-3" title="Ֆիլտրեր"><Filter className="h-4 w-4 shrink-0 text-slate-600" /><span className="hidden text-sm font-medium text-slate-700 sm:ml-1.5 sm:inline">Ֆիլտրեր</span></button>
                        <div className="inline-flex h-9 items-center rounded-xl border border-[#e7dfd6] bg-white p-0.5 shadow-sm"><button type="button" onClick={onPrev} className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100" title="Նախորդ"><ChevronLeft className="h-4 w-4 text-slate-600" /></button><button type="button" onClick={onNext} className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100" title="Հաջորդ"><ChevronRight className="h-4 w-4 text-slate-600" /></button></div>
                        {canManageBlocks ? <button type="button" onClick={onOpenBlock} className="hidden sm:inline-flex h-9 items-center gap-2 rounded-xl border border-[#e7dfd6] bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"><Ban className="h-4 w-4" /><span>Block</span></button> : null}
                        <button type="button" onClick={onOpenCreateNow} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#24364b] px-2.5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(36,54,75,0.18)] transition hover:bg-[#1d2b3c] sm:gap-2 sm:px-4"><Plus className="h-4 w-4 shrink-0" /><span className="hidden sm:inline">Նոր ամրագրում</span><span className="sm:hidden">Նոր</span></button>
                    </div>
                </div>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="inline-flex h-10 items-center rounded-2xl border border-[#e7dfd6] bg-white px-4 text-sm text-slate-600 shadow-sm"><span className="font-semibold text-slate-900">{viewMode === "day" ? "Օր" : "Շաբաթ"}</span><span className="mx-2 text-slate-300">•</span><span className="truncate">{rangeLabel}</span></div>
                        {isStaff ? <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[#ddd2f6] bg-[#f0ebfa] px-3 text-xs font-semibold text-[#6346a8]"><User className="h-3.5 w-3.5" /> միայն քո ամրագրումները</div> : <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e7dfd6] bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm"><Crown className="h-3.5 w-3.5 text-violet-600" /> բոլոր աշխատակիցները</div>}
                        <div className="hidden items-center gap-2 lg:flex">{visibleStaff.slice(0, 3).map((member) => <div key={member.id} className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e7dfd6] bg-white px-2.5 text-xs text-slate-600 shadow-sm"><div className="grid h-6 w-6 place-items-center overflow-hidden rounded-full border border-[#e7dfd6] bg-[#f7f3ee] text-[10px] font-semibold text-slate-700">{member.avatar_url ? <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" /> : initials(member.name)}</div><span className="max-w-[92px] truncate">{member.name}</span></div>)}{visibleStaff.length > 3 ? <div className="inline-flex h-10 items-center rounded-full border border-[#e7dfd6] bg-white px-3 text-xs font-semibold text-slate-500 shadow-sm">+{visibleStaff.length - 3}</div> : null}</div>
                    </div>
                    <div className="flex items-center gap-2 self-start lg:self-auto"><label className="hidden text-sm font-medium text-slate-600 sm:block">Jump to</label><input type="date" value={datePick} onChange={(e) => onJumpToPickedDate(e.target.value)} className="h-10 rounded-2xl border border-[#e7dfd6] bg-white px-4 text-sm shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" /></div>
                </div>
                {isMobile ? <div className="mt-1 -mx-1 overflow-x-auto"><div className="flex min-w-max gap-2 px-1 pb-1">{weekDays.map((day) => { const active = ymd(day) === datePick; return <button key={ymd(day)} type="button" onClick={() => onJumpToPickedDate(ymd(day))} className={cn("min-w-[82px] rounded-[18px] border px-4 py-3 text-center transition", active ? "border-[#24364b] bg-[#24364b] text-white shadow-sm" : "border-[#e7dfd6] bg-white text-slate-700")}><div className="text-[11px] font-medium opacity-80">{weekdayShort(day)}</div><div className="mt-1 text-lg font-semibold">{String(day.getDate()).padStart(2, "0")}</div></button>; })}</div></div> : null}
            </div>
        </div>
    );
}
