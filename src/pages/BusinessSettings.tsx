import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Clock,
  MapPin,
  Phone,
  Globe,
  CalendarDays,
  Link as LinkIcon,
  Crown,
  ArrowRight,
  Sparkles,
  Copy,
  CheckCircle2,
  Building2,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { page, card, cardTransition } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Toast } from "../components/ui/Toast";

import {
  fetchBusinessSettings,
  updateBusinessSettings,
  createBusinessLocation,
  updateBusinessLocation,
  deleteBusinessLocation,
  type BusinessSettings,
  type BusinessLocation,
} from "../lib/businessSettingsApi";
import { fetchSchedule, updateSchedule, type ScheduleDay } from "../lib/scheduleApi";
import { cn } from "../lib/cn";
import { uploadMedia } from "../lib/mediaApi";
import { useAuth } from "../store/auth";
import { LocationMapPicker } from "../components/settings/LocationMapPicker";

type ToastState = {
  open: boolean;
  text: string;
  type: "success" | "error";
};

type LocationDraft = {
  id: number | null;
  name: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
};

const emptyLocationDraft = (): LocationDraft => ({
  id: null,
  name: "",
  address: "",
  phone: "",
  latitude: null,
  longitude: null,
  is_primary: false,
});

const WEEKDAYS: Array<{ k: number; label: string }> = [
  { k: 1, label: "Երկուշաբթի" },
  { k: 2, label: "Երեքշաբթի" },
  { k: 3, label: "Չորեքշաբթի" },
  { k: 4, label: "Հինգշաբթի" },
  { k: 5, label: "Ուրբաթ" },
  { k: 6, label: "Շաբաթ" },
  { k: 7, label: "Կիրակի" },
];

function normalizeDay(d: Partial<ScheduleDay> & { weekday: number }): ScheduleDay {
  return {
    weekday: d.weekday,
    is_closed: !!d.is_closed,
    start: d.start ?? "09:00",
    end: d.end ?? "18:00",
    break_start: d.break_start ?? null,
    break_end: d.break_end ?? null,
  };
}

function sanitizeBreak(start: string | null, end: string | null) {
  if (!start || !end) return { break_start: null, break_end: null };
  return { break_start: start, break_end: end };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

function SectionCard({
                       children,
                       className,
                     }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
      <Card
          className={cn(
              "rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(124,58,237,0.06)]",
              className
          )}
      >
        {children}
      </Card>
  );
}

function InputShell({
                      label,
                      icon,
                      children,
                      hint,
                    }: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        </label>
        {children}
        {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
      </div>
  );
}

