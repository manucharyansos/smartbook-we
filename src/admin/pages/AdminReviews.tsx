import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, MessageSquareWarning } from "lucide-react";
import { adminApi } from "../services/adminApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRow } from "@/components/reviews/Stars";
import { cn } from "@/lib/cn";
import type { PublicReview } from "@/lib/publicApi";

type ModeratedReview = PublicReview & { business: { id: number; name: string; slug: string } | null; reported_at: string | null; report_reason: string | null; hidden: boolean };
type Status = "reported" | "hidden" | "all";

const statusLabels: Record<Status, string> = { reported: "Բողոքարկված", hidden: "Թաքցված", all: "Բոլորը" };

/** Vizit super admin: reviews reported by businesses, hide or show them. */
export default function AdminReviews() {
    const qc = useQueryClient();
    const [status, setStatus] = useState<Status>("reported");
    const reviewsQ = useQuery({
        queryKey: ["admin-reviews", status],
        queryFn: async () => (await adminApi.get<{ data: ModeratedReview[] }>("/reviews", { params: { status } })).data.data,
    });
    const toggle = useMutation({
        mutationFn: ({ id, hidden }: { id: number; hidden: boolean }) => adminApi.patch(`/reviews/${id}`, { hidden }),
        onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
    });
    const items = reviewsQ.data ?? [];

    return (
        <div className="space-y-5">
            <PageHero eyebrow={<><MessageSquareWarning className="h-4 w-4" /> Մոդերացիա</>} title="Կարծիքներ"
                description="Բիզնեսների բողոքարկած կարծիքները։ Թաքցված կարծիքը չի երևում հանրային էջում և չի մտնում միջին գնահատականի մեջ։ «Ցույց տալ» կոճակը վերադարձնում է կարծիքը և փակում բողոքը։" />
            <div className="flex gap-2">
                {(Object.keys(statusLabels) as Status[]).map((key) => (
                    <button key={key} type="button" aria-pressed={status === key} onClick={() => setStatus(key)}
                        className={cn("min-h-11 rounded-xl border px-4 text-sm font-semibold", status === key ? "border-[var(--vz-primary)] bg-[var(--vz-primary)] text-[var(--vz-on-primary)]" : "border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)]")}>
                        {statusLabels[key]}
                    </button>
                ))}
            </div>
            {reviewsQ.isPending ? <div className="h-40 animate-pulse rounded-[22px] bg-[var(--vz-surface-2)]" /> : !items.length ? (
                <EmptyState icon={MessageSquareWarning} title="Այստեղ կարծիք չկա" description="Նոր բողոքներ չկան։" />
            ) : items.map((review) => (
                <Card key={review.id} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="font-semibold">{review.business?.name} · {review.author_name}</div>
                            <div className="text-xs text-[var(--vz-muted)]">{[review.service?.name, review.staff?.name].filter(Boolean).join(" · ")}</div>
                        </div>
                        <StarRow value={review.rating} />
                    </div>
                    {review.comment ? <p className="mt-3 whitespace-pre-line text-sm">{review.comment}</p> : null}
                    {review.report_reason ? <p className="mt-3 rounded-xl bg-[var(--vz-warning-soft)] px-3 py-2 text-sm"><b>Բողոքի պատճառը․</b> {review.report_reason}</p> : null}
                    <div className="mt-3">
                        {review.hidden ? (
                            <Button type="button" size="sm" variant="secondary" loading={toggle.isPending} onClick={() => toggle.mutate({ id: review.id, hidden: false })}><Eye className="h-4 w-4" /> Ցույց տալ</Button>
                        ) : (
                            <Button type="button" size="sm" variant="danger" loading={toggle.isPending} onClick={() => toggle.mutate({ id: review.id, hidden: true })}><EyeOff className="h-4 w-4" /> Թաքցնել</Button>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}
