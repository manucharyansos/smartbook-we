import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleX, Clock3, Landmark, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";

import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../contexts/LanguageContext";
import { getInvoicePaymentStatus } from "../lib/paymentsApi";
import { verifiedPaymentStatus } from "../lib/paymentReturn";
import { SUPPORT_EMAIL } from "../lib/support";
import { useAuth } from "../store/auth";

const copy = {
  hy: {
    unverified: ["Վճարման վերադարձի էջ", "Վճարման հաստատված արդյունքը կերևա գործարքից հետո։ Քո հաշիվները կարող ես տեսնել վճարումների բաժնում։"],
    processing: ["Վճարումը ստուգվում է", "Սպասում ենք վճարային համակարգի սերվերային հաստատմանը։ Պլանը կակտիվանա վճարումը հաստատվելուց հետո։"],
    success: ["Վճարումը հաստատված է", "Վճարումը ստացվել է, և պլանն ակտիվացված է։"],
    failed: ["Վճարումը չի հաստատվել", "Հաշիվը վճարված չէ։ Կարող եք նորից փորձել վճարումների բաժնից։"],
    cancelled: ["Վճարումը չի ավարտվել", "Դուք վերադարձել եք վճարման էջից։ Շարունակում ենք ստուգել հաշվի իրական կարգավիճակը։"],
    review: ["Վճարումը ստացվել է․ անհրաժեշտ է ստուգում", `Խնդրում ենք կրկին չվճարել և կապվել ${SUPPORT_EMAIL} հասցեով՝ նշելով հաշվի համարը։`],
    hosted: "Անվտանգ վճարում", reference: "Գործարքի համար", invoice: "Վճարման հաշիվ", amount: "Գումար", billing: "Բացել վճարումների էջը", dashboard: "Գնալ վահանակ", login: "Մուտք գործել", retry: "Ստուգել կրկին",
    signInNote: "Մուտք գործեք նույն բիզնեսի հաշվով՝ վճարման հաստատված կարգավիճակը տեսնելու համար։",
    error: "Այս պահին չհաջողվեց ստուգել վճարումը։ Փորձեք կրկին կամ բացեք վճարումների բաժինը։",
    note: "Հաստատումը երբեմն տևում է մի քանի վայրկյան։ Այս էջը պարբերաբար ստուգում է հաշվի կարգավիճակը։",
  },
  ru: {
    unverified: ["Возврат после оплаты", "Подтверждённый результат появится после операции. Свои счета можно посмотреть в разделе оплаты."],
    processing: ["Проверяем платёж", "Ожидаем подтверждения от платёжного сервиса. Тариф активируется после подтверждения платежа сервером."],
    success: ["Платёж подтверждён", "Оплата получена, тариф активирован."],
    failed: ["Платёж не подтверждён", "Счёт не оплачен. Повторить попытку можно в разделе платежей."],
    cancelled: ["Оплата не завершена", "Вы вернулись со страницы оплаты. Продолжаем проверять фактическое состояние счёта."],
    review: ["Платёж получен и требует проверки", `Не оплачивайте повторно. Напишите на ${SUPPORT_EMAIL}, указав номер счёта.`],
    hosted: "Безопасная оплата", reference: "Номер операции", invoice: "Счёт", amount: "Сумма", billing: "Открыть раздел оплаты", dashboard: "Перейти в панель", login: "Войти", retry: "Проверить ещё раз",
    signInNote: "Войдите в тот же бизнес-аккаунт, чтобы увидеть подтверждённый статус оплаты.",
    error: "Сейчас не удалось проверить платёж. Повторите попытку или откройте раздел оплаты.",
    note: "Подтверждение иногда занимает несколько секунд. Эта страница периодически проверяет статус счёта.",
  },
  en: {
    unverified: ["Payment return page", "The verified result appears after a transaction. You can view your invoices in Billing."],
    processing: ["Checking your payment", "Waiting for confirmation from the payment service. Your plan activates after the server confirms payment."],
    success: ["Payment confirmed", "Your payment was received and your plan is active."],
    failed: ["Payment was not confirmed", "The invoice is unpaid. You can try again from Billing."],
    cancelled: ["Payment was not completed", "You returned from the payment page. We are still checking the invoice’s actual status."],
    review: ["Payment received and needs review", `Please do not pay again. Contact ${SUPPORT_EMAIL} with the invoice number.`],
    hosted: "Secure payment", reference: "Reference", invoice: "Invoice", amount: "Amount", billing: "Open Billing", dashboard: "Go to dashboard", login: "Sign in", retry: "Check again",
    signInNote: "Sign in to the same business account to see the verified payment status.",
    error: "We could not check your payment right now. Try again or open Billing.",
    note: "Confirmation may take a few seconds. This page periodically checks the invoice status.",
  },
} as const;

