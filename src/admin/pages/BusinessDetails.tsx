import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgePercent,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  HandCoins,
  Loader2,
  Pencil,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";

import { adminBusinessesApi } from "../services/adminBusinessesApi";
import { cn } from "@/lib/cn";

type AvailablePlan = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  staff_limit: number;
};

type PricingOverride = {
  id: number;
  plan_id: number;
  plan?: { id: number; code: string; name: string } | null;
  custom_monthly_price?: number | null;
  custom_yearly_price?: number | null;
  effective_monthly_price?: number | null;
  effective_yearly_price?: number | null;
  discount_type?: "percent" | "fixed" | "extra_trial_days" | null;
  discount_value?: number | null;
  billing_cycles_limit?: number | null;
  used_billing_cycles?: number;
  remaining_billing_cycles?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  note?: string | null;
  is_active: boolean;
  is_currently_active: boolean;
  created_at?: string | null;
  creator?: { id: number; name: string } | null;
};

type BusinessDetailsResponse = {
  business: {
    id: number;
    name: string;
    slug: string;
    business_type: "beauty" | "dental";
    phone?: string | null;
    address?: string | null;
    status: string;
    timezone?: string | null;
    work_start?: string | null;
    work_end?: string | null;
    created_at?: string | null;
  };
  subscription?: {
    status: string;
    billing_cycle?: "monthly" | "yearly";
    trial_ends_at?: string | null;
    current_period_ends_at?: string | null;
    is_active: boolean;
    plan?: {
      id: number;
      code: string;
      name: string;
      monthly_price: number;
      yearly_price: number;
      currency: string;
      staff_limit: number;
    } | null;
    pricing?: {
      effective_monthly_price: number;
      effective_yearly_price: number;
      discount_amount: number;
      has_override: boolean;
    } | null;
  } | null;
  seats: {
    active: number;
    limit: number | null;
    has_available: boolean;
    owners_unlimited?: boolean;
    managers_unlimited?: boolean;
  };
  stats: {
    users_total: number;
    users_active: number;
    staff_active: number;
    bookings_total: number;
    bookings_confirmed_done: number;
    revenue_all_time: number;
    currency: string;
  };
  available_plans: AvailablePlan[];
  pricing_overrides: PricingOverride[];
};

type OverrideForm = {
  plan_id: string;
  custom_monthly_price: string;
  custom_yearly_price: string;
  discount_type: "" | "percent" | "fixed" | "extra_trial_days";
  discount_value: string;
  billing_cycles_limit: string;
  starts_at: string;
  ends_at: string;
  note: string;
  is_active: boolean;
};

const EMPTY_AVAILABLE_PLANS: AvailablePlan[] = [];
const EMPTY_PRICING_OVERRIDES: PricingOverride[] = [];

const initialForm: OverrideForm = {
  plan_id: "",
  custom_monthly_price: "",
  custom_yearly_price: "",
  discount_type: "",
  discount_value: "",
  billing_cycles_limit: "",
  starts_at: "",
  ends_at: "",
  note: "",
  is_active: true,
};

