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
        <div className="overflow-hidden rounded-[24px] border border-[var(--vz-line)] bg-[var(--vz-surface)] shadow-[0_14px_38px_rgba(15,23,42,0.06)] sm:rounded-[30px]">
            <div className="space-y-3 bg-[var(--vz-surface-2)] p-3 sm:space-y-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--vz-primary)] text-[var(--vz-on-primary)] shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl"><CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                        <div className="min-w-0"><div className="hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--vz-muted)] sm:block">VIZIT</div><h1 className="truncate text-lg font-semibold tracking-tight text-[var(--vz-text)] sm:mt-1 sm:text-2xl">Օրացույց</h1></div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                        <div className="inline-flex h-9 items-center rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] p-0.5 shadow-sm">
                            {[{ key: "day", label: "Օր" }, { key: "week", label: "Շաբաթ" }].map((item) => <button key={item.key} type="button" onClick={() => onChangeViewMode(item.key as ViewMode)} className={cn("inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium transition sm:px-3 sm:text-sm", viewMode === item.key ? "bg-[var(--vz-primary)] text-[var(--vz-on-primary)]" : "text-[var(--vz-muted)] hover:bg-[var(--vz-surface-2)] hover:text-[var(--vz-text-secondary)]")}>{item.label}</button>)}
                        </div>
                        <button type="button" onClick={onOpenFilters} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] shadow-sm transition hover:bg-[var(--vz-surface-2)] sm:w-auto sm:px-3" title="Ֆիլտրեր"><Filter className="h-4 w-4 shrink-0 text-[var(--vz-text-secondary)]" /><span className="hidden text-sm font-medium text-[var(--vz-text-secondary)] sm:ml-1.5 sm:inline">Ֆիլտրեր</span></button>
                        <div className="inline-flex h-9 items-center rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] p-0.5 shadow-sm"><button type="button" onClick={onPrev} className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--vz-surface-2)]" title="Նախորդ"><ChevronLeft className="h-4 w-4 text-[var(--vz-text-secondary)]" /></button><button type="button" onClick={onNext} className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--vz-surface-2)]" title="Հաջորդ"><ChevronRight className="h-4 w-4 text-[var(--vz-text-secondary)]" /></button></div>
                        {canManageBlocks ? <button type="button" onClick={onOpenBlock} className="hidden sm:inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 text-sm font-medium text-[var(--vz-text-secondary)] shadow-sm transition hover:bg-[var(--vz-surface-2)]"><Ban className="h-4 w-4" /><span>Block</span></button> : null}
                        <button type="button" onClick={onOpenCreateNow} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--vz-primary)] px-2.5 text-sm font-medium text-[var(--vz-on-primary)] shadow-[0_10px_24px_rgba(36,54,75,0.18)] transition hover:bg-[var(--vz-primary-hover)] sm:gap-2 sm:px-4"><Plus className="h-4 w-4 shrink-0" /><span className="hidden sm:inline">Նոր ամրագրում</span><span className="sm:hidden">Նոր</span></button>
                    </div>
                </div>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="inline-flex h-10 items-center rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 text-sm text-[var(--vz-text-secondary)] shadow-sm"><span className="font-semibold text-[var(--vz-text)]">{viewMode === "day" ? "Օր" : "Շաբաթ"}</span><span className="mx-2 text-[var(--vz-line-strong)]">•</span><span className="truncate">{rangeLabel}</span></div>
                        {isStaff ? <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 text-xs font-semibold text-[var(--vz-accent-text)]"><User className="h-3.5 w-3.5" /> միայն քո ամրագրումները</div> : <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 text-xs font-semibold text-[var(--vz-text-secondary)] shadow-sm"><Crown className="h-3.5 w-3.5 text-[var(--vz-accent-text)]" /> բոլոր աշխատակիցները</div>}
                        <div className="hidden items-center gap-2 lg:flex">{visibleStaff.slice(0, 3).map((member) => <div key={member.id} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface)] px-2.5 text-xs text-[var(--vz-text-secondary)] shadow-sm"><div className="grid h-6 w-6 place-items-center overflow-hidden rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[10px] font-semibold text-[var(--vz-text-secondary)]">{member.avatar_url ? <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" /> : initials(member.name)}</div><span className="max-w-[92px] truncate">{member.name}</span></div>)}{visibleStaff.length > 3 ? <div className="inline-flex h-10 items-center rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 text-xs font-semibold text-[var(--vz-muted)] shadow-sm">+{visibleStaff.length - 3}</div> : null}</div>
                    </div>
                    <div className="flex items-center gap-2 self-start lg:self-auto"><label className="hidden text-sm font-medium text-[var(--vz-text-secondary)] sm:block">Jump to</label><input type="date" value={datePick} onChange={(e) => onJumpToPickedDate(e.target.value)} className="h-10 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 text-sm shadow-sm outline-none transition focus:border-[var(--vz-primary)] focus:ring-4 focus:ring-[var(--vz-focus)]" /></div>
                </div>
                {isMobile ? <div className="mt-1 -mx-1 overflow-x-auto"><div className="flex min-w-max gap-2 px-1 pb-1">{weekDays.map((day) => { const active = ymd(day) === datePick; return <button key={ymd(day)} type="button" onClick={() => onJumpToPickedDate(ymd(day))} className={cn("min-w-[82px] rounded-[18px] border px-4 py-3 text-center transition", active ? "border-[#24364b] bg-[var(--vz-primary)] text-[var(--vz-on-primary)] shadow-sm" : "border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)]")}><div className="text-[11px] font-medium opacity-80">{weekdayShort(day)}</div><div className="mt-1 text-lg font-semibold">{String(day.getDate()).padStart(2, "0")}</div></button>; })}</div></div> : null}
            </div>
        </div>
    );
}
