import { Sparkles } from "lucide-react";
import type { Slot } from "../../lib/availabilityApi";
import { cn } from "../../lib/cn";

export function SmartSlotPicker({
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
        <div className="rounded-[28px] border border-[var(--vz-success-line)] bg-[var(--vz-primary)] from-emerald-50 via-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--vz-success)]">
                <Sparkles className="h-4 w-4" />
                Խելացի առաջարկներ
            </div>
            <div className="mt-1 text-sm leading-6 text-[var(--vz-text-secondary)]">
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
                                    ? "border-[var(--vz-success-line)] bg-[var(--vz-success-soft)] shadow-sm"
                                    : "border-white/80 bg-[var(--vz-surface)] hover:border-[var(--vz-success-line)] hover:bg-[var(--vz-surface)]"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-[var(--vz-text)]">
                                    {slot.starts_at.slice(11, 16)}
                                    {showStaff && slot.staff_name ? ` · ${slot.staff_name}` : ""}
                                </div>
                                <span className="rounded-full bg-[var(--vz-success)] px-2 py-0.5 text-[11px] font-semibold text-[var(--vz-text)]">
                                    #{slot.recommendation_rank ?? "★"}
                                </span>
                            </div>
                            <div className="mt-1 text-xs text-[var(--vz-muted)]">{slot.smart_reason || "Առաջարկվող slot"}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
