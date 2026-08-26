import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  Link2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  Users,
} from "lucide-react";

import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { Spinner } from "../components/ui/Spinner";
import LanguageToggle from "../components/LanguageToggle";
import ThemeToggle from "../components/ThemeToggle";
import VizitLogo from "../components/VizitLogo";
import { useAuth } from "../store/auth";
import { getErrorMessage, getHttpStatus, type HttpError } from "../lib/http";

const steps = [
  {
    id: "service",
    title: "Առաջին ծառայությունը",
    subtitle: "Սա կերևա ամրագրման էջում և calendar-ում:",
    icon: Store,
  },
  {
    id: "staff",
    title: "Թիմի առաջին անդամը",
    subtitle: "Ավելացրու աշխատակից կամ մենեջեր:",
    icon: Users,
  },
  {
    id: "hours",
    title: "Ժամեր և ամրագրման քայլ",
    subtitle: "Սահմանում ես աշխատանքային ժամերն ու grid-ի քայլը:",
    icon: Calendar,
  },
  {
    id: "finish",
    title: "Պատրաստ է մեկնարկին",
    subtitle: "Ստուգիր հղումը և անցիր dashboard:",
    icon: CheckCircle2,
  },
] as const;

type SeatLimitError = {
  message?: string;
  limit?: number | null;
  current?: number | null;
};

function extractSeatLimitError(error: unknown): SeatLimitError {
  return ((error as HttpError).response?.data ?? {}) as SeatLimitError;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-slate-700">{children}</label>;
}

function FieldShell({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon ? <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div> : null}
      {children}
    </div>
  );
}

function PrimaryInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  const hasLeading = className?.includes("pl-");
  return (
    <input
      {...rest}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition",
        "placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100/80",
        hasLeading ? undefined : "pl-4",
        className,
      )}
    />
  );
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [price, setPrice] = useState<number | "">("");

  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState<"staff" | "manager">("staff");
  const [staffSkipped, setStaffSkipped] = useState(false);

  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [slotStep, setSlotStep] = useState<number>(15);

  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, setUser } = useAuth();
  const businessName = user?.business_name ?? "Քո բիզնեսը";
  const businessVertical = String(user?.vertical ?? user?.business_type ?? "").toLowerCase();
  const isHealthcare = ["healthcare", "dental", "clinic", "medical", "doctor", "health"].includes(businessVertical);

  const bookingLink = useMemo(
    () => `vizit.am/book/${user?.business_slug ?? "your-business"}`,
    [user?.business_slug],
  );

  const selectedStep = steps[currentStep];

  async function createServiceNext() {
    setError(null);

    const name = serviceName.trim();
    if (name.length < 2) return setError("Ծառայության անունը պարտադիր է (առնվազն 2 նիշ)։");
    if (duration < 5) return setError("Տևողությունը պետք է լինի առնվազն 5 րոպե։");

    setSaving(true);
    try {
      await api.post("/services", {
        name,
        description: serviceDescription.trim() || null,
        duration_minutes: duration,
        price: price === "" ? null : price,
        is_active: true,
        currency: "AMD",
      });

      await qc.invalidateQueries({ queryKey: ["services"] });
      setCurrentStep(1);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Չհաջողվեց ստեղծել ծառայությունը"));
    } finally {
      setSaving(false);
    }
  }

  async function createStaffNext() {
    setError(null);

    const n = staffName.trim();
    const em = staffEmail.trim();

    if (n.length < 2) return setError("Աշխատակցի անունը պարտադիր է։");
    if (!em.includes("@")) return setError("Email-ը սխալ է։");
    if (staffPassword.length < 8) return setError("Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։");

    setSaving(true);
    try {
      await api.post("/staff", {
        name: n,
        email: em,
        password: staffPassword,
        role: staffRole,
        show_in_public_team: staffRole === "staff",
        is_bookable: staffRole === "staff",
      });

      await qc.invalidateQueries({ queryKey: ["staff"] });
      setStaffSkipped(false);
      setCurrentStep(2);
    } catch (e: unknown) {
      if (getHttpStatus(e) === 409) {
        const d = extractSeatLimitError(e);
        const limit = d.limit ?? "—";
        const current = d.current ?? "—";
        setError(`Չհաջողվեց ավելացնել աշխատակից․ տեղերի սահմանաչափը լրացել է: ${current} / ${limit}։`);
      } else {
        setError(getErrorMessage(e, "Չհաջողվեց ավելացնել աշխատակից"));
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveHoursNext() {
    setError(null);

    if (!workStart || !workEnd) return setError("Ընտրիր աշխատանքային ժամերը։");
    if (workStart >= workEnd) return setError("Սկիզբը պետք է փոքր լինի վերջից։");
    if (slotStep < 5 || slotStep > 60) return setError("Քայլը պետք է լինի 5-60 րոպե։");

    setSaving(true);
    try {
      await api.patch("/business/settings", {
        work_start: workStart,
        work_end: workEnd,
        slot_step_minutes: slotStep,
        timezone: "Asia/Yerevan",
      });

      await qc.invalidateQueries();
      setCurrentStep(3);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Չհաջողվեց պահպանել աշխատանքային ժամերը"));
    } finally {
      setSaving(false);
    }
  }

  function skipHours() {
    setError(null);
    setCurrentStep(3);
  }

  function skipStaff() {
    setError(null);
    setStaffSkipped(true);
    setCurrentStep(2);
  }

  async function finish() {
    setError(null);
    setSaving(true);
    try {
      await api.post("/business/complete-onboarding");

      try {
        const me = await api.get("/auth/me");
        if (me?.data?.user) setUser(me.data.user);
      } catch {
        if (user) setUser({ ...user, needs_onboarding: false });
      }

      await qc.invalidateQueries();
      navigate("/app/dashboard", { replace: true });
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Չստացվեց ավարտել onboarding-ը"));
    } finally {
      setSaving(false);
    }
  }

  const durationPresets = [15, 30, 45, 60, 90, 120];
  const slotPresets = [10, 15, 20, 30];

  return (
    <div className="vizit-onboarding-page min-h-screen bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="vizit-onboarding-topbar mx-auto mb-4 flex max-w-7xl items-center justify-between rounded-[22px] border border-white/70 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur-xl sm:px-5">
        <VizitLogo markClassName="!h-9 !w-9" textClassName="!text-[19px]" />
        <div className="flex items-center gap-2">
          <LanguageToggle compact className="vizit-onboarding-language border border-slate-200 bg-white text-slate-700" />
          <ThemeToggle compact className="border border-slate-200 bg-white text-slate-700" />
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-stretch">
        <aside className="xl:w-[300px] xl:sticky xl:top-6 xl:self-start">
          <div className="vizit-onboarding-rail overflow-hidden rounded-[32px] border border-white/70 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
            <div className="vizit-onboarding-rail-head border-b border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,0.95),rgba(76,29,149,0.92))] p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                <Sparkles size={14} />
                Vizit setup
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight">{businessName}</h1>
              <p className="mt-2 max-w-sm text-sm text-white/75">
                Մի քանի կարճ քայլ, և workspace-ը պատրաստ կլինի առաջին աշխատանքային օրվա համար։
              </p>
            </div>

            <div className="space-y-3 p-5">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const active = index === currentStep;
                const completed = index < currentStep;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "rounded-3xl border p-4 transition-all",
                      active
                        ? "border-violet-400/70 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                        : completed
                          ? "border-emerald-400/20 bg-emerald-400/10"
                          : "border-white/10 bg-white/[0.03]",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                          active
                            ? "border-violet-300/50 bg-violet-300/20 text-white"
                            : completed
                              ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
                              : "border-white/10 bg-white/5 text-white/75",
                        )}
                      >
                        {completed ? <Check size={18} /> : <Icon size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white">Քայլ {index + 1}</div>
                        <div className="mt-0.5 text-base font-semibold text-white/95">{step.title}</div>
                        <p className="mt-1 text-sm leading-6 text-white/65">{step.subtitle}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <Link2 size={16} /> Հանրային ամրագրման հղում
                </div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white/80 break-all">
                  {bookingLink}
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-white/60">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                  Այս հղումը հետո էլ կարող ես փոխել settings-ից կամ public profile-ից։
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="vizit-onboarding-card overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/85 shadow-[0_30px_80px_rgba(148,163,184,0.18)] backdrop-blur"
          >
            <div className="border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    <selectedStep.icon size={14} />
                    {selectedStep.title}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[30px]">
                    {selectedStep.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{selectedStep.subtitle}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left sm:text-right">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Progress</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{currentStep + 1} / {steps.length}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="rounded-full bg-slate-100 p-1">
                    <motion.div
                      initial={false}
                      animate={{ opacity: index <= currentStep ? 1 : 0.35, scaleX: index <= currentStep ? 1 : 0.45 }}
                      transition={{ duration: 0.25 }}
                      className={cn(
                        "h-2 origin-left rounded-full",
                        index <= currentStep ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" : "bg-slate-300",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 p-4 sm:p-6 lg:p-8 2xl:grid-cols-[minmax(0,1fr)_300px]">
              <div>
                {error ? (
                  <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                  </div>
                ) : null}

                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <SectionLabel>Ծառայության անվանում</SectionLabel>
                          <FieldShell icon={<Store size={18} />}>
                            <PrimaryInput
                              value={serviceName}
                              onChange={(e) => setServiceName(e.target.value)}
                              className="pl-11"
                              placeholder={isHealthcare ? "Օր․ Սրտաբանի խորհրդատվություն" : "Օր․ Մանիկյուր, Սանրվածք, Մերսում…"}
                            />
                          </FieldShell>
                        </div>

                        <div>
                          <SectionLabel>Գին (AMD)</SectionLabel>
                          <FieldShell icon={<DollarSign size={18} />}>
                            <PrimaryInput
                              type="number"
                              value={price}
                              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                              className="pl-11"
                              min={0}
                              placeholder="5000"
                            />
                          </FieldShell>
                        </div>
                      </div>

                      <div>
                        <SectionLabel>Կարճ նկարագրություն</SectionLabel>
                        <textarea
                          value={serviceDescription}
                          onChange={(event) => setServiceDescription(event.target.value)}
                          rows={3}
                          maxLength={2000}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100/80"
                          placeholder={isHealthcare ? "Օր․ նախնական զննում, խորհրդատվություն և բուժման պլան" : "Նկարագրեք՝ ինչ է ներառում ծառայությունը"}
                        />
                      </div>

                      <div>
                        <SectionLabel>Տևողություն</SectionLabel>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
                          {durationPresets.map((value) => (
                            <button
                              type="button"
                              key={value}
                              onClick={() => setDuration(value)}
                              className={cn(
                                "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                                duration === value
                                  ? "border-violet-300 bg-violet-50 text-violet-700 shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-slate-50",
                              )}
                            >
                              {value} րոպե
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
                          <Clock3 size={16} className="mt-1 shrink-0 text-violet-500" />
                          {isHealthcare
                            ? "Նշեք այցի իրական տևողությունը․ օրինակ՝ բժշկի խորհրդատվությունը կարող է լինել 30 կամ 45 րոպե։"
                            : "Տևողությունը հենց ծառայության ժամանակն է։ Օրինակ՝ սանրվածքը կարող է լինել 45 կամ 60 րոպե։"}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <SectionLabel>Անուն</SectionLabel>
                          <FieldShell icon={<User size={18} />}>
                            <PrimaryInput
                              value={staffName}
                              onChange={(e) => setStaffName(e.target.value)}
                              className="pl-11"
                              placeholder="Օր․ Աննա"
                            />
                          </FieldShell>
                        </div>

                        <div>
                          <SectionLabel>Email</SectionLabel>
                          <FieldShell icon={<Mail size={18} />}>
                            <PrimaryInput
                              value={staffEmail}
                              onChange={(e) => setStaffEmail(e.target.value)}
                              className="pl-11"
                              placeholder="anna@mail.com"
                            />
                          </FieldShell>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <SectionLabel>Մուտքի գաղտնաբառ</SectionLabel>
                          <FieldShell icon={<Lock size={18} />}>
                            <PrimaryInput
                              type="password"
                              value={staffPassword}
                              onChange={(e) => setStaffPassword(e.target.value)}
                              className="pl-11"
                            />
                          </FieldShell>
                          <div className="mt-2 text-xs text-slate-500">Նվազագույնը՝ 8 նիշ։ Հետո կարող եք փոխել։</div>
                        </div>

                        <div>
                          <SectionLabel>Դեր</SectionLabel>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {[
                              {
                                value: "staff",
                                title: "Աշխատակից",
                                desc: "Տեսնում է իր գրաֆիկը և իր ամրագրումները։",
                                icon: Briefcase,
                              },
                              {
                                value: "manager",
                                title: "Մենեջեր",
                                desc: "Կարող է օգնել գրանցումներում և օրվա հոսքում։",
                                icon: ShieldCheck,
                              },
                            ].map((role) => {
                              const Icon = role.icon;
                              const selected = staffRole === role.value;
                              return (
                                <button
                                  key={role.value}
                                  type="button"
                                  onClick={() => setStaffRole(role.value as "staff" | "manager")}
                                  className={cn(
                                    "rounded-3xl border p-4 text-left transition",
                                    selected
                                      ? "border-violet-300 bg-violet-50 shadow-sm"
                                      : "border-slate-200 bg-white hover:border-violet-200",
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                      <Icon size={18} />
                                    </div>
                                    {selected ? <Check size={18} className="text-violet-600" /> : null}
                                  </div>
                                  <div className="mt-4 text-sm font-semibold text-slate-900">{role.title}</div>
                                  <div className="mt-1 text-sm leading-6 text-slate-500">{role.desc}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <SectionLabel>Աշխատանքի սկիզբ</SectionLabel>
                          <PrimaryInput type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} />
                        </div>

                        <div>
                          <SectionLabel>Աշխատանքի ավարտ</SectionLabel>
                          <PrimaryInput type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} />
                        </div>
                      </div>

                      <div>
                        <SectionLabel>Ամրագրման քայլ</SectionLabel>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {slotPresets.map((value) => (
                            <button
                              type="button"
                              key={value}
                              onClick={() => setSlotStep(value)}
                              className={cn(
                                "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                                slotStep === value
                                  ? "border-violet-300 bg-violet-50 text-violet-700 shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-slate-50",
                              )}
                            >
                              {value} րոպե
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                              <Clock3 size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">Ինչ է սա նշանակում</div>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                Սա ծառայության տևողությունը չէ։ Սա calendar-ի grid-ի քայլն է։
                                Օրինակ՝ <strong>15 րոպե</strong> ընտրելու դեպքում համակարգը կաշխատի 09:00, 09:15, 09:30, 09:45… կետերով։
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                        Եթե մոտդ հիմնականում երկար ծառայություններ են, կարող ես ընտրել 20 կամ 30 րոպե։ Եթե ուզում ես ավելի ճկուն calendar, 10 կամ 15 րոպեն ավելի հարմար է։
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-violet-600 text-white shadow-lg">
                        <CheckCircle2 size={38} />
                      </div>

                      <div>
                        <h3 className="text-3xl font-semibold tracking-tight text-slate-950">Ամեն ինչ պատրաստ է</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                          Քո հիմնական տվյալները արդեն ստեղծվել են։ Այժմ կարող ես մտնել dashboard, բացել calendar-ը, և հրապարակային ամրագրման հղումը ուղարկել հաճախորդներին։
                        </p>
                      </div>

                      <div className="grid gap-4 2xl:grid-cols-3">
                        {[
                          { label: "Ծառայություն", value: serviceName || "—" },
                          { label: "Աշխատակից", value: staffSkipped ? "Միայն սեփականատերը" : (staffName || "—") },
                          { label: "Ամրագրման քայլ", value: `${slotStep} րոպե` },
                        ].map((item) => (
                          <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</div>
                            <div className="mt-2 text-base font-semibold text-slate-900">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    {currentStep > 0 && currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
                      >
                        <ArrowLeft size={16} />
                        Հետ
                      </button>
                    ) : null}
                  </div>

                  <div className="ml-auto flex flex-wrap items-center gap-3">
                    {currentStep === 1 || currentStep === 2 ? (
                      <button
                        type="button"
                        onClick={currentStep === 1 ? skipStaff : skipHours}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
                      >
                        {currentStep === 1 ? "Շարունակել առանց աշխատակցի" : "Բաց թողնել"}
                      </button>
                    ) : null}

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={currentStep === 0 ? createServiceNext : currentStep === 1 ? createStaffNext : saveHoursNext}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Spinner size="sm" className="border-white/30 border-t-white" />
                            Պահպանվում…
                          </>
                        ) : (
                          <>
                            Շարունակել
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={finish}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-violet-700 hover:to-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Spinner size="sm" className="border-white/30 border-t-white" />
                            Բեռնվում…
                          </>
                        ) : (
                          <>
                            Բացել dashboard-ը
                            <ChevronRight size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 2xl:sticky 2xl:top-6">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-900">Ինչ կստանաս այս քայլից</div>
                  <ul className="mt-4 space-y-3">
                    {[
                      "Calendar-ը կսկսի աշխատել ճիշտ grid-ով",
                      "Հանրային ամրագրման էջում կհայտնվեն առաջին տվյալները",
                      "Թիմի անդամը կկարողանա մուտք գործել իր հաշիվ",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Check size={12} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">Քո ընթացիկ ընտրությունները</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-slate-500">Ծառայություն</span>
                      <span className="font-medium text-slate-900">{serviceName || "Չկա"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-slate-500">Աշխատակից</span>
                      <span className="font-medium text-slate-900">{staffSkipped ? "Միայն սեփականատերը" : (staffName || "Չկա")}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-slate-500">Ժամեր</span>
                      <span className="font-medium text-slate-900">{workStart} - {workEnd}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-slate-500">Ամրագրման քայլ</span>
                      <span className="font-medium text-slate-900">{slotStep} րոպե</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
