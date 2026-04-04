import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleX, Clock3, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const statusMap = {
  success: {
    title: "Վճարումը հաստատվեց",
    description: "Բանկի էջից վերադարձաք հաջող արդյունքով։ Եթե webhook-ը նույնպես հասել է backend, subscription-ը մի քանի վայրկյանի ընթացքում կակտիվանա։",
    icon: CheckCircle2,
    tone: "text-emerald-600",
    box: "border-emerald-200 bg-emerald-50",
  },
  failed: {
    title: "Վճարումը չհաստատվեց",
    description: "Բանկը վերադարձրեց ձախողված արդյունք։ Կարող եք նորից փորձել billing էջից։",
    icon: CircleX,
    tone: "text-rose-600",
    box: "border-rose-200 bg-rose-50",
  },
  cancelled: {
    title: "Վճարումը չեղարկվեց",
    description: "Գործարքը փակվել է առանց վճարման ավարտի։ Կարող եք նորից սկսել checkout-ը billing բաժնից։",
    icon: Clock3,
    tone: "text-amber-600",
    box: "border-amber-200 bg-amber-50",
  },
} as const;

export default function PaymentReturn() {
  const [params] = useSearchParams();
  const rawStatus = (params.get("status") ?? "success") as keyof typeof statusMap;
  const status = statusMap[rawStatus] ? rawStatus : "success";
  const config = statusMap[status];
  const Icon = config.icon;
  const reference = params.get("reference");
  const invoiceId = params.get("invoice_id");

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
            <Landmark className="h-3.5 w-3.5" /> IDBank hosted payment
          </div>
          <div className={`mt-5 rounded-3xl border p-5 ${config.box}`}>
            <Icon className={`h-10 w-10 ${config.tone}`} />
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">{config.title}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-700">{config.description}</p>
            <div className="mt-4 space-y-1 text-xs text-slate-500">
              {reference ? <div>Reference: <span className="font-medium text-slate-700">{reference}</span></div> : null}
              {invoiceId ? <div>Վճարման հաշիվ՝ <span className="font-medium text-slate-700">#{invoiceId}</span></div> : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app/billing"><Button>Բացել billing էջը</Button></Link>
            <Link to="/app/dashboard"><Button variant="secondary">Գնալ վահանակ</Button></Link>
            <Link to="/login"><Button variant="ghost">Մուտք գործել</Button></Link>
          </div>

          <p className="mt-5 text-xs leading-6 text-white/60">
            Redirect արդյունքը user-facing հուշում է։ Վերջնական state-ը backend-ում պետք է հաստատվի նաև webhook/callback-ով, որ վճարման lifecycle-ը անվտանգ լինի։
          </p>
        </motion.div>
      </div>
    </div>
  );
}
