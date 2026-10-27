import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleX, Clock3, Landmark, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";

import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: {
    processing: ["Վճարման արդյունքը ստուգվում է", "Բանկի էջից վերադարձը դեռ վերջնական հաստատում չէ։ Բացեք վճարումների էջը՝ հաշվի հաստատված կարգավիճակը տեսնելու համար։"],
    success: ["Բանկը վերադարձրել է հաջող արդյունք", "Վճարման վերջնական կարգավիճակը հաստատվում է սերվերի կողմից։ Բացեք վճարումների էջը՝ հաշվի իրական վիճակը տեսնելու համար։"],
    failed: ["Վճարումը չհաստատվեց", "Բանկը վերադարձրել է ձախողված արդյունք։ Կարող եք նորից փորձել վճարումների էջից։"],
    cancelled: ["Վճարումը չեղարկվեց", "Գործարքը փակվել է առանց վճարման ավարտի։ Կարող եք նորից սկսել վճարումների բաժնից։"],
    hosted: "IDBank-ի անվտանգ վճարում", reference: "Հղման համար", invoice: "Վճարման հաշիվ", billing: "Բացել վճարումների էջը", dashboard: "Գնալ վահանակ", login: "Մուտք գործել", note: "Եթե կարգավիճակը միանգամից չի թարմացել, սպասեք մի քանի վայրկյան և կրկին բացեք վճարումների էջը։",
  },
  ru: {
    processing: ["Проверяем результат платежа", "Возврат со страницы банка ещё не означает окончательное подтверждение. Откройте раздел оплаты, чтобы увидеть подтверждённый статус счёта."],
    success: ["Банк вернул успешный результат", "Окончательный статус платежа подтверждается сервером. Откройте раздел оплаты, чтобы увидеть фактическое состояние счёта."],
    failed: ["Платёж не подтверждён", "Банк вернул результат об ошибке. Повторить оплату можно в разделе платежей."],
    cancelled: ["Платёж отменён", "Операция закрыта без завершения оплаты. Начать заново можно в разделе платежей."],
    hosted: "Безопасная оплата IDBank", reference: "Номер операции", invoice: "Счёт", billing: "Открыть раздел оплаты", dashboard: "Перейти в панель", login: "Войти", note: "Если статус обновился не сразу, подождите несколько секунд и снова откройте раздел оплаты.",
  },
  en: {
    processing: ["Checking the payment result", "Returning from the bank page is not final confirmation. Open Billing to see the verified invoice status."],
    success: ["The bank returned a successful result", "The server confirms the final payment status. Open Billing to see the invoice's actual state."],
    failed: ["Payment was not confirmed", "The bank returned a failed result. You can try again from Billing."],
    cancelled: ["Payment was cancelled", "The transaction closed without completing payment. You can restart it from Billing."],
    hosted: "Secure IDBank payment", reference: "Reference", invoice: "Invoice", billing: "Open Billing", dashboard: "Go to dashboard", login: "Sign in", note: "If the status does not update immediately, wait a few seconds and open Billing again.",
  },
} as const;

const statusStyle = {
  processing: { icon: LoaderCircle, tone: "text-[var(--vz-accent-text)]", box: "border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)]" },
  success: { icon: CheckCircle2, tone: "text-[var(--vz-success)]", box: "border-[var(--vz-success-line)] bg-[var(--vz-success-soft)]" },
  failed: { icon: CircleX, tone: "text-[var(--vz-danger)]", box: "border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)]" },
  cancelled: { icon: Clock3, tone: "text-[var(--vz-warning)]", box: "border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)]" },
} as const;

function isPaymentStatus(value: string | null): value is keyof typeof statusStyle {
  return value !== null && Object.prototype.hasOwnProperty.call(statusStyle, value);
}

export default function PaymentReturn() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const [params] = useSearchParams();
  const rawStatus = params.get("status");
  const status: keyof typeof statusStyle = isPaymentStatus(rawStatus) ? rawStatus : "processing";
  const style = statusStyle[status];
  const [title, description] = text[status];
  const Icon = style.icon;
  const reference = params.get("reference");
  const invoiceId = params.get("invoice_id");
  const linkClass = "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition";

  return (
    <div className="min-h-screen bg-[var(--vz-page)] px-4 py-10 text-[var(--vz-text)]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-end"><LanguageToggle compact className="rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)]" /></div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[24px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-[var(--vz-shadow)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--vz-muted)]">
            <Landmark className="h-3.5 w-3.5" /> {text.hosted}
          </div>
          <div className={`mt-5 rounded-3xl border p-5 ${style.box}`}>
            <Icon className={`h-10 w-10 ${style.tone} ${status === "processing" ? "animate-spin" : ""}`} />
            <h1 className="mt-4 text-2xl font-semibold text-[var(--vz-text)]">{title}</h1>
            <p className="mt-2 text-sm leading-7 text-[var(--vz-text-secondary)]">{description}</p>
            <div className="mt-4 space-y-1 text-xs text-[var(--vz-muted)]">
              {reference ? <div>{text.reference}: <span className="break-all font-medium text-[var(--vz-text-secondary)]">{reference}</span></div> : null}
              {invoiceId ? <div>{text.invoice}: <span className="font-medium text-[var(--vz-text-secondary)]">#{invoiceId}</span></div> : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app/billing" className={`${linkClass} bg-[var(--vz-primary)] text-[var(--vz-on-primary)] hover:bg-[var(--vz-primary-hover)]`}>{text.billing}</Link>
            <Link to="/app/dashboard" className={`${linkClass} border border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)] hover:bg-[var(--vz-surface-2)]`}>{text.dashboard}</Link>
            <Link to="/login" className={`${linkClass} text-[var(--vz-text-secondary)] hover:bg-[var(--vz-surface-2)] hover:text-[var(--vz-text)]`}>{text.login}</Link>
          </div>

          <p className="mt-5 text-xs leading-6 text-[var(--vz-muted)]">{text.note}</p>
        </motion.div>
      </div>
    </div>
  );
}
