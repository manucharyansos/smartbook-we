import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, BadgePercent, Ban, Building2, CalendarDays, Clock3, Crown, ExternalLink, HandCoins, Loader2, Pencil,
  Receipt, RotateCcw, Trash2, Users, type LucideIcon,
} from "lucide-react";

import { adminBusinessesApi, type PurgePreview } from "../services/adminBusinessesApi";
import { adminLabel, amd, dateTime, verticalLabel } from "../lib/labels";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Toast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/lib/http";

type AvailablePlan = { id: number; code: string; name: string; monthly_price: number; yearly_price: number; currency: string; staff_limit: number };

type PricingOverride = {
  id: number; plan_id: number; plan?: { id: number; code: string; name: string } | null;
  custom_monthly_price?: number | null; custom_yearly_price?: number | null;
  effective_monthly_price?: number | null; effective_yearly_price?: number | null;
  discount_type?: "percent" | "fixed" | "extra_trial_days" | null; discount_value?: number | null;
  billing_cycles_limit?: number | null; used_billing_cycles?: number; remaining_billing_cycles?: number | null;
  starts_at?: string | null; ends_at?: string | null; note?: string | null;
  is_active: boolean; is_currently_active: boolean; creator?: { id: number; name: string } | null;
};

type Details = {
  business: {
    id: number; name: string; slug: string; business_type: string; vertical?: string | null; phone?: string | null; address?: string | null;
    status: string; billing_status?: string | null; timezone?: string | null; work_start?: string | null; work_end?: string | null;
    is_onboarding_completed?: boolean; is_public_profile_enabled?: boolean; is_marketplace_visible?: boolean; created_at?: string | null;
    locations_count?: number;
  };
  subscription?: {
    status: string; billing_cycle?: string; trial_ends_at?: string | null; current_period_ends_at?: string | null; is_active: boolean;
    plan?: { id: number; code: string; name: string; monthly_price: number; yearly_price: number; currency: string; staff_limit: number } | null;
    pricing?: { effective_monthly_price: number; effective_yearly_price: number; discount_amount: number; has_override: boolean } | null;
  } | null;
  seats: { active: number; limit: number | null };
  stats: { users_total: number; users_active: number; bookings_total: number; bookings_confirmed_done: number; revenue_all_time: number; currency: string };
  available_plans: AvailablePlan[];
  pricing_overrides: PricingOverride[];
  team?: { id: number; name: string; email: string; role: string; is_active: boolean }[];
  billing?: {
    paid_total: number; pending_total: number;
    invoices: { id: number; status: string; amount: number; billing_cycle: string; payment_method: string | null; plan: string | null; created_at: string | null; paid_at: string | null;
      transaction: { reference: string; status: string; provider: string; requires_manual_review: boolean } | null }[];
  };
  rental?: {
    hourly_price: number | null; min_minutes: number; max_minutes: number; buffer_minutes: number; allow_overnight: boolean;
    duration_discounts: { min_minutes: number; percent: number }[]; gallery_count: number;
    bookings_total: number; bookings_upcoming: number; booked_amount: number; last_booking_at: string | null;
  } | null;
};

type OverrideForm = {
  plan_id: string; custom_monthly_price: string; custom_yearly_price: string; discount_type: "" | "percent" | "fixed" | "extra_trial_days";
  discount_value: string; billing_cycles_limit: string; starts_at: string; ends_at: string; note: string; is_active: boolean;
};

const initialForm: OverrideForm = { plan_id: "", custom_monthly_price: "", custom_yearly_price: "", discount_type: "", discount_value: "", billing_cycles_limit: "", starts_at: "", ends_at: "", note: "", is_active: true };
const discountTypeLabel = { percent: "Տոկոս", fixed: "Ֆիքսված գումար", extra_trial_days: "Լրացուցիչ փորձաշրջանի օրեր" } as const;
const countLabels: Record<string, string> = {
  users: "Օգտատերեր", locations: "Մասնաճյուղեր", services: "Ծառայություններ", clients: "Հաճախորդներ", bookings: "Ամրագրումներ",
  invoices: "Vizit-ի հաշիվներ", payment_transactions: "Վճարման փորձեր", gift_cards: "Նվեր քարտեր", gallery_files: "Պատկերասրահ", stored_files: "Ֆայլեր",
};
const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("hy-AM", { year: "numeric", month: "short", day: "numeric" }) : "—";
}

