import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, ShieldCheck, Sparkles, Users, Building2, BadgePercent, Handshake } from "lucide-react";
import { Link } from "react-router-dom";

import MarketingPageShell from "../components/marketing/MarketingPageShell";
import { publicPlansApi, type PublicPlan } from "../lib/planApi";
import { cn } from "../lib/cn";
import { fadeUp, scaleIn, staggerContainer } from "../lib/motion";

type BillingCycle = "monthly" | "yearly";

function formatPrice(value: number | null | undefined, currency = "AMD") {
  if (value == null) return "Անհատական";
  const suffix = currency === "AMD" ? "֏" : currency;
  return `${value.toLocaleString("hy-AM")} ${suffix}`;
}

function planFeatures(plan: PublicPlan) {
  const features = plan.features ?? {};
  const staffLimit = Number(plan.staff_limit ?? features.staff_limit ?? 0);

  const items = [
    staffLimit >= 999 ? "16+ ակտիվ մասնագետ" : `Մինչև ${staffLimit} ակտիվ մասնագետ`,
    `Սեփականատերեր և մենեջերներ՝ անսահմանափակ`,
    `${Number(plan.locations ?? 1) > 1 ? `Մինչև ${plan.locations} հասցե` : "1 հասցե"}`,
    "Բոլոր հիմնական գործիքները ներառված են",
    "Օրացույց, ամրագրումներ, առաջադրանքներ և analytics",
    "Հաճախորդի cabinet, loyalty, նվերի քարտեր և աղբյուրների հետևում",
  ];

  return items;
}


