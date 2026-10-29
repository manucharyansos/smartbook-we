import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, CircleDollarSign, Clock3, CreditCard, Receipt, RefreshCcw, Search, Wallet, XCircle } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { AdminStatCard } from "../components/AdminStatCard";
import { adminBillingApi, type AdminInvoice, type AdminTransaction } from "../services/adminBillingApi";
import { adminLabel, amd, dateTime, verticalLabel } from "../lib/labels";
import { adminErrorText } from "../services/adminApi";

type Action = { kind: "approve"; invoice: AdminInvoice } | { kind: "cancel"; invoice: AdminInvoice } | { kind: "resolve"; transaction: AdminTransaction };

const statusTone: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-600",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
};

function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", statusTone[status] ?? statusTone.cancelled)}>{adminLabel(status)}</span>;
}

function errorText(error: unknown) {
  const data = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
  return Object.values(data?.errors ?? {})[0]?.[0] ?? data?.message ?? "Գործողությունը չհաջողվեց";
}

export default function AdminPayments() {
  const queryClient = useQueryClient();
  let role = "";
  try { role = JSON.parse(localStorage.getItem("admin") || "{}").role ?? ""; } catch { role = ""; }
  const canChange = role === "super_admin";
  const [tab, setTab] = useState<"invoices" | "review" | "attempts">("invoices");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const summaryQ = useQuery({ queryKey: ["admin", "billing", "summary"], queryFn: () => adminBillingApi.summary(), staleTime: 30_000 });
  const invoicesQ = useQuery({ queryKey: ["admin", "billing", "invoices", status, search, page], queryFn: () => adminBillingApi.invoices({ status: status || undefined, search: search.trim() || undefined, page }), enabled: tab === "invoices" });
  const transactionsQ = useQuery({ queryKey: ["admin", "billing", "transactions", tab, page], queryFn: () => adminBillingApi.transactions({ review: tab === "review", page }), enabled: tab !== "invoices" });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin", "billing"] });
  const mutation = useMutation({
    mutationFn: async (current: Action) => {
      if (current.kind === "approve") return adminBillingApi.approve(current.invoice.id, note.trim());
      if (current.kind === "cancel") return adminBillingApi.cancel(current.invoice.id, note.trim() || undefined);
      return adminBillingApi.resolveReview(current.transaction.id, note.trim());
    },
    onSuccess: () => { setMessage({ text: "Պահպանված է" }); setAction(null); setNote(""); refresh(); },
    onError: (error) => setMessage({ text: errorText(error), error: true }),
  });

  const s = summaryQ.data;
  const idram = s?.provider.idram;
  const list = tab === "invoices" ? invoicesQ.data : transactionsQ.data;
  const loading = tab === "invoices" ? invoicesQ.isLoading : transactionsQ.isLoading;
  const noteRequired = action?.kind !== "cancel";

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Vizit-ի եկամուտ"
        title="Վճարումներ"
        description="Բիզնեսների բաժանորդագրության հաշիվները և Idram-ով վճարումները։ Սա Vizit-ի եկամուտն է, ոչ թե բիզնեսների հաճախորդների ամրագրումների գումարը։"
        actions={<Button variant="secondary" onClick={refresh} disabled={summaryQ.isFetching}><RefreshCcw className={cn("h-4 w-4", summaryQ.isFetching && "animate-spin")} /> Թարմացնել</Button>}
      />

      {message ? <div role={message.error ? "alert" : "status"} className={cn("rounded-2xl border px-4 py-3 text-sm", message.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>{message.text}</div> : null}

      {summaryQ.isError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{adminErrorText(summaryQ.error, "Չհաջողվեց բեռնել ամփոփումը")}</div> : null}
      {(tab === "invoices" ? invoicesQ.error : transactionsQ.error) ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{adminErrorText(tab === "invoices" ? invoicesQ.error : transactionsQ.error, "Չհաջողվեց բեռնել ցանկը")}</div> : null}
      {s ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <AdminStatCard title="Այս ամիս ստացված" value={amd(s.income.this_month)} hint={`${amd(s.income.today)} այսօր · ${amd(s.income.all_time)} ընդհանուր`} icon={CircleDollarSign} tone="emerald" />
          <AdminStatCard title="Ամսական կրկնվող եկամուտ" value={amd(s.mrr)} hint={`${s.subscriptions.active} վճարված բաժանորդագրություն · տարեկանը բաժանված 12-ի`} icon={Wallet} tone="violet" />
          <AdminStatCard title="Չվճարված հաշիվներ" value={s.pending.invoices} hint={`${amd(s.pending.amount)} ընդհանուր`} icon={Receipt} tone="amber" />
          <AdminStatCard title="Պահանջում է ստուգում" value={s.review_required} hint="Ստացված, բայց պլանին չկիրառված վճարումներ" icon={AlertTriangle} tone={s.review_required ? "rose" : "slate"} />
        </div>
      ) : null}

      {s ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Idram-ի կապ</h2>
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium", idram?.ready ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>
                {idram?.ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{idram?.ready ? "Միացված" : "Միացված չէ"}
              </span>
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Ակտիվ մատակարար</dt><dd className="font-medium">{s.provider.display_name}</dd></div>
              <div><dt className="text-slate-500">Merchant ID</dt><dd className="font-mono">{idram?.merchant_account || "—"}</dd></div>
              <div><dt className="text-slate-500">Գաղտնի բանալի</dt><dd>{idram?.can_verify_callbacks ? "Կարգավորված է" : "Կարգավորված չէ"}</dd></div>
              <div><dt className="text-slate-500">Վերջին callback</dt><dd>{dateTime(s.provider.last_callback_at)}</dd></div>
            </dl>
            <details className="text-xs text-slate-500"><summary className="cursor-pointer">Idram-ում գրանցված հասցեները</summary>
              <div className="mt-2 space-y-1 break-all font-mono">{idram ? [idram.result_url, idram.success_url, idram.fail_url].map((url) => <div key={url}>{url}</div>) : null}</div>
            </details>
          </Card>
          <Card className="space-y-3 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Բաժանորդագրություններ</h2>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {([["Ակտիվ", s.subscriptions.active], ["Փորձաշրջան", s.subscriptions.trialing], ["Ժամկետանց", s.subscriptions.expired], ["Կասեցված", s.subscriptions.suspended], ["Չեղարկված", s.subscriptions.canceled]] as const).map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 p-3"><div className="text-slate-500">{label}</div><div className="text-xl font-semibold">{value}</div></div>
              ))}
            </div>
            <p className="flex items-center gap-2 text-sm text-slate-600"><Clock3 className="h-4 w-4" />{s.subscriptions.trials_ending_7d} փորձաշրջան ավարտվում է 7 օրում · {s.subscriptions.renewals_due_7d} երկարաձգում 7 օրում</p>
            <p className="text-sm text-slate-600">Այս ամիս. {amd(s.income.period_online)} օնլայն, {amd(s.income.period_manual)} ձեռքով հաստատված։</p>
          </Card>
        </div>
      ) : null}

      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="tablist">
          {([["invoices", "Հաշիվներ"], ["review", `Ստուգում${s?.review_required ? ` (${s.review_required})` : ""}`], ["attempts", "Վճարման փորձեր"]] as const).map(([key, label]) => (
            <Button key={key} role="tab" aria-selected={tab === key} variant={tab === key ? "primary" : "secondary"} size="sm" onClick={() => { setTab(key); setPage(1); }}>{label}</Button>
          ))}
        </div>
        {tab === "invoices" ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-11" placeholder="Բիզնես, հաշվի համար կամ Idram գործարք" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
            <select className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Կարգավիճակ">
              <option value="">Բոլորը</option>{["pending", "approved", "cancelled", "rejected"].map((value) => <option key={value} value={value}>{adminLabel(value)}</option>)}
            </select>
          </div>
        ) : null}
        {tab === "review" ? <p className="text-sm text-slate-600">Վճարումներ, որոնք Idram-ը հաստատել է, բայց պլանին չեն կիրառվել (չեղարկված հաշիվ, կրկնակի վճարում և այլն)։ Վերադարձրու գումարը Idram-ում կամ կիրառիր ձեռքով, հետո նշիր որպես լուծված։</p> : null}

        {loading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Բեռնվում է…</p> : !list?.data.length ? (
          <EmptyState icon={CreditCard} title="Գրառումներ չկան" description={tab === "review" ? "Ստուգում պահանջող վճարումներ չկան։" : "Ընտրված ֆիլտրով ոչինչ չգտնվեց։"} />
        ) : (
          <div className="space-y-3">
            {tab === "invoices" ? (list.data as AdminInvoice[]).map((invoice) => (
              <div key={invoice.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">#{invoice.id}</span><StatusBadge status={invoice.status} />
                    {invoice.transaction?.requires_manual_review ? <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700">Ստուգում</span> : null}</div>
                  <div className="text-sm">{invoice.business ? <Link className="font-medium text-violet-700 hover:underline" to={`/admin/businesses/${invoice.business.id}`}>{invoice.business.name}</Link> : "—"}
                    <span className="text-slate-500"> · {verticalLabel(invoice.business?.vertical, invoice.business?.business_type)} · {invoice.plan?.name ?? "—"} · {adminLabel(invoice.billing_cycle)}</span></div>
                  <div className="text-xs text-slate-500">Ստեղծվել է {dateTime(invoice.created_at)}{invoice.paid_at ? ` · վճարվել է ${dateTime(invoice.paid_at)}` : ""}{invoice.payment_method ? ` · ${adminLabel(invoice.payment_method)}` : ""}
                    {invoice.transaction ? ` · ${invoice.transaction.reference}${invoice.transaction.provider_payment_id ? ` / Idram ${invoice.transaction.provider_payment_id}` : ""}` : ""}{invoice.attempts ? ` · ${invoice.attempts} փորձ` : ""}</div>
                  {invoice.note ? <div className="text-xs text-slate-500">{invoice.note}</div> : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold">{amd(invoice.amount)}</span>
                  {canChange && invoice.status === "pending" ? <>
                    <Button size="sm" onClick={() => { setAction({ kind: "approve", invoice }); setNote(""); setMessage(null); }}>Հաստատել ձեռքով</Button>
                    <Button size="sm" variant="secondary" onClick={() => { setAction({ kind: "cancel", invoice }); setNote(""); setMessage(null); }}>Չեղարկել</Button>
                  </> : null}
                </div>
              </div>
            )) : (list.data as AdminTransaction[]).map((transaction) => (
              <div key={transaction.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm">{transaction.reference}</span><StatusBadge status={transaction.status} />
                    {transaction.requires_manual_review ? <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700">Ստուգում</span> : null}
                    {transaction.duplicate_payment_received ? <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700">Կրկնակի վճարում</span> : null}</div>
                  <div className="text-sm">{transaction.business ? <Link className="font-medium text-violet-700 hover:underline" to={`/admin/businesses/${transaction.business.id}`}>{transaction.business.name}</Link> : "—"}
                    <span className="text-slate-500"> · հաշիվ #{transaction.invoice_id}{transaction.invoice ? ` (${adminLabel(transaction.invoice.status)})` : ""} · {adminLabel(transaction.provider)}</span></div>
                  <div className="text-xs text-slate-500">{dateTime(transaction.created_at)}{transaction.paid_at ? ` · վճարվել է ${dateTime(transaction.paid_at)}` : ""}{transaction.provider_payment_id ? ` · Idram ${transaction.provider_payment_id}` : ""}{transaction.payer_account ? ` · վճարող ${transaction.payer_account}` : ""}</div>
                  {transaction.review_resolved ? <div className="text-xs text-emerald-700">Լուծված {dateTime(transaction.review_resolved.at)} · {transaction.review_resolved.note}</div> : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-lg font-semibold">{amd(transaction.amount)}</span>
                  {canChange && transaction.requires_manual_review ? <Button size="sm" onClick={() => { setAction({ kind: "resolve", transaction }); setNote(""); setMessage(null); }}>Նշել լուծված</Button> : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {list && list.last_page > 1 ? (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Էջ {list.current_page} / {list.last_page} · {list.total}</span>
            <div className="flex gap-2"><Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Նախորդ</Button>
              <Button size="sm" variant="secondary" disabled={page >= list.last_page} onClick={() => setPage((value) => value + 1)}>Հաջորդ</Button></div>
          </div>
        ) : null}
      </Card>

      <Modal open={!!action} onClose={() => setAction(null)} title={action?.kind === "approve" ? "Հաստատել հաշիվը ձեռքով" : action?.kind === "cancel" ? "Չեղարկել հաշիվը" : "Նշել վճարումը լուծված"}>
        {action ? (
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!noteRequired || note.trim().length >= 3) mutation.mutate(action); }}>
            <p className="text-sm text-slate-600">
              {action.kind === "approve" ? `Պլանը կակտիվանա առանց օնլայն վճարման (${amd(action.invoice.amount)})։ Օգտագործիր միայն փոխանցումով կամ կանխիկ ստացված գումարի համար։`
                : action.kind === "cancel" ? `Հաշիվ #${action.invoice.id}-ը և դրա բաց վճարման փորձերը կչեղարկվեն։`
                : `Վճարում ${action.transaction.reference} (${amd(action.transaction.amount)})։ Գրիր՝ ինչ է արվել (օրինակ՝ վերադարձվել է Idram-ում)։`}
            </p>
            <label className="block text-sm font-medium">Նշում{noteRequired ? " (պարտադիր)" : ""}
              <textarea className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} required={noteRequired} minLength={noteRequired ? 3 : undefined} />
            </label>
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setAction(null)}>Փակել</Button>
              <Button type="submit" variant={action.kind === "cancel" ? "danger" : "primary"} loading={mutation.isPending} disabled={noteRequired && note.trim().length < 3}>Հաստատել</Button></div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
