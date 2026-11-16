import { useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { fetchPublicPortfolio, type PublicPortfolioItem, type PublicService, type PublicStaff } from "@/lib/publicApi";
import { cn } from "@/lib/cn";
import type { Locale } from "@/contexts/LanguageContext";

export type PortfolioFilter = { staff_id?: number; service_id?: number };

const copy = {
    hy: {
        title: "Աշխատանքներ", subtitle: "Իրական աշխատանքներ այս սրահից", all: "Բոլորը", more: "Ցույց տալ ավելին", empty: "Այս ընտրությամբ աշխատանք չկա։",
        book: "Ամրագրել այս ծառայությունը", bookWith: "Ամրագրել {name}-ի մոտ", bookGeneric: "Ամրագրել", close: "Փակել", prev: "Նախորդը", next: "Հաջորդը",
        specialist: "Մասնագետ", service: "Ծառայություն", photo: "Աշխատանքի լուսանկար",
    },
    ru: {
        title: "Работы", subtitle: "Настоящие работы этого салона", all: "Все", more: "Показать ещё", empty: "Нет работ с таким выбором.",
        book: "Записаться на эту услугу", bookWith: "Записаться к мастеру {name}", bookGeneric: "Записаться", close: "Закрыть", prev: "Предыдущее", next: "Следующее",
        specialist: "Мастер", service: "Услуга", photo: "Фото работы",
    },
    en: {
        title: "Portfolio", subtitle: "Real work from this business", all: "All", more: "Show more", empty: "No work matches this choice.",
        book: "Book this service", bookWith: "Book with {name}", bookGeneric: "Book", close: "Close", prev: "Previous", next: "Next",
        specialist: "Specialist", service: "Service", photo: "Work photo",
    },
} as const;

const PAGE = 24;

function portfolioBookingHref(slug: string, item: Pick<PublicPortfolioItem, "service" | "staff">) {
    const params = new URLSearchParams();
    if (item.service) params.set("service_id", String(item.service.id));
    if (item.staff?.is_bookable) params.set("staff_id", String(item.staff.id));
    params.set("source", "website");
    return `/book/${slug}?${params.toString()}`;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button type="button" aria-pressed={active} onClick={onClick}
            className={cn("inline-flex min-h-10 items-center rounded-xl border px-3 text-sm font-medium transition",
                active ? "border-[var(--vz-primary)] bg-[var(--vz-primary)] text-[var(--vz-on-primary)]" : "border-[var(--vz-line)] bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)] hover:border-[var(--vz-line-strong)]")}>
            {children}
        </button>
    );
}

