import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHero({ eyebrow, title, description, actions, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "bb-surface bb-surface-soft rounded-[32px] p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {eyebrow ? <div className="bb-eyebrow">{eyebrow}</div> : null}
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
