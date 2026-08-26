import { cn } from "../lib/cn";

type VizitLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showText?: boolean;
};

export default function VizitLogo({
  className,
  markClassName,
  textClassName,
  showText = true,
}: VizitLogoProps) {
  return (
    <span className={cn("vizit-brand inline-flex items-center gap-2.5", className)}>
      <span className={cn("vizit-brand-mark inline-grid shrink-0 place-items-center", markClassName)} aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <path
            d="M13 10.5h22a7 7 0 0 1 7 7V35a7 7 0 0 1-7 7H13a7 7 0 0 1-7-7V17.5a7 7 0 0 1 7-7Z"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.8 20h34.4M16 6v8M32 6v8m-15 17 4.3 4.3L32 24.5"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText ? <span className={cn("vizit-brand-text", textClassName)}>Vizit</span> : null}
    </span>
  );
}
