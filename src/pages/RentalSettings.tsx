import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../store/auth";
import { rentalCopy } from "../i18n/rentals";
import { galleryUrl, rentalApi, type RentalSettings as Settings } from "../lib/rentalApi";
import { fetchBusinessSettings, updateBusinessSettings, type BusinessSettings } from "../lib/businessSettingsApi";
import { uploadMedia } from "../lib/mediaApi";
import { api } from "../lib/api";
import type { ScheduleDay } from "../lib/scheduleApi";
import { getErrorMessage } from "../lib/http";
import "../rentals.css";

export default function RentalSettings({ onboarding = false }: { onboarding?: boolean }) {
  const { locale } = useLanguage(); const t = rentalCopy[locale];
  const profile = useQuery({ queryKey: ["rental-profile"], queryFn: fetchBusinessSettings });
  const settings = useQuery({ queryKey: ["rental-settings"], queryFn: rentalApi.settings });
  const schedule = useQuery({ queryKey: ["rental-schedule"], queryFn: async (): Promise<ScheduleDay[]> => (await api.get("/rental/schedule")).data.data });
  if (profile.isPending || settings.isPending || schedule.isPending) return <p role="status">{t.loading}</p>;
  if (profile.isError || settings.isError || schedule.isError) return <div className="rental-note rental-error" role="alert">{t.error}<button className="rental-btn secondary" onClick={() => { void profile.refetch(); void settings.refetch(); void schedule.refetch(); }}>{t.retry}</button></div>;
  return <RentalSettingsForm profile={profile.data!} settings={settings.data!} initialDays={schedule.data!} onboarding={onboarding} />;
}

