import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getErrorMessage } from "@/lib/http";
import { StarInput } from "./Stars";
import { reviewCopy } from "./reviewCopy";

/** Stars + optional comment. `onSubmit` sends it; errors are shown under the form. */
export default function ReviewForm({ onSubmit, onDone }: { onSubmit: (payload: { rating: number; comment: string | null }) => Promise<unknown>; onDone?: () => void }) {
    const { locale } = useLanguage();
    const t = reviewCopy[locale];
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!rating) return;
        setSending(true);
        setError("");
        try {
            await onSubmit({ rating, comment: comment.trim() || null });
            onDone?.();
        } catch (err) {
            setError(getErrorMessage(err, t.failed));
        } finally {
            setSending(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <StarInput value={rating} onChange={setRating} disabled={sending} />
            <label className="block text-sm font-medium text-[var(--vz-text-secondary)]">
                {t.comment}
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={4} placeholder={t.commentPlaceholder}
                    className="mt-1 w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 py-2 text-sm text-[var(--vz-text)] outline-none focus:border-[var(--vz-primary)]" />
            </label>
            {error ? <p role="alert" className="text-sm text-[var(--vz-danger)]">{error}</p> : null}
            <Button type="submit" disabled={!rating} loading={sending}><Send className="h-4 w-4" /> {sending ? t.sending : t.send}</Button>
        </form>
    );
}
