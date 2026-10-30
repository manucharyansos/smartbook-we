import { useQuery } from "@tanstack/react-query";
import { BadgePercent } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import type { Locale } from "@/contexts/LanguageContext";
import type { ServiceDiscounts } from "./ServiceDiscountsCard";

type Progress = { visits: number; current_percent: number; next: { min_visits: number; percent: number; remaining: number } | null };

const copy = {
  hy: { title: "Զեղչեր", visit: (n: number, p: number) => `${n}-րդ ավարտված այցից հետո՝ −${p}%`, bundle: (n: number, p: number) => `${n} և ավելի ծառայություն մեկ այցում՝ −${p}%`,
    progress: (v: number, n: number) => `Դուք ունեք ${v} ավարտված այց։ ԵՒս ${n}-ը՝ հաջորդ զեղչին։`, current: (p: number) => `Ձեր զեղչը՝ ${p}%`, applies: (p: number) => `Այս ամրագրման զեղչը՝ ${p}%`, best: "Եթե երկու զեղչն էլ կիրառելի է, գործում է մեծը։" },
  ru: { title: "Скидки", visit: (n: number, p: number) => `после ${n} завершённых визитов — −${p}%`, bundle: (n: number, p: number) => `${n} и более услуг за визит — −${p}%`,
    progress: (v: number, n: number) => `У вас ${v} завершённых визитов. До следующей скидки — ещё ${n}.`, current: (p: number) => `Ваша скидка — ${p}%`, applies: (p: number) => `Скидка на эту запись — ${p}%`, best: "Если подходят обе скидки, действует большая." },
  en: { title: "Discounts", visit: (n: number, p: number) => `after ${n} completed visits: −${p}%`, bundle: (n: number, p: number) => `${n}+ services in one visit: −${p}%`,
    progress: (v: number, n: number) => `You have ${v} completed visits. ${n} more to the next discount.`, current: (p: number) => `Your discount: ${p}%`, applies: (p: number) => `Discount for this booking: ${p}%`, best: "If both apply, the larger discount is used." },
} as const;

/** Shows a business's discount tiers, the signed-in client's progress and the bundle discount for the current selection. */
export default function ServiceDiscountsNotice({ slug, discounts, locale, serviceCount }: { slug: string; discounts?: ServiceDiscounts | null; locale: Locale; serviceCount?: number }) {
  const t = copy[locale];
  const user = useAuth((state) => state.user) as { role?: string; audience?: string } | null;
  const isClient = user?.role === "client" || user?.audience === "client";
  const hasVisitTiers = !!discounts?.visit_tiers.length;
  const progressQ = useQuery({ queryKey: ["client-discount-progress", slug], queryFn: async () => (await api.get(`/client/discounts/${encodeURIComponent(slug)}`)).data.data as Progress, enabled: isClient && hasVisitTiers, retry: false, staleTime: 60_000 });
  if (!discounts || (!discounts.visit_tiers.length && !discounts.bundle_tiers.length)) return null;

  const bundlePercent = serviceCount ? discounts.bundle_tiers.reduce((p, tier) => serviceCount >= tier.min_services ? tier.percent : p, 0) : 0;
  const visitPercent = progressQ.data?.current_percent ?? 0;
  const applies = Math.max(bundlePercent, visitPercent);

  return (
    <div className="rounded-2xl border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] p-4 text-sm text-[var(--vz-text)]">
      <div className="flex items-center gap-2 font-semibold"><BadgePercent className="h-4 w-4 text-[var(--vz-brand-text)]" />{t.title}</div>
      <ul className="mt-2 space-y-1 text-[var(--vz-text-secondary)]">
        {discounts.visit_tiers.map((tier) => <li key={`v${tier.min_visits}`}>{t.visit(tier.min_visits, tier.percent)}</li>)}
        {discounts.bundle_tiers.map((tier) => <li key={`b${tier.min_services}`}>{t.bundle(tier.min_services, tier.percent)}</li>)}
      </ul>
      {hasVisitTiers && discounts.bundle_tiers.length ? <p className="mt-2 text-xs text-[var(--vz-muted)]">{t.best}</p> : null}
      {progressQ.data ? (
        <div className="mt-3">
          {progressQ.data.next ? <>
            <p className="text-[var(--vz-text-secondary)]">{t.progress(progressQ.data.visits, progressQ.data.next.remaining)}</p>
            <div className="mt-2 h-2 rounded-full bg-[var(--vz-surface)]"><div className="h-2 rounded-full bg-[var(--vz-primary)]" style={{ width: `${Math.min(100, Math.round(progressQ.data.visits / progressQ.data.next.min_visits * 100))}%` }} /></div>
          </> : null}
          {progressQ.data.current_percent ? <p className="mt-2 font-medium text-[var(--vz-success)]">{t.current(progressQ.data.current_percent)}</p> : null}
        </div>
      ) : null}
      {serviceCount && applies ? <p className="mt-2 font-semibold text-[var(--vz-success)]">{t.applies(applies)}</p> : null}
    </div>
  );
}
