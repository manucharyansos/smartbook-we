import type { ReactNode } from "react";

export function CreateField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block text-sm text-[var(--vz-text-secondary)]">
            <div className="mb-2 font-medium text-[var(--vz-text-secondary)]">{label}</div>
            {children}
        </label>
    );
}
