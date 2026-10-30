import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgePercent, Plus, Save, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/http";
import type { Locale } from "@/contexts/LanguageContext";

export type ServiceDiscounts = { visit_tiers: { min_visits: number; percent: number }[]; bundle_tiers: { min_services: number; percent: number }[] };
type DiscountSettings = ServiceDiscounts & { visit_enabled: boolean; bundle_enabled: boolean };
type Row = { count: string; percent: string };

const copy = {
  hy: { title: "Զեղչեր հաճախորդների համար", on: "Միացված է", off: "Անջատված է", offHelp: "Անջատված է․ հաճախորդները չեն տեսնի և չեն ստանա այս զեղչը։ Մակարդակները կպահպանվեն։", noneOn: "Երկու զեղչն էլ անջատված են։", intro: "Ընտրիր, թե որ զեղչը ես ուզում՝ մեկը, երկուսն էլ կամ ոչ մեկը, և ինքդ դիր քանակն ու տոկոսը։ Եթե ամրագրումը համապատասխանում է երկու զեղչին էլ, կիրառվում է մեծը։ Զեղչը կիրառվում է կայքից և հավելվածից կատարված ամրագրումներին։",
    visits: "Կրկնվող հաճախորդների համար", visitsHelp: "Քանի ավարտված այցից հետո ինչ զեղչ տալ։ Չեղարկված և չեկած այցերը չեն հաշվվում։", visitCount: "Ավարտված այցեր", bundle: "Մեկ այցում մի քանի ծառայություն", bundleHelp: "Քանի ծառայություն միասին ամրագրելիս ինչ զեղչ տալ։", serviceCount: "Ծառայությունների քանակ",
    percent: "Զեղչ, %", add: "Ավելացնել", remove: "Հեռացնել", save: "Պահպանել զեղչերը", saved: "Զեղչերը պահպանված են", invalid: "Միացված զեղչը պետք է ունենա առնվազն մեկ մակարդակ։ Քանակները չպետք է կրկնվեն, տոկոսը՝ 1-ից 90։", failed: "Չհաջողվեց պահպանել" },
  ru: { title: "Скидки для клиентов", on: "Включено", off: "Выключено", offHelp: "Выключено: клиенты не увидят и не получат эту скидку. Уровни сохранятся.", noneOn: "Обе скидки выключены.", intro: "Выберите, какую скидку давать — одну, обе или ни одной, — и сами задайте количество и процент. Если запись подходит под обе скидки, применяется большая. Скидка действует для записей с сайта и из приложения.",
    visits: "Для постоянных клиентов", visitsHelp: "Какая скидка после скольких завершённых визитов. Отменённые и неявки не считаются.", visitCount: "Завершённых визитов", bundle: "Несколько услуг за визит", bundleHelp: "Какая скидка при записи на несколько услуг сразу.", serviceCount: "Количество услуг",
    percent: "Скидка, %", add: "Добавить", remove: "Удалить", save: "Сохранить скидки", saved: "Скидки сохранены", invalid: "У включённой скидки должен быть хотя бы один уровень. Количества не должны повторяться, процент — от 1 до 90.", failed: "Не удалось сохранить" },
  en: { title: "Client discounts", on: "On", off: "Off", offHelp: "Off: clients will not see or get this discount. Your levels are kept.", noneOn: "Both discounts are off.", intro: "Choose which discount you want — one, both or none — and set the count and percent yourself. If a booking qualifies for both, the larger discount applies. Discounts apply to bookings made on the website and in the app.",
    visits: "For returning clients", visitsHelp: "Which discount after how many completed visits. Cancelled visits and no-shows do not count.", visitCount: "Completed visits", bundle: "Several services in one visit", bundleHelp: "Which discount when several services are booked together.", serviceCount: "Number of services",
    percent: "Discount, %", add: "Add", remove: "Remove", save: "Save discounts", saved: "Discounts saved", invalid: "An enabled discount needs at least one level. Counts must not repeat and the percent must be 1–90.", failed: "Could not save" },
} as const;

const inputClass = "h-11 w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 text-sm text-[var(--vz-text)] outline-none focus:border-[var(--vz-primary)]";

