import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/contexts/LanguageContext";
import { reviewCopy } from "./reviewCopy";
import type { RatingSummary } from "@/lib/publicApi";

export function StarRow({ value, size = "h-4 w-4", className }: { value: number; size?: string; className?: string }) {
    return (
        <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-[var(--vz-line-strong)]")} />
            ))}
        </span>
    );
}

/** "★ 4.6 · 12 reviews", or "New" until the business has enough reviews for a public average. */
export function RatingBadge({ rating, className }: { rating?: RatingSummary | null; className?: string }) {
    const { locale } = useLanguage();
    const t = reviewCopy[locale];
    const count = rating?.count ?? 0;
    if (rating?.average != null) {
        return (
            <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--vz-text)]", className)} aria-label={`${t.rating}: ${rating.average} / 5, ${t.reviewsCount(count)}`}>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                {rating.average.toFixed(1)}
                <span className="font-normal text-[var(--vz-muted)]">· {t.reviewsCount(count)}</span>
            </span>
        );
    }

    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-lg bg-[var(--vz-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--vz-accent-text)]", className)}>
            {t.newBusiness}{count ? <span className="font-normal">· {t.reviewsCount(count)}</span> : null}
        </span>
    );
}

export function StarInput({ value, onChange, disabled }: { value: number; onChange: (value: number) => void; disabled?: boolean }) {
    const { locale } = useLanguage();
    const t = reviewCopy[locale];
    return (
        <div role="radiogroup" aria-label={t.yourRating} className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={t.starLabel(n)} disabled={disabled}
                    onClick={() => onChange(n)}
                    className="grid h-11 w-11 place-items-center rounded-xl transition hover:bg-[var(--vz-surface-2)] disabled:cursor-not-allowed">
                    <Star className={cn("h-8 w-8", n <= value ? "fill-amber-400 text-amber-400" : "text-[var(--vz-line-strong)]")} />
                </button>
            ))}
        </div>
    );
}
