import type { BusinessType, PublicPlan } from "./planApi";
import { isCustomPlan, monthlyPlanPrice, yearlyPlanPrice } from "./planPresentation";

export type PlanBusinessType = "services" | "healthcare" | "rentals";
export type BillingCycle = "monthly" | "yearly";

export function planApiType(type: PlanBusinessType): BusinessType {
  return type === "rentals" ? "rentals" : type === "healthcare" ? "dental" : "beauty";
}

export function initialPlanType(value: string | null): PlanBusinessType {
  if (value === "rentals" || value === "rental") return "rentals";
  if (value === "healthcare" || value === "dental") return "healthcare";
  return "services";
}

export function plansForType(plans: PublicPlan[], type: PlanBusinessType): PublicPlan[] {
  return plans.filter((plan) => (plan.code === "rental" || plan.business_type === "rentals") === (type === "rentals"));
}

export function planCyclePrice(plan: PublicPlan, cycle: BillingCycle) {
  const monthly = monthlyPlanPrice(plan);
  const yearly = yearlyPlanPrice(plan);
  const custom = isCustomPlan(plan);
  const hasYearly = !custom && plan.yearly_offer?.enabled !== false && yearly != null;
  const billingCycle = hasYearly ? cycle : "monthly";
  const discountAmount = monthly != null && yearly != null ? Math.max(0, monthly * 12 - yearly) : 0;
  return {
    billingCycle, hasYearly, isCustom: custom, yearlyPrice: yearly,
    displayPrice: custom ? null : billingCycle === "yearly" ? yearly : monthly,
    discountAmount,
    monthsCharged: plan.yearly_offer?.months_charged ?? (plan.code === "rental" ? 12 : 10),
    monthsFree: plan.yearly_offer?.months_free ?? (plan.code === "rental" ? 0 : 2),
    perMonthEffective: yearly != null ? Math.round(yearly / 12) : null,
  };
}

export function planSignupHref(plan: PublicPlan, type: PlanBusinessType): string {
  if (isCustomPlan(plan)) return "/contact?subject=custom-plan";
  const params = new URLSearchParams({ intent: "business", type, plan: plan.code });
  return `/register?${params}`;
}
