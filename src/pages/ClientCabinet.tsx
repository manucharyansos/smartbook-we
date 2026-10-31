import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarClock, Clock3, History, LogOut, MailCheck, MapPin, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { fadeUp, pageTransition, staggerContainer } from "../lib/motion";
import { cn } from "../lib/cn";
import { getErrorMessage } from "../lib/http";

type BookingRow = {
  id: number;
  booking_code?: string | null;
  status: string;
  starts_at: string;
  ends_at: string;
  final_price?: number | null;
  currency?: string | null;
  business: { name?: string | null; slug?: string | null; logo_url?: string | null; address?: string | null };
  service: { name?: string | null; duration_minutes?: number | null; price?: number | null; currency?: string | null };
  staff: { name?: string | null; avatar_url?: string | null };
};

async function fetchCabinet() {
  const res = await api.get("/client/cabinet/bookings");
  return res.data as {
    data: { upcoming: BookingRow[]; past: BookingRow[] };
    meta: { linked_profiles: number; requires_email_verification: boolean };
  };
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-[var(--vz-warning-soft)] text-[var(--vz-warning)] border-[var(--vz-warning-line)]",
    confirmed: "bg-[var(--vz-success-soft)] text-[var(--vz-success)] border-[var(--vz-success-line)]",
    cancelled: "bg-[var(--vz-danger-soft)] text-[var(--vz-danger)] border-[var(--vz-danger-line)]",
    completed: "bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)] border-[var(--vz-line)]",
    done: "bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)] border-[var(--vz-line)]",
    no_show: "bg-[var(--vz-danger-soft)] text-[var(--vz-danger)] border-[var(--vz-danger-line)]",
  };
  return <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize", map[status] || "bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)] border-[var(--vz-line)]")}>{status.replace("_", " ")}</span>;
}

function formatDate(v?: string) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("hy-AM", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));
}

