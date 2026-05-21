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
        "bb-surface bb-surface-soft rounded-[24px] p-4 shadow-sm sm:rounded-[32px] sm:p-6 lg:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? <div className="bb-eyebrow">{eyebrow}</div> : null}
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:mt-5 sm:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-3 sm:leading-7">{description}</p>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