function hours(minutes: number) {
  return `${Math.round(minutes / 60 * 100) / 100} ժ`;
}

function Stat({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: React.ReactNode; hint?: string }) {
  return (
    <Card className="rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>{hint ? <div className="mt-1 text-sm text-slate-500">{hint}</div> : null}</div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-700"><Icon className="h-5 w-5" /></div>
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-800">{value}</span></div>;
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "emerald" | "amber" | "rose" | "violet" }) {
  const tones = { slate: "border-slate-200 bg-slate-50 text-slate-600", emerald: "border-emerald-200 bg-emerald-50 text-emerald-700", amber: "border-amber-200 bg-amber-50 text-amber-700", rose: "border-rose-200 bg-rose-50 text-rose-700", violet: "border-violet-200 bg-violet-50 text-violet-700" };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

const statusTone = (status?: string | null) => status === "active" || status === "approved" || status === "paid" ? "emerald" : status === "pending" || status === "trialing" ? "amber" : status === "suspended" || status === "failed" || status === "expired" ? "rose" : "slate";

export default function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const businessId = Number(id);
  const [planCode, setPlanCode] = useState("");
  const [trialDays, setTrialDays] = useState("14");
  const [editingOverrideId, setEditingOverrideId] = useState<number | null>(null);
  const [form, setForm] = useState<OverrideForm>(initialForm);
  const [statusAction, setStatusAction] = useState<"suspend" | "restore" | null>(null);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const detailsQ = useQuery({
    queryKey: ["admin", "business", businessId],
    queryFn: async () => (await adminBusinessesApi.get(businessId)).data.data as unknown as Details,
    enabled: Number.isFinite(businessId) && businessId > 0,
  });
  const purgeQ = useQuery<PurgePreview>({ queryKey: ["admin", "business", businessId, "purge-preview"], queryFn: () => adminBusinessesApi.purgePreview(businessId), enabled: purgeOpen, staleTime: 0 });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "business", businessId] });
  const done = (text: string) => { setToast({ text, type: "success" }); void refresh(); };
  const fail = (fallback: string) => (error: unknown) => setToast({ text: getErrorMessage(error, fallback), type: "error" });

  const changePlanMut = useMutation({ mutationFn: () => adminBusinessesApi.changePlan(businessId, planCode || currentPlanDefault), onSuccess: () => done("Պլանը փոխվեց"), onError: fail("Պլանը չհաջողվեց փոխել") });
  const extendTrialMut = useMutation({ mutationFn: () => adminBusinessesApi.extendTrial(businessId, Number(trialDays || 0)), onSuccess: () => done("Փորձաշրջանը երկարաձգվեց"), onError: fail("Չհաջողվեց երկարաձգել") });
  const saveOverrideMut = useMutation({
    mutationFn: async () => {
      const payload = {
        plan_id: Number(form.plan_id),
        custom_monthly_price: form.custom_monthly_price ? Number(form.custom_monthly_price) : null,
        custom_yearly_price: form.custom_yearly_price ? Number(form.custom_yearly_price) : null,
        discount_type: form.discount_type || null,
        discount_value: form.discount_value ? Number(form.discount_value) : null,
        billing_cycles_limit: form.billing_cycles_limit ? Number(form.billing_cycles_limit) : null,
        starts_at: form.starts_at || null, ends_at: form.ends_at || null, note: form.note || null, is_active: form.is_active,
      };
      return editingOverrideId ? adminBusinessesApi.updatePricingOverride(businessId, editingOverrideId, payload) : adminBusinessesApi.createPricingOverride(businessId, payload);
    },
    onSuccess: () => { setForm(initialForm); setEditingOverrideId(null); done("Առաջարկը պահպանվեց"); },
    onError: fail("Առաջարկը չհաջողվեց պահպանել"),
  });
  const deleteOverrideMut = useMutation({ mutationFn: (overrideId: number) => adminBusinessesApi.deletePricingOverride(businessId, overrideId), onSuccess: () => done("Առաջարկը ջնջվեց"), onError: fail("Չհաջողվեց ջնջել") });
  const statusMutation = useMutation({
    mutationFn: (action: "suspend" | "restore") => action === "suspend" ? adminBusinessesApi.suspend(businessId) : adminBusinessesApi.restore(businessId),
    onSuccess: (_, action) => { setStatusAction(null); void queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] }); done(action === "suspend" ? "Բիզնեսը կասեցվեց" : "Բիզնեսը վերականգնվեց"); },
    onError: (error) => { setStatusAction(null); fail("Կարգավիճակը չհաջողվեց փոխել")(error); },
  });
  const purgeMutation = useMutation({
    mutationFn: () => adminBusinessesApi.purge(businessId, confirmSlug.trim()),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] }); navigate("/admin/businesses", { replace: true }); },
    onError: fail("Չհաջողվեց ջնջել բիզնեսը"),
  });

  const data = detailsQ.data;
  const plans = data?.available_plans ?? [];
  const overrides = data?.pricing_overrides ?? [];
  const activePlan = data?.subscription?.plan ?? null;
  const effectivePrice = data?.subscription?.pricing ?? null;
  const currentPlanDefault = activePlan?.code ?? plans[0]?.code ?? "";
  const currentPlanId = activePlan?.id ? String(activePlan.id) : String(plans[0]?.id ?? "");

  if (detailsQ.isLoading) return <div className="grid min-h-[55vh] place-items-center"><Loader2 className="h-10 w-10 animate-spin text-violet-500" /></div>;
  if (detailsQ.isError || !data) {
    return <div className="grid min-h-[55vh] place-items-center px-4 text-center"><div>
      <div className="text-xl font-semibold text-slate-900">Չհաջողվեց բեռնել բիզնեսի տվյալները</div>
      <Button className="mt-4" onClick={() => navigate("/admin/businesses")}><ArrowLeft className="h-4 w-4" /> Վերադառնալ</Button>
    </div></div>;
  }

  const business = data.business;
  const rental = data.rental;
  const billing = data.billing;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button type="button" aria-label="Վերադառնալ" onClick={() => navigate("/admin/businesses")} className="mt-1 rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2"><Badge tone={statusTone(business.status)}>{adminLabel(business.status)}</Badge><Badge tone="violet">{verticalLabel(business.vertical, business.business_type)}</Badge>
              {data.subscription ? <Badge tone={statusTone(data.subscription.status)}>Բաժանորդագրություն՝ {adminLabel(data.subscription.status)}</Badge> : <Badge>Բաժանորդագրություն չկա</Badge>}
              {!business.is_onboarding_completed ? <Badge tone="amber">Գրանցումը չի ավարտվել</Badge> : null}</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{business.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <a className="inline-flex items-center gap-1 text-violet-700 hover:underline" href={`/businesses/${business.slug}`} target="_blank" rel="noreferrer"><Building2 className="h-4 w-4" />{business.slug}<ExternalLink className="h-3.5 w-3.5" /></a>
              {!rental ? <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />{business.work_start?.slice(0, 5) || "—"} – {business.work_end?.slice(0, 5) || "—"}</span> : null}
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />գրանցվել է {formatDate(business.created_at)}</span>
            </div>
          </div>
        </div>
        <Button variant={business.status === "suspended" ? "primary" : "danger"} onClick={() => setStatusAction(business.status === "suspended" ? "restore" : "suspend")}>
          {business.status === "suspended" ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}{business.status === "suspended" ? "Վերականգնել" : "Կասեցնել"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Stat icon={Crown} label="Պլան" value={activePlan?.name ?? "—"} hint={data.subscription ? `${adminLabel(data.subscription.billing_cycle ?? "monthly")} · մինչև ${formatDate(data.subscription.status === "trialing" ? data.subscription.trial_ends_at : data.subscription.current_period_ends_at)}` : undefined} />
        <Stat icon={Receipt} label="Վճարել է Vizit-ին" value={amd(billing?.paid_total)} hint={billing?.pending_total ? `${amd(billing.pending_total)} սպասվում է` : "Չվճարված հաշիվ չկա"} />
        {rental ? <Stat icon={HandCoins} label="Տարածքի ամրագրումներ" value={rental.bookings_total} hint={`${rental.bookings_upcoming} առաջիկա · ${amd(rental.booked_amount)}`} />
          : <Stat icon={HandCoins} label="Ամրագրումներ" value={data.stats.bookings_total} hint={`${data.stats.bookings_confirmed_done} հաստատված · ${amd(data.stats.revenue_all_time)} շրջանառություն`} />}
        <Stat icon={Users} label="Թիմ" value={data.stats.users_active} hint={rental ? `${data.stats.users_total} հաշիվ` : `${data.seats.active} աշխատակից · սահման ${data.seats.limit ?? "—"}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Պլան և բաժանորդագրություն</h2>
          <div className="space-y-2">
            <Row label="Ընթացիկ պլան" value={activePlan?.name ?? "—"} />
            <Row label="Ամսական գին" value={activePlan ? amd(effectivePrice?.effective_monthly_price ?? activePlan.monthly_price) : "—"} />
            <Row label="Տարեկան գին" value={activePlan ? amd(effectivePrice?.effective_yearly_price ?? activePlan.yearly_price) : "—"} />
            {effectivePrice?.has_override ? <Row label="Անհատական գին" value={<Badge tone="emerald">Ակտիվ</Badge>} /> : null}
            <Row label="Փորձաշրջանի ավարտ" value={formatDate(data.subscription?.trial_ends_at)} />
            <Row label="Վճարված ժամկետի ավարտ" value={formatDate(data.subscription?.current_period_ends_at)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><label className="text-sm font-medium text-slate-600" htmlFor="admin-plan">Փոխել պլանը</label>
              <select id="admin-plan" value={planCode || currentPlanDefault} onChange={(e) => setPlanCode(e.target.value)} className={inputClass}>
                {plans.map((plan) => <option key={plan.id} value={plan.code}>{plan.name} · {amd(plan.monthly_price)}/ամիս</option>)}
              </select>
              <Button className="w-full" loading={changePlanMut.isPending} disabled={!(planCode || currentPlanDefault)} onClick={() => changePlanMut.mutate()}>Փոխել</Button></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-600" htmlFor="admin-trial">Երկարաձգել փորձաշրջանը, օր</label>
              <input id="admin-trial" inputMode="numeric" value={trialDays} onChange={(e) => setTrialDays(e.target.value.replace(/[^0-9]/g, ""))} className={inputClass} />
              <Button className="w-full" variant="secondary" loading={extendTrialMut.isPending} disabled={!trialDays} onClick={() => extendTrialMut.mutate()}>Ավելացնել</Button></div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Կոնտակտ և թիմ</h2>
          <div className="space-y-2">
            <Row label="Հեռախոս" value={business.phone || "—"} />
            <Row label="Հասցե" value={business.address || "—"} />
            <Row label="Հանրային էջ" value={business.is_public_profile_enabled ? "Միացված" : "Անջատված"} />
            <Row label="Որոնման մեջ" value={business.is_marketplace_visible ? "Ցուցադրվում է" : "Թաքնված"} />
          </div>
          <div className="space-y-2">{(data.team ?? []).map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm">
              <div className="min-w-0"><div className="truncate font-medium text-slate-800">{user.name}</div><a className="truncate text-slate-500 hover:underline" href={`mailto:${user.email}`}>{user.email}</a></div>
              <div className="flex shrink-0 gap-2"><Badge>{adminLabel(user.role)}</Badge>{!user.is_active ? <Badge tone="rose">Անջատված</Badge> : null}</div>
            </div>
          ))}</div>
        </Card>
      </div>

      {rental ? (
        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Վարձով տարածք</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <Row label="Ժամավարձ" value={rental.hourly_price == null ? "Նշված չէ" : amd(rental.hourly_price)} />
            <Row label="Տևողություն" value={`${hours(rental.min_minutes)} – ${hours(rental.max_minutes)}`} />
            <Row label="Ամրագրումների միջև" value={`${rental.buffer_minutes} րոպե`} />
            <Row label="Գիշերակաց" value={rental.allow_overnight ? "Թույլատրված" : "Ոչ"} />
            <Row label="Պատկերասրահ" value={`${rental.gallery_count} ֆայլ`} />
            <Row label="Վերջին ամրագրում" value={dateTime(rental.last_booking_at)} />
          </div>
          <div className="text-sm text-slate-600">Զեղչեր. {rental.duration_discounts.length ? rental.duration_discounts.map((tier) => `${hours(tier.min_minutes)}-ից՝ ${tier.percent}%`).join(" · ") : "չկան"}</div>
        </Card>
      ) : null}

      <Card className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-900">Vizit-ի հաշիվներ</h2>
          <Link className="text-sm font-medium text-violet-700 hover:underline" to="/admin/payments">Բոլոր վճարումները</Link></div>
        {!billing?.invoices.length ? <p className="text-sm text-slate-500">Հաշիվներ դեռ չկան։</p> : (
          <div className="space-y-2">{billing.invoices.map((invoice) => (
            <div key={invoice.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div><span className="font-medium">#{invoice.id}</span> · {invoice.plan ?? "—"} · {adminLabel(invoice.billing_cycle)}
                <div className="text-xs text-slate-500">{dateTime(invoice.created_at)}{invoice.paid_at ? ` · վճարվել է ${dateTime(invoice.paid_at)}` : ""}{invoice.payment_method ? ` · ${adminLabel(invoice.payment_method)}` : ""}{invoice.transaction ? ` · ${invoice.transaction.reference}` : ""}</div></div>
              <div className="flex items-center gap-2"><span className="font-semibold">{amd(invoice.amount)}</span><Badge tone={statusTone(invoice.status)}>{adminLabel(invoice.status)}</Badge>
                {invoice.transaction?.requires_manual_review ? <Badge tone="rose">Ստուգում</Badge> : null}</div>
            </div>
          ))}</div>
        )}
      </Card>

      <Card className="space-y-5 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-xl font-semibold text-slate-900">Անհատական գին</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">Այս բիզնեսի համար հատուկ ամսական/տարեկան գին կամ զեղչ։ Այն երևում է միայն այս բիզնեսի «Պլան և վճարումներ» էջում։</p></div>
          <Button variant="secondary" onClick={() => { setEditingOverrideId(null); setForm({ ...initialForm, plan_id: currentPlanId || "" }); }}><Pencil className="h-4 w-4" /> Նոր առաջարկ</Button>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3 rounded-[24px] border border-slate-100 bg-slate-50 p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-600">Պլան<select value={form.plan_id} onChange={(e) => setForm((prev) => ({ ...prev, plan_id: e.target.value }))} className={cn(inputClass, "mt-1")}><option value="">Ընտրիր</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>
              <label className="text-sm text-slate-600">Զեղչի տեսակ<select value={form.discount_type} onChange={(e) => setForm((prev) => ({ ...prev, discount_type: e.target.value as OverrideForm["discount_type"] }))} className={cn(inputClass, "mt-1")}><option value="">Առանց զեղչի</option>{Object.entries(discountTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="text-sm text-slate-600">Ամսական գին, ֏<input inputMode="numeric" value={form.custom_monthly_price} onChange={(e) => setForm((prev) => ({ ...prev, custom_monthly_price: e.target.value.replace(/[^0-9]/g, "") }))} className={cn(inputClass, "mt-1")} /></label>
              <label className="text-sm text-slate-600">Տարեկան գին, ֏<input inputMode="numeric" value={form.custom_yearly_price} onChange={(e) => setForm((prev) => ({ ...prev, custom_yearly_price: e.target.value.replace(/[^0-9]/g, "") }))} className={cn(inputClass, "mt-1")} /></label>
              <label className="text-sm text-slate-600">Զեղչի արժեք<input inputMode="decimal" value={form.discount_value} onChange={(e) => setForm((prev) => ({ ...prev, discount_value: e.target.value.replace(/[^0-9.]/g, "") }))} className={cn(inputClass, "mt-1")} /></label>
              <label className="text-sm text-slate-600">Քանի վճարման համար<input inputMode="numeric" placeholder="անսահմանափակ" value={form.billing_cycles_limit} onChange={(e) => setForm((prev) => ({ ...prev, billing_cycles_limit: e.target.value.replace(/[^0-9]/g, "") }))} className={cn(inputClass, "mt-1")} /></label>
              <label className="text-sm text-slate-600">Սկիզբ<input type="date" value={form.starts_at} onChange={(e) => setForm((prev) => ({ ...prev, starts_at: e.target.value }))} className={cn(inputClass, "mt-1")} /></label>
              <label className="text-sm text-slate-600">Ավարտ<input type="date" value={form.ends_at} onChange={(e) => setForm((prev) => ({ ...prev, ends_at: e.target.value }))} className={cn(inputClass, "mt-1")} /></label>
              <label className="text-sm text-slate-600 md:col-span-2">Նշում<textarea value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} className={cn(inputClass, "mt-1 min-h-[90px]")} /></label>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} />Ակտիվ է</label>
            <div className="flex flex-wrap gap-2"><Button loading={saveOverrideMut.isPending} disabled={!form.plan_id} onClick={() => saveOverrideMut.mutate()}><BadgePercent className="h-4 w-4" />{editingOverrideId ? "Թարմացնել" : "Պահպանել"}</Button>
              <Button variant="secondary" onClick={() => { setEditingOverrideId(null); setForm(initialForm); }}>Մաքրել</Button></div>
          </div>
          <div className="space-y-3">
            {!overrides.length ? <div className="rounded-[24px] border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Անհատական առաջարկ չկա։</div> : overrides.map((override) => (
              <div key={override.id} className="space-y-2 rounded-[24px] border border-slate-100 p-5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{override.plan?.name || `Պլան #${override.plan_id}`}</span>
                  <Badge tone={override.is_currently_active ? "emerald" : "slate"}>{override.is_currently_active ? "Գործում է" : "Չի գործում"}</Badge></div>
                <div className="grid gap-1 text-slate-600 sm:grid-cols-2">
                  <div>Ամսական՝ {amd(override.effective_monthly_price ?? override.custom_monthly_price)}</div>
                  <div>Տարեկան՝ {amd(override.effective_yearly_price ?? override.custom_yearly_price)}</div>
                  <div>Զեղչ՝ {override.discount_type ? `${discountTypeLabel[override.discount_type]} · ${override.discount_value ?? 0}` : "—"}</div>
                  <div>Վճարումներ՝ {override.billing_cycles_limit == null ? "անսահմանափակ" : `${override.used_billing_cycles ?? 0} / ${override.billing_cycles_limit}`}</div>
                  <div>{formatDate(override.starts_at)} – {formatDate(override.ends_at)}</div>
                  <div>Ստեղծել է՝ {override.creator?.name || "ադմին"}</div>
                </div>
                {override.note ? <div className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-600">{override.note}</div> : null}
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => { setEditingOverrideId(override.id); setForm({
                    plan_id: String(override.plan_id), custom_monthly_price: override.custom_monthly_price ? String(override.custom_monthly_price) : "",
                    custom_yearly_price: override.custom_yearly_price ? String(override.custom_yearly_price) : "", discount_type: override.discount_type || "",
                    discount_value: override.discount_value ? String(override.discount_value) : "", billing_cycles_limit: override.billing_cycles_limit ? String(override.billing_cycles_limit) : "",
                    starts_at: override.starts_at?.slice(0, 10) ?? "", ends_at: override.ends_at?.slice(0, 10) ?? "", note: override.note || "", is_active: override.is_active }); }}><Pencil className="h-4 w-4" /> Խմբագրել</Button>
                  <Button size="sm" variant="danger" loading={deleteOverrideMut.isPending} onClick={() => deleteOverrideMut.mutate(override.id)}><Trash2 className="h-4 w-4" /> Ջնջել</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-3 border-rose-200 p-6">
        <h2 className="text-xl font-semibold text-rose-700">Ջնջել բիզնեսը</h2>
        <p className="text-sm text-slate-600">Թեստային կամ դեմո բիզնեսի համար։ Ընդմիշտ ջնջվում են բիզնեսը, նրա օգտատերերը, ամրագրումները, հաճախորդները, Vizit-ի հաշիվները և ֆայլերը։ Պլանները, կատեգորիաները և հաճախորդների ընդհանուր հաշիվները չեն ջնջվում։</p>
        <Button variant="danger" onClick={() => { setConfirmSlug(""); setPurgeOpen(true); }}><Trash2 className="h-4 w-4" /> Ցույց տալ, թե ինչ կջնջվի</Button>
      </Card>

      <Modal open={purgeOpen} onClose={() => !purgeMutation.isPending && setPurgeOpen(false)} title={`Ջնջե՞լ «${business.name}»-ը`}>
        {purgeQ.isLoading ? <p role="status" className="text-sm text-slate-500">Հաշվում ենք…</p> : purgeQ.isError ? <p role="alert" className="text-sm text-rose-700">Չհաջողվեց բեռնել։</p> : purgeQ.data ? (
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (confirmSlug.trim() === business.slug) purgeMutation.mutate(); }}>
            <div className="grid grid-cols-2 gap-2 text-sm">{Object.entries(purgeQ.data.counts).map(([key, count]) => <div key={key} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2"><span className="text-slate-500">{countLabels[key] ?? key}</span><span className="font-medium">{count}</span></div>)}</div>
            {purgeQ.data.warnings.map((warning) => <div key={warning} role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{warning}</div>)}
            <label className="block text-sm font-medium text-slate-700">Հաստատելու համար գրիր <span className="font-mono">{business.slug}</span>
              <input className={cn(inputClass, "mt-1 font-mono")} value={confirmSlug} onChange={(e) => setConfirmSlug(e.target.value)} autoComplete="off" /></label>
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setPurgeOpen(false)}>Չեղարկել</Button>
              <Button type="submit" variant="danger" loading={purgeMutation.isPending} disabled={confirmSlug.trim() !== business.slug}>Ջնջել ընդմիշտ</Button></div>
          </form>
        ) : null}
      </Modal>

      <ConfirmModal
        open={!!statusAction}
        title={statusAction === "suspend" ? "Կասեցնե՞լ բիզնեսը" : "Վերականգնե՞լ բիզնեսը"}
        description={statusAction === "suspend" ? "Բիզնեսի մուտքն ու հանրային էջը կկասեցվեն։ Օգտատերերի հաշիվները չեն փոխվի։" : "Բիզնեսը կրկին ակտիվ ու հասանելի կդառնա։"}
        confirmText={statusAction === "suspend" ? "Կասեցնել" : "Վերականգնել"}
        danger={statusAction === "suspend"}
        loading={statusMutation.isPending}
        onClose={() => !statusMutation.isPending && setStatusAction(null)}
        onConfirm={() => statusAction && statusMutation.mutate(statusAction)}
      />
      <Toast open={!!toast} text={toast?.text || ""} type={toast?.type} />
    </div>
  );
}
