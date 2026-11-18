import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Star } from "lucide-react";
import { PublicBusinessFooter, PublicBusinessHeader } from "../components/public/PublicBusinessChrome";
import Seo from "../components/Seo";
import ReviewForm from "../components/reviews/ReviewForm";
import { StarRow } from "../components/reviews/Stars";
import { reviewCopy } from "../components/reviews/reviewCopy";
import { useLanguage } from "../contexts/LanguageContext";
import { fetchBookingReview, submitBookingReview, type ReviewAccess } from "../lib/publicApi";

/**
 * /review/:code — opened from the booking page (?token=) or from the "rate your visit" email (?rt=).
 * ?booking_id= picks one visit of a multi-service booking.
 */
export default function ReviewVisit() {
    const { code = "" } = useParams();
    const [params] = useSearchParams();
    const { locale } = useLanguage();
    const t = reviewCopy[locale];
    const access: ReviewAccess = {
        token: params.get("token"),
        reviewToken: params.get("rt"),
        bookingId: Number(params.get("booking_id") || 0) || null,
    };
    const [submitted, setSubmitted] = useState(false);
    const contextQ = useQuery({
        queryKey: ["booking-review", code, access.bookingId, access.token, access.reviewToken],
        queryFn: () => fetchBookingReview(code, access),
        enabled: Boolean(code && (access.token || access.reviewToken)),
        retry: false,
    });
    const context = contextQ.data;
    const business = context?.booking.business;

    return (
        <div className="min-h-screen bg-[var(--vz-surface-2)] text-[var(--vz-text)]">
            <Seo title={`${t.pageTitle} | Vizit`} description={t.pageTitle} robots="noindex,nofollow" />
            <PublicBusinessHeader secondaryHref="/" secondaryLabel="Vizit" />
            <main className="mx-auto max-w-xl px-4 pb-16 pt-8 sm:px-6">
                <div className="rounded-[28px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-5 shadow-sm sm:p-7">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--vz-accent-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--vz-accent-text)]"><Star className="h-4 w-4" /> {t.reviews}</div>
                    <h1 className="mt-4 text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>

                    {contextQ.isLoading ? <div className="mt-6 h-40 animate-pulse rounded-2xl bg-[var(--vz-surface-2)]" /> : null}
                    {!contextQ.isLoading && (!context || contextQ.isError) ? <p role="alert" className="mt-6 text-sm text-[var(--vz-danger)]">{t.accessNeeded}</p> : null}

                    {context ? (
                        <>
                            <div className="mt-5 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4 text-sm">
                                <div className="font-semibold">{business?.name}</div>
                                <div className="mt-1 text-[var(--vz-text-secondary)]">
                                    {[context.booking.service?.name, context.booking.staff?.name].filter(Boolean).join(" · ")}
                                    {context.booking.starts_at ? ` · ${new Date(context.booking.starts_at).toLocaleDateString(locale === "hy" ? "hy-AM" : locale)}` : ""}
                                </div>
                            </div>
                            <div className="mt-6">
                                {submitted ? (
                                    <div role="status" className="rounded-2xl border border-[var(--vz-success-line)] bg-[var(--vz-success-soft)] p-4">
                                        <div className="flex items-center gap-2 font-semibold text-[var(--vz-success)]"><CheckCircle2 className="h-5 w-5" /> {t.thanks}</div>
                                        <p className="mt-1 text-sm text-[var(--vz-text-secondary)]">{t.thanksText}</p>
                                    </div>
                                ) : context.review ? (
                                    <div className="rounded-2xl border border-[var(--vz-line)] p-4">
                                        <div className="text-sm text-[var(--vz-muted)]">{t.yourRating}</div>
                                        <StarRow value={context.review.rating} size="h-5 w-5" className="mt-1" />
                                        {context.review.comment ? <p className="mt-2 text-sm">{context.review.comment}</p> : null}
                                        {context.review.reply ? <p className="mt-3 rounded-xl bg-[var(--vz-surface-2)] p-3 text-sm"><b>{t.reply}:</b> {context.review.reply}</p> : null}
                                    </div>
                                ) : context.eligible ? (
                                    <ReviewForm onSubmit={(payload) => submitBookingReview(code, access, payload)} onDone={() => { setSubmitted(true); void contextQ.refetch(); }} />
                                ) : (
                                    <p className="text-sm text-[var(--vz-text-secondary)]">{context.reason ? t.reasons[context.reason] : t.accessNeeded}</p>
                                )}
                            </div>
                            {business?.slug ? <Link to={`/businesses/${business.slug}#reviews`} className="mt-6 inline-flex text-sm font-semibold text-[var(--vz-accent-text)] hover:underline">{t.openBusiness}</Link> : null}
                        </>
                    ) : null}
                </div>
            </main>
            <PublicBusinessFooter compact />
        </div>
    );
}
