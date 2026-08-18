import type { PublicPlan } from "@/lib/planApi";

type PlanLike = Partial<PublicPlan> & {
  features?: Record<string, unknown> | null;
};

export function isCustomPlan(plan: PlanLike): boolean {
  if (typeof plan.is_custom === "boolean") return plan.is_custom;
  if (plan.self_serve === false) return true;

  return String(plan.code ?? "").toLowerCase() === "custom"
    || plan.features?.custom_pricing === true;
}

export function monthlyPlanPrice(plan: PlanLike): number | null {
  if (isCustomPlan(plan)) return null;
  const value = plan.monthly_price ?? plan.price;
  return value == null ? null : Number(value);
}

export function yearlyPlanPrice(plan: PlanLike): number | null {
  if (isCustomPlan(plan)) return null;
  const monthly = monthlyPlanPrice(plan);
  const value = plan.yearly_offer?.price ?? (monthly == null ? null : monthly * 10);
  return value == null ? null : Number(value);
}

export function formatPlanPrice(value: number | null | undefined, currency = "AMD"): string {
  if (value == null) return "Անհատական առաջարկ";
  const suffix = currency === "AMD" ? "֏" : currency;
  return `${value.toLocaleString("hy-AM")} ${suffix}`;
}

export function localizePlanName(plan: PlanLike): string {
  const value = String(plan.name || plan.code || "").toLowerCase();
  if (value.includes("start")) return "Սկիզբ";
  if (value.includes("studio")) return "Ստուդիա";
  if (value.includes("scale")) return "Աճ";
  if (value.includes("business")) return "Բիզնես";
  if (value.includes("custom")) return "Անհատական";
  return plan.name ?? "Պլան";
}

export function localizePlanNameForLocale(plan: PlanLike, locale: "hy" | "ru" | "en" = "hy"): string {
  const value = String(plan.name || plan.code || "").toLowerCase();
  const names = {
    hy: { start: "Սկիզբ", studio: "Ստուդիա", scale: "Աճ", business: "Բիզնես", custom: "Անհատական", fallback: "Պլան" },
    ru: { start: "Старт", studio: "Студия", scale: "Рост", business: "Бизнес", custom: "Индивидуальный", fallback: "Тариф" },
    en: { start: "Start", studio: "Studio", scale: "Scale", business: "Business", custom: "Custom", fallback: "Plan" },
  }[locale];
  const key = (["start", "studio", "scale", "business", "custom"] as const).find((item) => value.includes(item));
  return key ? names[key] : (plan.name ?? names.fallback);
}

export function localizePlanDescription(plan: PlanLike, locale: "hy" | "ru" | "en" = "hy"): string {
  const value = String(plan.code || plan.name || "").toLowerCase();
  const descriptions = {
    hy: {
      start: "Անհատ մասնագետների և փոքր բիզնեսների մեկնարկային գործիքներ։",
      studio: "Աճող թիմերի համար՝ ավելի շատ մասնագետներ, ծառայություններ և հասցեներ։",
      scale: "Մեծ թիմերի և ընդլայնվող բիզնեսների համար։",
      custom: "Անհատական պայմաններ ցանցային և մեծ բիզնեսների համար։",
      fallback: "Vizit-ի կառավարման և օնլայն ամրագրման գործիքներ բիզնեսի համար։",
    },
    ru: {
      start: "Стартовые инструменты для частных специалистов и малого бизнеса.",
      studio: "Для растущих команд: больше специалистов, услуг и адресов.",
      scale: "Для крупных команд и развивающегося бизнеса.",
      custom: "Индивидуальные условия для сетевых и крупных компаний.",
      fallback: "Инструменты Vizit для управления бизнесом и онлайн-записи.",
    },
    en: {
      start: "Essential tools for independent professionals and small businesses.",
      studio: "For growing teams that need more staff, services and locations.",
      scale: "For larger teams and expanding businesses.",
      custom: "Tailored terms for multi-location and larger businesses.",
      fallback: "Vizit tools for business management and online booking.",
    },
  }[locale];
  const key = (["start", "studio", "scale", "custom"] as const).find((item) => value.includes(item));
  return key ? descriptions[key] : descriptions.fallback;
}
