import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, ShieldCheck, Sparkles, Users, Building2, BadgePercent, Handshake } from "lucide-react";
import { Link } from "react-router-dom";

import MarketingPageShell from "../components/marketing/MarketingPageShell";
import { publicPlansApi, type PublicPlan } from "../lib/planApi";
import { formatPlanPrice, isCustomPlan, localizePlanDescription, localizePlanNameForLocale, monthlyPlanPrice, yearlyPlanPrice } from "../lib/planPresentation";
import { cn } from "../lib/cn";
import { fadeUp, scaleIn, staggerContainer } from "../lib/motion";
import { useLanguage, type Locale } from "../contexts/LanguageContext";

type BillingCycle = "monthly" | "yearly";

const copy = {
  hy: {
    badge: "Vizit գնացուցակ · պարզ և հասկանալի", titleLead: "Պարզ պլաններ՝ ըստ", titleAccent: "ձեր բիզնեսի չափի", intro: "Հիմնական գործիքները հասանելի են բոլոր պլաններում, իսկ ընտրությունը կախված է ակտիվ մասնագետների, ծառայությունների և հասցեների քանակից։",
    systemTitle: "Պարզ գնային համակարգ", systemText: "Ընտրեք պլանը ըստ ակտիվ մասնագետների, ծառայությունների և հասցեների անհրաժեշտ քանակի։", monthly: "Ամսական", yearly: "Տարեկան", loadingError: "Չհաջողվեց բեռնել պլանները։",
    cards: [["Միայն ակտիվ մասնագետներ", "Սեփականատերն ու մենեջերը չեն մտնում սահմանաչափի մեջ։"], ["Հիմնական գործիքները ներառված են", "Օրացույցը, ամրագրումները և հաճախորդների կառավարումը հասանելի են բոլոր պլաններում։"], ["Տարեկան՝ 2 ամիս նվեր", "Տարեկան տարբերակում վճարում եք 10 ամիս, օգտվում՝ 12 ամիս։"], ["Անհատական առաջարկներ", "Առանձին պայմանները սահմանվում են ընտրված մեծ բիզնեսների համար։"]],
    twoFree: "2 ամիս անվճար", popular: "Ամենապահանջվածը", businessPlan: "Պլան բիզնեսի համար", customPrice: "գինը սահմանվում է առաջարկով", yearlyPayment: "տարեկան վճարում", monthlyPayment: "ամսական վճարում", pay: "Վճարում եք", months: "ամիս", receive: "ստանում եք", gift: "ամիս նվեր", average: "Միջին արժեքը", perMonth: "ամիս", customCta: "Ստանալ անհատական առաջարկ", trialCta: "Սկսել 14 օր անվճար", save: "Տնտեսում եք",
    chooseTitle: "Ո՞ր պլանն ընտրել", chooseText: "Եթե նոր եք սկսում, ընտրեք «Սկիզբ» պլանը։ Թիմի, ծառայությունների կամ հասցեների աճին զուգահեռ ընտրեք ավելի բարձր պլան։ 16+ մասնագետի կամ ցանցային բիզնեսի դեպքում կստանաք անհատական առաջարկ։",
    chooseItems: ["«Սկիզբ» պլանը նախատեսված է մեկ ակտիվ մասնագետի համար։", "Յուրաքանչյուր պլանի մասնագետների, ծառայությունների և հասցեների սահմանաչափերը նշված են քարտում։", "Տարեկան տարբերակն ավելի շահավետ է երկարաժամկետ աշխատանքի համար։", "Անհատական առաջարկը նախատեսված է մեծ և ցանցային բիզնեսների համար։"],
    startBadge: "Սկսեք ձեր բիզնեսը", startTitle: "Սկսեք ձեզ հարմար ճանապարհով", startText: "Սկսեք փորձաշրջանից, ընտրեք հարմար պլանը կամ կապվեք անհատական պայմանների համար։", startTrial: "Սկսել փորձաշրջանը", partner: "Դառնալ գործընկեր",
  },
  ru: {
    badge: "Тарифы Vizit · просто и понятно", titleLead: "Понятные тарифы для", titleAccent: "вашего масштаба", intro: "Основные инструменты доступны во всех тарифах; выбор зависит от числа активных специалистов, услуг и адресов.",
    systemTitle: "Простая система тарифов", systemText: "Выберите тариф по необходимому числу активных специалистов, услуг и адресов.", monthly: "Ежемесячно", yearly: "Ежегодно", loadingError: "Не удалось загрузить тарифы.",
    cards: [["Только активные специалисты", "Владелец и менеджер не входят в лимит."], ["Основные инструменты включены", "Календарь, записи и управление клиентами доступны во всех тарифах."], ["2 месяца в подарок", "При годовой оплате платите за 10 месяцев и пользуетесь 12."], ["Индивидуальные условия", "Отдельные условия доступны выбранным крупным компаниям."]],
    twoFree: "2 месяца бесплатно", popular: "Самый популярный", businessPlan: "Тариф для бизнеса", customPrice: "цена по запросу", yearlyPayment: "оплата за год", monthlyPayment: "оплата за месяц", pay: "Оплачиваете", months: "месяцев", receive: "получаете", gift: "месяца в подарок", average: "Средняя стоимость", perMonth: "месяц", customCta: "Получить предложение", trialCta: "Начать 14 дней бесплатно", save: "Экономия",
    chooseTitle: "Какой тариф выбрать", chooseText: "Если вы только начинаете, выберите «Старт». По мере роста команды, услуг или адресов переходите на следующий тариф. Для 16+ специалистов и сетевого бизнеса доступны индивидуальные условия.",
    chooseItems: ["«Старт» рассчитан на одного активного специалиста.", "Лимиты специалистов, услуг и адресов указаны в каждой карточке.", "Годовая оплата выгоднее для долгосрочной работы.", "Индивидуальные условия предназначены для крупных и сетевых компаний."],
    startBadge: "Запустите свой бизнес", startTitle: "Начните удобным способом", startText: "Начните с пробного периода, выберите тариф или свяжитесь с нами для индивидуальных условий.", startTrial: "Начать пробный период", partner: "Стать партнёром",
  },
  en: {
    badge: "Vizit pricing · simple and clear", titleLead: "Clear plans for", titleAccent: "your business size", intro: "Core tools are available in every plan; choose based on active staff, services and locations.",
    systemTitle: "Simple pricing", systemText: "Choose a plan by the number of active staff, services and locations you need.", monthly: "Monthly", yearly: "Yearly", loadingError: "Could not load plans.",
    cards: [["Only active staff count", "Owners and managers do not count toward the limit."], ["Core tools included", "Calendar, bookings and client management are available in every plan."], ["2 months free yearly", "Pay for 10 months and use Vizit for 12."], ["Tailored offers", "Custom terms are available to selected larger businesses."]],
    twoFree: "2 months free", popular: "Most popular", businessPlan: "Business plan", customPrice: "priced by proposal", yearlyPayment: "yearly payment", monthlyPayment: "monthly payment", pay: "Pay for", months: "months", receive: "receive", gift: "months free", average: "Average cost", perMonth: "month", customCta: "Request a custom offer", trialCta: "Start 14 days free", save: "You save",
    chooseTitle: "Which plan should you choose?", chooseText: "If you are just starting, choose Start. Move up as your team, services or locations grow. Businesses with 16+ specialists or multiple locations can request a tailored offer.",
    chooseItems: ["Start is designed for one active specialist.", "Staff, service and location limits are shown on each card.", "Yearly billing offers better value for long-term use.", "Tailored offers are intended for larger and multi-location businesses."],
    startBadge: "Start your business", startTitle: "Begin in the way that suits you", startText: "Start with a trial, choose a plan or contact us for tailored terms.", startTrial: "Start a trial", partner: "Become a partner",
  },
};

