import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BellRing, CalendarClock, Contact, History, Mail, NotebookPen, Phone, Pin, Plus, Search, ShieldBan, Star, Trash2, UserRound, WalletCards } from "lucide-react";

import { page, card, cardTransition } from "../lib/motion";
import { PageHero } from "../components/ui/PageHero";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../store/auth";
import { cn } from "../lib/cn";
import { createClient, createClientNote, createClientReminder, deleteClientNote, deleteClientReminder, dispatchClientReminder, fetchClient, fetchClientBookings, fetchClients, updateClient, updateClientReminder, type ClientDetails, type ClientFormPayload, type ClientRow } from "../lib/clientsApi";
import { useLanguage, type Locale } from "../contexts/LanguageContext";

const clientsCopy = {
  hy: {
    badge: "Պացիենտների կառավարում", genericBadge: "Հաճախորդների կառավարում", title: "Պացիենտներ և բժշկական քարտեր", genericTitle: "Հաճախորդների բազա",
    intro: "Պացիենտի այցերը, բժշկական նշումները, ալերգիաները, հիշեցումներն ու պատմությունը՝ մեկ ապահով և հստակ քարտում։", genericIntro: "Հաճախորդների այցերը, նշումները, խմբերը և հիշեցումները՝ մեկ հստակ քարտում։", newClient: "Նոր հաճախորդ", newPatient: "Նոր պացիենտ",
    totalClients: "Ընդհանուր հաճախորդներ", totalPatients: "Ընդհանուր պացիենտներ", visits: "Այցեր", revenue: "Շրջանառություն", upcomingPeople: "Առաջիկա այց ունեցողներ", blocked: "Սև ցուցակ", amd: "դր",
    filters: "Խելացի ֆիլտրեր", filtersText: "Գտեք ըստ կարգավիճակի, VIP նշման կամ խմբի։", search: "Փնտրել անուն, հեռախոս, էլ. փոստ կամ խումբ", allSegments: "Բոլոր տեսակները", grouped: "Խմբավորված", allStatuses: "Բոլոր կարգավիճակները", statusNew: "Նոր", returning: "Վերադարձող", lost: "Կորած", upcoming: "Առաջիկա այցով", allGroups: "Բոլոր խմբերը", clear: "Մաքրել ֆիլտրերը",
    list: "Պացիենտների ցուցակ", genericList: "Հաճախորդների ցուցակ", listText: "Ընտրեք անձին՝ ամբողջ պատմությունն ու բժշկական քարտը բացելու համար։", genericListText: "Ընտրեք հաճախորդին՝ ամբողջ պատմությունը բացելու համար։", loading: "Բեռնում ենք…", empty: "Պացիենտներ դեռ չկան", genericEmpty: "Հաճախորդներ դեռ չկան", emptyText: "Ավելացրեք առաջին գրառումը կամ փոխեք ֆիլտրերը։", visit: "այց", lastVisit: "Վերջին այց", nextVisit: "Հաջորդ այց", page: "Էջ", previous: "Նախորդ", next: "Հաջորդ",
    profile: "Պացիենտի քարտ", genericProfile: "Հաճախորդի քարտ", edit: "Խմբագրել", totalVisits: "Ընդհանուր այցեր", totalSpent: "Ընդհանուր ծախս", avgTicket: "Միջին վճարում", favoriteService: "Հաճախ ընտրված ծառայություն", favoriteStaff: "Հաճախ ընտրված մասնագետ", favoriteDoctor: "Հաճախ ընտրված բժիշկ", source: "Հիմնական աղբյուր", account: "Օգտատիրոջ հաշիվ", linked: "Կապված է", notLinked: "Դեռ չկա", completed: "Կատարված այցեր", cancellations: "Չեղարկումներ", noShow: "Չկայացած այցեր", blockReason: "Սև ցուցակի պատճառ",
    medicalCard: "Բժշկական տեղեկություններ", birthDate: "Ծննդյան օր", bloodType: "Արյան խումբ", allergies: "Ալերգիաներ", emergency: "Արտակարգ կապ", medicalHistory: "Բժշկական պատմություն",
    notes: "Նշումներ", general: "Ընդհանուր", visitNote: "Այց", medical: "Բժշկական", pin: "Ամրացնել", add: "Ավելացնել", notePlaceholder: "Գրեք այցի կամ պացիենտի մասին կարևոր նշումը…", pinned: "Ամրացված", noNotes: "Նշումներ դեռ չկան։",
    reminders: "Հիշեցումներ", reminderPlaceholder: "Ինչի՞ մասին հիշեցնել", internal: "Ներքին", atTime: "Հենց ժամին", min15: "15 րոպե առաջ", min30: "30 րոպե առաջ", hour1: "1 ժամ առաջ", hour3: "3 ժամ առաջ", day1: "1 օր առաջ", inApp: "Համակարգում", activeReminder: "Ակտիվ հիշեցում", details: "Մանրամասներ…", createReminder: "Ստեղծել հիշեցում", minBefore: "ր առաջ", disabled: "անջատված է", markDone: "Ավարտված", sendNow: "Ուղարկել հիմա", noReminders: "Հիշեցումներ դեռ չկան։",
    timeline: "Գործողությունների պատմություն", emptyTimeline: "Պատմությունը դեռ դատարկ է։", recentBookings: "Վերջին այցերը", service: "Ծառայություն", noBookings: "Դեռ այցեր չկան։", selectClient: "Ընտրեք պացիենտ", genericSelectClient: "Ընտրեք հաճախորդ", selectText: "Ցուցակից ընտրեք անձին՝ մանրամասն քարտը բացելու համար։",
    editClient: "Խմբագրել հաճախորդին", editPatient: "Խմբագրել պացիենտին", name: "Անուն և ազգանուն", namePlaceholder: "Օր․ Մարիամ Հովհաննիսյան", phone: "Հեռախոս", email: "Էլ. փոստ", group: "Խումբ", groupPlaceholder: "Օր․ VIP, կորպորատիվ", select: "Ընտրել", emergencyName: "Արտակարգ կապի անուն", emergencyPhone: "Արտակարգ կապի հեռախոս", nameShort: "Անուն", vipClient: "VIP հաճախորդ", vipPatient: "VIP պացիենտ", blacklist: "Սև ցուցակ", reason: "Սև ցուցակի պատճառ", reasonPlaceholder: "Նշեք պատճառը…", allergiesPlaceholder: "Օր․ լատեքս, պենիցիլին…", historyPlaceholder: "Այցերի ժամանակ հաշվի առնելու տեղեկություններ…", note: "Ընդհանուր նշում", profileNotePlaceholder: "Նախընտրություններ կամ այլ կարևոր տեղեկություն…", close: "Փակել", save: "Պահպանել", create: "Ստեղծել",
    statusLost: "Կորած", statusReturning: "Վերադարձող", statusUpcoming: "Առաջիկա", statusBlacklist: "Սև ցուցակ",
  },
  ru: {
    badge: "Управление пациентами", genericBadge: "Управление клиентами", title: "Пациенты и медицинские карты", genericTitle: "База клиентов", intro: "Визиты, медицинские заметки, аллергии, напоминания и история пациента в одной защищенной карте.", genericIntro: "Визиты, заметки, группы и напоминания клиентов в одном профиле.", newClient: "Новый клиент", newPatient: "Новый пациент",
    totalClients: "Всего клиентов", totalPatients: "Всего пациентов", visits: "Визиты", revenue: "Оборот", upcomingPeople: "С ближайшим визитом", blocked: "Черный список", amd: "֏",
    filters: "Умные фильтры", filtersText: "Поиск по статусу, VIP-метке или группе.", search: "Поиск по имени, телефону, почте или группе", allSegments: "Все типы", grouped: "С группой", allStatuses: "Все статусы", statusNew: "Новый", returning: "Возвращается", lost: "Потерян", upcoming: "С визитом", allGroups: "Все группы", clear: "Сбросить фильтры",
    list: "Список пациентов", genericList: "Список клиентов", listText: "Выберите человека, чтобы открыть историю и медицинскую карту.", genericListText: "Выберите клиента, чтобы открыть полную историю.", loading: "Загрузка…", empty: "Пациентов пока нет", genericEmpty: "Клиентов пока нет", emptyText: "Добавьте первую запись или измените фильтры.", visit: "визитов", lastVisit: "Последний визит", nextVisit: "Следующий визит", page: "Страница", previous: "Назад", next: "Далее",
    profile: "Карта пациента", genericProfile: "Профиль клиента", edit: "Изменить", totalVisits: "Всего визитов", totalSpent: "Всего потрачено", avgTicket: "Средний чек", favoriteService: "Любимая услуга", favoriteStaff: "Любимый специалист", favoriteDoctor: "Любимый врач", source: "Основной источник", account: "Аккаунт клиента", linked: "Подключен", notLinked: "Пока нет", completed: "Завершенные визиты", cancellations: "Отмены", noShow: "Неявки", blockReason: "Причина блокировки",
    medicalCard: "Медицинская информация", birthDate: "Дата рождения", bloodType: "Группа крови", allergies: "Аллергии", emergency: "Экстренный контакт", medicalHistory: "Медицинская история",
    notes: "Заметки", general: "Общее", visitNote: "Визит", medical: "Медицинское", pin: "Закрепить", add: "Добавить", notePlaceholder: "Важная заметка о визите или пациенте…", pinned: "Закреплено", noNotes: "Заметок пока нет.",
    reminders: "Напоминания", reminderPlaceholder: "О чем напомнить?", internal: "Внутреннее", atTime: "В назначенное время", min15: "За 15 минут", min30: "За 30 минут", hour1: "За 1 час", hour3: "За 3 часа", day1: "За 1 день", inApp: "В системе", activeReminder: "Напоминание активно", details: "Подробности…", createReminder: "Создать напоминание", minBefore: "мин. до", disabled: "отключено", markDone: "Завершено", sendNow: "Отправить сейчас", noReminders: "Напоминаний пока нет.",
    timeline: "История действий", emptyTimeline: "История пока пуста.", recentBookings: "Последние визиты", service: "Услуга", noBookings: "Визитов пока нет.", selectClient: "Выберите пациента", genericSelectClient: "Выберите клиента", selectText: "Выберите человека из списка, чтобы открыть карточку.",
    editClient: "Редактировать клиента", editPatient: "Редактировать пациента", name: "Имя и фамилия", namePlaceholder: "Напр. Мария Иванова", phone: "Телефон", email: "Эл. почта", group: "Группа", groupPlaceholder: "Напр. VIP, корпоративные", select: "Выбрать", emergencyName: "Имя экстренного контакта", emergencyPhone: "Телефон экстренного контакта", nameShort: "Имя", vipClient: "VIP-клиент", vipPatient: "VIP-пациент", blacklist: "Черный список", reason: "Причина блокировки", reasonPlaceholder: "Укажите причину…", allergiesPlaceholder: "Напр. латекс, пенициллин…", historyPlaceholder: "Информация, важная во время визитов…", note: "Общая заметка", profileNotePlaceholder: "Предпочтения и другая важная информация…", close: "Закрыть", save: "Сохранить", create: "Создать",
    statusLost: "Потерян", statusReturning: "Возвращается", statusUpcoming: "Предстоящий", statusBlacklist: "Черный список",
  },
  en: {
    badge: "Patient management", genericBadge: "Client management", title: "Patients & medical records", genericTitle: "Client database", intro: "Visits, clinical notes, allergies, reminders and patient history in one secure, clear record.", genericIntro: "Client visits, notes, groups and reminders in one clear profile.", newClient: "New client", newPatient: "New patient",
    totalClients: "Total clients", totalPatients: "Total patients", visits: "Visits", revenue: "Revenue", upcomingPeople: "With an upcoming visit", blocked: "Blocked", amd: "AMD",
    filters: "Smart filters", filtersText: "Find people by status, VIP marker or group.", search: "Search name, phone, email or group", allSegments: "All types", grouped: "Grouped", allStatuses: "All statuses", statusNew: "New", returning: "Returning", lost: "Lost", upcoming: "Upcoming", allGroups: "All groups", clear: "Clear filters",
    list: "Patient list", genericList: "Client list", listText: "Select a person to open their full history and medical record.", genericListText: "Select a client to open their full history.", loading: "Loading…", empty: "No patients yet", genericEmpty: "No clients yet", emptyText: "Add the first record or change the filters.", visit: "visits", lastVisit: "Last visit", nextVisit: "Next visit", page: "Page", previous: "Previous", next: "Next",
    profile: "Patient record", genericProfile: "Client profile", edit: "Edit", totalVisits: "Total visits", totalSpent: "Total spent", avgTicket: "Average payment", favoriteService: "Favorite service", favoriteStaff: "Favorite specialist", favoriteDoctor: "Favorite doctor", source: "Main source", account: "Client account", linked: "Linked", notLinked: "Not linked", completed: "Completed visits", cancellations: "Cancellations", noShow: "No-shows", blockReason: "Block reason",
    medicalCard: "Medical information", birthDate: "Date of birth", bloodType: "Blood type", allergies: "Allergies", emergency: "Emergency contact", medicalHistory: "Medical history",
    notes: "Notes", general: "General", visitNote: "Visit", medical: "Medical", pin: "Pin", add: "Add", notePlaceholder: "Add an important note about the visit or patient…", pinned: "Pinned", noNotes: "No notes yet.",
    reminders: "Reminders", reminderPlaceholder: "What should we remind you about?", internal: "Internal", atTime: "At the scheduled time", min15: "15 minutes before", min30: "30 minutes before", hour1: "1 hour before", hour3: "3 hours before", day1: "1 day before", inApp: "In app", activeReminder: "Reminder enabled", details: "Details…", createReminder: "Create reminder", minBefore: "min before", disabled: "disabled", markDone: "Done", sendNow: "Send now", noReminders: "No reminders yet.",
    timeline: "Activity history", emptyTimeline: "The history is empty.", recentBookings: "Recent visits", service: "Service", noBookings: "No visits yet.", selectClient: "Select a patient", genericSelectClient: "Select a client", selectText: "Select someone from the list to open the full record.",
    editClient: "Edit client", editPatient: "Edit patient", name: "Full name", namePlaceholder: "e.g. Mary Smith", phone: "Phone", email: "Email", group: "Group", groupPlaceholder: "e.g. VIP, corporate", select: "Select", emergencyName: "Emergency contact name", emergencyPhone: "Emergency contact phone", nameShort: "Name", vipClient: "VIP client", vipPatient: "VIP patient", blacklist: "Block list", reason: "Block reason", reasonPlaceholder: "Enter the reason…", allergiesPlaceholder: "e.g. latex, penicillin…", historyPlaceholder: "Information to consider during visits…", note: "General note", profileNotePlaceholder: "Preferences or other important information…", close: "Close", save: "Save", create: "Create",
    statusLost: "Lost", statusReturning: "Returning", statusUpcoming: "Upcoming", statusBlacklist: "Blocked",
  },
} satisfies Record<Locale, Record<string, string>>;

