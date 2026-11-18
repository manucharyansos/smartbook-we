import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, MessageSquareQuote, Reply } from "lucide-react";
import { PageHero } from "../components/ui/PageHero";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";
import { RatingBadge, StarRow } from "../components/reviews/Stars";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/http";
import { cn } from "../lib/cn";
import type { PublicReview, RatingSummary } from "../lib/publicApi";

type BusinessReview = PublicReview & { visit_at: string | null; reported_at: string | null; report_reason: string | null; hidden: boolean };
type ReviewsPage = { data: BusinessReview[]; meta: { total: number; current_page: number; last_page: number; summary: RatingSummary; min_public_count: number } };

const copy: Record<Locale, Record<string, string>> = {
    hy: {
        eyebrow: "Հաճախորդներ", title: "Կարծիքներ", intro: "Հաճախորդը կարող է կարծիք թողնել միայն ավարտված այցից հետո։ Կարծիքը ջնջել կամ թաքցնել հնարավոր չէ․ կարող եք պատասխանել հրապարակայնորեն կամ բողոքել, եթե կարծիքը անպատշաճ է։",
        all: "Բոլորը", unanswered: "Անպատասխան", empty: "Դեռ կարծիք չկա։", reply: "Պատասխանել", editReply: "Փոխել պատասխանը", yourReply: "Ձեր պատասխանը", save: "Հրապարակել պատասխանը",
        removeReply: "Հեռացնել պատասխանը", cancel: "Չեղարկել", report: "Բողոքել", reportReason: "Ինչո՞ւ է կարծիքն անպատշաճ", sendReport: "Ուղարկել բողոքը",
        reported: "Բողոքն ուղարկված է Vizit-ին", hidden: "Թաքցված է Vizit-ի կողմից", saved: "Պահպանվեց", failed: "Չհաջողվեց պահպանել", visit: "Այց",
        minNote: "Միջին գնահատականը հանրային էջում երևում է {n} կարծիքից սկսած։", prev: "Նախորդ էջ", next: "Հաջորդ էջ",
    },
    ru: {
        eyebrow: "Клиенты", title: "Отзывы", intro: "Клиент может оставить отзыв только после завершённого визита. Отзыв нельзя удалить или скрыть: можно публично ответить или пожаловаться, если отзыв недопустимый.",
        all: "Все", unanswered: "Без ответа", empty: "Отзывов пока нет.", reply: "Ответить", editReply: "Изменить ответ", yourReply: "Ваш ответ", save: "Опубликовать ответ",
        removeReply: "Удалить ответ", cancel: "Отменить", report: "Пожаловаться", reportReason: "Почему отзыв недопустимый", sendReport: "Отправить жалобу",
        reported: "Жалоба отправлена в Vizit", hidden: "Скрыт Vizit", saved: "Сохранено", failed: "Не удалось сохранить", visit: "Визит",
        minNote: "Средняя оценка видна на публичной странице начиная с {n} отзывов.", prev: "Предыдущая страница", next: "Следующая страница",
    },
    en: {
        eyebrow: "Clients", title: "Reviews", intro: "Clients can review only after a finished visit. Reviews cannot be deleted or hidden: you can reply publicly, or report a review that breaks the rules.",
        all: "All", unanswered: "Unanswered", empty: "No reviews yet.", reply: "Reply", editReply: "Edit reply", yourReply: "Your reply", save: "Publish reply",
        removeReply: "Remove reply", cancel: "Cancel", report: "Report", reportReason: "Why is this review inappropriate", sendReport: "Send report",
        reported: "Reported to Vizit", hidden: "Hidden by Vizit", saved: "Saved", failed: "Could not save", visit: "Visit",
        minNote: "The average rating shows on the public page from {n} reviews.", prev: "Previous page", next: "Next page",
    },
};

const fieldClass = "mt-1 w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 py-2 text-sm text-[var(--vz-text)] outline-none focus:border-[var(--vz-primary)]";

