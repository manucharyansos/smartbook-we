import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MessageSquareQuote } from "lucide-react";
import { fetchPublicReviews, type PublicStaff, type RatingSummary } from "@/lib/publicApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import { RatingBadge, StarRow } from "./Stars";
import { reviewCopy } from "./reviewCopy";

/** Public reviews on the business page, with a filter by specialist. */
export default function ReviewsSection({ slug, summary, staff }: { slug: string; summary?: RatingSummary; staff: PublicStaff[] }) {
    const { locale } = useLanguage();
    const t = reviewCopy[locale];
    const [staffId, setStaffId] = useState<number | null>(null);
    const [pages, setPages] = useState(1);
    const reviewsQ = useQuery({
        queryKey: ["public-reviews", slug, staffId ?? 0, pages],
        queryFn: async () => {
            const results = await Promise.all(Array.from({ length: pages }, (_, n) => fetchPublicReviews(slug, { ...(staffId ? { staff_id: staffId } : {}), page: n + 1 })));
            return { items: results.flatMap((r) => r.items), lastPage: results[0]?.lastPage ?? 1 };
        },
        enabled: Boolean(slug && summary?.count),
        placeholderData: keepPreviousData,
    });
    if (!summary?.count) return null;
    const reviewed = staff.filter((person) => (person.rating?.count ?? 0) > 0);
    const items = reviewsQ.data?.items ?? [];

    return (
        <section id="reviews" aria-labelledby="reviews-title" className="vizit-profile-section scroll-mt-24 rounded-[32px] border border-white/70 bg-[var(--vz-surface)] p-5 shadow-sm dark:border-white/10 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="vizit-profile-section-badge inline-flex items-center gap-2 rounded-xl border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--vz-brand-text)]">
                    <MessageSquareQuote className="h-4 w-4" />
                    <h2 id="reviews-title">{t.reviews}</h2>
                </div>
                <RatingBadge rating={summary} />
            </div>

            {reviewed.length ? (
                <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={t.specialist}>
                    {[{ id: null as number | null, name: t.all }, ...reviewed.map((p) => ({ id: p.id as number | null, name: p.name }))].map((chip) => (
                        <button key={chip.id ?? "all"} type="button" aria-pressed={staffId === chip.id} onClick={() => { setStaffId(chip.id); setPages(1); }}
                            className={cn("inline-flex min-h-10 items-center rounded-xl border px-3 text-sm font-medium transition",
                                staffId === chip.id ? "border-[var(--vz-primary)] bg-[var(--vz-primary)] text-[var(--vz-on-primary)]" : "border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)]")}>
                            {chip.name}
                        </button>
                    ))}
                </div>
            ) : null}

            {!items.length && !reviewsQ.isPending ? <p className="mt-6 text-sm text-[var(--vz-muted)]">{t.empty}</p> : null}
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {items.map((review) => (
                    <li key={review.id} className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="font-semibold text-[var(--vz-text)]">{review.author_name}</div>
                                <div className="mt-0.5 text-xs text-[var(--vz-muted)]">{[review.service?.name, review.staff?.name].filter(Boolean).join(" · ")}</div>
                            </div>
                            <div className="text-right">
                                <StarRow value={review.rating} />
                                {review.created_at ? <div className="mt-1 text-xs text-[var(--vz-muted)]">{new Date(review.created_at).toLocaleDateString(locale === "hy" ? "hy-AM" : locale)}</div> : null}
                            </div>
                        </div>
                        <span className="sr-only">{t.starLabel(review.rating)}</span>
                        {review.comment ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--vz-text-secondary)]">{review.comment}</p> : null}
                        {review.reply ? (
                            <div className="mt-3 rounded-xl border-l-4 border-[var(--vz-primary)] bg-[var(--vz-surface)] px-3 py-2 text-sm">
                                <div className="text-xs font-semibold text-[var(--vz-muted)]">{t.reply}</div>
                                <p className="mt-1 whitespace-pre-line text-[var(--vz-text-secondary)]">{review.reply}</p>
                            </div>
                        ) : null}
                    </li>
                ))}
            </ul>
            {pages < (reviewsQ.data?.lastPage ?? 1) ? (
                <button type="button" onClick={() => setPages((n) => n + 1)} disabled={reviewsQ.isFetching}
                    className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-5 text-sm font-semibold hover:bg-[var(--vz-surface-2)] disabled:opacity-60">
                    {t.more}
                </button>
            ) : null}
        </section>
    );
}
