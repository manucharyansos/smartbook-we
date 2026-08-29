import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, Clock3, ListChecks, Mail, Megaphone, Pencil, RefreshCw, Send, Sparkles, UserRound, X } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { useLanguage } from "../contexts/LanguageContext";
import { page } from "../lib/motion";
import { fetchStaff } from "../lib/staffApi";
import {
  cancelCampaign,
  createCampaign,
  fetchCampaigns,
  fetchCampaignDeliveries,
  fetchWaitlist,
  offerWaitlistEntry,
  sendCampaign,
  updateCampaign,
  updateWaitlistEntry,
  type CampaignPayload,
  type CampaignSegment,
  type MarketingCampaign,
  type WaitlistEntry,
  type WaitlistStatus,
} from "../lib/growthApi";

const copy = {
  hy: {
    badge: "Աճի գործիքներ", title: "Սպասման ցուցակ և marketing", intro: "Լրացրեք ազատված ժամերը ավտոմատ առաջարկներով և վերադարձեք ճիշտ հաճախորդներին թիրախավորված email-ներով։",
    waitlist: "Սպասման ցուցակ", campaigns: "Campaign-ներ", waiting: "Սպասում է", offered: "Առաջարկված", booked: "Ամրագրված", cancelled: "Չեղարկված", expired: "Ժամկետանց", all: "Բոլորը", noWaitlist: "Սպասման գրառում դեռ չկա։", requested: "Ցանկալի ժամ", party: "Մասնակից", anyStaff: "Ցանկացած մասնագետ", offer: "Առաջարկել ժամ", sendOffer: "Ուղարկել առաջարկը", returnToQueue: "Վերադարձնել հերթ", cancel: "Չեղարկել", offerSent: "Առաջարկն ուղարկվեց", updated: "Ցուցակը թարմացվեց", chooseStaff: "Ընտրեք մասնագետ", chooseTime: "Ընտրեք ժամը", autoHint: "Երբ ամրագրում է չեղարկվում կամ տեղափոխվում, համակարգն ինքն է գտնում առաջին համապատասխան հաճախորդին և 30 րոպեով պահում ազատված ժամը։",
    newCampaign: "Նոր campaign", editCampaign: "Խմբագրել campaign-ը", campaignName: "Ներքին անուն", subject: "Email-ի թեմա", message: "Հաղորդագրություն", segment: "Սեգմենտ", allOpted: "Բոլոր համաձայնվածները", newClients: "Նոր հաճախորդներ", returning: "Վերադարձողներ", inactive: "90+ օր ոչ ակտիվ", vip: "VIP", schedule: "Պլանավորել", optional: "ըստ ցանկության", saveDraft: "Պահպանել", createScheduled: "Պլանավորել", created: "Campaign-ը ստեղծվեց", campaignUpdated: "Campaign-ը թարմացվեց", sent: "Ուղարկումն ավարտվեց", sendNow: "Ուղարկել հիմա", edit: "Խմբագրել", deliveries: "Ուղարկումների պատմություն", stop: "Չեղարկել", close: "Փակել", recipients: "ստացող", delivered: "ուղարկված", failed: "ձախողված", noCampaigns: "Campaign դեռ չկա։", noDeliveries: "Ուղարկումներ դեռ չկան։", consentHint: "Ուղարկումը կատարվում է միայն marketing համաձայնություն տված և չապաբաժանորդագրված հաճախորդներին։", draft: "Սևագիր", scheduled: "Պլանավորված", sending: "Ուղարկվում է", failedStatus: "Սխալ", cancelledStatus: "Չեղարկված", sentStatus: "Ուղարկված", formError: "Լրացրեք պարտադիր դաշտերը։", actionFailed: "Գործողությունը չհաջողվեց։", refresh: "Թարմացնել",
  },
  ru: {
    badge: "Инструменты роста", title: "Лист ожидания и маркетинг", intro: "Заполняйте освободившиеся окна автоматическими предложениями и возвращайте нужных клиентов целевыми email-кампаниями.",
    waitlist: "Лист ожидания", campaigns: "Кампании", waiting: "Ожидает", offered: "Предложено", booked: "Записан", cancelled: "Отменено", expired: "Истекло", all: "Все", noWaitlist: "В листе ожидания пока нет записей.", requested: "Желаемое время", party: "Участников", anyStaff: "Любой специалист", offer: "Предложить время", sendOffer: "Отправить предложение", returnToQueue: "Вернуть в очередь", cancel: "Отменить", offerSent: "Предложение отправлено", updated: "Список обновлен", chooseStaff: "Выберите специалиста", chooseTime: "Выберите время", autoHint: "При отмене или переносе система сама находит первого подходящего клиента и удерживает окно 30 минут.",
    newCampaign: "Новая кампания", editCampaign: "Редактировать кампанию", campaignName: "Внутреннее название", subject: "Тема письма", message: "Сообщение", segment: "Сегмент", allOpted: "Все с согласием", newClients: "Новые клиенты", returning: "Возвращающиеся", inactive: "Неактивны 90+ дней", vip: "VIP", schedule: "Запланировать", optional: "необязательно", saveDraft: "Сохранить", createScheduled: "Запланировать", created: "Кампания создана", campaignUpdated: "Кампания обновлена", sent: "Рассылка завершена", sendNow: "Отправить сейчас", edit: "Изменить", deliveries: "История отправок", stop: "Отменить", close: "Закрыть", recipients: "получателей", delivered: "доставлено", failed: "ошибок", noCampaigns: "Кампаний пока нет.", noDeliveries: "Отправок пока нет.", consentHint: "Письма получают только клиенты с согласием на маркетинг, которые не отписались.", draft: "Черновик", scheduled: "Запланирована", sending: "Отправляется", failedStatus: "Ошибка", cancelledStatus: "Отменена", sentStatus: "Отправлена", formError: "Заполните обязательные поля.", actionFailed: "Не удалось выполнить действие.", refresh: "Обновить",
  },
  en: {
    badge: "Growth tools", title: "Waitlist and marketing", intro: "Fill newly opened times with automatic offers and bring the right customers back with targeted email campaigns.",
    waitlist: "Waitlist", campaigns: "Campaigns", waiting: "Waiting", offered: "Offered", booked: "Booked", cancelled: "Cancelled", expired: "Expired", all: "All", noWaitlist: "There are no waitlist entries yet.", requested: "Requested time", party: "Party", anyStaff: "Any specialist", offer: "Offer a time", sendOffer: "Send offer", returnToQueue: "Return to queue", cancel: "Cancel", offerSent: "Offer sent", updated: "Waitlist updated", chooseStaff: "Choose a specialist", chooseTime: "Choose a time", autoHint: "When a booking is cancelled or moved, the system finds the first matching customer and holds the opened time for 30 minutes.",
    newCampaign: "New campaign", editCampaign: "Edit campaign", campaignName: "Internal name", subject: "Email subject", message: "Message", segment: "Segment", allOpted: "All opted-in", newClients: "New customers", returning: "Returning", inactive: "Inactive 90+ days", vip: "VIP", schedule: "Schedule", optional: "optional", saveDraft: "Save draft", createScheduled: "Schedule", created: "Campaign created", campaignUpdated: "Campaign updated", sent: "Campaign completed", sendNow: "Send now", edit: "Edit", deliveries: "Delivery history", stop: "Cancel", close: "Close", recipients: "recipients", delivered: "sent", failed: "failed", noCampaigns: "There are no campaigns yet.", noDeliveries: "There are no deliveries yet.", consentHint: "Only customers who opted in to marketing and have not unsubscribed receive these emails.", draft: "Draft", scheduled: "Scheduled", sending: "Sending", failedStatus: "Failed", cancelledStatus: "Cancelled", sentStatus: "Sent", formError: "Complete the required fields.", actionFailed: "The action failed.", refresh: "Refresh",
  },
} as const;