function localeCode(locale: Locale) {
  return locale === "hy" ? "hy-AM" : locale === "ru" ? "ru-RU" : "en-US";
}

function formatDateTime(value: string | null | undefined, locale: Locale) {
  if (!value) return "—";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(localeCode(locale), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatMoney(value: number | null | undefined, locale: Locale) {
  try {
    return new Intl.NumberFormat(localeCode(locale)).format(Number(value || 0));
  } catch {
    return String(value || 0);
  }
}


function deliveryTone(status?: string | null) {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700";
    case "queued":
      return "bg-amber-50 text-amber-700";
    case "skipped":
      return "bg-slate-100 text-slate-600";
    case "failed":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-sky-50 text-sky-700";
  }
}



function SummaryCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Contact }) {
  return (
    <Card className="h-full min-h-[150px] rounded-[22px] border border-slate-200 bg-white/95 p-4 shadow-sm sm:min-h-[156px] sm:p-5">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex min-h-[48px] items-start justify-between gap-2">
          <div className="max-w-[calc(100%-48px)] text-[13px] font-medium leading-5 text-slate-500 sm:text-sm">{label}</div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 text-violet-600 sm:h-11 sm:w-11 sm:rounded-2xl">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-[28px] font-semibold leading-none tracking-tight text-slate-950 sm:text-3xl">{value}</div>
      </div>
    </Card>
  );
}

