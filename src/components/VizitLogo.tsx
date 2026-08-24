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
            d="M24 41 8.7 25.5C2.3 19 6.8 8.2 15.7 8.2c3.7 0 6.8 1.7 8.3 4.7 1.6-3 4.7-4.7 8.4-4.7 8.8 0 13.3 10.8 6.9 17.3L24 41Z"
            stroke="currentColor"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m16.2 22.1 7.8 7.8 10.2-10.5"
            stroke="currentColor"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText ? <span className={cn("vizit-brand-text", textClassName)}>Vizit.am</span> : null}
    </span>
  );
}