function localizePlanName(plan: PublicPlan) {
  const value = String(plan.name || plan.code || "").toLowerCase();
  if (value.includes("start")) return "Սկիզբ";
  if (value.includes("studio")) return "Ստուդիա";
  if (value.includes("business")) return "Բիզնես";
  if (value.includes("custom")) return "Անհատական";
  return plan.name;
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");

  const plansQ = useQuery({
    queryKey: ["public-pricing-plans"],
    queryFn: async () => {
      const res = await publicPlansApi.list();
      return (res.data?.data ?? []) as PublicPlan[];
    },
    staleTime: 60_000,
  });

  const plans = useMemo(() => {
    return (plansQ.data ?? []).map((plan) => {
      const baseMonthly = plan.price ?? null;
      const yearlyPrice = plan.yearly_offer?.price ?? (baseMonthly != null ? baseMonthly * 10 : null);
      const displayPrice = billingCycle === "yearly" ? yearlyPrice : baseMonthly;
      const discountAmount = baseMonthly != null && yearlyPrice != null ? (plan.yearly_offer?.discount_amount ?? Math.max(baseMonthly * 12 - yearlyPrice, 0)) : 0;

      return {
        ...plan,
        yearlyPrice,
        displayPrice,
        discountAmount,
        monthsCharged: plan.yearly_offer?.months_charged ?? 10,
        monthsFree: plan.yearly_offer?.months_free ?? 2,
        perMonthEffective: yearlyPrice != null ? Math.round(yearlyPrice / 12) : null,
      };
    });
  }, [plansQ.data, billingCycle]);

  return (
    <MarketingPageShell
      badge={
        <>
          <Sparkles className="h-4 w-4" />
          SmartBook գնացուցակ · պարզ և հասկանալի
        </>
      }
      title={
        <>
          Պլաններ, որոնք հաշվարկվում են միայն
          <span className="text-violet-600"> ակտիվ մասնագետներով</span>
        </>
      }
      description="Բոլոր պլաններում հասանելի են հիմնական գործիքները, իսկ տարբերությունը գալիս է միայն ակտիվ մասնագետների քանակից։"
    >
      <motion.section
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div
          variants={fadeUp}
          className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(124,58,237,0.08)] sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Պարզ գնային համակարգ
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Ընտրիր պլանը ըստ ակտիվ մասնագետների քանակի և քո բիզնեսի չափի։
              </p>
            </div>

            <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
                  billingCycle === "monthly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
                )}
              >
                Ամսական
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
                  billingCycle === "yearly" ? "bg-violet-600 text-white" : "text-slate-600"
                )}
              >
                Տարեկան
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: Users, title: "Միայն ակտիվ մասնագետներ", text: "Սեփականատերն ու մենեջերը չեն մտնում սահմանաչափի մեջ։" },
              { icon: ShieldCheck, title: "Հիմնական գործիքները ներառված են", text: "Օրացույցը, ամրագրումները և հաճախորդների կառավարումը հասանելի են բոլոր պլաններում։" },
              { icon: BadgePercent, title: "Տարեկան՝ 2 ամիս նվեր", text: "Տարեկան տարբերակում վճարում ես 10 ամիս, օգտվում՝ 12 ամիս։" },
              { icon: Handshake, title: "Անհատական առաջարկներ", text: "Առանձին պայմանները սահմանվում են միայն ընտրված բիզնեսների համար։" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {plansQ.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-[500px] animate-pulse rounded-[30px] border border-slate-200 bg-white" />
            ))}
          </div>
        ) : plansQ.isError ? (
          <motion.div variants={fadeUp} className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-rose-700">
            Չհաջողվեց բեռնել պլանները։
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {plans.map((plan) => {
              const highlighted = plan.code === "studio";
              const isCustom = false;
              return (
                <motion.article
                  key={plan.id}
                  variants={scaleIn}
                  className={cn(
                    "relative flex h-full flex-col rounded-[30px] border p-5 pt-16 sm:p-6 sm:pt-14 shadow-sm",
                    highlighted
                      ? "border-slate-950 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
                      : "border-slate-200 bg-white"
                  )}
                >
                  {(highlighted || (billingCycle === "yearly" && !isCustom)) && (
                    <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      {billingCycle === "yearly" && !isCustom ? (
                        <div
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-semibold",
                            highlighted ? "bg-white/10 text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          )}
                        >
                          2 ամիս անվճար
                        </div>
                      ) : <span />}

                      {highlighted ? (
                        <div className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-950 sm:text-xs">
                          Ամենապահանջվածը
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div
                    className={cn(
                      "inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 pr-4 text-[11px] font-medium sm:text-xs",
                      highlighted ? "bg-white/10 text-white/90" : "border border-slate-200 bg-slate-50 text-slate-700"
                    )}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Պլան բիզնեսի համար
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold tracking-tight sm:mt-5">{localizePlanName(plan)}</h3>
                  <p className={cn("mt-3 text-sm leading-6", highlighted ? "text-white/70" : "text-slate-600")}>
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        {formatPrice(plan.displayPrice, plan.currency || "AMD")}
                      </div>
                      {billingCycle === "yearly" && !isCustom && (
                        <div className={cn("pb-1 text-sm line-through", highlighted ? "text-white/50" : "text-slate-500")}>
                          {formatPrice((plan.price ?? 0) * 12, plan.currency || "AMD")}
                        </div>
                      )}
                    </div>

                    <div className={cn("mt-1 text-sm", highlighted ? "text-white/60" : "text-slate-500")}>
                      {billingCycle === "yearly" ? "տարեկան վճարում" : "ամսական վճարում"}
                    </div>

                    {billingCycle === "yearly" && !isCustom && (
                      <div
                        className={cn(
                          "mt-3 rounded-2xl p-3 text-sm leading-6",
                          highlighted ? "bg-white/10 text-white/90" : "border border-violet-100 bg-violet-50 text-slate-700"
                        )}
                      >
                        Վճարում ես {plan.monthsCharged} ամիս, ստանում ես {plan.monthsFree} ամիս նվեր։
                        Միջին արժեքը՝ <span className="font-semibold">{formatPrice(plan.perMonthEffective, plan.currency || "AMD")}/ամիս</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    {planFeatures(plan).map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className={cn("text-sm leading-6", highlighted ? "text-white/80" : "text-slate-600")}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3">
                    <Link
                      to="/register?intent=business"
                      className={cn(
                        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-medium transition",
                        highlighted ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-violet-600 text-white hover:bg-violet-700"
                      )}
                    >
                      Սկսել 14 օր անվճար
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {!isCustom && billingCycle === "yearly" && (
                      <div className={cn("text-center text-xs", highlighted ? "text-white/60" : "text-slate-500")}>
                        Տնտեսում ես {formatPrice(plan.discountAmount, plan.currency || "AMD")}
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        <motion.div
          variants={fadeUp}
          className="grid gap-6 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(124,58,237,0.06)] sm:p-6 2xl:grid-cols-[1.3fr_0.7fr]"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Որ պլանն ընտրել</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Եթե նոր ես սկսում, ընտրիր փոքր պլանը։ Ավելի մեծ թիմի կամ մի քանի հասցեի դեպքում ընտրիր ավելի բարձր պլանը։ Եթե պետք է առանձին պայման, կստանաս անհատական առաջարկ։
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                "Սկիզբ պլանը հարմար է փոքր թիմերի համար։",
                "Ավելի մեծ թիմի կամ երկրորդ հասցեի դեպքում ընտրիր բարձր պլան։",
                "Տարեկան տարբերակը ավելի շահավետ է երկարաժամկետ աշխատանքի համար։",
                "Անհատական առաջարկը տրվում է միայն ընտրված բիզնեսներին։",
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-violet-200 bg-[linear-gradient(180deg,#f5f3ff_0%,#ffffff_100%)] p-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
              <Building2 className="h-3.5 w-3.5" />
              Սկսիր քո բիզնեսը
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">Սկսիր քեզ հարմար ճանապարհով</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Սկսիր փորձնական շրջանից, ընտրիր քեզ հարմար պլանը կամ կապ հաստատիր անհատական պայմանների համար։
            </p>

            <div className="mt-5 space-y-3">
              <Link
                to="/register?intent=business"
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                Սկսել փորձնական շրջան
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Դառնալ գործընկեր
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </MarketingPageShell>
  );
}