function formatMoney(value?: number | null, currency = "AMD") {
  if (value == null) return "—";
  return `${value.toLocaleString("hy-AM")} ${currency}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("hy-AM", { year: "numeric", month: "short", day: "numeric" });
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-[28px] border border-[#E8D5C4]/40 bg-white/90 p-6 shadow-[0_18px_50px_rgba(197,162,138,0.12)]", className)}>
      {children}
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-[24px] border border-[#E8D5C4]/30 bg-gradient-to-br from-white to-[#FFF8F3] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[#8F6B58]">{label}</div>
          <div className="mt-3 text-2xl font-semibold text-[#2C2C2C]">{value}</div>
          {hint ? <div className="mt-2 text-sm text-[#8F6B58]">{hint}</div> : null}
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#C5A28A] to-[#B88E72] text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const businessId = Number(id);
  const [planCode, setPlanCode] = useState("");
  const [trialDays, setTrialDays] = useState("14");
  const [editingOverrideId, setEditingOverrideId] = useState<number | null>(null);
  const [form, setForm] = useState<OverrideForm>(initialForm);

  const detailsQ = useQuery({
    queryKey: ["admin", "business", businessId],
    queryFn: async () => {
      const response = await adminBusinessesApi.get(businessId);
      return response.data.data as unknown as BusinessDetailsResponse;
    },
    enabled: Number.isFinite(businessId) && businessId > 0,
  });

  const changePlanMut = useMutation({
    mutationFn: () => adminBusinessesApi.changePlan(businessId, planCode),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "business", businessId] });
    },
  });

  const extendTrialMut = useMutation({
    mutationFn: () => adminBusinessesApi.extendTrial(businessId, Number(trialDays || 0)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "business", businessId] });
    },
  });

  const saveOverrideMut = useMutation({
    mutationFn: async () => {
      const payload = {
        plan_id: Number(form.plan_id),
        custom_monthly_price: form.custom_monthly_price ? Number(form.custom_monthly_price) : null,
        custom_yearly_price: form.custom_yearly_price ? Number(form.custom_yearly_price) : null,
        discount_type: form.discount_type || null,
        discount_value: form.discount_value ? Number(form.discount_value) : null,
        billing_cycles_limit: form.billing_cycles_limit ? Number(form.billing_cycles_limit) : null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        note: form.note || null,
        is_active: form.is_active,
      };

      if (editingOverrideId) {
        return adminBusinessesApi.updatePricingOverride(businessId, editingOverrideId, payload);
      }

      return adminBusinessesApi.createPricingOverride(businessId, payload);
    },
    onSuccess: async () => {
      setForm(initialForm);
      setEditingOverrideId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "business", businessId] });
    },
  });

  const deleteOverrideMut = useMutation({
    mutationFn: (overrideId: number) => adminBusinessesApi.deletePricingOverride(businessId, overrideId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "business", businessId] });
    },
  });

  const data = detailsQ.data;
  const plans = data?.available_plans ?? EMPTY_AVAILABLE_PLANS;
  const overrides = data?.pricing_overrides ?? EMPTY_PRICING_OVERRIDES;

  const activePlan = data?.subscription?.plan ?? null;
  const effectivePrice = data?.subscription?.pricing ?? null;

  const currentPlanDefault = activePlan?.code ?? plans[0]?.code ?? "";
  const currentPlanId = activePlan?.id ? String(activePlan.id) : String(plans[0]?.id ?? "");

  if (detailsQ.isLoading) {
    return <div className="grid min-h-[55vh] place-items-center"><Loader2 className="h-10 w-10 animate-spin text-[#C5A28A]" /></div>;
  }

  if (detailsQ.isError || !data) {
    return (
      <div className="grid min-h-[55vh] place-items-center px-4 text-center">
        <div>
          <div className="text-xl font-semibold text-[#2C2C2C]">Չհաջողվեց բեռնել բիզնեսի տվյալները</div>
          <button
            onClick={() => navigate("/admin/businesses")}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#2C2C2C] px-5 py-3 text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Վերադառնալ
          </button>
        </div>
      </div>
    );
  }

  const business = data.business;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate("/admin/businesses")} className="mt-1 rounded-2xl border border-[#E8D5C4]/40 bg-white p-3 text-[#8F6B58] transition hover:text-[#2C2C2C]">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8D5C4]/40 bg-white px-3 py-1 text-xs font-medium text-[#8F6B58]">
              <ShieldCheck className="h-3.5 w-3.5" /> Super admin business control
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#2C2C2C]">{business.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#8F6B58]">
              <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" /> {business.slug}</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> {business.work_start?.slice(0,5) || "—"} – {business.work_end?.slice(0,5) || "—"}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> ստեղծվել է {formatDate(business.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> {business.status}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
            <Sparkles className="h-4 w-4" /> {business.business_type === "beauty" ? "Beauty" : "Clinic"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Stat icon={Users} label="Active staff" value={data.seats.active} hint={`Limit · ${data.seats.limit ?? "Custom"}`} />
        <Stat icon={Crown} label="Current plan" value={activePlan?.name ?? "—"} hint="Owner / manager unlimited" />
        <Stat icon={HandCoins} label="Revenue" value={formatMoney(data.stats.revenue_all_time, data.stats.currency)} hint="Confirmed + done bookings" />
        <Stat icon={BadgePercent} label="Effective monthly" value={effectivePrice ? formatMoney(effectivePrice.effective_monthly_price, activePlan?.currency || "AMD") : "—"} hint={effectivePrice?.has_override ? "Անհատական պայմաններ ակտիվ են" : "Public pricing"} />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <Panel className="bg-[radial-gradient(circle_at_top_left,rgba(197,162,138,0.12),transparent_34%),white]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-[#8F6B58]">Plan & billing snapshot</div>
              <h2 className="mt-2 text-2xl font-semibold text-[#2C2C2C]">Պլանների կառավարում</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-[#E8D5C4]/30 bg-[#FFF8F3] p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-[#8F6B58]">Current subscription</div>
              <div className="mt-3 text-xl font-semibold text-[#2C2C2C]">{activePlan?.name ?? "No plan"}</div>
              <div className="mt-3 space-y-2 text-sm text-[#5F4A3C]">
                <div>Monthly: {activePlan ? formatMoney(effectivePrice?.effective_monthly_price ?? activePlan.monthly_price, activePlan.currency) : "—"}</div>
                <div>Yearly: {activePlan ? formatMoney(effectivePrice?.effective_yearly_price ?? activePlan.yearly_price, activePlan.currency) : "—"}</div>
                <div>Staff limit: {activePlan?.staff_limit ?? data.seats.limit ?? "—"}</div>
                <div>Cycle: {data.subscription?.billing_cycle ?? "monthly"}</div>
                <div>Trial ends: {formatDate(data.subscription?.trial_ends_at)}</div>
                <div>Current period end: {formatDate(data.subscription?.current_period_ends_at)}</div>
              </div>
              <div className="mt-4 rounded-2xl border border-[#E8D5C4]/30 bg-white px-4 py-3 text-sm text-[#8F6B58]">
                Պլանները հաշվում են միայն active staff-ը։ Owner և manager հաշիվները անսահմանափակ են։
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#E8D5C4]/30 bg-white p-5">
                <div className="text-sm font-medium text-[#8F6B58]">Change plan</div>
                <select
                  value={planCode || currentPlanDefault}
                  onChange={(e) => setPlanCode(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-[#E8D5C4]/40 bg-[#FFF8F3] px-4 py-3 text-sm outline-none"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.code}>{plan.name} · մինչև {plan.staff_limit} staff</option>
                  ))}
                </select>
                <button
                  onClick={() => changePlanMut.mutate()}
                  disabled={changePlanMut.isPending || !(planCode || currentPlanDefault)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2C2C2C] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                  {changePlanMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Փոխել պլանը
                </button>
              </div>

              <div className="rounded-[24px] border border-[#E8D5C4]/30 bg-white p-5">
                <div className="text-sm font-medium text-[#8F6B58]">Extend trial</div>
                <div className="mt-3 flex gap-3">
                  <input
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded-2xl border border-[#E8D5C4]/40 bg-[#FFF8F3] px-4 py-3 text-sm outline-none"
                    placeholder="Days"
                  />
                  <button
                    onClick={() => extendTrialMut.mutate()}
                    disabled={extendTrialMut.isPending || !trialDays}
                    className="shrink-0 rounded-2xl border border-[#2C2C2C] px-5 py-3 text-sm font-medium text-[#2C2C2C] disabled:opacity-60"
                  >
                    {extendTrialMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ավելացնել"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="text-sm font-medium text-[#8F6B58]">Business details</div>
          <h2 className="mt-2 text-2xl font-semibold text-[#2C2C2C]">Profile snapshot</h2>
          <div className="mt-5 space-y-3 text-sm text-[#5F4A3C]">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8D5C4]/25 bg-[#FFF8F3] px-4 py-3"><span>Phone</span><span>{business.phone || "—"}</span></div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8D5C4]/25 bg-[#FFF8F3] px-4 py-3"><span>Address</span><span className="text-right">{business.address || "—"}</span></div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8D5C4]/25 bg-[#FFF8F3] px-4 py-3"><span>Timezone</span><span>{business.timezone || "—"}</span></div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8D5C4]/25 bg-[#FFF8F3] px-4 py-3"><span>Total users</span><span>{data.stats.users_total}</span></div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8D5C4]/25 bg-[#FFF8F3] px-4 py-3"><span>Active users</span><span>{data.stats.users_active}</span></div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8D5C4]/25 bg-[#FFF8F3] px-4 py-3"><span>Bookings</span><span>{data.stats.bookings_total}</span></div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8D5C4]/25 bg-[#FFF8F3] px-4 py-3"><span>Done/confirmed</span><span>{data.stats.bookings_confirmed_done}</span></div>
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-medium text-[#8F6B58]">Individual business offer</div>
            <h2 className="mt-2 text-2xl font-semibold text-[#2C2C2C]">Անհատական գին ու պայմաններ</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#8F6B58]">
              Այստեղ super admin-ը կոնկրետ ընտրված բիզնեսին կարող է տալ իր անհատական monthly/yearly գինը, զեղչը, ժամկետը ու նշումը։ Այդ առաջարկը կերևա միայն տվյալ բիզնեսի billing էջում։
            </p>
          </div>
          <button
            onClick={() => {
              setEditingOverrideId(null);
              setForm({ ...initialForm, plan_id: currentPlanId || "" });
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#2C2C2C] px-4 py-3 text-sm font-medium text-[#2C2C2C]"
          >
            <Pencil className="h-4 w-4" /> Նոր անհատական առաջարկ
          </button>
        </div>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border border-[#E8D5C4]/30 bg-[#FFF8F3] p-5">
            <div className="text-sm font-medium text-[#8F6B58]">Override editor</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <select value={form.plan_id} onChange={(e) => setForm((prev) => ({ ...prev, plan_id: e.target.value }))} className="rounded-2xl border border-[#E8D5C4]/40 bg-white px-4 py-3 text-sm outline-none">
                <option value="">Ընտրիր պլանը</option>
                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
              </select>
              <select value={form.discount_type} onChange={(e) => setForm((prev) => ({ ...prev, discount_type: e.target.value as OverrideForm["discount_type"] }))} className="rounded-2xl border border-[#E8D5C4]/40 bg-white px-4 py-3 text-sm outline-none">
                <option value="">Առանց discount type</option>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
                <option value="extra_trial_days">Extra trial days</option>
              </select>
              <input value={form.custom_monthly_price} onChange={(e) => setForm((prev) => ({ ...prev, custom_monthly_price: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="Custom monthly price" className="rounded-2xl border border-[#E8D5C4]/40 bg-white px-4 py-3 text-sm outline-none" />
              <input value={form.custom_yearly_price} onChange={(e) => setForm((prev) => ({ ...prev, custom_yearly_price: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="Custom yearly price" className="rounded-2xl border border-[#E8D5C4]/40 bg-white px-4 py-3 text-sm outline-none" />
              <input value={form.discount_value} onChange={(e) => setForm((prev) => ({ ...prev, discount_value: e.target.value.replace(/[^0-9.]/g, "") }))} placeholder="Discount value" className="rounded-2xl border border-[#E8D5C4]/40 bg-white px-4 py-3 text-sm outline-none" />
              <input value={form.billing_cycles_limit} onChange={(e) => setForm((prev) => ({ ...prev, billing_cycles_limit: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="Billing cycles limit" className="rounded-2xl border border-[#E8D5C4]/40 bg-white px-4 py-3 text-sm outline-none" />
              <input type="date" value={form.starts_at} onChange={(e) => setForm((prev) => ({ ...prev, starts_at: e.target.value }))} className="rounded-2xl border border-[#E8D5C4]/40 bg-white px-4 py-3 text-sm outline-none" />
              <input type="date" value={form.ends_at} onChange={(e) => setForm((prev) => ({ ...prev, ends_at: e.target.value }))} className="rounded-2xl border border-[#E8D5C4]/40 bg-white px-4 py-3 text-sm outline-none" />
              <textarea value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Նշում կամ պատճառաբանություն" className="md:col-span-2 min-h-[110px] rounded-2xl border border-[#E8D5C4]/40 bg-white px-4 py-3 text-sm outline-none" />
            </div>
            <label className="mt-4 inline-flex items-center gap-2 text-sm text-[#5F4A3C]">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
              Override-ը ակտիվ է
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => saveOverrideMut.mutate()}
                disabled={saveOverrideMut.isPending || !form.plan_id}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2C2C2C] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {saveOverrideMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />}
                {editingOverrideId ? "Թարմացնել առաջարկը" : "Պահպանել առաջարկը"}
              </button>
              <button
                onClick={() => { setEditingOverrideId(null); setForm(initialForm); }}
                className="rounded-2xl border border-[#E8D5C4]/40 px-5 py-3 text-sm font-medium text-[#5F4A3C]"
              >
                Մաքրել
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {overrides.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#E8D5C4]/50 bg-white p-8 text-center text-sm text-[#8F6B58]">
                Override դեռ չկա։ Կարող ես ստեղծել հատուկ գին կամ զեղչ տվյալ բիզնեսի համար։
              </div>
            ) : (
              overrides.map((override) => (
                <div key={override.id} className="rounded-[24px] border border-[#E8D5C4]/30 bg-white p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-[#8F6B58]">
                        <BadgePercent className="h-3.5 w-3.5" /> {override.plan?.name || `Plan #${override.plan_id}`}
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-[#5F4A3C] sm:grid-cols-2">
                        <div>Monthly: {formatMoney(override.effective_monthly_price ?? override.custom_monthly_price, activePlan?.currency || "AMD")}</div>
                        <div>Yearly: {formatMoney(override.effective_yearly_price ?? override.custom_yearly_price, activePlan?.currency || "AMD")}</div>
                        <div>Discount: {override.discount_type ? `${override.discount_type} · ${override.discount_value ?? 0}` : "—"}</div>
                        <div>Cycles: {override.billing_cycles_limit == null ? "unlimited" : `${override.used_billing_cycles ?? 0} / ${override.billing_cycles_limit} used · ${override.remaining_billing_cycles ?? 0} remaining`}</div>
                        <div>Start: {formatDate(override.starts_at)}</div>
                        <div>End: {formatDate(override.ends_at)}</div>
                      </div>
                      {override.note ? <div className="mt-3 rounded-2xl bg-[#FFF8F3] px-4 py-3 text-sm text-[#8F6B58]">{override.note}</div> : null}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#8F6B58]">
                        <span className={cn("rounded-full px-3 py-1", override.is_currently_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{override.is_currently_active ? "Active now" : "Inactive"}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">Ստեղծել է {override.creator?.name || "admin"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingOverrideId(override.id);
                          setForm({
                            plan_id: String(override.plan_id),
                            custom_monthly_price: override.custom_monthly_price ? String(override.custom_monthly_price) : "",
                            custom_yearly_price: override.custom_yearly_price ? String(override.custom_yearly_price) : "",
                            discount_type: (override.discount_type as OverrideForm["discount_type"]) || "",
                            discount_value: override.discount_value ? String(override.discount_value) : "",
                            billing_cycles_limit: override.billing_cycles_limit ? String(override.billing_cycles_limit) : "",
                            starts_at: override.starts_at ? override.starts_at.slice(0, 10) : "",
                            ends_at: override.ends_at ? override.ends_at.slice(0, 10) : "",
                            note: override.note || "",
                            is_active: override.is_active,
                          });
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8D5C4]/40 px-4 py-2.5 text-sm font-medium text-[#2C2C2C]"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => deleteOverrideMut.mutate(override.id)}
                        disabled={deleteOverrideMut.isPending}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 disabled:opacity-60"
                      >
                        {deleteOverrideMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Panel>
    </motion.div>
  );
}
