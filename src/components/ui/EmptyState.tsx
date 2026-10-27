import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("bb-surface rounded-[28px] p-8 text-center", className)}>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--vz-surface-2)] text-[var(--vz-muted)]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--vz-text)]">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--vz-muted)]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