function RentalSettingsForm({ profile, settings, initialDays, onboarding }: { profile: BusinessSettings; settings: Settings; initialDays: ScheduleDay[]; onboarding: boolean }) {
  const { locale } = useLanguage(); const t = rentalCopy[locale];
  const navigate = useNavigate(); const queryClient = useQueryClient(); const { user, setUser } = useAuth();
  const [rates, setRates] = useState({ hourly_price: settings.hourly_price, min_minutes: settings.min_minutes, max_minutes: settings.max_minutes, buffer_minutes: settings.buffer_minutes, slot_step_minutes: settings.slot_step_minutes });
  const [data, setData] = useState({ phone: profile.phone || "", address: profile.address || "", short_description: profile.short_description || "", description: profile.description || "", logo_url: profile.logo_url || "", cover_url: profile.cover_url || "", is_public_profile_enabled: profile.is_public_profile_enabled ?? true, is_marketplace_visible: profile.is_marketplace_visible ?? true });
  const [days, setDays] = useState<ScheduleDay[]>(Array.from({ length: 7 }, (_, n) => initialDays.find((day) => day.weekday === n + 1) || { weekday: n + 1, is_closed: n === 6, start: "09:00", end: "18:00", break_start: null, break_end: null }));
  const [caption, setCaption] = useState(""); const [message, setMessage] = useState(""); const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["rental-settings"] }); void queryClient.invalidateQueries({ queryKey: ["public-business"] }); void queryClient.invalidateQueries({ queryKey: ["rental-profile"] }); };
  const fail = (error: unknown) => { setMessage(getErrorMessage(error, t.error)); setSuccess(false); };
  const save = useMutation({ mutationFn: async (publish: boolean) => {
    await rentalApi.saveSettings(rates);
    await updateBusinessSettings({ ...data, show_services: false, show_staff: false });
    await api.put("/rental/schedule", { days });
    if (publish) await api.post("/business/complete-onboarding");
    return publish;
  }, onError: fail, onSuccess: (publish) => { refresh(); setMessage(t.saved); setSuccess(true); if (publish) { if (user) setUser({ ...user, needs_onboarding: false }); navigate("/app/dashboard", { replace: true }); } } });
  const remove = useMutation({ mutationFn: rentalApi.deleteMedia, onError: fail, onSuccess: refresh });
  const reorder = useMutation({ mutationFn: async ({ index, offset }: { index: number; offset: number }) => {
    const ids = settings.gallery.map((item) => item.id); const next = index + offset;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    for (let n = 0; n < ids.length; n++) await rentalApi.updateMedia(ids[n], { sort_order: n });
  }, onError: fail, onSuccess: refresh });
  async function upload(file: File | undefined, field?: "logo_url" | "cover_url") {
    if (!file) return; setUploading(true); setMessage("");
    try { if (field) { const url = await uploadMedia(file, `businesses/${user?.business_id}`); setData((old) => ({ ...old, [field]: url })); }
      else { await rentalApi.upload(file, caption); setCaption(""); refresh(); }
    } catch (error) { fail(error); } finally { setUploading(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); setMessage(""); save.mutate(onboarding); }
  return <div className={onboarding ? "rental-page rental-wrap" : "rental-workspace"}>
    <div className="rental-row rental-between"><div><span className="rental-badge">{t.title}</span><h1 style={{ marginTop: 10 }}>{t.settings}</h1></div>
      {!onboarding && <Link className="rental-btn secondary" to={`/businesses/${profile.slug}`} target="_blank">{t.publicPage}</Link>}
    </div>
    <div className="rental-note" style={{ margin: "20px 0" }}><strong>{t.subscription}: 25 000 ֏</strong><p>{t.subscriptionHelp}</p></div>
    {message && <div className={`rental-note ${success ? "rental-success" : "rental-error"}`} role={success ? "status" : "alert"}>{message}</div>}
    <form onSubmit={submit} className="rental-stack" style={{ marginTop: 20 }}>
      <section className="rental-card"><h2>{t.hourly}</h2><p className="rental-muted" style={{ marginBottom: 16 }}>{t.priceHelp}</p>
        <div className="rental-fields">{(["hourly_price", "min_minutes", "max_minutes", "buffer_minutes"] as const).map((key) => <label className="rental-field" key={key}>
          {key === "hourly_price" ? `${t.hourly} · AMD` : key === "min_minutes" ? t.min : key === "max_minutes" ? t.max : t.buffer}
          <input type="number" min={key.includes("minutes") && key !== "buffer_minutes" ? 15 : 0} max={key === "hourly_price" ? 100000000 : key === "buffer_minutes" ? 240 : 1440} step={1} value={rates[key] ?? ""} onChange={(event) => setRates((old) => ({ ...old, [key]: event.target.value === "" && key === "hourly_price" ? null : Number(event.target.value) }))} required />
        </label>)}<label className="rental-field">{t.step}<select value={rates.slot_step_minutes} onChange={(event) => setRates((old) => ({ ...old, slot_step_minutes: Number(event.target.value) }))}>{[5, 10, 15, 20, 30, 60].map((n) => <option key={n} value={n}>{n}</option>)}</select></label></div>
      </section>
      <section className="rental-card rental-stack"><h2>{t.space}</h2>
        <div className="rental-fields"><label className="rental-field">{t.address}<input value={data.address} onChange={(event) => setData((old) => ({ ...old, address: event.target.value }))} maxLength={255} required /></label><label className="rental-field">{t.phone}<input type="tel" value={data.phone} onChange={(event) => setData((old) => ({ ...old, phone: event.target.value }))} maxLength={40} /></label></div>
        <label className="rental-field">{t.shortDescription}<input value={data.short_description} onChange={(event) => setData((old) => ({ ...old, short_description: event.target.value }))} maxLength={255} /></label>
        <label className="rental-field">{t.description}<textarea value={data.description} onChange={(event) => setData((old) => ({ ...old, description: event.target.value }))} maxLength={10000} /></label>
        <div className="rental-fields">{(["logo_url", "cover_url"] as const).map((key) => <div key={key} className="rental-stack">
          {data[key] && <img src={data[key]} alt={key === "logo_url" ? t.logo : t.cover} style={{ width: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 12 }} />}
          <label className="rental-field">{key === "logo_url" ? t.logo : t.cover}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { void upload(event.target.files?.[0], key); event.target.value = ""; }} /></label>
        </div>)}</div>
        {!onboarding && <><label className="rental-check"><input type="checkbox" checked={data.is_public_profile_enabled} onChange={(event) => setData((old) => ({ ...old, is_public_profile_enabled: event.target.checked }))} />{t.public}</label><label className="rental-check"><input type="checkbox" checked={data.is_marketplace_visible} onChange={(event) => setData((old) => ({ ...old, is_marketplace_visible: event.target.checked }))} />{t.visible}</label></>}
      </section>
      <section className="rental-card"><h2>{t.workingHours}</h2>{days.map((day, index) => <div className="rental-schedule-row" key={day.weekday}>
        <span>{t.weekdays[index]}</span><label className="rental-check"><input type="checkbox" checked={day.is_closed} onChange={(event) => setDays((old) => old.map((row, n) => n === index ? { ...row, is_closed: event.target.checked, start: row.start || "09:00", end: row.end || "18:00" } : row))} />{t.closed}</label>
        {(["start", "end"] as const).map((field) => <label className="rental-field" key={field}><span className="sr-only">{t.weekdays[index]} {field === "start" ? t.start : t.end}</span><input type="time" disabled={day.is_closed} value={day[field]?.slice(0, 5) || ""} required={!day.is_closed} onChange={(event) => setDays((old) => old.map((row, n) => n === index ? { ...row, [field]: event.target.value } : row))} /></label>)}
      </div>)}</section>
      <button className="rental-btn" disabled={save.isPending || uploading}>{save.isPending ? t.loading : onboarding ? t.publish : t.save}</button>
    </form>
    <section className="rental-card rental-stack" style={{ marginTop: 24 }}><h2>{t.gallery} ({settings.gallery.length}/20)</h2><p className="rental-muted">{t.uploadHelp}</p>
      <label className="rental-field">{t.caption}<input value={caption} maxLength={255} onChange={(event) => setCaption(event.target.value)} /></label>
      <label className="rental-field"><span className="rental-row"><ImagePlus size={18} />{uploading ? t.loading : t.upload}</span><input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" disabled={uploading || settings.gallery.length >= 20} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label>
      {!settings.gallery.length && <p className="rental-muted">{t.emptyGallery}</p>}
      <div className="rental-gallery">{settings.gallery.map((item, index) => <figure key={item.id}>
        {item.kind === "video" ? <video controls playsInline preload="metadata" src={galleryUrl(item)} /> : <img src={galleryUrl(item)} alt={item.caption || t.space} loading="lazy" />}
        {item.caption && <figcaption>{item.caption}</figcaption>}
        <div className="rental-row" style={{ marginTop: 8 }}><button className="rental-btn secondary" type="button" aria-label={t.earlier} disabled={!index || reorder.isPending} onClick={() => reorder.mutate({ index, offset: -1 })}><ArrowUp size={16} /></button><button className="rental-btn secondary" type="button" aria-label={t.later} disabled={index === settings.gallery.length - 1 || reorder.isPending} onClick={() => reorder.mutate({ index, offset: 1 })}><ArrowDown size={16} /></button><button className="rental-btn danger" type="button" aria-label={t.remove} disabled={remove.isPending} onClick={() => remove.mutate(item.id)}><Trash2 size={16} /></button></div>
      </figure>)}</div>
    </section>
  </div>;
}
