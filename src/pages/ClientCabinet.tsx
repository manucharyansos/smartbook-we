import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarClock, Clock3, History, LogOut, MapPin, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { fadeUp, pageTransition, staggerContainer } from "../lib/motion";
import { cn } from "../lib/cn";

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
  return res.data as { data: { upcoming: BookingRow[]; past: BookingRow[] }; meta: { linked_profiles: number } };
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
    done: "bg-slate-100 text-slate-700 border-slate-200",
    no_show: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize", map[status] || "bg-slate-100 text-slate-700 border-slate-200")}>{status.replace("_", " ")}</span>;
}

function formatDate(v?: string) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("hy-AM", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));
}

export default function ClientCabinet() {
  const { user, clear } = useAuth();
  const cabinetQ = useQuery({ queryKey: ["client-cabinet"], queryFn: fetchCabinet });

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_22%,#faf7ff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} className="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                <Sparkles className="h-3.5 w-3.5" /> Vizit client cabinet
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Բարի վերադարձ, {user?.name ?? "հյուր"}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">Այստեղ տեսնում ես քո upcoming ու past bookings-ները տարբեր բիզնեսներից, որոնք կապված են նույն email/phone-ին։</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">Գլխավոր</Link>
              <button onClick={() => clear()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
                <LogOut className="h-4 w-4" /> Դուրս գալ
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="mt-6 grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
          <motion.section variants={fadeUp} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><CalendarClock className="h-5 w-5 text-violet-600" /> Առաջիկա այցեր</div>
            <div className="mt-5 space-y-4">
              {cabinetQ.isLoading ? <div className="text-sm text-slate-500">Բեռնում ենք upcoming bookings-ները...</div> : null}
              {(cabinetQ.data?.data.upcoming ?? []).length === 0 && !cabinetQ.isLoading ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Առաջիկա այց դեռ չկա։ Երբ booking անես նույն email/phone-ով, այն կերևա այստեղ։</div> : null}
              {(cabinetQ.data?.data.upcoming ?? []).map((booking) => (
                <div key={booking.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{booking.business?.name || "Բիզնես"}</div>
                      <div className="mt-1 text-sm text-slate-500">{booking.service?.name || "Ծառայություն"} • {formatDate(booking.starts_at)}</div>
                    </div>
                    <StatusPill status={booking.status} />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-violet-600" /> {booking.service?.duration_minutes ? `${booking.service.duration_minutes} րոպե` : "Տևողություն չկա"}</div>
                    <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-violet-600" /> {booking.staff?.name || "Աշխատակից չի նշվել"}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-violet-600" /> {booking.business?.address || "Հասցե չկա"}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section variants={fadeUp} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><History className="h-5 w-5 text-violet-600" /> Նախորդ այցեր</div>
            <div className="mt-5 space-y-4">
              {cabinetQ.isLoading ? <div className="text-sm text-slate-500">Բեռնում ենք history-ն...</div> : null}
              {(cabinetQ.data?.data.past ?? []).length === 0 && !cabinetQ.isLoading ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">History դեռ չի գտնվել կապված profile-ների վրա։</div> : null}
              {(cabinetQ.data?.data.past ?? []).slice(0, 8).map((booking) => (
                <div key={booking.id} className="rounded-[22px] border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{booking.business?.name || "Բիզնես"}</div>
                      <div className="mt-1 text-sm text-slate-500">{booking.service?.name || "Ծառայություն"}</div>
                    </div>
                    <StatusPill status={booking.status} />
                  </div>
                  <div className="mt-3 text-sm text-slate-600">{formatDate(booking.starts_at)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-violet-100 bg-violet-50/70 p-4 text-sm leading-7 text-slate-600">
              Կապված client profile-ներ՝ <span className="font-semibold text-slate-900">{cabinetQ.data?.meta.linked_profiles ?? 0}</span>. Եթե booking-երը չեն երևում, փորձիր նույն email/phone-ը, որով booking ես արել public page-ից։
            </div>
          </motion.section>
        </motion.div>
      </div>
    </motion.div>
  );
}
