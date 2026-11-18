import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ReviewState } from "@/lib/publicApi";
import ReviewForm from "./ReviewForm";
import { StarRow } from "./Stars";
import { reviewCopy } from "./reviewCopy";

/** Review block under a visit in the client cabinet: the client's rating, or a button to rate the visit. */
export default function CabinetReview({ bookingId, state }: { bookingId: number; state?: ReviewState | null }) {
    const { locale } = useLanguage();
    const t = reviewCopy[locale];
    const qc = useQueryClient();
    const [open, setOpen] = useState(false);
    if (!state) return null;

    if (state.review) {
        return (
            <div className="mt-3 rounded-2xl bg-[var(--vz-surface-2)] px-3 py-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--vz-muted)]">{t.yourRating}: <StarRow value={state.review.rating} /></div>
                {state.review.comment ? <p className="mt-1 text-[var(--vz-text-secondary)]">{state.review.comment}</p> : null}
                {state.review.reply ? <p className="mt-1 text-[var(--vz-text-secondary)]"><b>{t.reply}:</b> {state.review.reply}</p> : null}
            </div>
        );
    }
    if (!state.eligible) return null;

    return open ? (
        <div className="mt-3 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] p-4">
            <ReviewForm
                onSubmit={(payload) => api.post(`/client/cabinet/bookings/${bookingId}/review`, payload)}
                onDone={() => { setOpen(false); void qc.invalidateQueries({ queryKey: ["client-cabinet"] }); }}
            />
        </div>
    ) : (
        <button type="button" onClick={() => setOpen(true)}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--vz-primary)] px-4 text-sm font-semibold text-[var(--vz-on-primary)]">
            <Star className="h-4 w-4" /> {t.rateVisit}
        </button>
    );
}