function planFeatures(plan: PublicPlan, locale: Locale) {
  const features = plan.features ?? {};
  const staffLimit = Number(plan.staff_limit ?? features.staff_limit ?? 0);

  const servicesLimit = Number(plan.services_limit ?? features.services_limit ?? 0);

  const custom = isCustomPlan(plan);
  const labels = {
    hy: { active: (n: number) => `Մինչև ${n} ակտիվ մասնագետ`, activeUnlimited: "16+ ակտիվ մասնագետ", managers: "Սեփականատերեր և մենեջերներ՝ անսահմանափակ", location: "1 հասցե", locations: (n: number) => `Մինչև ${n} հասցե`, services: (n: number) => `Մինչև ${n} ծառայություն`, unlimitedServices: "Ծառայությունների սահմանափակում չկա", core: "Բոլոր հիմնական գործիքները ներառված են", operations: "Օրացույց, ամրագրումներ, առաջադրանքներ և վերլուծություն", growth: "Հաճախորդի cabinet, loyalty, նվերի քարտեր և աղբյուրների հետևում" },
    ru: { active: (n: number) => `До ${n} активных специалистов`, activeUnlimited: "16+ активных специалистов", managers: "Владельцы и менеджеры — без ограничений", location: "1 адрес", locations: (n: number) => `До ${n} адресов`, services: (n: number) => `До ${n} услуг`, unlimitedServices: "Без ограничения услуг", core: "Все основные инструменты включены", operations: "Календарь, записи, задачи и аналитика", growth: "Кабинет клиента, лояльность, подарочные карты и источники" },
    en: { active: (n: number) => `Up to ${n} active staff`, activeUnlimited: "16+ active staff", managers: "Unlimited owners and managers", location: "1 location", locations: (n: number) => `Up to ${n} locations`, services: (n: number) => `Up to ${n} services`, unlimitedServices: "Unlimited services", core: "All core tools included", operations: "Calendar, bookings, tasks and analytics", growth: "Client cabinet, loyalty, gift cards and source tracking" },
  }[locale];
  const items = [
    custom || staffLimit >= 999 ? labels.activeUnlimited : labels.active(staffLimit),
    labels.managers,
    Number(plan.locations ?? 1) > 1 ? labels.locations(Number(plan.locations)) : labels.location,
    custom || servicesLimit >= 999 || servicesLimit <= 0 ? labels.unlimitedServices : labels.services(servicesLimit),
    labels.core, labels.operations, labels.growth,
  ];

  return items;
}