type FormState = {
  name: string;
  phone: string;
  email: string;
  notes: string;
  birth_date: string;
  group_name: string;
  is_vip: boolean;
  is_blacklisted: boolean;
  blacklist_reason: string;
  blood_type: string;
  allergies: string;
  medical_history: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  notes: "",
  birth_date: "",
  group_name: "",
  is_vip: false,
  is_blacklisted: false,
  blacklist_reason: "",
  blood_type: "",
  allergies: "",
  medical_history: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
};

function StatusPill({ client, text }: { client: ClientRow; text: Record<string, string> }) {
  if (client.is_blacklisted) return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">{text.statusBlacklist}</span>;
  if (client.is_vip) return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">VIP</span>;
  if (client.status_segment === "lost") return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{text.statusLost}</span>;
  if (client.status_segment === "returning") return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{text.statusReturning}</span>;
  if (client.status_segment === "new") return <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">{text.statusNew}</span>;
  if (client.status_segment === "upcoming") return <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">{text.statusUpcoming}</span>;
  return null;
}

export default function Clients() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { locale } = useLanguage();
  const text = clientsCopy[locale];
  const vertical = String(user?.vertical ?? user?.business_type ?? "").toLowerCase();
  const isHealthcare = ["healthcare", "dental", "clinic", "medical", "doctor", "health"].includes(vertical);
  const canManage = user?.role === "owner" || user?.role === "manager";

  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [segment, setSegment] = useState("");
  const [status, setStatus] = useState("");
  const [group, setGroup] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [noteBody, setNoteBody] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [notePinned, setNotePinned] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [reminderChannel, setReminderChannel] = useState("internal");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderLeadMinutes, setReminderLeadMinutes] = useState(60);
  const [reminderNotifyVia, setReminderNotifyVia] = useState<string[]>(["internal"]);

  const clientsQ = useQuery({
    queryKey: ["clients", search, pageNumber, segment, status, group],
    queryFn: () => fetchClients({ search: search || undefined, page: pageNumber, per_page: 20, segment: segment || undefined, status: status || undefined, group: group || undefined }),
  });

  const clients = useMemo(() => clientsQ.data?.data ?? [], [clientsQ.data?.data]);
  const selectedClient = selectedClientId ?? clients[0]?.id ?? null;

  const clientQ = useQuery({
    queryKey: ["client", selectedClient],
    queryFn: () => fetchClient(selectedClient as number),
    enabled: !!selectedClient,
  });

  const clientBookingsQ = useQuery({
    queryKey: ["client", selectedClient, "bookings"],
    queryFn: () => fetchClientBookings(selectedClient as number, { per_page: 12 }),
    enabled: !!selectedClient,
  });

  const createMut = useMutation({
    mutationFn: (payload: ClientFormPayload) => createClient(payload),
    onSuccess: async (created) => {
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setSelectedClientId(created.id);
      await qc.invalidateQueries({ queryKey: ["clients"] });
      await qc.invalidateQueries({ queryKey: ["client"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ClientFormPayload> }) => updateClient(id, payload),
    onSuccess: async (updated) => {
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setSelectedClientId(updated.id);
      await qc.invalidateQueries({ queryKey: ["clients"] });
      await qc.invalidateQueries({ queryKey: ["client"] });
    },
  });

  const createNoteMut = useMutation({
    mutationFn: ({ clientId, body, note_type, is_pinned }: { clientId: number; body: string; note_type?: string; is_pinned?: boolean }) =>
      createClientNote(clientId, { body, note_type, is_pinned }),
    onSuccess: async () => {
      setNoteBody("");
      setNoteType("general");
      setNotePinned(false);
      await qc.invalidateQueries({ queryKey: ["client", selectedClient] });
    },
  });

  const deleteNoteMut = useMutation({
    mutationFn: ({ clientId, noteId }: { clientId: number; noteId: number }) => deleteClientNote(clientId, noteId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client", selectedClient] });
    },
  });

  const createReminderMut = useMutation({
    mutationFn: ({ clientId, title, note, remind_at, channel, is_enabled, lead_minutes, notify_via }: { clientId: number; title: string; note?: string | null; remind_at: string; channel?: string; is_enabled?: boolean; lead_minutes?: number; notify_via?: string[] }) =>
      createClientReminder(clientId, { title, note, remind_at, channel, is_enabled, lead_minutes, notify_via }),
    onSuccess: async () => {
      setReminderTitle("");
      setReminderNote("");
      setReminderAt("");
      setReminderChannel("internal");
      setReminderEnabled(true);
      setReminderLeadMinutes(60);
      setReminderNotifyVia(["internal"]);
      await qc.invalidateQueries({ queryKey: ["client", selectedClient] });
    },
  });

  const updateReminderMut = useMutation({
    mutationFn: ({ clientId, reminderId, status, is_enabled, lead_minutes, notify_via }: { clientId: number; reminderId: number; status?: string; is_enabled?: boolean; lead_minutes?: number; notify_via?: string[] }) => updateClientReminder(clientId, reminderId, { status, is_enabled, lead_minutes, notify_via }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client", selectedClient] });
    },
  });

  const deleteReminderMut = useMutation({
    mutationFn: ({ clientId, reminderId }: { clientId: number; reminderId: number }) => deleteClientReminder(clientId, reminderId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client", selectedClient] });
    },
  });
  const dispatchReminderMut = useMutation({
    mutationFn: ({ clientId, reminderId }: { clientId: number; reminderId: number }) => dispatchClientReminder(clientId, reminderId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client", selectedClient] });
    },
  });


  const summary = useMemo(() => {
    const totalClients = clientsQ.data?.total ?? 0;
    const visibleSpent = clients.reduce((sum, row) => sum + Number(row.total_spent ?? 0), 0);
    const visibleVisits = clients.reduce((sum, row) => sum + Number(row.bookings_count ?? 0), 0);
    const upcoming = clients.filter((row) => !!row.next_booking_at).length;
    return {
      totalClients,
      visibleSpent,
      visibleVisits,
      upcoming,
      vip: clientsQ.data?.meta?.vip_count ?? 0,
      blacklisted: clientsQ.data?.meta?.blacklisted_count ?? 0,
    };
  }, [clientsQ.data, clients]);

  const groupCounts = clientsQ.data?.meta?.group_counts ?? [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(client: ClientDetails | ClientRow) {
    setEditing(client);
    setForm({
      name: client.name ?? "",
      phone: client.phone ?? "",
      email: client.email ?? "",
      notes: client.notes ?? "",
      birth_date: client.birth_date ?? "",
      group_name: client.group_name ?? "",
      is_vip: !!client.is_vip,
      is_blacklisted: !!client.is_blacklisted,
      blacklist_reason: client.blacklist_reason ?? "",
      blood_type: client.blood_type ?? "",
      allergies: client.allergies ?? "",
      medical_history: client.medical_history ?? "",
      emergency_contact_name: client.emergency_contact_name ?? "",
      emergency_contact_phone: client.emergency_contact_phone ?? "",
    });
    setOpen(true);
  }

  function submit() {
    if (!form.name.trim()) return;
    const payload: ClientFormPayload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
      birth_date: form.birth_date || null,
      group_name: form.group_name.trim() || null,
      is_vip: form.is_vip,
      is_blacklisted: form.is_blacklisted,
      blacklist_reason: form.is_blacklisted ? form.blacklist_reason.trim() || null : null,
      blood_type: form.blood_type || null,
      allergies: form.allergies.trim() || null,
      medical_history: form.medical_history.trim() || null,
      emergency_contact_name: form.emergency_contact_name.trim() || null,
      emergency_contact_phone: form.emergency_contact_phone.trim() || null,
    };

    if (editing) {
      updateMut.mutate({ id: editing.id, payload });
      return;
    }

    createMut.mutate(payload);
  }

  function clearFilters() {
    setSegment("");
    setStatus("");
    setGroup("");
    setPageNumber(1);
  }

  function submitClientNote() {
    if (!selectedClient || !noteBody.trim()) return;
    createNoteMut.mutate({ clientId: selectedClient, body: noteBody.trim(), note_type: noteType, is_pinned: notePinned });
  }

  function submitClientReminder() {
    if (!selectedClient || !reminderTitle.trim() || !reminderAt) return;
    createReminderMut.mutate({
      clientId: selectedClient,
      title: reminderTitle.trim(),
      note: reminderNote.trim() || null,
      remind_at: reminderAt.replace("T", " "),
      channel: reminderChannel,
      is_enabled: reminderEnabled,
      lead_minutes: reminderLeadMinutes,
      notify_via: reminderNotifyVia,
    });
  }

  function toggleReminderNotifyVia(channel: string) {
    setReminderNotifyVia((prev: string[]) => {
      const next = prev.includes(channel) ? prev.filter((item: string) => item !== channel) : [...prev, channel];
      return next.length ? next : ["internal"];
    });
  }

  return (
    <motion.div {...page} className="admin-page space-y-4">
      <PageHero
        eyebrow={isHealthcare ? text.badge : text.genericBadge}
        title={isHealthcare ? text.title : text.genericTitle}
        description={isHealthcare ? text.intro : text.genericIntro}
        actions={canManage ? <Button size="lg" onClick={openCreate}><Plus className="h-4 w-4" /> {isHealthcare ? text.newPatient : text.newClient}</Button> : undefined}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label={isHealthcare ? text.totalPatients : text.totalClients} value={String(summary.totalClients)} icon={Contact} />
        <SummaryCard label={text.visits} value={String(summary.visibleVisits)} icon={UserRound} />
        <SummaryCard label={text.revenue} value={`${formatMoney(summary.visibleSpent, locale)} ${text.amd}`} icon={WalletCards} />
        <SummaryCard label={text.upcomingPeople} value={String(summary.upcoming)} icon={CalendarClock} />
        <SummaryCard label="VIP" value={String(summary.vip)} icon={Star} />
        <SummaryCard label={text.blocked} value={String(summary.blacklisted)} icon={ShieldBan} />
      </div>

      <Card className="rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-950">{text.filters}</div>
            <div className="text-sm text-slate-500">{text.filtersText}</div>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPageNumber(1); }} className="pl-11" placeholder={text.search} />
          </div>
        </div>

        <div className="mt-3 grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <select value={segment} onChange={(e) => { setSegment(e.target.value); setPageNumber(1); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <option value="">{text.allSegments}</option>
            <option value="vip">VIP</option>
            <option value="blacklist">Blacklist</option>
            <option value="grouped">{text.grouped}</option>
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPageNumber(1); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <option value="">{text.allStatuses}</option>
            <option value="new">{text.statusNew}</option>
            <option value="returning">{text.returning}</option>
            <option value="lost">{text.lost}</option>
            <option value="upcoming">{text.upcoming}</option>
          </select>
          <select value={group} onChange={(e) => { setGroup(e.target.value); setPageNumber(1); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <option value="">{text.allGroups}</option>
            {groupCounts.map((row) => <option key={row.group_name} value={row.group_name}>{row.group_name} ({row.total})</option>)}
          </select>
          <Button variant="secondary" onClick={clearFilters}>{text.clear}</Button>
        </div>

        {groupCounts.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {groupCounts.slice(0, 8).map((row) => (
              <button key={row.group_name} type="button" onClick={() => { setGroup(row.group_name); setPageNumber(1); }} className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition", group === row.group_name ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{row.group_name} · {row.total}</button>
            ))}
          </div>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
          <Card className="rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-sm sm:p-6">
            <div>
              <div className="text-lg font-semibold text-slate-950">{isHealthcare ? text.list : text.genericList}</div>
              <div className="text-sm text-slate-500">{isHealthcare ? text.listText : text.genericListText}</div>
            </div>

            <div className="mt-5 space-y-3">
              {clientsQ.isLoading ? (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500"><Spinner size={16} /> {text.loading}</div>
              ) : clients.length === 0 ? (
                <EmptyState icon={Contact} title={isHealthcare ? text.empty : text.genericEmpty} description={text.emptyText} />
              ) : clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClientId(client.id)}
                  className={cn(
                    "w-full rounded-[26px] border p-4 text-left transition",
                    selectedClient === client.id ? "border-violet-200 bg-violet-50/70 shadow-sm" : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-slate-950">{client.name}</div>
                        <StatusPill client={client} text={text} />
                        {client.group_name ? <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">{client.group_name}</span> : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {client.phone || "—"}</span>
                        {client.email ? <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {client.email}</span> : null}
                      </div>
                    </div>
                    <div className="grid gap-1 text-left text-xs text-slate-500 sm:min-w-[140px] sm:text-right">
                      <div>{client.bookings_count ?? 0} {text.visit}</div>
                      <div>{formatMoney(client.total_spent, locale)} {text.amd}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <div>{text.lastVisit}՝ <span className="font-medium text-slate-700">{formatDateTime(client.last_booking_at, locale)}</span></div>
                    <div>{text.nextVisit}՝ <span className="font-medium text-slate-700">{formatDateTime(client.next_booking_at, locale)}</span></div>
                  </div>
                </button>
              ))}
            </div>

            {(clientsQ.data?.last_page ?? 1) > 1 ? (
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
                <div>{text.page} {clientsQ.data?.current_page} / {clientsQ.data?.last_page}</div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled={(clientsQ.data?.current_page ?? 1) <= 1} onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>{text.previous}</Button>
                  <Button variant="secondary" size="sm" disabled={(clientsQ.data?.current_page ?? 1) >= (clientsQ.data?.last_page ?? 1)} onClick={() => setPageNumber((p) => p + 1)}>{text.next}</Button>
                </div>
              </div>
            ) : null}
          </Card>
        </motion.div>

        <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
          <Card className="rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-sm sm:p-6">
            {clientQ.isLoading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500"><Spinner size={16} /> {text.loading}</div>
            ) : clientQ.data ? (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{isHealthcare ? text.profile : text.genericProfile}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="text-2xl font-semibold tracking-tight text-slate-950">{clientQ.data.name}</div>
                      <StatusPill client={clientQ.data} text={text} />
                      {clientQ.data.group_name ? <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">{clientQ.data.group_name}</span> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {clientQ.data.phone || "—"}</span>
                      {clientQ.data.email ? <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {clientQ.data.email}</span> : null}
                    </div>
                  </div>
                  {canManage ? <Button variant="secondary" onClick={() => openEdit(clientQ.data)}>{text.edit}</Button> : null}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">{text.totalVisits}</div>
                    <div className="mt-1 text-xl font-semibold text-slate-950">{clientQ.data.bookings_count ?? 0}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">{text.totalSpent}</div>
                    <div className="mt-1 text-xl font-semibold text-slate-950">{formatMoney(clientQ.data.total_spent, locale)} {text.amd}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">{text.avgTicket}</div>
                    <div className="mt-1 text-xl font-semibold text-slate-950">{formatMoney(clientQ.data.crm?.avg_ticket, locale)} {text.amd}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">{text.favoriteService}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{clientQ.data.crm?.favorite_service_name || "—"}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">{isHealthcare ? text.favoriteDoctor : text.favoriteStaff}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{clientQ.data.crm?.favorite_staff_name || "—"}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">{text.source}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{clientQ.data.crm?.favorite_source || "—"}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">{text.account}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{clientQ.data.crm?.linked_account ? text.linked : text.notLinked}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-emerald-700">{text.completed}</div>
                    <div className="mt-1 text-xl font-semibold text-emerald-900">{clientQ.data.crm?.completed_count ?? 0}</div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-amber-700">{text.cancellations}</div>
                    <div className="mt-1 text-xl font-semibold text-amber-900">{clientQ.data.crm?.cancelled_count ?? 0}</div>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-rose-700">{text.noShow}</div>
                    <div className="mt-1 text-xl font-semibold text-rose-900">{clientQ.data.crm?.no_show_count ?? 0}</div>
                  </div>
                </div>

                {(clientQ.data.blacklist_reason || clientQ.data.notes) ? (
                  <div className="mt-4 grid gap-4 2xl:grid-cols-2">
                    {clientQ.data.blacklist_reason ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <div className="font-semibold">{text.blockReason}</div>
                        <div className="mt-1">{clientQ.data.blacklist_reason}</div>
                      </div>
                    ) : null}
                    {clientQ.data.notes ? (
                      <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">{clientQ.data.notes}</div>
                    ) : null}
                  </div>
                ) : null}

                {(clientQ.data.birth_date || clientQ.data.blood_type || clientQ.data.allergies || clientQ.data.medical_history || clientQ.data.emergency_contact_name || clientQ.data.emergency_contact_phone) ? (
                  <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-semibold text-slate-950">{text.medicalCard}</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="text-slate-400">{text.birthDate}</span><div className="mt-1 font-semibold text-slate-900">{clientQ.data.birth_date || "—"}</div></div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="text-slate-400">{text.bloodType}</span><div className="mt-1 font-semibold text-slate-900">{clientQ.data.blood_type || "—"}</div></div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="text-slate-400">{text.allergies}</span><div className="mt-1 font-semibold text-slate-900">{clientQ.data.allergies || "—"}</div></div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="text-slate-400">{text.emergency}</span><div className="mt-1 font-semibold text-slate-900">{clientQ.data.emergency_contact_name || "—"} {clientQ.data.emergency_contact_phone ? `· ${clientQ.data.emergency_contact_phone}` : ""}</div></div>
                    </div>
                    {clientQ.data.medical_history ? <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"><div className="text-slate-400">{text.medicalHistory}</div><div className="mt-1 font-medium text-slate-900">{clientQ.data.medical_history}</div></div> : null}
                  </div>
                ) : null}

                <div className="mt-6 grid gap-4 2xl:grid-cols-2">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><NotebookPen className="h-4 w-4 text-violet-600" /> {text.notes}</div>
                    {canManage ? (
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto]">
                          <select value={noteType} onChange={(e) => setNoteType(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                            <option value="general">{text.general}</option>
                            <option value="visit">{text.visitNote}</option>
                            <option value="medical">{text.medical}</option>
                          </select>
                          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"><input type="checkbox" checked={notePinned} onChange={(e) => setNotePinned(e.target.checked)} /> <Pin className="h-4 w-4 text-amber-500" /> {text.pin}</label>
                          <Button onClick={submitClientNote} loading={createNoteMut.isPending}>{text.add}</Button>
                        </div>
                        <textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder={text.notePlaceholder} />
                      </div>
                    ) : null}
                    <div className="mt-4 space-y-3">
                      {(clientQ.data.recent_notes ?? []).length ? (clientQ.data.recent_notes ?? []).map((note) => (
                        <div key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                {note.is_pinned ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">{text.pinned}</span> : null}
                                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">{note.note_type || 'general'}</span>
                                <span className="text-xs text-slate-400">{formatDateTime(note.created_at, locale)}</span>
                              </div>
                              <div className="mt-2 text-sm leading-6 text-slate-700">{note.body}</div>
                              {note.author_name ? <div className="mt-1 text-xs text-slate-400">{note.author_name}</div> : null}
                            </div>
                            {canManage ? <button type="button" onClick={() => selectedClient && deleteNoteMut.mutate({ clientId: selectedClient, noteId: note.id })} className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-rose-200 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button> : null}
                          </div>
                        </div>
                      )) : <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">{text.noNotes}</div>}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><BellRing className="h-4 w-4 text-sky-600" /> {text.reminders}</div>
                    {canManage ? (
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} placeholder={text.reminderPlaceholder} />
                          <input type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
                          <select value={reminderChannel} onChange={(e) => setReminderChannel(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                            <option value="internal">{text.internal}</option>
                            <option value="sms">SMS</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                          </select>
                          <select value={String(reminderLeadMinutes)} onChange={(e) => setReminderLeadMinutes(Number(e.target.value) || 0)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                            <option value="0">{text.atTime}</option>
                            <option value="15">{text.min15}</option>
                            <option value="30">{text.min30}</option>
                            <option value="60">{text.hour1}</option>
                            <option value="180">{text.hour3}</option>
                            <option value="1440">{text.day1}</option>
                          </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { key: "internal", label: text.inApp },
                            { key: "sms", label: "SMS" },
                            { key: "whatsapp", label: "WhatsApp" },
                            { key: "email", label: "Email" },
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => toggleReminderNotifyVia(item.key)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                                reminderNotifyVia.includes(item.key)
                                  ? "border-violet-300 bg-violet-50 text-violet-700"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                          <label className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                            <input type="checkbox" checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} />
                            {text.activeReminder}
                          </label>
                        </div>
                        <textarea value={reminderNote} onChange={(e) => setReminderNote(e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder={text.details} />
                        <Button onClick={submitClientReminder} loading={createReminderMut.isPending}>{text.createReminder}</Button>
                      </div>
                    ) : null}
                    <div className="mt-4 space-y-3">
                      {(clientQ.data.reminders ?? []).length ? (clientQ.data.reminders ?? []).map((reminder) => (
                        <div key={reminder.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-slate-900">{reminder.title}</div>
                              <div className="mt-1 text-xs text-slate-500">{formatDateTime(reminder.remind_at, locale)} · {reminder.channel || text.internal}</div>
                              {reminder.note ? <div className="mt-2 text-sm leading-6 text-slate-700">{reminder.note}</div> : null}
                              <div className="mt-3 flex flex-wrap gap-2">
                                {(reminder.notify_via ?? []).map((channel) => (
                                  <span key={channel} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">{channel}</span>
                                ))}
                                {reminder.lead_minutes ? <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">{reminder.lead_minutes} {text.minBefore}</span> : null}
                                {reminder.is_enabled === false ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{text.disabled}</span> : null}
                              </div>
                              {(reminder.deliveries ?? []).length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {(reminder.deliveries ?? []).map((delivery) => (
                                    <span key={delivery.id} className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", deliveryTone(delivery.status))}>
                                      {delivery.channel}: {delivery.status}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", reminder.status === 'done' ? 'bg-emerald-50 text-emerald-700' : reminder.status === 'canceled' ? 'bg-rose-50 text-rose-700' : reminder.status === 'queued' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700')}>{reminder.status || 'pending'}</span>
                              {canManage && reminder.status !== 'done' ? <Button variant="secondary" size="sm" onClick={() => selectedClient && updateReminderMut.mutate({ clientId: selectedClient, reminderId: reminder.id, status: 'done' })}>{text.markDone}</Button> : null}
                              {canManage ? <Button variant="secondary" size="sm" loading={dispatchReminderMut.isPending} onClick={() => selectedClient && dispatchReminderMut.mutate({ clientId: selectedClient, reminderId: reminder.id })}>{text.sendNow}</Button> : null}
                              {canManage ? <button type="button" onClick={() => selectedClient && deleteReminderMut.mutate({ clientId: selectedClient, reminderId: reminder.id })} className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-rose-200 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button> : null}
                            </div>
                          </div>
                        </div>
                      )) : <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">{text.noReminders}</div>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><History className="h-4 w-4 text-slate-700" /> {text.timeline}</div>
                  <div className="mt-4 space-y-3">
                    {(clientQ.data.timeline ?? []).length ? (clientQ.data.timeline ?? []).map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">{item.type}</span>
                              {item.status ? <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">{item.status}</span> : null}
                            </div>
                            <div className="mt-2 font-medium text-slate-900">{item.title}</div>
                            {item.subtitle ? <div className="mt-1 text-xs text-slate-500">{item.subtitle}</div> : null}
                            {item.body ? <div className="mt-2 text-sm leading-6 text-slate-700">{item.body}</div> : null}
                          </div>
                          <div className="text-xs text-slate-400">{formatDateTime(item.occurred_at, locale)}</div>
                        </div>
                      </div>
                    )) : <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">{text.emptyTimeline}</div>}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold text-slate-950">{text.recentBookings}</div>
                  <div className="mt-3 space-y-3">
                    {(clientBookingsQ.data?.data ?? []).length ? (clientBookingsQ.data?.data ?? []).map((booking) => (
                      <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-slate-900">{booking.service_name ?? booking.service?.name ?? `${text.service} #${booking.service_id}`}</div>
                            <div className="mt-1 text-xs text-slate-500">{formatDateTime(booking.starts_at, locale)} · {booking.staff_name ?? booking.staff?.name ?? "—"}</div>
                          </div>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{booking.status}</span>
                        </div>
                      </div>
                    )) : <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">{text.noBookings}</div>}
                  </div>
                </div>
              </>
            ) : (
              <EmptyState icon={Contact} title={isHealthcare ? text.selectClient : text.genericSelectClient} description={text.selectText} />
            )}
          </Card>
        </motion.div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? (isHealthcare ? text.editPatient : text.editClient) : (isHealthcare ? text.newPatient : text.newClient)}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              {text.name}
              <Input className="mt-1" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder={text.namePlaceholder} />
            </label>
            <label className="text-sm text-slate-600">
              {text.phone}
              <Input className="mt-1" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+374..." />
            </label>
            <label className="text-sm text-slate-600">
              {text.email}
              <Input className="mt-1" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="name@example.com" />
            </label>
            <label className="text-sm text-slate-600">
              {text.group}
              <Input className="mt-1" value={form.group_name} onChange={(e) => setForm((p) => ({ ...p, group_name: e.target.value }))} placeholder={text.groupPlaceholder} />
            </label>
            <label className="text-sm text-slate-600">
              {text.birthDate}
              <Input className="mt-1" type="date" value={form.birth_date} onChange={(e) => setForm((p) => ({ ...p, birth_date: e.target.value }))} />
            </label>
            <label className="text-sm text-slate-600">
              {text.bloodType}
              <select value={form.blood_type} onChange={(e) => setForm((p) => ({ ...p, blood_type: e.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <option value="">{text.select}</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              {text.emergencyName}
              <Input className="mt-1" value={form.emergency_contact_name} onChange={(e) => setForm((p) => ({ ...p, emergency_contact_name: e.target.value }))} placeholder={text.nameShort} />
            </label>
            <label className="text-sm text-slate-600">
              {text.emergencyPhone}
              <Input className="mt-1" value={form.emergency_contact_phone} onChange={(e) => setForm((p) => ({ ...p, emergency_contact_phone: e.target.value }))} placeholder="+374..." />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={form.is_vip} onChange={(e) => setForm((p) => ({ ...p, is_vip: e.target.checked }))} />
              <Star className="h-4 w-4 text-amber-500" /> {isHealthcare ? text.vipPatient : text.vipClient}
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={form.is_blacklisted} onChange={(e) => setForm((p) => ({ ...p, is_blacklisted: e.target.checked }))} />
              <AlertTriangle className="h-4 w-4 text-rose-500" /> {text.blacklist}
            </label>
          </div>

          {form.is_blacklisted ? (
            <label className="block text-sm text-slate-600">
              {text.reason}
              <textarea value={form.blacklist_reason} onChange={(e) => setForm((p) => ({ ...p, blacklist_reason: e.target.value }))} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-violet-300" placeholder={text.reasonPlaceholder} />
            </label>
          ) : null}

          <label className="block text-sm text-slate-600">
            {text.allergies}
            <textarea value={form.allergies} onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-violet-300" placeholder={text.allergiesPlaceholder} />
          </label>
          <label className="block text-sm text-slate-600">
            {text.medicalHistory}
            <textarea value={form.medical_history} onChange={(e) => setForm((p) => ({ ...p, medical_history: e.target.value }))} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-violet-300" placeholder={text.historyPlaceholder} />
          </label>
          <label className="block text-sm text-slate-600">
            {text.note}
            <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={4} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-violet-300" placeholder={text.profileNotePlaceholder} />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>{text.close}</Button>
            <Button loading={createMut.isPending || updateMut.isPending} onClick={submit}>{editing ? text.save : text.create}</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
