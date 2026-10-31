import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Building2, Clock3, MapPin, Phone } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { rentalCopy } from "../../i18n/rentals";
import { rentalApi, rentalQuote, rentalToday } from "../../lib/rentalApi";
import { trackSiteEvent } from "../../lib/siteAnalytics";
import RentalDiscounts from "./RentalDiscounts";
import { cancelPublicBooking, fetchPublicBookingDetail, resendPublicBookingCode, verifyPublicBooking, type PublicBusiness } from "../../lib/publicApi";
import { getErrorMessage } from "../../lib/http";
import { LEGAL_DOCUMENT_VERSION } from "../../config/legal";
import { PublicBusinessHeader, PublicBusinessFooter } from "../public/PublicBusinessChrome";
import Seo from "../Seo";
import RentalDurationField from "./RentalDurationField";
import { rentalDurationLabel, rentalLocalStamp, validRentalDuration } from "../../lib/rentalTime";
import "../../rentals.css";
import { localizedText } from "@/lib/localizedText";

export default function RentalPublic({ business }: { business: PublicBusiness }) {
  const { locale } = useLanguage();
  const t = rentalCopy[locale];
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const rates = business.rental;
  const [date, setDate] = useState(() => rentalToday(business.timezone || undefined));
  const [duration, setDuration] = useState(rates?.min_minutes ?? 60);
  const validDuration = !!rates && validRentalDuration(duration, rates.min_minutes, rates.max_minutes, rates.slot_step_minutes);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [legal, setLegal] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [moving, setMoving] = useState(false);
  const code = params.get("booking") || "";
  const [token, setToken] = useState(() => {
    if (params.get("token")) return params.get("token")!;
    try { return sessionStorage.getItem(`rental-token-${code}`) || ""; } catch { return ""; }
  });
  useEffect(() => {
    if (token && code) {
      try { sessionStorage.setItem(`rental-token-${code}`, token); } catch { /* The in-memory token still works. */ }
      if (params.has("token")) { const next = new URLSearchParams(params); next.delete("token"); setParams(next, { replace: true }); }
    }
  }, [token, code, params, setParams]);
  const detailQ = useQuery({ queryKey: ["rental-public-booking", code, token], queryFn: () => fetchPublicBookingDetail({ booking_code: code, token }), enabled: !!code && !!token, retry: false });
  const slotsQ = useQuery({ queryKey: ["rental-public-slots", business.slug, date, duration, moving, code],
    queryFn: () => moving ? rentalApi.rescheduleSlots(code, token, date) : rentalApi.slots(business.slug, date, duration),
    enabled: !!rates && rates.hourly_price !== null && (moving || validDuration) && (!code || moving), staleTime: 0, refetchInterval: 30000 });
  const selectedSlot = slotsQ.data?.find((slot) => slot.starts_at === time);
  const onError = (error: unknown) => setMessage(getErrorMessage(error, t.error));
  const create = useMutation({ mutationFn: () => rentalApi.publicCreate(business.slug, {
    starts_at: selectedSlot?.starts_at || "", duration_minutes: duration, client_name: name, client_phone: phone, client_email: email, notes,
    legal_accepted: legal, terms_version: LEGAL_DOCUMENT_VERSION, privacy_version: LEGAL_DOCUMENT_VERSION,
  }), onError: (error) => { onError(error); setTime(""); void slotsQ.refetch(); }, onSuccess: (result) => { trackSiteEvent("booking_created"); const next = new URLSearchParams(); next.set("booking", result.data.booking_code); setParams(next); setMessage(""); setTime(""); void slotsQ.refetch(); } });
  const verify = useMutation({ mutationFn: () => verifyPublicBooking({ booking_code: code, otp }), onError,
    onSuccess: (result) => { if (result.manage_token) { setToken(result.manage_token); setMessage(""); } } });
  const resend = useMutation({ mutationFn: () => resendPublicBookingCode(code), onError, onSuccess: () => setMessage(t.sent) });
  const cancel = useMutation({ mutationFn: () => cancelPublicBooking({ booking_code: code, token }), onError,
    onSuccess: () => { setMessage(""); void queryClient.invalidateQueries({ queryKey: ["rental-public-booking"] }); void slotsQ.refetch(); } });
  const move = useMutation({ mutationFn: () => rentalApi.reschedule(code, token, selectedSlot?.starts_at || ""), onError,
    onSuccess: () => { setMoving(false); setTime(""); setMessage(""); void queryClient.invalidateQueries({ queryKey: ["rental-public-booking"] }); } });
  const detail = detailQ.data?.data;
  const booking = detail?.primary_booking;
  const currency = (value: number) => `${value.toLocaleString(locale === "hy" ? "hy-AM" : locale)} ֏`;
  const stamp = (value: string) => new Date(value).toLocaleString(locale === "hy" ? "hy-AM" : locale, { timeZone: business.timezone || "Asia/Yerevan", dateStyle: "medium", timeStyle: "short" });
  const quote = rates?.hourly_price == null ? null : rentalQuote(rates.hourly_price, duration, rates.duration_discounts);
  function submit(event: FormEvent) { event.preventDefault(); setMessage(""); if (!selectedSlot || !validDuration || slotsQ.isError || slotsQ.isFetching) { setMessage(t.chooseSlot); return; } create.mutate(); }
  function newBooking() { setParams({}); setToken(""); setOtp(""); setTime(""); setMessage(""); setMoving(false); }

  return <div className="rental-page">
    <Seo title={`${t.book} · ${business.name}`} description={localizedText(business, "short_description", locale) || localizedText(business, "description", locale) || t.book} canonical={`/book/${business.slug}`} />
    <PublicBusinessHeader business={business} primaryHref={`/businesses/${business.slug}`} primaryLabel={t.viewSpace} secondaryHref={`/businesses/${business.slug}`} secondaryLabel={t.viewSpace} />
    <main className="rental-wrap">
      <div className="rental-row rental-between"><div className="rental-row">
        {business.logo_url && business.show_logo !== false ? <img className="rental-logo" src={business.logo_url} alt={business.name} /> : <Building2 size={36} />}
        <div><span className="rental-badge">{t.title}</span><h1 style={{ marginTop: 10 }}>{business.name}</h1></div>
      </div><div>{rates?.hourly_price != null && <><div className="rental-price">{currency(rates.hourly_price)}</div><span className="rental-muted">{t.hourly}</span></>}</div></div>
      {!moving && <RentalDiscounts discounts={rates?.duration_discounts} />}
      <div className="rental-layout">
        <div className="rental-stack">
          {business.cover_url && business.show_cover !== false && <img className="rental-cover" src={business.cover_url} alt={business.name} />}
          <section className="rental-card rental-stack">
            {localizedText(business, "short_description", locale) && <h2>{localizedText(business, "short_description", locale)}</h2>}
            {localizedText(business, "description", locale) && <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{localizedText(business, "description", locale)}</p>}
            {business.address && <p className="rental-row"><MapPin size={18} />{business.address}</p>}
            {business.phone && <a className="rental-row" href={`tel:${business.phone}`}><Phone size={18} />{business.phone}</a>}
            <p className="rental-row rental-muted"><Clock3 size={17} />{t.timezone}: {business.timezone || "Asia/Yerevan"}</p>
          </section>
          <Link className="rental-btn secondary rental-full" to={`/businesses/${business.slug}`}>{t.viewSpace}</Link>
        </div>
        <section className="rental-card rental-stack" aria-label={t.book}>
          {message && <div role="alert" className="rental-note rental-error">{message}</div>}
          {code && !token ? <form onSubmit={(event) => { event.preventDefault(); setMessage(""); verify.mutate(); }} className="rental-stack">
            <h2>{t.code}</h2><p className="rental-note">{t.sent}</p><div className="rental-muted">#{code}</div>
            <label className="rental-field">{t.code}<input aria-label={t.code} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" maxLength={4} required /></label>
            <button className="rental-btn" disabled={verify.isPending || otp.length !== 4}>{verify.isPending ? t.loading : t.verify}</button>
            <button className="rental-btn secondary" type="button" onClick={() => resend.mutate()} disabled={resend.isPending}>{t.resend}</button>
            <button className="rental-btn secondary" type="button" onClick={newBooking}>{t.newBooking}</button>
          </form> : code && token ? <>
            {detailQ.isPending && <p role="status">{t.loading}</p>}
            {detailQ.isError && <div role="alert" className="rental-note rental-error">{t.manageError}</div>}
            {detail && <><h2>{detail.status === "cancelled" ? t.cancelled : (t.statuses[detail.status as keyof typeof t.statuses] || t.confirmed)}</h2><div className="rental-muted">#{code}</div>
              {booking && <p>{stamp(booking.starts_at)} — {stamp(booking.ends_at)}</p>}
              <p className="rental-price">{currency(detail.total_price || 0)}</p>
              {detail.can_reschedule && <button className="rental-btn secondary" onClick={() => { setMoving(!moving); setTime(""); }}>{moving ? t.back : t.move}</button>}
              {detail.can_cancel && <button className="rental-btn danger" onClick={() => cancel.mutate()} disabled={cancel.isPending}>{t.cancel}</button>}
            </>}
            <button className="rental-btn secondary" onClick={newBooking}>{t.newBooking}</button>
          </> : <h2>{t.book}</h2>}

          {(!code || moving) && <>
            <div className="rental-fields"><label className="rental-field">{t.date}<input type="date" value={date} min={rentalToday(business.timezone || undefined)} onChange={(event) => { setDate(event.target.value); setTime(""); }} /></label>
              {!moving && rates && <RentalDurationField value={duration} onChange={(minutes) => { setDuration(minutes); setTime(""); }} min={rates.min_minutes} max={rates.max_minutes} step={rates.slot_step_minutes} presets />}
            </div>
            <p className="rental-muted">{t.availabilityHelp} {rates?.allow_overnight ? t.overnightPublic : t.withinHours}</p>
            <h2 style={{ marginBottom: 0 }}>{t.availability}</h2>
            {(moving || validDuration) && slotsQ.isPending && <p role="status">{t.loading}</p>}
            {slotsQ.isError && <div className="rental-note rental-error" role="alert">{getErrorMessage(slotsQ.error, t.error)} <button className="rental-btn secondary" onClick={() => void slotsQ.refetch()}>{t.retry}</button></div>}
            {slotsQ.data?.length === 0 && <p className="rental-empty">{t.noSlots}</p>}
            <div className="rental-slots">{slotsQ.data?.map((slot) => <button type="button" key={slot.starts_at} className="rental-slot" aria-label={`${t.start}: ${rentalLocalStamp(slot.starts_at, locale)} · ${t.end}: ${rentalLocalStamp(slot.ends_at, locale)}`} aria-pressed={time === slot.starts_at} onClick={() => { setTime(slot.starts_at); setMessage(""); }}>{slot.starts_at.slice(11, 16)}<small style={{ display: "block", opacity: .75 }}>– {slot.ends_at.slice(0, 10) !== slot.starts_at.slice(0, 10) ? rentalLocalStamp(slot.ends_at, locale) : slot.ends_at.slice(11, 16)}</small></button>)}</div>
            {selectedSlot && <div className="rental-note rental-selected-period" role="status"><strong>{t.selection}</strong><span>{t.start}: {rentalLocalStamp(selectedSlot.starts_at, locale)}</span><span>{t.end}: {rentalLocalStamp(selectedSlot.ends_at, locale)}</span>{!moving && <span>{t.duration}: {rentalDurationLabel(duration, t)}</span>}</div>}
            {moving ? <button className="rental-btn" disabled={!selectedSlot || slotsQ.isError || slotsQ.isFetching || move.isPending} onClick={() => move.mutate()}>{move.isPending ? t.loading : t.save}</button> : <form className="rental-stack" onSubmit={submit}>
              {quote !== null && validDuration && <div className="rental-row rental-between"><span>{t.total}{quote.percent > 0 && <small className="rental-muted" style={{ display: "block" }}>{t.discountApplied(quote.percent)} · <s>{currency(quote.gross)}</s></small>}</span><strong className="rental-price">{currency(quote.price)}</strong></div>}
              <label className="rental-field">{t.name}<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" minLength={2} maxLength={120} required /></label>
              <div className="rental-fields"><label className="rental-field">{t.phone}<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" maxLength={40} required /></label>
                <label className="rental-field">{t.email}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={150} required /></label></div>
              <label className="rental-field">{t.notes}<textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} /></label>
              <label className="rental-check"><input type="checkbox" checked={legal} onChange={(event) => setLegal(event.target.checked)} required /><span>{locale === "hy" ? "Ընդունում եմ" : locale === "ru" ? "Я принимаю" : "I accept the"} <Link to="/terms" target="_blank">{locale === "hy" ? "Պայմանները" : locale === "ru" ? "Условия" : "Terms"}</Link> {locale === "hy" ? "և" : locale === "ru" ? "и" : "and"} <Link to="/privacy-policy" target="_blank">{locale === "hy" ? "Գաղտնիության քաղաքականությունը" : locale === "ru" ? "Политику конфиденциальности" : "Privacy Policy"}</Link></span></label>
              <button className="rental-btn rental-full" disabled={!selectedSlot || !validDuration || slotsQ.isError || slotsQ.isFetching || !legal || create.isPending || rates?.hourly_price == null}>{create.isPending ? t.loading : t.book}</button>
            </form>}
          </>}
        </section>
      </div>
    </main><PublicBusinessFooter business={business} compact />
  </div>;
}