function TierEditor({ title, help, countLabel, percentLabel, rows, minCount, onChange, addLabel, removeLabel, nextDefault, enabled, onToggle, onLabel, offLabel, offHelp }: {
  title: string; help: string; countLabel: string; percentLabel: string; rows: Row[]; minCount: number; onChange: (rows: Row[]) => void; addLabel: string; removeLabel: string; nextDefault: number;
  enabled: boolean; onToggle: (value: boolean) => void; onLabel: string; offLabel: string; offHelp: string;
}) {
  return (
    <div className={`space-y-3 rounded-2xl border p-4 transition ${enabled ? "border-[var(--vz-primary)] bg-[var(--vz-surface-2)]" : "border-[var(--vz-line)] bg-[var(--vz-surface)]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div><div className="font-semibold text-[var(--vz-text)]">{title}</div><p className="mt-1 text-sm text-[var(--vz-text-secondary)]">{help}</p></div>
        <button type="button" role="switch" aria-checked={enabled} aria-label={title} onClick={() => onToggle(!enabled)}
          className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-[var(--vz-primary)]" : "bg-[var(--vz-line)]"}`}>
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${enabled ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
      <div className={`text-xs font-semibold ${enabled ? "text-[var(--vz-success)]" : "text-[var(--vz-muted)]"}`}>{enabled ? onLabel : offLabel}</div>
      {!enabled ? <p className="text-sm text-[var(--vz-muted)]">{offHelp}</p> : (
        <>
          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <label className="text-xs text-[var(--vz-muted)]">{countLabel}<input className={inputClass} inputMode="numeric" min={minCount} value={row.count} onChange={(e) => onChange(rows.map((item, n) => n === index ? { ...item, count: e.target.value.replace(/\D/g, "") } : item))} /></label>
              <label className="text-xs text-[var(--vz-muted)]">{percentLabel}<input className={inputClass} inputMode="numeric" value={row.percent} onChange={(e) => onChange(rows.map((item, n) => n === index ? { ...item, percent: e.target.value.replace(/\D/g, "") } : item))} /></label>
              <Button type="button" variant="danger" aria-label={removeLabel} onClick={() => onChange(rows.filter((_, n) => n !== index))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" disabled={rows.length >= 10} onClick={() => onChange([...rows, { count: String(rows.length ? Number(rows[rows.length - 1].count || 0) + 2 : nextDefault), percent: "5" }])}><Plus className="h-4 w-4" /> {addLabel}</Button>
        </>
      )}
    </div>
  );
}

export default function ServiceDiscountsCard({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["business-service-discounts"], queryFn: async () => (await api.get("/business/service-discounts")).data.data as DiscountSettings });
  const [visits, setVisits] = useState<Row[]>([]);
  const [bundle, setBundle] = useState<Row[]>([]);
  const [visitOn, setVisitOn] = useState(false);
  const [bundleOn, setBundleOn] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (!q.data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the editor starts from the saved tiers once they load
    setVisits(q.data.visit_tiers.map((tier) => ({ count: String(tier.min_visits), percent: String(tier.percent) })));
    setBundle(q.data.bundle_tiers.map((tier) => ({ count: String(tier.min_services), percent: String(tier.percent) })));
    // A type with no saved levels starts switched off, so a new business opts in explicitly.
    setVisitOn(q.data.visit_enabled && q.data.visit_tiers.length > 0);
    setBundleOn(q.data.bundle_enabled && q.data.bundle_tiers.length > 0);
  }, [q.data]);

  const valid = (on: boolean, rows: Row[], min: number) => !on || (rows.length > 0 && rows.every((row) => Number(row.count) >= min && Number(row.percent) >= 1 && Number(row.percent) <= 90)
    && new Set(rows.map((row) => Number(row.count))).size === rows.length);
  // Levels of a switched-off type are kept, minus any half-typed rows the server would reject.
  const keep = (on: boolean, rows: Row[], min: number) => on ? rows : rows.filter((row, index) => Number(row.count) >= min && Number(row.percent) >= 1 && Number(row.percent) <= 90
    && rows.findIndex((other) => Number(other.count) === Number(row.count)) === index);
  const ok = valid(visitOn, visits, 1) && valid(bundleOn, bundle, 2);
  const save = useMutation({
    mutationFn: async () => (await api.put("/business/service-discounts", {
      visit_enabled: visitOn,
      bundle_enabled: bundleOn,
      visit_tiers: keep(visitOn, visits, 1).map((row) => ({ min_visits: Number(row.count), percent: Number(row.percent) })),
      bundle_tiers: keep(bundleOn, bundle, 2).map((row) => ({ min_services: Number(row.count), percent: Number(row.percent) })),
    })).data.data as DiscountSettings,
    onSuccess: (data) => { qc.setQueryData(["business-service-discounts"], data); setMessage({ text: t.saved }); },
    onError: (error) => setMessage({ text: getErrorMessage(error, t.failed), error: true }),
  });

  return (
    <Card className="space-y-4 rounded-[24px] p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--vz-accent-soft)] text-[var(--vz-brand-text)]"><BadgePercent className="h-5 w-5" /></div>
        <div><h2 className="text-lg font-semibold text-[var(--vz-text)]">{t.title}</h2><p className="mt-1 text-sm leading-6 text-[var(--vz-text-secondary)]">{t.intro}</p></div>
      </div>
      {q.isLoading ? <p className="text-sm text-[var(--vz-muted)]">…</p> : (
        <div className="grid gap-3 lg:grid-cols-2">
          <TierEditor title={t.visits} help={t.visitsHelp} countLabel={t.visitCount} percentLabel={t.percent} rows={visits} minCount={1} onChange={setVisits} addLabel={t.add} removeLabel={t.remove} nextDefault={3}
            enabled={visitOn} onToggle={(on) => { setVisitOn(on); if (on && !visits.length) setVisits([{ count: "3", percent: "5" }]); }} onLabel={t.on} offLabel={t.off} offHelp={t.offHelp} />
          <TierEditor title={t.bundle} help={t.bundleHelp} countLabel={t.serviceCount} percentLabel={t.percent} rows={bundle} minCount={2} onChange={setBundle} addLabel={t.add} removeLabel={t.remove} nextDefault={2}
            enabled={bundleOn} onToggle={(on) => { setBundleOn(on); if (on && !bundle.length) setBundle([{ count: "2", percent: "10" }]); }} onLabel={t.on} offLabel={t.off} offHelp={t.offHelp} />
        </div>
      )}
      {!q.isLoading && !visitOn && !bundleOn ? <p className="text-sm text-[var(--vz-muted)]">{t.noneOn}</p> : null}
      {!ok ? <p role="alert" className="text-sm text-[var(--vz-danger)]">{t.invalid}</p> : null}
      {message ? <p role={message.error ? "alert" : "status"} className={message.error ? "text-sm text-[var(--vz-danger)]" : "text-sm text-[var(--vz-success)]"}>{message.text}</p> : null}
      <Button type="button" onClick={() => { setMessage(null); save.mutate(); }} disabled={!ok || q.isLoading} loading={save.isPending}><Save className="h-4 w-4" /> {t.save}</Button>
    </Card>
  );
}