export default function ClientCabinet() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, setUser, clear } = useAuth();
  const [resending, setResending] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const cabinetQ = useQuery({ queryKey: ["client-cabinet"], queryFn: fetchCabinet });
  const verifiedViaLink = new URLSearchParams(location.search).get("email_verified") === "1";
  const requiresVerification = Boolean(
    user?.requires_email_verification || cabinetQ.data?.meta.requires_email_verification,
  );

  useEffect(() => {
    if (!verifiedViaLink) return;

    let cancelled = false;

    api.get("/client/auth/me")
      .then((response) => {
        if (cancelled) return;
        setUser(response.data.user);
        setVerificationNotice({ type: "success", text: "Email հասցեն հաստատված է։ Ամրագրումները թարմացվել են։" });
        return queryClient.invalidateQueries({ queryKey: ["client-cabinet"] });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setVerificationNotice({ type: "error", text: getErrorMessage(error, "Չհաջողվեց թարմացնել հաշիվը։") });
        }
      })
      .finally(() => {
        if (cancelled) return;
        const params = new URLSearchParams(location.search);
        params.delete("email_verified");
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, navigate, queryClient, setUser, verifiedViaLink]);

  async function resendVerification() {
    setResending(true);
    setVerificationNotice(null);

    try {
      const response = await api.post("/client/auth/email/verification-notification");
      if (response.data?.already_verified) {
        const me = await api.get("/client/auth/me");
        setUser(me.data.user);
        await queryClient.invalidateQueries({ queryKey: ["client-cabinet"] });
        setVerificationNotice({ type: "success", text: "Email հասցեն արդեն հաստատված է։" });
      } else if (response.data?.ok) {
        setVerificationNotice({ type: "success", text: "Հաստատման նամակը նորից ուղարկվել է։" });
      } else {
        setVerificationNotice({ type: "error", text: "Նամակը չուղարկվեց։ Փորձիր մի փոքր ուշ։" });
      }
    } catch (error: unknown) {
      setVerificationNotice({ type: "error", text: getErrorMessage(error, "Նամակը չհաջողվեց ուղարկել։") });
    } finally {
      setResending(false);
    }
  }

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await api.post("/client/auth/logout");
    } catch {
      // Local sign-out must still complete if the token already expired.
    } finally {
      queryClient.clear();
      clear();
      navigate("/client/login", { replace: true });
    }
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="vizit-public-page vizit-client-page min-h-screen">
      <div className="mx-auto max-w-none px-4 py-8 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} className="rounded-[32px] border border-white/70 bg-[var(--vz-surface)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--vz-accent-text)]">
                <Sparkles className="h-3.5 w-3.5" /> Vizit client cabinet
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--vz-text)]">Բարի վերադարձ, {user?.name ?? "հյուր"}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--vz-muted)]">Այստեղ տեսնում ես տարբեր բիզնեսներում կատարած քո առաջիկա և նախորդ ամրագրումները՝ կապված նույն հաստատված email հասցեին։</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/" className="inline-flex items-center justify-center rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-2.5 text-sm font-medium text-[var(--vz-text-secondary)]">Գլխավոր</Link>
              <button disabled={loggingOut} onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--vz-primary)] px-4 py-2.5 text-sm font-medium text-[var(--vz-on-primary)] disabled:cursor-not-allowed disabled:opacity-60">
                <LogOut className="h-4 w-4" /> {loggingOut ? "Դուրս ենք գալիս…" : "Դուրս գալ"}
              </button>
            </div>
          </div>
        </motion.div>

        {requiresVerification ? (
          <motion.div variants={fadeUp} className="mt-6 flex flex-col gap-4 rounded-[28px] border border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)] p-5 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--vz-warning)]" />
              <div>
                <div className="font-semibold">Հաստատիր email հասցեն</div>
                <p className="mt-1 text-sm leading-6 text-[var(--vz-warning)]">Ամրագրումների պատմությունը կերևա միայն email-ի հաստատումից հետո։ Ստուգիր նաև spam թղթապանակը։</p>
              </div>
            </div>
            <button disabled={resending} onClick={resendVerification} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-amber-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
              <RefreshCw className={cn("h-4 w-4", resending && "animate-spin")} />
              {resending ? "Ուղարկվում է…" : "Ուղարկել կրկին"}
            </button>
          </motion.div>
        ) : null}

        {verificationNotice ? (
          <motion.div
            variants={fadeUp}
            className={cn(
              "mt-4 rounded-2xl border px-4 py-3 text-sm",
              verificationNotice.type === "success"
                ? "border-[var(--vz-success-line)] bg-[var(--vz-success-soft)] text-[var(--vz-success)]"
                : "border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] text-[var(--vz-danger)]",
            )}
          >
            {verificationNotice.text}
          </motion.div>
        ) : null}

        <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="mt-6 grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
          <motion.section variants={fadeUp} className="rounded-[28px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--vz-text)]"><CalendarClock className="h-5 w-5 text-[var(--vz-accent-text)]" /> Առաջիկա այցեր</div>
            <div className="mt-5 space-y-4">
              {cabinetQ.isLoading ? <div className="text-sm text-[var(--vz-muted)]">Բեռնում ենք upcoming bookings-ները...</div> : null}
              {(cabinetQ.data?.data.upcoming ?? []).length === 0 && !cabinetQ.isLoading ? <div className="rounded-2xl border border-dashed border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-4 py-6 text-sm text-[var(--vz-muted)]">Առաջիկա այց դեռ չկա։ Նույն հաստատված email-ով ամրագրումը կերևա այստեղ։</div> : null}
              {(cabinetQ.data?.data.upcoming ?? []).map((booking) => (
                <div key={booking.id} className="rounded-[24px] border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-[var(--vz-text)]">{booking.business?.name || "Բիզնես"}</div>
                      <div className="mt-1 text-sm text-[var(--vz-muted)]">{booking.service?.name || "Ծառայություն"} • {formatDate(booking.starts_at)}</div>
                    </div>
                    <StatusPill status={booking.status} />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-[var(--vz-text-secondary)] sm:grid-cols-3">
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[var(--vz-accent-text)]" /> {booking.service?.duration_minutes ? `${booking.service.duration_minutes} րոպե` : "Տևողություն չկա"}</div>
                    <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[var(--vz-accent-text)]" /> {booking.staff?.name || "Աշխատակից չի նշվել"}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--vz-accent-text)]" /> {booking.business?.address || "Հասցե չկա"}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section variants={fadeUp} className="rounded-[28px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--vz-text)]"><History className="h-5 w-5 text-[var(--vz-accent-text)]" /> Նախորդ այցեր</div>
            <div className="mt-5 space-y-4">
              {cabinetQ.isLoading ? <div className="text-sm text-[var(--vz-muted)]">Բեռնում ենք history-ն...</div> : null}
              {(cabinetQ.data?.data.past ?? []).length === 0 && !cabinetQ.isLoading ? <div className="rounded-2xl border border-dashed border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-4 py-6 text-sm text-[var(--vz-muted)]">History դեռ չի գտնվել կապված profile-ների վրա։</div> : null}
              {(cabinetQ.data?.data.past ?? []).slice(0, 8).map((booking) => (
                <div key={booking.id} className="rounded-[22px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-[var(--vz-text)]">{booking.business?.name || "Բիզնես"}</div>
                      <div className="mt-1 text-sm text-[var(--vz-muted)]">{booking.service?.name || "Ծառայություն"}</div>
                    </div>
                    <StatusPill status={booking.status} />
                  </div>
                  <div className="mt-3 text-sm text-[var(--vz-text-secondary)]">{formatDate(booking.starts_at)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] p-4 text-sm leading-7 text-[var(--vz-text-secondary)]">
              Կապված հաճախորդի պրոֆիլներ՝ <span className="font-semibold text-[var(--vz-text)]">{cabinetQ.data?.meta.linked_profiles ?? 0}</span>։ Եթե ամրագրումները չեն երևում, համոզվիր, որ email-ը հաստատված է և համընկնում է ամրագրման ժամանակ նշված հասցեին։
            </div>
          </motion.section>
        </motion.div>
      </div>
    </motion.div>
  );
}
