import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function ModeCard({
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
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-500">{description}</div>
                </div>
            </div>
        </button>
    );
}
