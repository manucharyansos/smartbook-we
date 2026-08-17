import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Crown,
  ExternalLink,
  Handshake,
  Landmark,
  Loader2,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { fetchBillingMe } from "@/lib/billingMeApi";
import { createCheckoutSession, getInvoicePaymentStatus, type PaymentTransaction } from "@/lib/paymentsApi";
import type { PublicPlan } from "@/lib/planApi";
import { isCustomPlan, localizePlanName } from "@/lib/planPresentation";

type BillingCycle = "monthly" | "yearly";

type IndividualOffer = {
  id: number;
  title: string;
  base_plan: {
    id: number;
    code: string;
    name: string;
    staff_limit: number;
    services_limit?: number | null;
    locations?: number | null;
    currency: string;
  };
  effective_monthly_price: number;
  effective_yearly_price: number;
  discount_amount: number;
  billing_cycles_limit?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  note?: string | null;
};

type Invoice = {
  id: number;
  amount: number;
  currency: string;
  billing_cycle?: BillingCycle;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
  payment_method?: string | null;
  note?: string | null;
  meta?: {
    base_monthly_amount?: number;
    effective_monthly_amount?: number;
    effective_yearly_amount?: number;
    yearly_months_charged?: number;
    yearly_months_free?: number;
    full_year_amount?: number | null;
    discount_amount?: number;
    pricing_override_id?: number | null;
  } | null;
  plan?: { name: string; code?: string | null } | null;
};

type InvoiceUpgradeResponse = {
  ok: boolean;
  mode: "invoice";
  data: Invoice;
  provider?: {
    default: "idbank" | "idbank_mock";
    mode: string;
    checkout_required: boolean;
  };
};

type InstantUpgradeResponse = {
  ok: boolean;
  mode: "instant";
  data: {
    invoice_id: number;
    subscription_status: string;
    plan: { code: string; name: string; price: number; currency: string };
  };
};

type UpgradeResponse = InvoiceUpgradeResponse | InstantUpgradeResponse;

async function fetchPlans(businessType?: string | null): Promise<PublicPlan[]> {
  const r = await api.get("/plans", {
    params: { business_type: businessType ?? undefined },
  });
  return r.data.data as PublicPlan[];
}

async function fetchInvoices(): Promise<Invoice[]> {
  const r = await api.get("/billing/invoices");
  return r.data.data as Invoice[];
}

async function requestUpgrade(planCode: string, billingCycle: BillingCycle) {
  const r = await api.post("/billing/upgrade-request", {
    plan_code: planCode,
    payment_method: "card",
    billing_cycle: billingCycle,
  });
  return r.data as UpgradeResponse;
}

function formatMoney(amount?: number | null, currency = "AMD") {
  if (amount == null) return "—";
  return `${amount.toLocaleString("hy-AM")} ${currency}`;
}

function cycleLabel(cycle: BillingCycle) {
  return cycle === "yearly" ? "Տարեկան" : "Ամսական";
}

function statusBadge(status?: string | null) {
  const value = String(status ?? "inactive");
  if (value === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (value === "trialing") return "bg-amber-50 text-amber-700 border-amber-200";
  if (value === "suspended") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function requestErrorMessage(error: unknown) {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message || "Չհաջողվեց ստեղծել վճարման հաշիվը։ Փորձիր կրկին։";
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("rounded-[32px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(124,58,237,0.08)]", className)}>
      {children}
    </Card>
  );
}

