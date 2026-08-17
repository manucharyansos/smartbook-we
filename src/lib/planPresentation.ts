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
