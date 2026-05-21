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