export default function Billing() {
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const billingQ = useQuery({ queryKey: ["billing", "me"], queryFn: fetchBillingMe, staleTime: 20_000 });
  const currentBusinessType = billingQ.data?.business.business_type ?? null;
  const plansQ = useQuery({
    queryKey: ["plans", "billing-page", currentBusinessType],
    queryFn: () => fetchPlans(currentBusinessType),
    staleTime: 60_000,
  });
  const invoicesQ = useQuery({ queryKey: ["billing", "invoices"], queryFn: fetchInvoices, staleTime: 20_000 });

  const latestInvoice = invoicesQ.data?.[0] ?? null;
  const targetInvoiceId = currentInvoiceId ?? latestInvoice?.id ?? null;

  const paymentStatusQ = useQuery({
    queryKey: ["billing", "payment-status", targetInvoiceId],
    queryFn: () => getInvoicePaymentStatus(targetInvoiceId as number),
    enabled: !!targetInvoiceId,
    refetchInterval: (q) => {
      const transaction = (q.state.data as { data?: { transaction?: PaymentTransaction | null } } | undefined)?.data?.transaction;
      return transaction?.status === "pending" ? 5000 : false;
    },
  });

  const requestMut = useMutation({
    mutationFn: ({ planCode, cycle }: { planCode: string; cycle: BillingCycle }) => requestUpgrade(planCode, cycle),
    onMutate: () => setUpgradeError(null),
    onSuccess: (data) => {
      const invoiceId = data.mode === "invoice" ? data.data.id : data.data.invoice_id;
      if (invoiceId) setCurrentInvoiceId(invoiceId);
      void queryClient.invalidateQueries({ queryKey: ["billing", "invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
    },
    onError: (error) => setUpgradeError(requestErrorMessage(error)),
    onSettled: () => setSelectedPlan(null),
  });

  const checkoutMut = useMutation({
    mutationFn: (invoiceId: number) => createCheckoutSession({ invoice_id: invoiceId, payment_method: "card" }),
    onSuccess: (data) => {
      setCurrentInvoiceId(data.data.invoice_id);
      if (data.data.checkout_url) window.location.href = data.data.checkout_url;
    },
  });

  const subscription = billingQ.data?.subscription ?? null;
  const pricing = billingQ.data?.pricing ?? null;
  const currentTransaction = paymentStatusQ.data?.data.transaction ?? null;

  const individualOffers = useMemo(() => billingQ.data?.individual_offers ?? [], [billingQ.data?.individual_offers]);

  const presentationPlans = useMemo(() => {
    const standardPlans = (plansQ.data ?? []).filter((plan) => !isCustomPlan(plan)).map((plan) => {
      const monthlyPrice = Number(plan.monthly_price ?? plan.price ?? 0);
      const yearlyPrice = Number(plan.yearly_offer?.price ?? monthlyPrice * 10);
      return {
        id: `plan-${plan.id}`,
        code: plan.code,
        name: localizePlanName(plan),
        description: plan.description,
        currency: plan.currency ?? "AMD",
        staff_limit: plan.staff_limit,
        services_limit: plan.services_limit,
        locations: plan.locations,
        monthlyPrice,
        yearlyPrice,
        displayPrice: billingCycle === "yearly" ? yearlyPrice : monthlyPrice,
        discountAmount: plan.yearly_offer?.discount_amount ?? Math.max(monthlyPrice * 12 - yearlyPrice, 0),
        perMonthEffective: Math.round(yearlyPrice / 12),
        isIndividualOffer: false,
        note: null as string | null,
        billingCyclesLimit: null as number | null,
      };
    });

    const offerCards = (individualOffers as IndividualOffer[]).map((offer) => {
      const monthlyPrice = offer.effective_monthly_price;
      const yearlyPrice = offer.effective_yearly_price;
      const isCustomBase = offer.base_plan.code === "custom" || offer.base_plan.staff_limit >= 999;
      return {
        id: `offer-${offer.id}`,
        code: offer.base_plan.code,
        name: offer.title,
        description: `${offer.base_plan.name} · ${isCustomBase ? "16+ ակտիվ մասնագետ" : `մինչև ${offer.base_plan.staff_limit} ակտիվ մասնագետ`}`,
        currency: offer.base_plan.currency,
        staff_limit: offer.base_plan.staff_limit,
        services_limit: offer.base_plan.services_limit,
        locations: offer.base_plan.locations,
        monthlyPrice,
        yearlyPrice,
        displayPrice: billingCycle === "yearly" ? yearlyPrice : monthlyPrice,
        discountAmount: offer.discount_amount ?? Math.max(monthlyPrice * 12 - yearlyPrice, 0),
        perMonthEffective: Math.round(yearlyPrice / 12),
        isIndividualOffer: true,
        note: offer.note ?? null,
        billingCyclesLimit: offer.billing_cycles_limit ?? null,
      };
    });

    const offerCodes = new Set(offerCards.map((offer) => offer.code));
    const filteredStandard = standardPlans.filter((plan) => !offerCodes.has(plan.code));
    return [...filteredStandard, ...offerCards];
  }, [plansQ.data, individualOffers, billingCycle]);

  const currentPlanCode = subscription?.plan?.code ?? null;
  const currentPlanName = currentPlanCode === "custom" && pricing?.has_override
    ? "Անհատական առաջարկ"
    : subscription?.plan ? localizePlanName(subscription.plan) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="admin-page space-y-4">
      <SectionCard className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.10),transparent_35%),white] p-8">
        <div className="flex flex-col gap-5 sm:gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              <Sparkles className="h-4 w-4" /> Վճարումներ · գնագոյացում ըստ մասնագետների
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">Պլան և վճարումներ</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Ընտրիր պլանը ըստ ակտիվ մասնագետների, ծառայությունների և հասցեների քանակի։ Սեփականատիրոջ և մենեջերի հաշիվները սահմանաչափում չեն հաշվվում, իսկ անհատական առաջարկը կերևա հենց այստեղ։
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/app/settings"><Button variant="secondary">Ընդհանուր կարգավորումներ</Button></Link>
              <a href="https://idbank.am/en/business/instruments/trade-finance/v-pos-virtual-pos-terminal-0/" target="_blank" rel="noreferrer">
                <Button>IDBank V-POS <ExternalLink className="h-4 w-4" /></Button>
              </a>
            </div>
          </div>

          <div className="w-full rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_80px_rgba(124,58,237,0.10)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-500">Ընթացիկ պլան</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">{currentPlanName ?? "Ակտիվացում է սպասվում"}</div>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg"><Landmark className="h-6 w-6" /></div>
            </div>

            <div className="mt-4 grid gap-3 grid-cols-2 xl:grid-cols-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Կարգավիճակ</div>
                <div className="mt-2"><span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusBadge(subscription?.status))}>{subscription?.status ?? "inactive"}</span></div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Մասնագետներ</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{billingQ.data?.seats.active_staff ?? 0} / {billingQ.data?.seats.staff_limit ?? "∞"}</div>
                <div className="mt-1 text-xs text-slate-500">Սեփականատերը և մենեջերը չեն հաշվվում</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Ծառայություններ</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{billingQ.data?.usage?.services_count ?? 0} / {billingQ.data?.usage?.services_limit ?? "∞"}</div>
                <div className="mt-1 text-xs text-slate-500">Ընթացիկ ծառայությունների քանակ</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Հասցեներ</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{billingQ.data?.usage?.locations_count ?? 0} / {billingQ.data?.usage?.locations_limit ?? "∞"}</div>
                <div className="mt-1 text-xs text-slate-500">Մասնաճյուղերի և հասցեների սահմանաչափ</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Վճարման provider</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{billingQ.data?.payment_provider?.default === "idbank" ? "IDBank Live" : "IDBank Test"}</div>
                <div className="mt-1 text-xs text-slate-500">Վճարման անվտանգ միջավայր</div>
              </div>

            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Արդյունավետ ամսական արժեք</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{formatMoney(pricing?.effective_monthly_price ?? subscription?.plan?.monthly_price, subscription?.plan?.currency ?? pricing?.currency ?? "AMD")}</div>
                </div>
                {pricing?.has_override ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Անհատական պայմաններն ակտիվ են</span> : null}
              </div>
              <div className="mt-3 text-sm text-slate-600">Տարեկան արժեքը՝ {formatMoney(pricing?.effective_yearly_price ?? subscription?.plan?.yearly_price, subscription?.plan?.currency ?? pricing?.currency ?? "AMD")}</div>
              {pricing?.override?.note ? <div className="mt-3 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-700">{pricing.override.note}</div> : null}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Բոլոր հիմնական գործիքները ներառված են բոլոր պլաններում
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">Փոխել պլանը</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">Համեմատիր բոլոր իրական սահմանաչափերը։ Եթե սուպեր ադմինը ստեղծել է անհատական առաջարկ, այն կերևա որպես առանձին քարտ՝ իր գործող գնով և ժամկետով։</p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button type="button" onClick={() => setBillingCycle("monthly")} className={cn("rounded-[14px] px-4 py-2.5 text-sm font-medium transition", billingCycle === "monthly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600")}>Ամսական</button>
            <button type="button" onClick={() => setBillingCycle("yearly")} className={cn("rounded-[14px] px-4 py-2.5 text-sm font-medium transition", billingCycle === "yearly" ? "bg-violet-600 text-white" : "text-slate-600")}>Տարեկան</button>
          </div>
        </div>

        {plansQ.isError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Չհաջողվեց բեռնել հասանելի պլանները։</div>
        ) : null}

        {upgradeError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{upgradeError}</div>
        ) : null}

        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
          {presentationPlans.map((plan) => {
            const isCurrent = currentPlanCode === plan.code;
            const isBusy = requestMut.isPending && selectedPlan === plan.code;
            return (
              <motion.div key={plan.id} whileHover={{ y: -4 }} className={cn("relative rounded-[30px] border p-6 pt-14 shadow-sm", isCurrent ? "border-violet-600 bg-violet-600 text-white shadow-[0_24px_60px_rgba(124,58,237,0.22)]" : plan.isIndividualOffer ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white")}> 
                {billingCycle === "yearly" ? <div className={cn("absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold", isCurrent ? "bg-white/15 text-white" : plan.isIndividualOffer ? "border border-emerald-200 bg-white text-emerald-700" : "bg-emerald-50 text-emerald-700")}>{plan.isIndividualOffer ? "Անհատական առաջարկ" : "2 ամիս անվճար"}</div> : null}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold">{plan.name}</div>
                    <div className={cn("mt-1 text-sm", isCurrent ? "text-white/70" : plan.isIndividualOffer ? "text-emerald-700" : "text-slate-500")}>{plan.isIndividualOffer ? plan.description : `Մինչև ${plan.staff_limit ?? 0} ակտիվ մասնագետ`}</div>
                  </div>
                  {isCurrent ? <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", isCurrent ? "bg-white/15 text-white" : "bg-violet-50 text-violet-700")}><BadgeCheck className="mr-1 inline h-3.5 w-3.5" /> Ակտիվ</span> : null}
                </div>

                <div className="mt-6 flex items-end gap-2">
                  <div className="text-4xl font-semibold tracking-tight">{plan.displayPrice.toLocaleString("hy-AM")}</div>
                  <div className={cn("pb-1 text-sm", isCurrent ? "text-white/70" : "text-slate-500")}>{plan.currency}</div>
                </div>

                <div className={cn("mt-3 space-y-1 text-sm", isCurrent ? "text-white/80" : "text-slate-600")}>
                  <div>{billingCycle === "yearly" ? `Արդյունավետ՝ ~${formatMoney(plan.perMonthEffective, plan.currency)}/ամիս` : `${formatMoney(plan.monthlyPrice, plan.currency)} / ամիս`}</div>
                  {billingCycle === "yearly" ? <div>{plan.isIndividualOffer ? `Անհատական տարեկան առաջարկ՝ ${formatMoney(plan.yearlyPrice, plan.currency)}` : `Խնայողություն՝ ${formatMoney(plan.discountAmount, plan.currency)}`}</div> : null}
                  <div>{plan.locations && plan.locations > 1 ? `Մինչև ${plan.locations} հասցե` : "1 հասցե"}</div>
                  <div>{plan.services_limit && plan.services_limit < 999 ? `Մինչև ${plan.services_limit} ծառայություն` : 'Ծառայությունների սահմանափակում չկա'}</div>
                  {plan.billingCyclesLimit ? <div>Վավեր է մինչև {plan.billingCyclesLimit} վճարային շրջան</div> : null}
                </div>

                <div className="mt-5 space-y-2">
                  <div className={cn("flex items-center gap-2 text-sm", isCurrent ? "text-white/90" : "text-slate-700")}><Check className="h-4 w-4 text-emerald-500" /> Հանրային ամրագրում և հաճախորդի cabinet</div>
                  <div className={cn("flex items-center gap-2 text-sm", isCurrent ? "text-white/90" : "text-slate-700")}><Check className="h-4 w-4 text-emerald-500" /> Ամրագրումների վահանակ, վերլուծություն և աղբյուրների հետևում</div>
                  <div className={cn("flex items-center gap-2 text-sm", isCurrent ? "text-white/90" : "text-slate-700")}><Check className="h-4 w-4 text-emerald-500" /> Սեփականատեր և մենեջեր՝ անսահմանափակ</div>
                </div>

                {plan.note ? <div className={cn("mt-4 rounded-2xl px-4 py-3 text-sm", isCurrent ? "bg-white/10 text-white/85" : plan.isIndividualOffer ? "border border-emerald-200 bg-white text-emerald-800" : "bg-violet-50 text-violet-700")}>{plan.note}</div> : null}

                <Button className={cn("mt-6 w-full", isCurrent ? "bg-white text-violet-700 hover:bg-white/90" : "")} loading={isBusy} disabled={isCurrent} onClick={() => { setSelectedPlan(plan.code); requestMut.mutate({ planCode: plan.code, cycle: billingCycle }); }}>
                  {isCurrent ? <BadgeCheck className="h-4 w-4" /> : plan.isIndividualOffer ? <Handshake className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  {isCurrent ? "Ընթացիկ պլան" : plan.isIndividualOffer ? (billingCycle === "yearly" ? "Ստեղծել վճարման հաշիվ ըստ անհատական առաջարկի" : "Ստեղծել վճարման հաշիվ ըստ անհատական առաջարկի") : billingCycle === "yearly" ? "Ստեղծել տարեկան վճարման հաշիվ" : "Ստեղծել ամսական վճարման հաշիվ"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Landmark className="h-4 w-4 text-violet-600" /> Վերջին վճարման հաշիվ և checkout</div>
          {!latestInvoice ? (
            <EmptyState icon={Receipt} title="Վճարման հաշիվ դեռ չկա" description="Ընտրիր պլան վերևից, ստեղծիր վճարման հաշիվ և հետո բացիր բանկի checkout-ը։" className="border-0 shadow-none" />
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Invoice</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">#{latestInvoice.id} · {latestInvoice.plan?.name ?? "Plan"}</div>
                  <div className="mt-1 text-sm text-slate-600">{formatMoney(latestInvoice.amount, latestInvoice.currency)} · {cycleLabel((latestInvoice.billing_cycle as BillingCycle | undefined) ?? "monthly")}</div>
                  {latestInvoice.meta?.pricing_override_id ? <div className="mt-2 text-sm text-violet-700">Կիրառվել է անհատական առաջարկ</div> : null}
                  {latestInvoice.meta?.discount_amount ? <div className="mt-2 text-sm text-emerald-700">Discount: {formatMoney(latestInvoice.meta.discount_amount, latestInvoice.currency)}</div> : null}
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Վիճակ</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{latestInvoice.status}</div>
                  <div className="mt-1 text-sm text-slate-600">{new Date(latestInvoice.created_at).toLocaleString("hy-AM")}</div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="text-base font-semibold text-slate-950">Բացել bank checkout-ը</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">Checkout session-ը ստեղծվում է backend-ում, և frontend-ը այլևս provider hardcode չի անում։</p>
                <Button className="mt-4" loading={checkoutMut.isPending} onClick={() => checkoutMut.mutate(latestInvoice.id)}>
                  {checkoutMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} {billingQ.data?.payment_provider?.default === "idbank" ? "Բացել IDBank checkout-ը" : "Բացել IDBank test checkout-ը"}
                </Button>
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><ArrowRight className="h-4 w-4 text-violet-600" /> Transaction timeline</div>
          {currentTransaction ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">Reference</div>
                <div className="mt-2 break-all font-mono text-sm text-slate-700">{currentTransaction.provider_transaction_id}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">Status</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{currentTransaction.status}</div>
                <div className="mt-1 text-sm text-slate-600">{formatMoney(currentTransaction.amount, currentTransaction.currency)}</div>
              </div>
            </div>
          ) : (
            <EmptyState icon={Sparkles} title="Transaction դեռ չկա" description="Checkout session բացելուց հետո այստեղ կերևա transaction reference-ը և վերջնական status-ը։" className="border-0 shadow-none" />
          )}
        </SectionCard>
      </div>
    </motion.div>
  );
}
