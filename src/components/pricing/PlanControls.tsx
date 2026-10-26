import { Building2, HeartPulse, Sparkles } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { rentalCopy } from "../../i18n/rentals";
import { cn } from "../../lib/cn";
import type { BillingCycle, PlanBusinessType } from "../../lib/pricing";

const copy = {
  hy: { type: "Բիզնեսի տեսակը", period: "Վճարման պարբերականությունը", monthly: "Ամսական", yearly: "Տարեկան" },
  ru: { type: "Тип бизнеса", period: "Период оплаты", monthly: "Ежемесячно", yearly: "Ежегодно" },
  en: { type: "Business type", period: "Billing period", monthly: "Monthly", yearly: "Yearly" },
};

export function PlanTypeSelector({ value, onChange }: { value: PlanBusinessType; onChange: (value: PlanBusinessType) => void }) {
  const { t, locale } = useLanguage();
  const options = [
    { value: "services", label: t("businesses.services"), icon: Sparkles },
    { value: "healthcare", label: t("businesses.healthcare"), icon: HeartPulse },
    { value: "rentals", label: rentalCopy[locale].title, icon: Building2 },
  ] as const;
  return <div role="group" aria-label={copy[locale].type} className="vizit-segmented-control grid w-full gap-1 rounded-2xl border p-1 sm:w-fit sm:grid-cols-3">
    {options.map(({ value: option, label, icon: Icon }) => <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)} className={cn("vizit-segmented-option inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2", value === option && "is-active")}><Icon size={17} aria-hidden="true" />{label}</button>)}
  </div>;
}

export function PlanBillingSelector({ value, onChange, planName }: { value: BillingCycle; onChange: (value: BillingCycle) => void; planName: string }) {
  const { locale } = useLanguage(); const text = copy[locale];
  return <div role="group" aria-label={`${planName} · ${text.period}`} className="vizit-segmented-control grid grid-cols-2 gap-1 rounded-2xl border p-1">
    {(["monthly", "yearly"] as const).map((cycle) => <button type="button" key={cycle} onClick={() => onChange(cycle)} aria-pressed={value === cycle} className={cn("vizit-segmented-option min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2", value === cycle && "is-active")}>{text[cycle]}</button>)}
  </div>;
}