const statusStyles: Record<WaitlistStatus, string> = {
  waiting: "border-amber-200 bg-amber-50 text-amber-700",
  offered: "border-violet-200 bg-violet-50 text-violet-700",
  booked: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-600",
  expired: "border-rose-200 bg-rose-50 text-rose-700",
};

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallback;
  }
  return fallback;
}

function localDateTimeInput(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function GrowthPage() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"waitlist" | "campaigns">("waitlist");
  const [status, setStatus] = useState<WaitlistStatus | "">("");
  const [offerFor, setOfferFor] = useState<WaitlistEntry | null>(null);
  const [offerStaff, setOfferStaff] = useState("");
  const [offerTime, setOfferTime] = useState("");
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [deliveryCampaign, setDeliveryCampaign] = useState<MarketingCampaign | null>(null);
  const [toast, setToast] = useState({ open: false, text: "", type: "success" as "success" | "error" });
  const [form, setForm] = useState<CampaignPayload>({ name: "", segment: "all", subject: "", body: "", scheduled_for: null });

  const waitlistQ = useQuery({ queryKey: ["waitlist", status], queryFn: () => fetchWaitlist({ status }) });
  const campaignsQ = useQuery({ queryKey: ["marketing-campaigns"], queryFn: fetchCampaigns });
  const deliveriesQ = useQuery({ queryKey: ["marketing-deliveries", deliveryCampaign?.id ?? 0], queryFn: () => fetchCampaignDeliveries(deliveryCampaign!.id), enabled: !!deliveryCampaign });
  const staffQ = useQuery({ queryKey: ["staff", "growth"], queryFn: () => fetchStaff() });
  const bookableStaff = useMemo(() => (staffQ.data ?? []).filter((member) => member.is_active && member.is_bookable), [staffQ.data]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ open: true, text: message, type });
    window.setTimeout(() => setToast((previous) => ({ ...previous, open: false })), 2600);
  };

  const offerMut = useMutation({
    mutationFn: () => offerWaitlistEntry(offerFor!.id, { staff_id: Number(offerStaff), starts_at: offerTime.replace("T", " ") }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["waitlist"] }); setOfferFor(null); showToast(text.offerSent); },
    onError: (error) => showToast(errorMessage(error, text.actionFailed), "error"),
  });
  const updateWaitlistMut = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: "waiting" | "cancelled" }) => updateWaitlistEntry(id, { status: nextStatus }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["waitlist"] }); showToast(text.updated); },
    onError: (error) => showToast(errorMessage(error, text.actionFailed), "error"),
  });
  const createMut = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] }); setEditingCampaignId(null); setForm({ name: "", segment: "all", subject: "", body: "", scheduled_for: null }); showToast(text.created); },
    onError: (error) => showToast(errorMessage(error, text.actionFailed), "error"),
  });
  const updateCampaignMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CampaignPayload }) => updateCampaign(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] }); setEditingCampaignId(null); setForm({ name: "", segment: "all", subject: "", body: "", scheduled_for: null }); showToast(text.campaignUpdated); },
    onError: (error) => showToast(errorMessage(error, text.actionFailed), "error"),
  });
  const sendMut = useMutation({
    mutationFn: sendCampaign,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] }); showToast(text.sent); },
    onError: (error) => showToast(errorMessage(error, text.actionFailed), "error"),
  });
  const cancelMut = useMutation({
    mutationFn: cancelCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] }),
    onError: (error) => showToast(errorMessage(error, text.actionFailed), "error"),
  });

  const openOffer = (entry: WaitlistEntry) => {
    const initialTime = `${entry.desired_date}T${(entry.window_start || "09:00").slice(0, 5)}`;
    setOfferFor(entry);
    setOfferStaff(String(entry.staff_id ?? bookableStaff[0]?.id ?? ""));
    setOfferTime(initialTime);
  };

  const submitCampaign = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) return showToast(text.formError, "error");
    const payload = { ...form, scheduled_for: form.scheduled_for ? new Date(form.scheduled_for).toISOString() : null };
    if (editingCampaignId) updateCampaignMut.mutate({ id: editingCampaignId, payload });
    else createMut.mutate(payload);
  };

  const editCampaign = (campaign: MarketingCampaign) => {
    setEditingCampaignId(campaign.id);
    setForm({ name: campaign.name, segment: campaign.segment, subject: campaign.subject, body: campaign.body, scheduled_for: localDateTimeInput(campaign.scheduled_for) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetCampaignForm = () => {
    setEditingCampaignId(null);
    setForm({ name: "", segment: "all", subject: "", body: "", scheduled_for: null });
  };

  const waitlist = waitlistQ.data ?? [];
  const campaigns = campaignsQ.data ?? [];
  const statusLabel = (value: WaitlistStatus) => text[value];
  const campaignStatus = (campaign: MarketingCampaign) => ({
    draft: text.draft, scheduled: text.scheduled, sending: text.sending, sent: text.sentStatus, failed: text.failedStatus, cancelled: text.cancelledStatus,
  }[campaign.status]);

  return (
    <motion.div {...page} className="admin-page space-y-5">
      <Toast open={toast.open} text={toast.text} type={toast.type} />

      <Card className="overflow-hidden border border-violet-200 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.16),transparent_35%),linear-gradient(135deg,#fff,#faf5ff)] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700"><Sparkles className="h-4 w-4" />{text.badge}</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{text.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{text.intro}</p>
          </div>
          <Button variant="secondary" onClick={() => { waitlistQ.refetch(); campaignsQ.refetch(); }}><RefreshCw className="h-4 w-4" />{text.refresh}</Button>
        </div>
      </Card>

      <div className="flex w-full gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 sm:w-fit">
        <button onClick={() => setTab("waitlist")} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold sm:flex-none ${tab === "waitlist" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}><CalendarClock className="mr-2 inline h-4 w-4" />{text.waitlist}</button>
        <button onClick={() => setTab("campaigns")} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold sm:flex-none ${tab === "campaigns" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}><Megaphone className="mr-2 inline h-4 w-4" />{text.campaigns}</button>
      </div>

      {tab === "waitlist" ? (
        <div className="space-y-4">
          <Card className="border border-violet-100 bg-violet-50/70 p-4 text-sm leading-6 text-violet-800"><Sparkles className="mr-2 inline h-4 w-4" />{text.autoHint}</Card>
          <Card className="p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-slate-950">{text.waitlist}</h2>
              <select value={status} onChange={(event) => setStatus(event.target.value as WaitlistStatus | "")} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-300">
                <option value="">{text.all}</option><option value="waiting">{text.waiting}</option><option value="offered">{text.offered}</option><option value="booked">{text.booked}</option><option value="cancelled">{text.cancelled}</option><option value="expired">{text.expired}</option>
              </select>
            </div>
            {!waitlistQ.isLoading && waitlist.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">{text.noWaitlist}</div> : null}
            <div className="grid gap-3 xl:grid-cols-2">
              {waitlist.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="font-semibold text-slate-950">{entry.customer_name}</div><div className="mt-1 text-xs text-slate-500">{entry.customer_phone} · {entry.customer_email}</div></div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[entry.status]}`}>{statusLabel(entry.status)}</span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="flex gap-2"><CalendarClock className="mt-0.5 h-4 w-4 text-violet-600" /><span><strong className="text-slate-800">{entry.service?.name}</strong><br />{text.requested}: {entry.desired_date} {entry.window_start?.slice(0, 5) || "—"}–{entry.window_end?.slice(0, 5) || "—"}</span></div>
                    <div className="flex gap-2"><UserRound className="mt-0.5 h-4 w-4 text-violet-600" /><span>{entry.staff?.name || text.anyStaff}<br />{text.party}: {entry.party_size}</span></div>
                  </div>
                  {entry.offered_starts_at ? <div className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700"><Clock3 className="mr-1 inline h-3.5 w-3.5" />{entry.offered_starts_at} · {entry.offered_staff?.name}</div> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.status === "waiting" ? <Button size="sm" onClick={() => openOffer(entry)}><Send className="h-4 w-4" />{text.offer}</Button> : null}
                    {entry.status === "offered" || entry.status === "expired" ? <Button size="sm" variant="secondary" onClick={() => updateWaitlistMut.mutate({ id: entry.id, nextStatus: "waiting" })}>{text.returnToQueue}</Button> : null}
                    {entry.status === "waiting" || entry.status === "offered" ? <Button size="sm" variant="danger" onClick={() => updateWaitlistMut.mutate({ id: entry.id, nextStatus: "cancelled" })}><X className="h-4 w-4" />{text.cancel}</Button> : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <Card className="h-fit p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-950">{editingCampaignId ? text.editCampaign : text.newCampaign}</h2>{editingCampaignId ? <button type="button" onClick={resetCampaignForm} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label={text.close}><X className="h-4 w-4" /></button> : null}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{text.consentHint}</p>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">{text.campaignName}<input value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-300" /></label>
              <label className="block text-sm font-medium text-slate-700">{text.segment}<select value={form.segment} onChange={(event) => setForm((previous) => ({ ...previous, segment: event.target.value as CampaignSegment }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-violet-300"><option value="all">{text.allOpted}</option><option value="new">{text.newClients}</option><option value="returning">{text.returning}</option><option value="inactive">{text.inactive}</option><option value="vip">{text.vip}</option></select></label>
              <label className="block text-sm font-medium text-slate-700">{text.subject}<input value={form.subject} onChange={(event) => setForm((previous) => ({ ...previous, subject: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-300" /></label>
              <label className="block text-sm font-medium text-slate-700">{text.message}<textarea rows={6} value={form.body} onChange={(event) => setForm((previous) => ({ ...previous, body: event.target.value }))} placeholder="{{name}}, {{business}}" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none focus:border-violet-300" /></label>
              <label className="block text-sm font-medium text-slate-700">{text.schedule} <span className="font-normal text-slate-400">({text.optional})</span><input type="datetime-local" value={form.scheduled_for || ""} onChange={(event) => setForm((previous) => ({ ...previous, scheduled_for: event.target.value || null }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-300" /></label>
              <Button className="w-full" onClick={submitCampaign} loading={createMut.isPending || updateCampaignMut.isPending}><Check className="h-4 w-4" />{editingCampaignId ? text.saveDraft : form.scheduled_for ? text.createScheduled : text.saveDraft}</Button>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-semibold text-slate-950">{text.campaigns}</h2>
            {!campaignsQ.isLoading && campaigns.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">{text.noCampaigns}</div> : null}
            <div className="mt-5 space-y-3">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div><div className="font-semibold text-slate-950">{campaign.name}</div><div className="mt-1 text-sm text-slate-600">{campaign.subject}</div><div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500"><span className="rounded-full bg-slate-100 px-2.5 py-1">{campaign.segment}</span><span>{campaign.recipient_count} {text.recipients}</span><span>{campaign.sent_count} {text.delivered}</span>{campaign.failed_count ? <span className="text-rose-600">{campaign.failed_count} {text.failed}</span> : null}</div></div>
                    <span className="w-fit rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{campaignStatus(campaign)}</span>
                  </div>
                  {campaign.scheduled_for ? <div className="mt-3 text-xs text-slate-500"><CalendarClock className="mr-1 inline h-3.5 w-3.5" />{new Date(campaign.scheduled_for).toLocaleString()}</div> : null}
                  {campaign.last_error ? <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{campaign.last_error}</div> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {campaign.status === "draft" || campaign.status === "scheduled" || campaign.status === "failed" ? <><Button size="sm" onClick={() => sendMut.mutate(campaign.id)} loading={sendMut.isPending}><Mail className="h-4 w-4" />{text.sendNow}</Button><Button size="sm" variant="secondary" onClick={() => editCampaign(campaign)}><Pencil className="h-4 w-4" />{text.edit}</Button><Button size="sm" variant="danger" onClick={() => cancelMut.mutate(campaign.id)}>{text.stop}</Button></> : null}
                    {campaign.deliveries_count || campaign.status === "sent" || campaign.status === "failed" ? <Button size="sm" variant="secondary" onClick={() => setDeliveryCampaign(campaign)}><ListChecks className="h-4 w-4" />{text.deliveries}</Button> : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {offerFor ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOfferFor(null); }}>
          <Card className="w-full max-w-md border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold text-slate-950">{text.offer}</h3><p className="mt-1 text-sm text-slate-500">{offerFor.customer_name} · {offerFor.service?.name}</p></div><button onClick={() => setOfferFor(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">{text.chooseStaff}<select value={offerStaff} onChange={(event) => setOfferStaff(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-violet-300"><option value="" disabled>{text.chooseStaff}</option>{bookableStaff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
              <label className="block text-sm font-medium text-slate-700">{text.chooseTime}<input type="datetime-local" value={offerTime} onChange={(event) => setOfferTime(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-300" /></label>
              <Button className="w-full" disabled={!offerStaff || !offerTime} loading={offerMut.isPending} onClick={() => offerMut.mutate()}><Send className="h-4 w-4" />{text.sendOffer}</Button>
            </div>
          </Card>
        </div>
      ) : null}

      {deliveryCampaign ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeliveryCampaign(null); }}>
          <Card className="max-h-[82vh] w-full max-w-2xl overflow-y-auto border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-slate-950">{text.deliveries}</h3><p className="mt-1 text-sm text-slate-500">{deliveryCampaign.name}</p></div><button type="button" onClick={() => setDeliveryCampaign(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label={text.close}><X className="h-5 w-5" /></button></div>
            <div className="mt-5 space-y-2">
              {!deliveriesQ.isLoading && !(deliveriesQ.data ?? []).length ? <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">{text.noDeliveries}</div> : null}
              {(deliveriesQ.data ?? []).map((delivery) => <div key={delivery.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><div className="flex items-center justify-between gap-3"><span className="font-medium text-slate-900">{delivery.email}</span><span className={delivery.status === "sent" ? "text-emerald-700" : delivery.status === "failed" ? "text-rose-700" : "text-amber-700"}>{delivery.status}</span></div>{delivery.sent_at ? <div className="mt-1 text-xs text-slate-500">{new Date(delivery.sent_at).toLocaleString()}</div> : null}{delivery.error ? <div className="mt-1 text-xs text-rose-600">{delivery.error}</div> : null}</div>)}
            </div>
          </Card>
        </div>
      ) : null}
    </motion.div>
  );
}
