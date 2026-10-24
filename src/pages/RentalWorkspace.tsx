import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../store/auth";
import { rentalCopy } from "../i18n/rentals";
import { rentalApi, rentalToday, type RentalBooking } from "../lib/rentalApi";
import { createBlock, deleteBlock, fetchBlocks } from "../lib/calendarBlocksApi";
import { getErrorMessage } from "../lib/http";
import { Modal } from "../components/ui/Modal";
import "../rentals.css";

function monthBounds(value: string): [string, string] {
  const [year, month] = value.split("-").map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [`${value.slice(0, 7)}-01`, `${value.slice(0, 7)}-${last}`];
}

export default function RentalWorkspace() {
  const { locale } = useLanguage(); const t = rentalCopy[locale]; const location = useLocation();
  const user = useAuth((state) => state.user); const queryClient = useQueryClient();
  const view = location.pathname.endsWith("analytics") ? "analytics" : location.pathname.endsWith("calendar") ? "calendar" : "dashboard";
  const [from, setFrom] = useState(() => monthBounds(rentalToday())[0]); const [to, setTo] = useState(() => monthBounds(rentalToday())[1]);
  const [selectedDay, setSelectedDay] = useState(""); const [selectedId, setSelectedId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false); const [blockOpen, setBlockOpen] = useState(false); const [message, setMessage] = useState("");
  const bookingsQ = useQuery({ queryKey: ["rental-bookings", from, to], queryFn: () => rentalApi.bookings(from, to), refetchInterval: 30000 });
  const summaryQ = useQuery({ queryKey: ["rental-summary", from, to], queryFn: () => rentalApi.summary(from, to), refetchInterval: 30000 });
  const ratesQ = useQuery({ queryKey: ["rental-settings"], queryFn: rentalApi.settings });
  const blocksQ = useQuery({ queryKey: ["rental-blocks", from, to], queryFn: () => fetchBlocks(from, to), enabled: view === "calendar" });
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["rental-bookings"] }); void queryClient.invalidateQueries({ queryKey: ["rental-summary"] }); void queryClient.invalidateQueries({ queryKey: ["rental-blocks"] }); };
  const fail = (error: unknown) => setMessage(getErrorMessage(error, t.error));
  const removeBlock = useMutation({ mutationFn: deleteBlock, onError: fail, onSuccess: refresh });
  const summary = summaryQ.data; const all = bookingsQ.data || [];
  const current = all.find((item) => item.id === selectedId);
  const money = (value: number) => `${value.toLocaleString(locale === "hy" ? "hy-AM" : locale)} ֏`;
  const datePart = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
  const stamp = (value: string) => new Date(value).toLocaleString(locale === "hy" ? "hy-AM" : locale, { timeZone: "Asia/Yerevan", dateStyle: "short", timeStyle: "short" });
  const items = selectedDay && view === "calendar" ? all.filter((item) => datePart(item.starts_at) === selectedDay) : all;
  const statuses = t.statuses as Record<string, string>;
  function shiftMonth(offset: number) { const [year, month] = from.split("-").map(Number); const next = new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0, 10); const bounds = monthBounds(next); setFrom(bounds[0]); setTo(bounds[1]); setSelectedDay(""); }
  const first = new Date(`${from.slice(0, 7)}-01T12:00:00Z`); const emptyDays = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const metrics: [string, string][] = summary ? [
    [t.bookings, String(summary.bookings_count)], [t.booked, money(summary.booked_amount)], [t.net, money(summary.net_received)], [t.debt, money(summary.outstanding_amount)],
    [t.completed, money(summary.completed_amount)], [t.refunded, money(summary.refunded_amount)], [t.refundDue, money(summary.refund_due)], [t.occupancy, `${summary.occupancy_percent}%`],
  ] : [];
  return <div className="rental-workspace">
    <div className="rental-row rental-between"><div><span className="rental-badge">{t.title}</span><h1 style={{ marginTop: 10 }}>{view === "analytics" ? t.analytics : view === "calendar" ? t.calendar : t.dashboard}</h1></div>
      <div className="rental-row"><Link to={`/businesses/${user?.business_slug}`} className="rental-btn secondary" target="_blank">{t.publicPage}</Link><button className="rental-btn" onClick={() => setCreateOpen(true)}><Plus size={18} />{t.manual}</button></div>
    </div>
    {message && <div className="rental-note rental-error" role="alert" style={{ marginTop: 20 }}>{message}</div>}
    {view !== "calendar" && <div className="rental-fields" style={{ marginTop: 24, maxWidth: 500 }}><label className="rental-field">{t.from}<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></label><label className="rental-field">{t.to}<input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} /></label></div>}
    {summaryQ.isPending && <p role="status">{t.loading}</p>}
    {(summaryQ.isError || bookingsQ.isError) && <div className="rental-note rental-error" role="alert">{t.error}<button className="rental-btn secondary" onClick={() => { void summaryQ.refetch(); void bookingsQ.refetch(); }}>{t.retry}</button></div>}
    {view !== "calendar" && <><div className="rental-metrics">{metrics.map(([label, value]) => <div key={label} className="rental-metric"><span className="rental-muted">{label}</span><strong>{value}</strong></div>)}</div><p className="rental-muted">{t.ledgerHelp}</p>
      {summary && <div className="rental-note" style={{ margin: "20px 0" }}>{t.subscription}: <strong>{money(summary.monthly_subscription || 25000)}</strong> · {t.subscriptionHelp}<p>{t.pending}: {summary.pending_count} · {t.statuses.cancelled}: {summary.cancelled_count} · {t.duration}: {Math.round(summary.booked_minutes / 60 * 10) / 10} {t.hours}</p></div>}
    </>}
    {view === "calendar" && <section className="rental-card" style={{ marginTop: 24 }}>
      <div className="rental-row rental-between" style={{ marginBottom: 20 }}><div className="rental-row"><button className="rental-btn secondary" aria-label={t.back} onClick={() => shiftMonth(-1)}><ChevronLeft size={18} /></button><h2 style={{ margin: 0 }}>{first.toLocaleDateString(locale === "hy" ? "hy-AM" : locale, { month: "long", year: "numeric", timeZone: "UTC" })}</h2><button className="rental-btn secondary" aria-label={t.later} onClick={() => shiftMonth(1)}><ChevronRight size={18} /></button></div><button className="rental-btn secondary" onClick={() => setBlockOpen(true)}>{t.block}</button></div>
      <div className="rental-month">{t.weekdays.map((label) => <div key={label} className="rental-muted" aria-label={label}>{label.slice(0, 2)}</div>)}{Array.from({ length: emptyDays }, (_, n) => <div key={`empty-${n}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => { const value = `${from.slice(0, 7)}-${String(index + 1).padStart(2, "0")}`; const count = all.filter((item) => datePart(item.starts_at) === value && !["cancelled", "no_show"].includes(item.status) && !item.is_expired).length;
          return <button key={value} className="rental-month-day" aria-pressed={selectedDay === value} onClick={() => setSelectedDay(selectedDay === value ? "" : value)}><strong>{index + 1}</strong>{count > 0 && <span className="rental-month-count">{count}</span>}</button>;
        })}
      </div>
      {!!blocksQ.data?.length && <div className="rental-stack" style={{ marginTop: 20 }}>{blocksQ.data.map((block) => <div className="rental-row rental-between rental-note" key={block.id}><span>{block.starts_at.slice(0, 16)} — {block.ends_at.slice(0, 16)} {block.reason}</span><button className="rental-btn secondary" disabled={removeBlock.isPending} onClick={() => removeBlock.mutate(block.id)}>{t.unblock}</button></div>)}</div>}
    </section>}
    {view === "analytics" && summary?.daily.length ? <section className="rental-card" style={{ marginTop: 24 }}><h2>{t.analytics}</h2><div className="rental-table-wrap"><table className="rental-table"><thead><tr><th>{t.date}</th><th>{t.count}</th><th>{t.amount}</th></tr></thead><tbody>{summary.daily.map((row) => <tr key={row.date}><td>{row.date}</td><td>{row.count}</td><td>{money(row.amount)}</td></tr>)}</tbody></table></div></section> : null}
    <section className="rental-card" style={{ marginTop: 24 }}><h2>{t.bookings}{selectedDay && view === "calendar" ? ` · ${selectedDay}` : ""}</h2>
      {!items.length && !bookingsQ.isPending && <p className="rental-empty">{t.noBookings}</p>}
      <div className="rental-desktop-table rental-table-wrap"><table className="rental-table"><thead><tr><th>{t.date}</th><th>{t.name}</th><th>{t.status}</th><th>{t.total}</th><th>{t.paid}</th><th>{t.debt}</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id} data-selectable="true" onClick={() => setSelectedId(item.id)}><td>{stamp(item.starts_at)}<div className="rental-muted">{stamp(item.ends_at)}</div></td><td>{item.client_name}<div className="rental-muted">{item.client_phone}</div></td><td><span className="rental-status" data-status={item.status}>{item.is_expired ? t.expired : statuses[item.status] || item.status}</span></td><td>{money(item.final_price)}</td><td>{money(item.paid_amount)}</td><td>{["cancelled", "no_show"].includes(item.status) ? "—" : money(item.outstanding_amount)}</td><td><button className="rental-btn secondary" onClick={(event) => { event.stopPropagation(); setSelectedId(item.id); }}>{t.status}</button></td></tr>)}</tbody></table></div>
      <div className="rental-mobile-cards">{items.map((item) => <button key={item.id} className="rental-card rental-stack" style={{ textAlign: "left", padding: 16 }} onClick={() => setSelectedId(item.id)}><div className="rental-row rental-between"><strong>{item.client_name}</strong><span className="rental-status" data-status={item.status}>{item.is_expired ? t.expired : statuses[item.status]}</span></div><span>{stamp(item.starts_at)}</span><span className="rental-row rental-between"><span>{t.total}: {money(item.final_price)}</span><span>{t.paid}: {money(item.paid_amount)}</span></span></button>)}</div>
    </section>
    <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t.manual}>{createOpen && <ManualBooking minMinutes={ratesQ.data?.min_minutes || 60} maxMinutes={ratesQ.data?.max_minutes || 720} step={ratesQ.data?.slot_step_minutes || 15} hourly={ratesQ.data?.hourly_price || 0} onSuccess={() => { setCreateOpen(false); refresh(); }} />}</Modal>
    <Modal open={blockOpen} onClose={() => setBlockOpen(false)} title={t.block}>{blockOpen && <BlockForm onSuccess={() => { setBlockOpen(false); refresh(); }} />}</Modal>
    <Modal open={!!current} onClose={() => setSelectedId(null)} title={current ? `${current.client_name} · #${current.booking_code}` : ""}>{current && <BookingDetail key={current.id} booking={current} onChange={refresh} />}</Modal>
  </div>;
}

function ManualBooking({ minMinutes, maxMinutes, step, hourly, onSuccess }: { minMinutes: number; maxMinutes: number; step: number; hourly: number; onSuccess: () => void }) {
  const { locale } = useLanguage(); const t = rentalCopy[locale];
  const [data, setData] = useState({ starts_at: "", duration_minutes: minMinutes, client_name: "", client_phone: "", client_email: "", notes: "" });
  const mutation = useMutation({ mutationFn: () => rentalApi.create({ ...data, starts_at: data.starts_at.replace("T", " ") }), onSuccess });
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate(); }
  return <form className="rental-workspace rental-stack" onSubmit={submit}>
    {mutation.isError && <div className="rental-note rental-error" role="alert">{getErrorMessage(mutation.error, t.error)}</div>}
    <div className="rental-fields"><label className="rental-field">{t.start}<input type="datetime-local" value={data.starts_at} onChange={(event) => setData((old) => ({ ...old, starts_at: event.target.value }))} required /></label><label className="rental-field">{t.duration} ({t.minutes})<input type="number" min={minMinutes} max={maxMinutes} step={step} value={data.duration_minutes} onChange={(event) => setData((old) => ({ ...old, duration_minutes: Number(event.target.value) }))} required /></label></div>
    {(["client_name", "client_phone", "client_email", "notes"] as const).map((key) => <label className="rental-field" key={key}>{key === "client_name" ? t.name : key === "client_phone" ? t.phone : key === "client_email" ? t.email : t.notes}<input value={data[key]} type={key === "client_email" ? "email" : key === "client_phone" ? "tel" : "text"} maxLength={key === "notes" ? 2000 : key === "client_phone" ? 40 : key === "client_email" ? 255 : 120} required={key === "client_name" || key === "client_phone"} onChange={(event) => setData((old) => ({ ...old, [key]: event.target.value }))} /></label>)}
    <p>{t.total}: <strong>{Math.ceil(hourly * data.duration_minutes / 60).toLocaleString()} ֏</strong></p><button className="rental-btn" disabled={mutation.isPending}>{mutation.isPending ? t.loading : t.save}</button>
  </form>;
}

function BlockForm({ onSuccess }: { onSuccess: () => void }) {
  const { locale } = useLanguage(); const t = rentalCopy[locale]; const [start, setStart] = useState(""); const [end, setEnd] = useState(""); const [reason, setReason] = useState("");
  const mutation = useMutation({ mutationFn: () => createBlock({ starts_at: start.replace("T", " "), ends_at: end.replace("T", " "), reason }), onSuccess });
  return <form className="rental-workspace rental-stack" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>{mutation.isError && <div className="rental-note rental-error" role="alert">{getErrorMessage(mutation.error, t.error)}</div>}
    <label className="rental-field">{t.start}<input type="datetime-local" required value={start} onChange={(event) => setStart(event.target.value)} /></label><label className="rental-field">{t.end}<input type="datetime-local" min={start} required value={end} onChange={(event) => setEnd(event.target.value)} /></label><label className="rental-field">{t.reason}<input value={reason} maxLength={190} onChange={(event) => setReason(event.target.value)} /></label><button className="rental-btn" disabled={mutation.isPending}>{mutation.isPending ? t.loading : t.save}</button>
  </form>;
}

function BookingDetail({ booking, onChange }: { booking: RentalBooking; onChange: () => void }) {
  const { locale } = useLanguage(); const t = rentalCopy[locale]; const [amount, setAmount] = useState(""); const [operation, setOperation] = useState<"payment" | "refund">("payment"); const [key, setKey] = useState(() => crypto.randomUUID()); const [newTime, setNewTime] = useState("");
  const status = useMutation({ mutationFn: (value: string) => rentalApi.update(booking.id, { status: value }), onSuccess: onChange });
  const payment = useMutation({ mutationFn: () => rentalApi.payment(booking.id, Number(amount), operation, key), onSuccess: () => { setAmount(""); setKey(crypto.randomUUID()); onChange(); } });
  const move = useMutation({ mutationFn: () => rentalApi.update(booking.id, { starts_at: newTime.replace("T", " ") }), onSuccess: () => { setNewTime(""); onChange(); } });
  const allowed: Record<string, string[]> = { pending: ["confirmed", "cancelled"], confirmed: ["in_progress", "completed", "cancelled", "no_show"], in_progress: ["completed", "cancelled", "no_show"] };
  const stateNames = t.statuses as Record<string, string>;
  const error = status.error || payment.error || move.error;
  return <div className="rental-workspace rental-stack">
    {error && <div className="rental-note rental-error" role="alert">{getErrorMessage(error, t.error)}</div>}
    <p>{booking.client_phone} {booking.client_email}</p><span className="rental-status" data-status={booking.status}>{stateNames[booking.status]}</span>
    <div className="rental-fields"><div>{t.total}<strong style={{ display: "block" }}>{booking.final_price.toLocaleString()} ֏</strong></div><div>{t.paid}<strong style={{ display: "block" }}>{booking.paid_amount.toLocaleString()} ֏</strong></div></div>
    {booking.notes && <p>{booking.notes}</p>}
    <div className="rental-row">{(allowed[booking.status] || []).map((value) => <button key={value} className={`rental-btn ${value === "cancelled" ? "danger" : "secondary"}`} disabled={status.isPending} onClick={() => status.mutate(value)}>{stateNames[value]}</button>)}</div>
    {["pending", "confirmed"].includes(booking.status) && <form className="rental-row" onSubmit={(event) => { event.preventDefault(); move.mutate(); }}><label className="rental-field">{t.move}<input type="datetime-local" value={newTime} onChange={(event) => setNewTime(event.target.value)} required /></label><button className="rental-btn secondary" disabled={!newTime || move.isPending}>{t.save}</button></form>}
    <form className="rental-stack" onSubmit={(event) => { event.preventDefault(); payment.mutate(); }}><p className="rental-note">{t.paymentHelp}</p><label className="rental-field">{t.amount}<input type="number" min={1} step={1} max={operation === "refund" ? booking.paid_amount : booking.outstanding_amount} value={amount} onChange={(event) => { setAmount(event.target.value); setKey(crypto.randomUUID()); }} required /></label>
      <label className="rental-field">{t.status}<select value={operation} onChange={(event) => { setOperation(event.target.value as "payment" | "refund"); setKey(crypto.randomUUID()); }}><option value="payment">{t.recordPayment}</option><option value="refund">{t.recordRefund}</option></select></label><button className="rental-btn" disabled={payment.isPending}>{payment.isPending ? t.loading : t.save}</button>
    </form>
    <h2>{t.paymentHistory}</h2>{booking.payments.map((item) => <div className="rental-row rental-between" key={item.id}><span>{item.status === "refunded" ? t.refunded : t.paid}</span><strong>{Number(item.amount).toLocaleString()} ֏</strong><span className="rental-muted">{new Date(item.created_at).toLocaleString(locale)}</span></div>)}
  </div>;
}
