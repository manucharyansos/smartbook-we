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
        <svg viewBox="0 0 64 64" fill="none">
          <rect x="2" y="2" width="60" height="60" rx="16" fill="#378ADD" />
          <path d="M18 23.5h28v22a5.5 5.5 0 0 1-5.5 5.5h-17a5.5 5.5 0 0 1-5.5-5.5v-22Z" stroke="white" strokeWidth="4" strokeLinejoin="round" />
          <path d="M18 30h28M24 17v10M40 17v10" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <path d="m24.5 39 6.2 6.2L41 34" stroke="white" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showText ? <span className={cn("vizit-brand-text", textClassName)}>Vizit</span> : null}
    </span>
  );
}
