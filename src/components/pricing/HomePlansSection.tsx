import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { rentalCopy } from "../../i18n/rentals";
import { cn } from "../../lib/cn";
import { publicPlansApi, type PublicPlan } from "../../lib/planApi";
import { formatPlanPrice, localizePlanDescription, localizePlanNameForLocale } from "../../lib/planPresentation";
import { planApiType, planCyclePrice, plansForType, planSignupHref, type BillingCycle, type PlanBusinessType } from "../../lib/pricing";
import { PlanBillingSelector, PlanTypeSelector } from "./PlanControls";

const copy = {
  hy: { month: "ամիս", year: "տարի", trial: "Սկսել 14 օր անվճար", custom: "Ստանալ առաջարկ", noPlans: "Այս տեսակի համար հասանելի պլան չկա։", retry: "Կրկին փորձել" },
  ru: { month: "месяц", year: "год", trial: "Начать 14 дней бесплатно", custom: "Получить предложение", noPlans: "Для этого типа пока нет доступных тарифов.", retry: "Повторить" },
  en: { month: "month", year: "year", trial: "Start 14 days free", custom: "Request an offer", noPlans: "No plans are available for this business type.", retry: "Try again" },
};

function HomePlanCard({ plan, businessType }: { plan: PublicPlan; businessType: PlanBusinessType }) {
  const { t, locale } = useLanguage(); const text = copy[locale]; const rental = rentalCopy[locale];
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const price = planCyclePrice(plan, cycle);
  const name = localizePlanNameForLocale(plan, locale);
  return <div role="article" aria-label={name} className="flex min-w-0 flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
    <div className="inline-flex w-fit rounded-full bg-[var(--vz-accent-soft)] px-3 py-1 text-xs font-black text-[var(--vz-brand-text)]">{t("plans.businessPlan")}</div>
    <h3 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">{name}</h3>
    <p className="mb-5 mt-3 min-h-[48px] text-sm leading-6 text-slate-500 dark:text-slate-300">{localizePlanDescription(plan, locale)}</p>
    {price.hasYearly && <PlanBillingSelector value={price.billingCycle} onChange={setCycle} planName={name} />}
    <div className="mt-4 flex flex-wrap items-baseline gap-2" aria-live="polite"><strong className="text-3xl font-black text-slate-950 dark:text-white">{price.isCustom ? text.custom : formatPlanPrice(price.displayPrice, plan.currency ?? undefined)}</strong>{!price.isCustom && <span className="text-sm text-slate-500 dark:text-slate-300">/ {price.billingCycle === "yearly" ? text.year : text.month}</span>}</div>
    {businessType === "rentals" && <><ul className="mt-5 space-y-3">{[rental.calendar, rental.gallery, rental.analytics, rental.workingHours].map((label) => <li key={label} className="flex items-start gap-2 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />{label}</li>)}</ul><p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-300">{rental.subscriptionHelp}</p></>}
    <Link to={planSignupHref(plan, businessType)} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--vz-primary)] px-4 py-3 text-sm font-semibold text-[var(--vz-on-primary)]">{price.isCustom ? text.custom : text.trial}<ArrowRight size={17} aria-hidden="true" /></Link>
  </div>;
}

export default function HomePlansSection() {
  const { t, locale } = useLanguage(); const text = copy[locale];
  const [businessType, setBusinessType] = useState<PlanBusinessType>("services");
  const plansQ = useQuery({ queryKey: ["home-public-plans-preview", businessType], queryFn: async () => (await publicPlansApi.list(planApiType(businessType))).data.data, staleTime: 60_000 });
  const plans = plansForType(plansQ.data ?? [], businessType).slice(0, businessType === "rentals" ? undefined : 3);
  return <section id="plans" className="vizit-plans-section scroll-mt-24 bg-slate-50 px-5 py-16 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8 lg:py-20">
    <div className="mx-auto max-w-[1320px]">
      <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"><div><span className="inline-flex items-center gap-2 rounded-full bg-[var(--vz-accent-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--vz-brand-text)]"><BadgeCheck size={16} aria-hidden="true" />{t("plans.badge")}</span><h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">{t("plans.title")}</h2></div><Link to={`/pricing?type=${businessType}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:border-white/[0.12] dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/[0.12]">{t("cta.pricing")}<ArrowRight size={16} aria-hidden="true" /></Link></div>
      <div className="mb-8"><PlanTypeSelector value={businessType} onChange={setBusinessType} /></div>
      {plansQ.isLoading ? <div className="grid gap-5 md:grid-cols-3" role="status"><span className="sr-only">{rentalCopy[locale].loading}</span>{Array.from({ length: businessType === "rentals" ? 1 : 3 }, (_, index) => <div key={index} className="h-[300px] animate-pulse rounded-[26px] border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.06]" />)}</div>
        : plansQ.isError ? <div className="rounded-2xl bg-rose-50 p-5 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200" role="alert">{t("status.errorPlans")}<button type="button" onClick={() => void plansQ.refetch()} className="ml-3 underline">{text.retry}</button></div>
          : !plans.length ? <p role="status">{text.noPlans}</p>
            : <div data-plan-type={businessType} className={cn("vizit-plans-grid grid gap-5", businessType === "rentals" ? "mx-auto w-full max-w-xl grid-cols-1" : "md:grid-cols-3")}>{plans.map((plan) => <HomePlanCard key={`${businessType}:${plan.id}`} plan={plan} businessType={businessType} />)}</div>}
    </div>
  </section>;
}
