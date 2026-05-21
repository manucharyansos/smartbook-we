import type { ReactNode } from "react";

export function CreateField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block text-sm text-slate-600">
            <div className="mb-2 font-medium text-slate-600">{label}</div>
            {children}
        </label>
    );
}