export default function BusinessSettingsPage() {
  const qc = useQueryClient();
  const auth = useAuth();
  const user = auth.user;

  const canEdit = user?.role === "owner" || user?.role === "manager" || user?.role === "super_admin";
  const isOwner = user?.role === "owner" || user?.role === "super_admin";

  const [toast, setToast] = useState<ToastState>({
    open: false,
    text: "",
    type: "success",
  });
  const [copiedLink, setCopiedLink] = useState(false);

  const settingsQ = useQuery({
    queryKey: ["business-settings"],
    queryFn: fetchBusinessSettings,
  });

  const scheduleQ = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });

  const [form, setForm] = useState<Partial<BusinessSettings>>({});
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [locationDraft, setLocationDraft] = useState<LocationDraft>(emptyLocationDraft());
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [isLocationEditorOpen, setIsLocationEditorOpen] = useState(false);

  useEffect(() => {
    if (settingsQ.data) setForm(settingsQ.data);
  }, [settingsQ.data]);

  useEffect(() => {
    const raw = scheduleQ.data?.days ?? [];
    if (!raw.length) {
      setDays(WEEKDAYS.map((w) => normalizeDay({ weekday: w.k, is_closed: w.k === 7 })));
      return;
    }

    const map = new Map<number, ScheduleDay>();
    raw.forEach((d) => map.set(d.weekday, normalizeDay(d)));
    setDays(WEEKDAYS.map((w) => map.get(w.k) ?? normalizeDay({ weekday: w.k })));
  }, [scheduleQ.data]);

  const locationLimit = Number(form.location_limit ?? settingsQ.data?.location_limit ?? 1);
  const locations = (form.locations ?? settingsQ.data?.locations ?? []) as BusinessLocation[];
  const canAddLocation = canEdit && locations.length < locationLimit;

  function syncLocations(nextLocations: BusinessLocation[], nextLimit?: number) {
    const primary = nextLocations.find((item) => item.is_primary) ?? nextLocations[0];
    setForm((prev) => ({
      ...prev,
      locations: nextLocations,
      location_limit: nextLimit ?? prev.location_limit ?? settingsQ.data?.location_limit ?? 1,
      address: primary?.address ?? prev.address ?? null,
    }));
  }

  function startLocationCreate() {
    setEditingLocationId(null);
    setIsLocationEditorOpen(true);
    setLocationDraft({ ...emptyLocationDraft(), phone: form.phone ?? "", is_primary: locations.length === 0 });
  }

  function startLocationEdit(location: BusinessLocation) {
    setEditingLocationId(location.id);
    setIsLocationEditorOpen(true);
    setLocationDraft({
      id: location.id,
      name: location.name ?? "",
      address: location.address ?? "",
      phone: location.phone ?? "",
      latitude: location.latitude == null ? null : Number(location.latitude),
      longitude: location.longitude == null ? null : Number(location.longitude),
      is_primary: Boolean(location.is_primary),
    });
  }

  function resetLocationEditor() {
    setEditingLocationId(null);
    setIsLocationEditorOpen(false);
    setLocationDraft(emptyLocationDraft());
  }

  const bookingLink = useMemo(() => {
    const slug = (form.slug ?? settingsQ.data?.slug) as string | undefined;
    if (!slug) return null;
    return `vizit.am/book/${slug}`;
  }, [form.slug, settingsQ.data?.slug]);

  const saveSettingsMut = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["business-settings"] });
      setToast({ open: true, text: "Պահպանվեց ✅", type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    },
    onError: (error: unknown) => {
      setToast({
        open: true,
        text: getErrorMessage(error, "Չհաջողվեց պահպանել"),
        type: "error",
      });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2600);
    },
  });

  const saveLocationMut = useMutation({
    mutationFn: async () => {
      const payload = {
        name: locationDraft.name.trim() || null,
        address: locationDraft.address.trim(),
        phone: locationDraft.phone.trim() || null,
        latitude: locationDraft.latitude,
        longitude: locationDraft.longitude,
        is_primary: locationDraft.is_primary,
      };

      return editingLocationId
        ? updateBusinessLocation(editingLocationId, payload)
        : createBusinessLocation(payload);
    },
    onSuccess: async (data) => {
      syncLocations(data.locations, data.location_limit);
      resetLocationEditor();
      await qc.invalidateQueries({ queryKey: ['business-settings'] });
      setToast({ open: true, text: editingLocationId ? 'Հասցեն թարմացվեց ✅' : 'Հասցեն ավելացվեց ✅', type: 'success' });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    },
    onError: (error: unknown) => {
      setToast({ open: true, text: getErrorMessage(error, 'Չհաջողվեց պահպանել հասցեն'), type: 'error' });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2600);
    },
  });

  const deleteLocationMut = useMutation({
    mutationFn: deleteBusinessLocation,
    onSuccess: async (data) => {
      syncLocations(data.locations, data.location_limit);
      if (editingLocationId && !data.locations.some((item) => item.id === editingLocationId)) {
        resetLocationEditor();
      }
      await qc.invalidateQueries({ queryKey: ['business-settings'] });
      setToast({ open: true, text: 'Հասցեն ջնջվեց ✅', type: 'success' });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    },
    onError: (error: unknown) => {
      setToast({ open: true, text: getErrorMessage(error, 'Չհաջողվեց ջնջել հասցեն'), type: 'error' });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2600);
    },
  });

  function submitLocation() {
    if (!canEdit || !locationDraft.address.trim()) return;
    saveLocationMut.mutate();
  }

  const copyBookingLink = async () => {
    if (!bookingLink || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(`https://${bookingLink}`);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      setToast({ open: true, text: "Չհաջողվեց պատճենել հղումը", type: "error" });
      window.setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    }
  };

  const saveScheduleMut = useMutation({
    mutationFn: updateSchedule,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["schedule"] });
      setToast({ open: true, text: "Գրաֆիկը պահպանվեց ✅", type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    },
    onError: (error: unknown) => {
      setToast({
        open: true,
        text: getErrorMessage(error, "Չհաջողվեց պահպանել գրաֆիկը"),
        type: "error",
      });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2600);
    },
  });

  function saveAll() {
    if (!canEdit) return;

    saveSettingsMut.mutate({
      phone: form.phone ?? null,
      address: form.address ?? null,
      timezone: form.timezone ?? "Asia/Yerevan",
      slot_step_minutes: Number(form.slot_step_minutes ?? 15),
      work_start: form.work_start,
      work_end: form.work_end,
      short_description: form.short_description ?? null,
      description: form.description ?? null,
      logo_url: form.logo_url ?? null,
      cover_url: form.cover_url ?? null,
      is_public_profile_enabled: Boolean(form.is_public_profile_enabled),
      is_marketplace_visible: Boolean(form.is_marketplace_visible),
      show_logo: Boolean(form.show_logo),
      show_cover: Boolean(form.show_cover),
      show_staff: Boolean(form.show_staff),
      show_services: Boolean(form.show_services),
      instagram_url: form.instagram_url ?? null,
      facebook_url: form.facebook_url ?? null,
      whatsapp_phone: form.whatsapp_phone ?? null,
      messenger_url: form.messenger_url ?? null,
    });

    saveScheduleMut.mutate({
      days: days.map((d) => ({
        ...d,
        start: d.is_closed ? null : d.start,
        end: d.is_closed ? null : d.end,
        ...(d.is_closed ? { break_start: null, break_end: null } : sanitizeBreak(d.break_start, d.break_end)),
      })),
    });
  }

  const loading = settingsQ.isLoading || scheduleQ.isLoading;
  const saving = saveSettingsMut.isPending || saveScheduleMut.isPending;

  return (
      <>
        <Toast open={toast.open} text={toast.text} type={toast.type} />

        <motion.div {...page} className="admin-page space-y-4">
          <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[22px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_35%),white] p-5 shadow-[0_12px_34px_rgba(15,23,42,0.055)] sm:p-6"
          >
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  <Sparkles className="h-4 w-4" />
                  Բիզնեսի կարգավորումներ
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Կարգավորումներ</h1>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Կառավարիր բիզնեսի տվյալները, աշխատանքային ժամերը, public booking հղումը և շաբաթական գրաֆիկը։
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {bookingLink && (
                    <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 md:flex">
                      <LinkIcon size={14} className="text-violet-600" />
                      <span>{bookingLink}</span>
                      <button
                        type="button"
                        onClick={copyBookingLink}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700"
                      >
                        {copiedLink ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {copiedLink ? "Պատճենվեց" : "Պատճենել"}
                      </button>
                    </div>
                )}

                <Button onClick={saveAll} disabled={!canEdit || loading || saving} className="gap-2">
                  {saving ? <Spinner size={16} /> : <Save size={16} />}
                  Պահպանել
                </Button>
              </div>
            </div>
          </motion.div>


          <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
            <SectionCard className="p-4 sm:p-6 md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Հանրային էջ և բրենդինգ</h2>
                  <p className="mt-1 text-sm text-slate-500">Կառավարիր լոգոն, banner-ը, public էջի նկարագրությունը և marketplace visibility-ն։</p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <InputShell label="Կարճ նկարագրություն" icon={<Sparkles className="h-4 w-4 text-violet-500" />}>
                    <textarea value={form.short_description ?? ""} onChange={(e) => setForm((p) => ({ ...p, short_description: e.target.value }))} className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
                  </InputShell>
                  <InputShell label="Լրիվ նկարագրություն" icon={<Globe className="h-4 w-4 text-violet-500" />}>
                    <textarea value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
                  </InputShell>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["is_public_profile_enabled", "Public էջ ակտիվ"],
                      ["is_marketplace_visible", "Ցուցադրել գլխավորում"],
                      ["show_logo", "Ցուցադրել logo"],
                      ["show_cover", "Ցուցադրել banner"],
                      ["show_staff", "Ցուցադրել թիմը"],
                      ["show_services", "Ցուցադրել ծառայությունները"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/40">
                        <input type="checkbox" checked={Boolean((form as any)[key])} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))} />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-sm font-semibold text-slate-900">Սոցիալական հղումներ և աղբյուրներ</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">Այս հղումները կերևան public profile-ում և booking source tracking-ի համար էլ պետք կգան։</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <InputShell label="Instagram հղում" icon={<LinkIcon className="h-4 w-4 text-violet-500" />}>
                        <input value={form.instagram_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, instagram_url: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="https://instagram.com/..." />
                      </InputShell>
                      <InputShell label="Facebook հղում" icon={<LinkIcon className="h-4 w-4 text-violet-500" />}>
                        <input value={form.facebook_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, facebook_url: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="https://facebook.com/..." />
                      </InputShell>
                      <InputShell label="WhatsApp համար" icon={<Phone className="h-4 w-4 text-violet-500" />}>
                        <input value={form.whatsapp_phone ?? ""} onChange={(e) => setForm((p) => ({ ...p, whatsapp_phone: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="+374..." />
                      </InputShell>
                      <InputShell label="Messenger հղում" icon={<LinkIcon className="h-4 w-4 text-violet-500" />}>
                        <input value={form.messenger_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, messenger_url: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="https://m.me/..." />
                      </InputShell>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-800">Logo</div>
                    <div className="flex items-center gap-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                      <div className="h-20 w-20 overflow-hidden rounded-3xl bg-white shadow-sm ring-4 ring-white">{form.logo_url ? <img src={form.logo_url} alt="logo" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-slate-400">Logo</div>}</div>
                      <div className="space-y-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                          Վերբեռնել լոգոն
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadMedia(file, 'branding'); setForm((p) => ({ ...p, logo_url: url })); e.currentTarget.value = ''; }} />
                        </label>
                        <div className="text-xs text-slate-500">Լավագույն արդյունքի համար օգտագործիր քառակուսի նկար։</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-800">Banner</div>
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50/70 p-3">
                      <div className="h-40 overflow-hidden rounded-3xl bg-white shadow-sm">{form.cover_url ? <img src={form.cover_url} alt="banner" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-slate-400">Banner preview</div>}</div>
                      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                        Վերբեռնել banner-ը
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadMedia(file, 'branding'); setForm((p) => ({ ...p, cover_url: url })); e.currentTarget.value = ''; }} />
                      </label>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
                    <div className="relative h-44 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.4),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.35),transparent_35%),linear-gradient(135deg,#0f172a_0%,#111827_100%)]">
                      {form.cover_url ? <img src={form.cover_url} alt="preview banner" className="absolute inset-0 h-full w-full object-cover opacity-35" /> : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5">
                        <div className="h-16 w-16 overflow-hidden rounded-[22px] border border-white/20 bg-white/10 backdrop-blur">
                          {form.logo_url ? <img src={form.logo_url} alt="preview logo" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-sm text-white/70">Logo</div>}
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{form.name ?? settingsQ.data?.name ?? 'Քո բիզնեսը'}</div>
                          <div className="mt-1 text-sm text-white/75">{form.short_description || 'Հանրային էջի նախադիտումը կերևա այստեղ։'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3 p-5 text-sm text-white/80 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/50">Հանրային էջ</div>
                        <div className="mt-2 font-semibold text-white">{form.is_public_profile_enabled ? 'Պատրաստ է' : 'Թաքցված'}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/50">Գլխավոր ցուցակ</div>
                        <div className="mt-2 font-semibold text-white">{form.is_marketplace_visible ? 'Տեսանելի է' : 'Չի ցուցադրվում'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {isOwner && (
              <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
                <SectionCard className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.10),transparent_35%),white] p-0">
                  <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="p-4 sm:p-6 md:p-7">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                        <Crown size={14} className="text-violet-600" />
                        Սեփականատիրոջ վճարումների կենտրոն
                      </div>

                      <h2 className="text-2xl font-semibold text-slate-950">Պլան և վճարումներ</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                        Billing-ի ամբողջական կառավարումը տեղափոխված է առանձին owner-only էջ, որպեսզի subscription-ը,
                        տարեկան պլանները, վճարման հաշիվները և բանկային վճարման հոսքը լինեն իրենց սեփական բաժնում։
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link to="/app/billing">
                          <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20"
                          >
                            Բացել պլանը և վճարումները
                            <ArrowRight size={16} />
                          </button>
                        </Link>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 bg-slate-50/60 p-6 lg:border-l lg:border-t-0">
                      <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">ԱՐԱԳ ՀԻՇԵՑՈՒՄ</div>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-sm font-semibold text-slate-950">Միայն owner-ի հասանելիությամբ</div>
                          <div className="mt-1 text-xs text-slate-500">
                            Billing բաժինը manager/staff-ի համար բաց չէ։
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-sm font-semibold text-slate-950">Hosted bank վճարումներ</div>
                          <div className="mt-1 text-xs text-slate-500">
                            User-ը վճարում է բանկի էջում և վերադառնում է ձեզ մոտ։
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-sm font-semibold text-slate-950">Տարեկան պլան</div>
                          <div className="mt-1 text-xs text-slate-500">
                            2 ամիս անվճար տարբերակը ցուցադրվում է billing էջում։
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
          )}

          {settingsQ.error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600">
                {getErrorMessage(settingsQ.error, "Չհաջողվեց բեռնել բիզնեսի կարգավորումները")}
              </div>
          )}

          {scheduleQ.error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600">
                {getErrorMessage(scheduleQ.error, "Չհաջողվեց բեռնել գրաֆիկը")}
              </div>
          )}

          {loading ? (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                    <SectionCard key={i} className="p-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Spinner />
                        Բեռնում…
                      </div>
                      <div className="mt-4 space-y-3">
                        {Array.from({ length: 5 }).map((_, j) => (
                            <div key={j} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                        ))}
                      </div>
                    </SectionCard>
                ))}
              </div>
          ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
                  <SectionCard className="p-6">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-violet-600" />
                        <div className="text-lg font-semibold text-slate-950">Ընդհանուր</div>
                      </div>

                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        {canEdit ? "Կարող ես խմբագրել" : "Read only"}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <InputShell label="Հեռախոս" icon={<Phone size={14} className="text-violet-600" />}>
                        <input
                            disabled={!canEdit}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                            value={form.phone ?? ""}
                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="օր․ 077 12 34 56"
                        />
                      </InputShell>

                      <InputShell label="Ամրագրման քայլ" icon={<Clock size={14} className="text-violet-600" />} hint="15 րոպե = 09:00, 09:15, 09:30… Սա grid-ի քայլն է, ոչ թե ծառայության տևողությունը։">
                        <select
                            disabled={!canEdit}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                            value={Number(form.slot_step_minutes ?? 15)}
                            onChange={(e) => setForm((p) => ({ ...p, slot_step_minutes: Number(e.target.value) }))}
                        >
                          {[5, 10, 15, 20, 30].map((v) => (
                              <option key={v} value={v}>
                                {v} րոպե
                              </option>
                          ))}
                        </select>
                      </InputShell>

                      <InputShell label="Գլխավոր հասցե" icon={<MapPin size={14} className="text-violet-600" />}>
                        <input
                            disabled={!canEdit}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                            value={form.address ?? ""}
                            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                            placeholder="օր․ Երևան, ..."
                        />
                      </InputShell>

                      <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <Building2 className="h-4 w-4 text-violet-600" /> Մասնաճյուղեր և հասցեներ
                            </div>
                            <div className="mt-1 text-xs leading-5 text-slate-500">
                              Այս փուլում կարող ես ավելացնել մինչև {locationLimit} հասցե։ Գլխավոր հասցեն օգտագործվում է public էջի հիմնական կոնտակտում։
                            </div>
                          </div>
                          {canAddLocation ? (
                            <button
                              type="button"
                              onClick={startLocationCreate}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
                            >
                              <Plus className="h-4 w-4" /> Ավելացնել հասցե
                            </button>
                          ) : (
                            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                              {locations.length}/{locationLimit} հասցե
                            </div>
                          )}
                        </div>

                        <div className="mt-4 space-y-3">
                          {locations.map((location) => (
                            <div key={location.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-sm font-semibold text-slate-900">{location.name || `Հասցե ${location.sort_order}`}</div>
                                    {location.is_primary ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Գլխավոր</span> : null}
                                  </div>
                                  <div className="text-sm leading-6 text-slate-600">{location.address}</div>
                                  {location.phone ? <div className="text-xs text-slate-500">{location.phone}</div> : null}
                                  {location.latitude != null && location.longitude != null ? (
                                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700">
                                      <MapPin className="h-3 w-3" /> Քարտեզում նշված է
                                    </div>
                                  ) : (
                                    <div className="mt-2 text-[11px] font-medium text-amber-700">Քարտեզի դիրքը նշված չէ</div>
                                  )}
                                </div>
                                {canEdit ? (
                                  <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => startLocationEdit(location)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button type="button" disabled={locations.length <= 1 || deleteLocationMut.isPending} onClick={() => deleteLocationMut.mutate(location.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-500 disabled:opacity-50">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>

                        {isLocationEditorOpen ? (
                          <div className="mt-4 rounded-[22px] border border-violet-200 bg-white p-4 shadow-sm">
                            <div className="text-sm font-semibold text-slate-900">{editingLocationId ? 'Խմբագրել հասցեն' : 'Նոր հասցե'}</div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <input
                                value={locationDraft.name}
                                onChange={(e) => setLocationDraft((prev) => ({ ...prev, name: e.target.value }))}
                                disabled={!canEdit}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                                placeholder="Անվանում (օր․ Կենտրոն)"
                              />
                              <input
                                value={locationDraft.phone}
                                onChange={(e) => setLocationDraft((prev) => ({ ...prev, phone: e.target.value }))}
                                disabled={!canEdit}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                                placeholder="Հեռախոս"
                              />
                            </div>
                            <textarea
                              value={locationDraft.address}
                              onChange={(e) => setLocationDraft((prev) => ({ ...prev, address: e.target.value }))}
                              disabled={!canEdit}
                              className="mt-3 min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                              placeholder="Լրիվ հասցե"
                            />
                            <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                  <MapPin className="h-4 w-4 text-violet-600" /> Դիր հասցեն քարտեզի վրա
                                </div>
                                <div className="mt-1 text-xs leading-5 text-slate-500">
                                  Քաշիր քարտեզը մինչև նշիչը հայտնվի բիզնեսի մուտքի վրա։ Սա պետք է գլխավոր էջի քարտեզի և մոտակա վայրերի որոնման համար։
                                </div>
                              </div>
                              <LocationMapPicker
                                key={editingLocationId ?? "new-location"}
                                latitude={locationDraft.latitude}
                                longitude={locationDraft.longitude}
                                disabled={!canEdit || saveLocationMut.isPending}
                                onChange={(coordinates) => setLocationDraft((prev) => ({
                                  ...prev,
                                  latitude: coordinates?.latitude ?? null,
                                  longitude: coordinates?.longitude ?? null,
                                }))}
                              />
                            </div>
                            <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
                              <input type="checkbox" checked={locationDraft.is_primary} onChange={(e) => setLocationDraft((prev) => ({ ...prev, is_primary: e.target.checked }))} />
                              Սարքել գլխավոր հասցե
                            </label>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button type="button" onClick={submitLocation} disabled={!canEdit || !locationDraft.address.trim() || saveLocationMut.isPending}>
                                {saveLocationMut.isPending ? <Spinner size={16} /> : editingLocationId ? 'Թարմացնել հասցեն' : 'Պահպանել հասցեն'}
                              </Button>
                              <Button type="button" variant="secondary" onClick={resetLocationEditor} disabled={saveLocationMut.isPending}>Չեղարկել</Button>
                            </div>
                          </div>
                        ) : canAddLocation ? (
                          <button
                            type="button"
                            onClick={startLocationCreate}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                          >
                            <Plus className="h-4 w-4" /> Ավելացնել ևս մեկ հասցե
                          </button>
                        ) : null}
                      </div>

                      <InputShell
                          label="Timezone"
                          icon={<Globe size={14} className="text-violet-600" />}
                          hint="Հայաստանում հիմնականը՝ Asia/Yerevan"
                      >
                        <select
                            disabled={!canEdit}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                            value={form.timezone ?? "Asia/Yerevan"}
                            onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                        >
                          <option value="Asia/Yerevan">Asia/Yerevan (Հայաստան)</option>
                          <option value="Europe/Moscow">Europe/Moscow</option>
                          <option value="Europe/Istanbul">Europe/Istanbul</option>
                          <option value="Asia/Tbilisi">Asia/Tbilisi</option>
                        </select>
                      </InputShell>

                      <div className="grid grid-cols-2 gap-4">
                        <InputShell label="Աշխատանքի սկիզբ" icon={<Clock size={14} className="text-violet-600" />}>
                          <input
                              type="time"
                              disabled={!canEdit}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                              value={form.work_start ?? "09:00"}
                              onChange={(e) => setForm((p) => ({ ...p, work_start: e.target.value }))}
                          />
                        </InputShell>

                        <InputShell label="Աշխատանքի վերջ" icon={<Clock size={14} className="text-violet-600" />}>
                          <input
                              type="time"
                              disabled={!canEdit}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                              value={form.work_end ?? "18:00"}
                              onChange={(e) => setForm((p) => ({ ...p, work_end: e.target.value }))}
                          />
                        </InputShell>
                      </div>
                    </div>

                    {bookingLink && (
                        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-medium text-slate-500">Հանրային ամրագրման հղում</div>
                              <div className="mt-1 break-all text-sm text-slate-900">{bookingLink}</div>
                            </div>
                            <button type="button" onClick={copyBookingLink} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                              {copiedLink ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                              {copiedLink ? 'Պատճենվեց' : 'Պատճենել'}
                            </button>
                          </div>
                        </div>
                    )}
                  </SectionCard>
                </motion.div>

                <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
                  <SectionCard className="p-6">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={18} className="text-violet-600" />
                        <div className="text-lg font-semibold text-slate-950">Շաբաթական գրաֆիկ</div>
                      </div>

                      <div className="text-xs text-slate-500">Break-ը ընտրովի է</div>
                    </div>

                    <div className="max-h-[640px] space-y-3 overflow-y-auto pr-2">
                      {WEEKDAYS.map((w) => {
                        const d = days.find((x) => x.weekday === w.k);
                        if (!d) return null;

                        return (
                            <motion.div
                                key={w.k}
                                initial={{ opacity: 0, x: -14 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: w.k * 0.04 }}
                                className={cn(
                                    "rounded-2xl border p-4 transition-all",
                                    d.is_closed
                                        ? "border-slate-200 bg-slate-50"
                                        : "border-slate-200 bg-white hover:border-violet-300"
                                )}
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="font-medium text-slate-900">{w.label}</div>

                                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                  <input
                                      disabled={!canEdit}
                                      type="checkbox"
                                      checked={!d.is_closed}
                                      onChange={(e) =>
                                          setDays((prev) =>
                                              prev.map((x) =>
                                                  x.weekday === w.k ? { ...x, is_closed: !e.target.checked } : x
                                              )
                                          )
                                      }
                                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200"
                                  />
                                  Բաց է
                                </label>
                              </div>

                              {!d.is_closed && (
                                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div>
                                      <label className="mb-1 block text-xs text-slate-500">Սկիզբ</label>
                                      <input
                                          disabled={!canEdit}
                                          type="time"
                                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                                          value={d.start ?? "09:00"}
                                          onChange={(e) =>
                                              setDays((prev) =>
                                                  prev.map((x) => (x.weekday === w.k ? { ...x, start: e.target.value } : x))
                                              )
                                          }
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-xs text-slate-500">Վերջ</label>
                                      <input
                                          disabled={!canEdit}
                                          type="time"
                                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                                          value={d.end ?? "18:00"}
                                          onChange={(e) =>
                                              setDays((prev) =>
                                                  prev.map((x) => (x.weekday === w.k ? { ...x, end: e.target.value } : x))
                                              )
                                          }
                                      />
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                      <div className="mb-2 text-xs text-slate-500">Break (ընտրովի)</div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <input
                                            disabled={!canEdit}
                                            type="time"
                                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                                            value={d.break_start ?? ""}
                                            onChange={(e) =>
                                                setDays((prev) =>
                                                    prev.map((x) =>
                                                        x.weekday === w.k ? { ...x, break_start: e.target.value || null } : x
                                                    )
                                                )
                                            }
                                        />
                                        <input
                                            disabled={!canEdit}
                                            type="time"
                                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                                            value={d.break_end ?? ""}
                                            onChange={(e) =>
                                                setDays((prev) =>
                                                    prev.map((x) =>
                                                        x.weekday === w.k ? { ...x, break_end: e.target.value || null } : x
                                                    )
                                                )
                                            }
                                        />
                                      </div>

                                      <button
                                          disabled={!canEdit}
                                          className="mt-2 text-xs text-slate-500 transition hover:text-violet-700 disabled:opacity-50"
                                          onClick={() =>
                                              setDays((prev) =>
                                                  prev.map((x) =>
                                                      x.weekday === w.k ? { ...x, break_start: null, break_end: null } : x
                                                  )
                                              )
                                          }
                                          type="button"
                                      >
                                        Ջնջել break-ը
                                      </button>
                                    </div>
                                  </div>
                              )}
                            </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                          disabled={!canEdit || saving}
                          onClick={() => saveScheduleMut.mutate({ days })}
                          variant="secondary"
                          className="gap-2"
                      >
                        {saveScheduleMut.isPending ? <Spinner size={16} /> : <Save size={16} />}
                        Պահպանել միայն գրաֆիկը
                      </Button>
                    </div>
                  </SectionCard>
                </motion.div>
              </div>
          )}
        </motion.div>
      </>
  );
}