export default function Pricing() {
  const { locale } = useLanguage();
  const text = copy[locale];
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
      const custom = isCustomPlan(plan);
      const baseMonthly = monthlyPlanPrice(plan);
      const yearlyPrice = yearlyPlanPrice(plan);
      const displayPrice = custom ? null : billingCycle === "yearly" ? yearlyPrice : baseMonthly;
      const discountAmount = baseMonthly != null && yearlyPrice != null ? (plan.yearly_offer?.discount_amount ?? Math.max(baseMonthly * 12 - yearlyPrice, 0)) : 0;

      return {
        ...plan,
        isCustom: custom,
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
          {text.badge}
        </>
      }
      title={
        <>
          {text.titleLead} <span className="text-violet-600">{text.titleAccent}</span>
        </>
      }
      description={text.intro}
    >
      <motion.section
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div
          variants={fadeUp}
          className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(124,58,237,0.08)] dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {text.systemTitle}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                {text.systemText}
              </p>
            </div>

            <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.06]">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
                  billingCycle === "monthly" ? "bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950" : "text-slate-600 dark:text-slate-300"
                )}
              >
                {text.monthly}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
                  billingCycle === "yearly" ? "bg-violet-600 text-white" : "text-slate-600 dark:text-slate-300"
                )}
              >
                {text.yearly}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {text.cards.map(([title, cardText], index) => {
              const item = { icon: [Users, ShieldCheck, BadgePercent, Handshake][index], title, text: cardText };
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.055]">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-violet-400/15 dark:text-violet-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {plansQ.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-[500px] animate-pulse rounded-[30px] border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.06]" />
            ))}
          </div>
        ) : plansQ.isError ? (
          <motion.div variants={fadeUp} className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-rose-700">
            {text.loadingError}
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => {
              const highlighted = plan.code === "studio";
              const isCustom = plan.isCustom;
              return (
                <motion.article
                  key={plan.id}
                  variants={scaleIn}
                  className={cn(
                    "relative flex h-full flex-col rounded-[30px] border p-5 pt-16 sm:p-6 sm:pt-14 shadow-sm",
                    highlighted
                      ? "border-slate-950 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
                      : "border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-white/[0.07] dark:text-white"
                  )}
                >
                  {(highlighted || (billingCycle === "yearly" && !isCustom)) && (
                    <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      {billingCycle === "yearly" && !isCustom ? (
                        <div
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-semibold",
                            highlighted ? "bg-white/10 text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/25 dark:bg-emerald-300/10 dark:text-emerald-200"
                          )}
                        >
                          {text.twoFree}
                        </div>
                      ) : <span />}

                      {highlighted ? (
                        <div className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-950 sm:text-xs">
                          {text.popular}
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div
                    className={cn(
                      "inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 pr-4 text-[11px] font-medium sm:text-xs",
                      highlighted ? "bg-white/10 text-white/90" : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
                    )}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {text.businessPlan}
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold tracking-tight sm:mt-5">{localizePlanNameForLocale(plan, locale)}</h3>
                  <p className={cn("mt-3 text-sm leading-6", highlighted ? "text-white/70" : "text-slate-600 dark:text-slate-300")}>
                    {localizePlanDescription(plan, locale)}
                  </p>

                  <div className="mt-6">
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        {formatPlanPrice(plan.displayPrice, plan.currency || "AMD")}
                      </div>
                      {billingCycle === "yearly" && !isCustom && (
                        <div className={cn("pb-1 text-sm line-through", highlighted ? "text-white/50" : "text-slate-500 dark:text-slate-400")}>
                          {formatPlanPrice((plan.monthly_price ?? plan.price ?? 0) * 12, plan.currency || "AMD")}
                        </div>
                      )}
                    </div>

                    <div className={cn("mt-1 text-sm", highlighted ? "text-white/60" : "text-slate-500 dark:text-slate-400")}>
                      {isCustom ? text.customPrice : billingCycle === "yearly" ? text.yearlyPayment : text.monthlyPayment}
                    </div>

                    {billingCycle === "yearly" && !isCustom && (
                      <div
                        className={cn(
                          "mt-3 rounded-2xl p-3 text-sm leading-6",
                          highlighted ? "bg-white/10 text-white/90" : "border border-violet-100 bg-violet-50 text-slate-700 dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-100"
                        )}
                      >
                        {text.pay} {plan.monthsCharged} {text.months}, {text.receive} {plan.monthsFree} {text.gift}. {text.average}: <span className="font-semibold">{formatPlanPrice(plan.perMonthEffective, plan.currency || "AMD")}/{text.perMonth}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    {planFeatures(plan, locale).map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className={cn("text-sm leading-6", highlighted ? "text-white/80" : "text-slate-600 dark:text-slate-300")}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3">
                    <Link
                      to={isCustom ? "/contact?subject=custom-plan" : `/register?intent=business&plan=${encodeURIComponent(plan.code)}`}
                      className={cn(
                        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-medium transition",
                        highlighted ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-violet-600 text-white hover:bg-violet-700"
                      )}
                    >
                      {isCustom ? text.customCta : text.trialCta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {!isCustom && billingCycle === "yearly" && (
                      <div className={cn("text-center text-xs", highlighted ? "text-white/60" : "text-slate-500 dark:text-slate-400")}>
                        {text.save} {formatPlanPrice(plan.discountAmount, plan.currency || "AMD")}
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
          className="grid gap-6 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(124,58,237,0.06)] dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:p-6 2xl:grid-cols-[1.3fr_0.7fr]"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{text.chooseTitle}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {text.chooseText}
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {text.chooseItems.map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.055] dark:text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-violet-200 bg-[linear-gradient(180deg,#f5f3ff_0%,#ffffff_100%)] p-5 dark:border-violet-300/20 dark:bg-[linear-gradient(180deg,rgba(124,58,237,0.16)_0%,rgba(255,255,255,0.04)_100%)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-200">
              <Building2 className="h-3.5 w-3.5" />
              {text.startBadge}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">{text.startTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {text.startText}
            </p>

            <div className="mt-5 space-y-3">
              <Link
                to="/register?intent=business"
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                {text.startTrial}
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/[0.12]"
              >
                {text.partner}
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </MarketingPageShell>
  );
}