const statusStyle = {
  unverified: { icon: Landmark, tone: "text-[var(--vz-accent-text)]", box: "border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)]" },
  processing: { icon: LoaderCircle, tone: "text-[var(--vz-accent-text)]", box: "border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)]" },
  success: { icon: CheckCircle2, tone: "text-[var(--vz-success)]", box: "border-[var(--vz-success-line)] bg-[var(--vz-success-soft)]" },
  failed: { icon: CircleX, tone: "text-[var(--vz-danger)]", box: "border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)]" },
  cancelled: { icon: Clock3, tone: "text-[var(--vz-warning)]", box: "border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)]" },
  review: { icon: Clock3, tone: "text-[var(--vz-warning)]", box: "border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)]" },
} as const;

export default function PaymentReturn() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const user = useAuth((state) => state.user);
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const reference = params.get("reference");
  const rawId = Number(params.get("invoice_id"));
  const invoiceId = Number.isSafeInteger(rawId) && rawId > 0 ? rawId : null;
  const canCheck = Boolean(user?.business_id && invoiceId && reference);
  const paymentQ = useQuery({
    queryKey: ["payment-return", user?.id, user?.business_id, invoiceId, reference],
    queryFn: () => getInvoicePaymentStatus(invoiceId as number),
    enabled: canCheck,
    retry: false,
    refetchInterval: (query) => {
      const transaction = query.state.data?.data.transaction;
      if (query.state.error || transaction?.status === "paid" || transaction?.status === "failed") return false;
      return query.state.dataUpdateCount < 20 ? 3000 : false;
    },
  });
  const transaction = paymentQ.data?.data.transaction;
  const status = invoiceId && reference ? verifiedPaymentStatus(paymentQ.data?.data.invoice, transaction, reference, params.get("status")) : "unverified";
  const style = statusStyle[status];
  const [title, description] = text[status];
  const Icon = style.icon;
  const provider = params.get("provider") === "idram" ? "Idram" : "IDBank";
  const linkClass = "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition";

  useEffect(() => {
    if (status !== "success") return;
    void queryClient.invalidateQueries({ queryKey: ["billing"] });
    void queryClient.invalidateQueries({ queryKey: ["features"] });
  }, [status, queryClient]);

  return (
    <div className="min-h-screen bg-[var(--vz-page)] px-4 py-10 text-[var(--vz-text)]" data-payment-return={status}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-end"><LanguageToggle compact className="rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)]" /></div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[24px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-[var(--vz-shadow)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--vz-muted)]"><Landmark className="h-3.5 w-3.5" /> {provider} · {text.hosted}</div>
          <div className={`mt-5 rounded-3xl border p-5 ${style.box}`} aria-live="polite" role="status">
            <Icon className={`h-10 w-10 ${style.tone} ${status === "processing" ? "animate-spin" : ""}`} />
            <h1 className="mt-4 text-2xl font-semibold text-[var(--vz-text)]">{title}</h1>
            <p className="mt-2 text-sm leading-7 text-[var(--vz-text-secondary)]">{description}</p>
            <div className="mt-4 space-y-1 text-xs text-[var(--vz-muted)]">
              {reference ? <div>{text.reference}: <span className="break-all font-medium text-[var(--vz-text-secondary)]">{reference}</span></div> : null}
              {invoiceId ? <div>{text.invoice}: <span className="font-medium text-[var(--vz-text-secondary)]">#{invoiceId}</span></div> : null}
              {transaction?.provider_transaction_id === reference ? <div>{text.amount}: <span className="font-medium text-[var(--vz-text-secondary)]">{transaction.amount.toLocaleString(locale === "hy" ? "hy-AM" : locale === "ru" ? "ru-RU" : "en-US")} {transaction.currency}</span></div> : null}
            </div>
          </div>
          {paymentQ.isError ? <p role="alert" className="mt-4 text-sm text-[var(--vz-warning)]">{text.error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app/billing" className={`${linkClass} bg-[var(--vz-primary)] text-[var(--vz-on-primary)] hover:bg-[var(--vz-primary-hover)]`}>{text.billing}</Link>
            <Link to="/app/dashboard" className={`${linkClass} border border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)] hover:bg-[var(--vz-surface-2)]`}>{text.dashboard}</Link>
            {!user ? <Link to="/login" className={`${linkClass} text-[var(--vz-text-secondary)] hover:bg-[var(--vz-surface-2)]`}>{text.login}</Link> : null}
            {canCheck && status === "processing" ? <button type="button" disabled={paymentQ.isFetching} onClick={() => void paymentQ.refetch()} className={`${linkClass} border border-[var(--vz-line)] disabled:opacity-50`}>{text.retry}</button> : null}
          </div>
          <p className="mt-5 text-xs leading-6 text-[var(--vz-muted)]">{user ? text.note : text.signInNote}</p>
        </motion.div>
      </div>
    </div>
  );
}