export default function Reviews() {
    const { locale } = useLanguage();
    const t = copy[locale];
    const qc = useQueryClient();
    const [unanswered, setUnanswered] = useState(false);
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState<{ id: number; mode: "reply" | "report"; text: string } | null>(null);
    const [toast, setToast] = useState<{ open: boolean; text: string; type: "success" | "error" }>({ open: false, text: "", type: "success" });
    const notify = (text: string, type: "success" | "error" = "success") => {
        setToast({ open: true, text, type });
        window.setTimeout(() => setToast((old) => ({ ...old, open: false })), 2600);
    };

    const reviewsQ = useQuery({
        queryKey: ["business-reviews", unanswered, page],
        queryFn: async () => (await api.get<ReviewsPage>("/reviews", { params: { unanswered: unanswered ? 1 : undefined, page } })).data,
        placeholderData: keepPreviousData,
    });
    const save = useMutation({
        mutationFn: async ({ id, mode, text }: { id: number; mode: "reply" | "report"; text: string }) => mode === "reply"
            ? api.put(`/reviews/${id}/reply`, { reply: text.trim() || null })
            : api.post(`/reviews/${id}/report`, { reason: text.trim() }),
        onSuccess: (_, vars) => {
            setEditing(null);
            notify(vars.mode === "report" ? t.reported : t.saved);
            void qc.invalidateQueries({ queryKey: ["business-reviews"] });
            void qc.invalidateQueries({ queryKey: ["public-reviews"] });
        },
        onError: (error) => notify(getErrorMessage(error, t.failed), "error"),
    });

    const data = reviewsQ.data;
    const items = data?.data ?? [];

    return (
        <div className="space-y-5 sm:space-y-6">
            <PageHero eyebrow={<><MessageSquareQuote className="h-4 w-4" /> {t.eyebrow}</>} title={t.title} description={t.intro}
                actions={data ? <RatingBadge rating={data.meta.summary} /> : null} />
            {data && !data.meta.summary.shown ? <p className="text-sm text-[var(--vz-muted)]">{t.minNote.replace("{n}", String(data.meta.min_public_count))}</p> : null}

            <div className="flex gap-2" role="group">
                {[false, true].map((value) => (
                    <button key={String(value)} type="button" aria-pressed={unanswered === value} onClick={() => { setUnanswered(value); setPage(1); }}
                        className={cn("min-h-11 rounded-xl border px-4 text-sm font-semibold", unanswered === value ? "border-[var(--vz-primary)] bg-[var(--vz-primary)] text-[var(--vz-on-primary)]" : "border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)]")}>
                        {value ? t.unanswered : t.all}
                    </button>
                ))}
            </div>

            {reviewsQ.isPending ? <div className="h-40 animate-pulse rounded-[22px] bg-[var(--vz-surface-2)]" /> : !items.length ? (
                <Card className="p-8 text-center text-sm text-[var(--vz-muted)]">{t.empty}</Card>
            ) : (
                <div className="space-y-3">
                    {items.map((review) => (
                        <Card key={review.id} className={cn("p-4 sm:p-5", review.hidden && "opacity-60")}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="font-semibold text-[var(--vz-text)]">{review.author_name}</div>
                                    <div className="mt-0.5 text-xs text-[var(--vz-muted)]">
                                        {[review.service?.name, review.staff?.name].filter(Boolean).join(" · ")}
                                        {review.visit_at ? ` · ${t.visit}: ${new Date(review.visit_at).toLocaleDateString(locale === "hy" ? "hy-AM" : locale)}` : ""}
                                    </div>
                                </div>
                                <StarRow value={review.rating} />
                            </div>
                            {review.comment ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--vz-text-secondary)]">{review.comment}</p> : null}
                            {review.hidden ? <p className="mt-2 text-xs font-semibold text-[var(--vz-danger)]">{t.hidden}</p> : review.reported_at ? <p className="mt-2 text-xs font-semibold text-[var(--vz-warning)]">{t.reported}</p> : null}
                            {review.reply && editing?.id !== review.id ? (
                                <div className="mt-3 rounded-xl border-l-4 border-[var(--vz-primary)] bg-[var(--vz-surface-2)] px-3 py-2 text-sm">
                                    <div className="text-xs font-semibold text-[var(--vz-muted)]">{t.yourReply}</div>
                                    <p className="mt-1 whitespace-pre-line">{review.reply}</p>
                                </div>
                            ) : null}

                            {editing?.id === review.id ? (
                                <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
                                    <label className="block text-sm font-medium text-[var(--vz-text-secondary)]">
                                        {editing.mode === "reply" ? t.yourReply : t.reportReason}
                                        <textarea className={fieldClass} rows={3} maxLength={editing.mode === "reply" ? 1000 : 500} value={editing.text}
                                            onChange={(e) => setEditing({ ...editing, text: e.target.value })} required={editing.mode === "report"} minLength={editing.mode === "report" ? 5 : undefined} />
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="submit" size="sm" loading={save.isPending}>{editing.mode === "reply" ? t.save : t.sendReport}</Button>
                                        {editing.mode === "reply" && review.reply ? <Button type="button" size="sm" variant="secondary" onClick={() => save.mutate({ ...editing, text: "" })}>{t.removeReply}</Button> : null}
                                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>{t.cancel}</Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Button type="button" size="sm" variant="secondary" onClick={() => setEditing({ id: review.id, mode: "reply", text: review.reply ?? "" })}>
                                        <Reply className="h-4 w-4" /> {review.reply ? t.editReply : t.reply}
                                    </Button>
                                    {!review.reported_at && !review.hidden ? (
                                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing({ id: review.id, mode: "report", text: "" })}>
                                            <Flag className="h-4 w-4" /> {t.report}
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
            {data && data.meta.last_page > 1 ? (
                <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>{t.prev}</Button>
                    <span className="text-sm text-[var(--vz-muted)]">{data.meta.current_page}/{data.meta.last_page}</span>
                    <Button type="button" variant="secondary" size="sm" disabled={page >= data.meta.last_page} onClick={() => setPage((n) => n + 1)}>{t.next}</Button>
                </div>
            ) : null}
            <Toast open={toast.open} text={toast.text} type={toast.type} />
        </div>
    );
}
