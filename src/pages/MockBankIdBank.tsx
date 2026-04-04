import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Landmark, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { completeHostedMockPaymentByReference } from "@/lib/paymentsApi";

export default function MockBankIdBank() {
  const [params] = useSearchParams();
  const [busy, setBusy] = useState<"success" | "failed" | "cancelled" | null>(null);
  const reference = params.get("reference") ?? "";
  const amount = params.get("amount") ?? "0";
  const currency = params.get("currency") ?? "AMD";
  const returnUrl = params.get("return_url") ?? "/payment-return";
  const cancelUrl = params.get("cancel_url") ?? "/payment-return?status=cancelled";

  const readableAmount = useMemo(() => Number(amount || 0).toLocaleString("hy-AM"), [amount]);

  async function finish(status: "success" | "failed" | "cancelled") {
    setBusy(status);
    try {
      if (reference) {
        await completeHostedMockPaymentByReference(reference, status);
      }
    } finally {
      const target = status === "cancelled" ? cancelUrl : `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}status=${status}`;
      window.location.href = target;
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-md">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
            <Landmark className="h-3.5 w-3.5" /> IDBank mock hosted page
          </div>
          <h1 className="mt-5 text-2xl font-semibold">Վճարում բանկի էջից</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">Սա mock bank page է, բայց flow-ը նույնն է լինելու live տարբերակում՝ այստեղից հետո callback/webhook-ը կգնա backend, հետո user-ը կվերադառնա ձեր կայք։</p>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Reference</div>
            <div className="mt-1 font-medium">{reference || "—"}</div>
            <div className="mt-4 text-xs uppercase tracking-wide text-slate-400">Amount</div>
            <div className="mt-1 text-xl font-semibold">{readableAmount} {currency}</div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <ShieldCheck className="mt-0.5 h-4 w-4" />
            <div>Hosted payment page տարբերակում քարտային տվյալները չեն մտնում ձեր app-ի մեջ, user-ը վճարում է հենց բանկի էջում։</div>
          </div>

          <div className="mt-6 grid gap-3">
            <Button disabled={!!busy} onClick={() => finish("success")}>
              {busy === "success" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Հաստատել վճարումը
            </Button>
            <Button variant="secondary" disabled={!!busy} onClick={() => finish("failed")}>
              {busy === "failed" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Ձախողել վճարումը
            </Button>
            <Button variant="ghost" disabled={!!busy} onClick={() => finish("cancelled")}>
              {busy === "cancelled" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Չեղարկել և վերադառնալ
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