export default function PortfolioSection({ slug, preview, total, staff, services, filter, onFilterChange, locale }: {
    slug: string;
    preview: PublicPortfolioItem[];
    total: number;
    staff: PublicStaff[];
    services: PublicService[];
    filter: PortfolioFilter;
    onFilterChange: (filter: PortfolioFilter) => void;
    locale: Locale;
}) {
    const t = copy[locale];
    // 0 = show the preview that came with the business; otherwise load that many photos.
    // The parent remounts this section (key) when the filter changes, which resets both values.
    const [perPage, setPerPage] = useState(0);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const filtered = Boolean(filter.staff_id || filter.service_id);
    const useList = filtered || perPage > 0;

    const listQ = useQuery({
        queryKey: ["public-portfolio", slug, filter.staff_id ?? 0, filter.service_id ?? 0, perPage || PAGE],
        queryFn: () => fetchPublicPortfolio(slug, { ...filter, per_page: perPage || PAGE, page: 1 }),
        enabled: useList,
        placeholderData: keepPreviousData,
    });

    const items = useList ? (listQ.data?.items ?? (filtered ? [] : preview)) : preview;
    const shownTotal = filtered ? (listQ.data?.total ?? 0) : total;
    const staffChips = useMemo(() => staff.filter((item) => (item.portfolio_count ?? 0) > 0), [staff]);
    const serviceChips = useMemo(() => services.filter((item) => (item.portfolio_count ?? 0) > 0), [services]);

    if (!total) return null;

    return (
        <section id="portfolio" aria-labelledby="portfolio-title" className="vizit-profile-section scroll-mt-24 rounded-[32px] border border-white/70 bg-[var(--vz-surface)] p-5 shadow-sm dark:border-white/10 sm:p-7">
            <div className="vizit-profile-section-badge inline-flex items-center gap-2 rounded-xl border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--vz-brand-text)]">
                <Images className="h-4 w-4" /> {t.title}
            </div>
            <h2 id="portfolio-title" className="mt-4 text-2xl font-semibold tracking-tight text-[var(--vz-text)]">{t.subtitle}</h2>

            {staffChips.length || serviceChips.length ? (
                <div className="mt-5 space-y-2">
                    <div className="flex flex-wrap gap-2" role="group" aria-label={t.specialist}>
                        <Chip active={!filtered} onClick={() => onFilterChange({})}>{t.all}</Chip>
                        {staffChips.map((person) => (
                            <Chip key={`s${person.id}`} active={filter.staff_id === person.id} onClick={() => onFilterChange(filter.staff_id === person.id ? {} : { staff_id: person.id })}>{person.name}</Chip>
                        ))}
                    </div>
                    {serviceChips.length ? (
                        <div className="flex flex-wrap gap-2" role="group" aria-label={t.service}>
                            {serviceChips.map((service) => (
                                <Chip key={`v${service.id}`} active={filter.service_id === service.id} onClick={() => onFilterChange(filter.service_id === service.id ? {} : { service_id: service.id })}>{service.name}</Chip>
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {filtered && listQ.isPending ? (
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{[0, 1, 2, 3].map((n) => <div key={n} className="aspect-square animate-pulse rounded-2xl bg-[var(--vz-surface-2)]" />)}</div>
            ) : !items.length ? (
                <p className="mt-6 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-5 text-sm text-[var(--vz-muted)]">{t.empty}</p>
            ) : (
                <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {items.map((item, index) => (
                        <li key={item.id}>
                            <button type="button" onClick={() => setOpenIndex(index)} className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-[var(--vz-surface-2)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vz-focus)]">
                                {item.url ? <img src={item.url} alt={item.caption || item.service?.name || t.photo} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : null}
                                {item.service || item.staff ? (
                                    <span className="absolute inset-x-2 bottom-2 truncate rounded-lg bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                                        {[item.service?.name, item.staff?.name].filter(Boolean).join(" · ")}
                                    </span>
                                ) : null}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {items.length < shownTotal && (perPage || PAGE) <= 60 && items.length < 60 ? (
                <button type="button" onClick={() => setPerPage((n) => Math.min(60, Math.max(n, items.length) + PAGE))} disabled={listQ.isFetching}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-5 text-sm font-semibold text-[var(--vz-text)] hover:bg-[var(--vz-surface-2)] disabled:opacity-60">
                    {t.more} ({shownTotal - items.length})
                </button>
            ) : null}

            {openIndex !== null && items[openIndex] ? (
                <Lightbox slug={slug} items={items} index={openIndex} onIndex={setOpenIndex} onClose={() => setOpenIndex(null)} locale={locale} />
            ) : null}
        </section>
    );
}

function Lightbox({ slug, items, index, onIndex, onClose, locale }: { slug: string; items: PublicPortfolioItem[]; index: number; onIndex: (index: number) => void; onClose: () => void; locale: Locale }) {
    const t = copy[locale];
    const item = items[index];
    const closeRef = useRef<HTMLButtonElement>(null);
    const hasPrev = index > 0;
    const hasNext = index < items.length - 1;

    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        closeRef.current?.focus();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = overflow; previous?.focus?.(); };
    }, []);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
            if (event.key === "ArrowLeft" && hasPrev) onIndex(index - 1);
            if (event.key === "ArrowRight" && hasNext) onIndex(index + 1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [hasNext, hasPrev, index, onClose, onIndex]);

    const bookLabel = item.service ? t.book : item.staff?.is_bookable ? t.bookWith.replace("{name}", item.staff.name) : t.bookGeneric;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={item.caption || t.photo} onClick={onClose}>
            <div className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-[24px] bg-[var(--vz-surface)] shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white hover:bg-black/70"><X className="h-5 w-5" /></button>
                <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
                    {item.url ? <img src={item.url} alt={item.caption || item.service?.name || t.photo} className="max-h-[65vh] w-auto max-w-full object-contain" /> : null}
                    {hasPrev ? <button type="button" onClick={() => onIndex(index - 1)} aria-label={t.prev} className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white hover:bg-black/70"><ChevronLeft className="h-6 w-6" /></button> : null}
                    {hasNext ? <button type="button" onClick={() => onIndex(index + 1)} aria-label={t.next} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white hover:bg-black/70"><ChevronRight className="h-6 w-6" /></button> : null}
                </div>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="min-w-0 text-sm">
                        {item.caption ? <div className="font-semibold text-[var(--vz-text)]">{item.caption}</div> : null}
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[var(--vz-text-secondary)]">
                            {item.service ? <span>{t.service}: <strong className="font-medium text-[var(--vz-text)]">{item.service.name}</strong></span> : null}
                            {item.staff ? <span>{t.specialist}: <strong className="font-medium text-[var(--vz-text)]">{item.staff.name}</strong></span> : null}
                        </div>
                    </div>
                    <Link to={portfolioBookingHref(slug, item)} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--vz-primary)] px-5 text-sm font-semibold text-[var(--vz-on-primary)] hover:bg-[var(--vz-primary-hover)]">
                        <CalendarDays className="h-4 w-4" /> {bookLabel}
                    </Link>
                </div>
            </div>
        </div>
    );
}
