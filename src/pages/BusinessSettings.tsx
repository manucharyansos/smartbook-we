/* eslint-disable react-hooks/set-state-in-effect -- Query results intentionally hydrate the editable settings and schedule drafts. */
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
  Send,
  Unplug,
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
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import {
  createTelegramConnectionLink,
  disconnectTelegram,
  fetchTelegramConnection,
} from "../lib/telegramApi";

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

type MapCoordinates = {
  latitude: number | null;
  longitude: number | null;
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

const settingsCopy = {
  hy: {
    saved: "Պահպանվեց", saveFailed: "Չհաջողվեց պահպանել", locationUpdated: "Հասցեն թարմացվեց", locationAdded: "Հասցեն ավելացվեց", locationSaveFailed: "Չհաջողվեց պահպանել հասցեն", locationDeleted: "Հասցեն ջնջվեց", locationDeleteFailed: "Չհաջողվեց ջնջել հասցեն", mapSaved: "Քարտեզի դիրքը պահպանվեց", mapSaveFailed: "Չհաջողվեց պահպանել քարտեզի դիրքը", copyFailed: "Չհաջողվեց պատճենել հղումը", scheduleSaved: "Գրաֆիկը պահպանվեց", scheduleSaveFailed: "Չհաջողվեց պահպանել գրաֆիկը",
    badge: "Բիզնեսի կարգավորումներ", medicalBadge: "Կլինիկայի կարգավորումներ", title: "Կարգավորումներ", intro: "Կառավարեք տվյալները, աշխատանքային ժամերը, հանրային ամրագրման հղումը և շաբաթական գրաֆիկը։", medicalIntro: "Կառավարեք կլինիկայի տվյալները, մասնաճյուղերը, Yandex քարտեզը, ընդունելության ժամերը և հանրային էջը։", copied: "Պատճենված է", copy: "Պատճենել", markOnMap: "Նշել քարտեզում", save: "Պահպանել",
    branding: "Հանրային էջ և բրենդինգ", brandingText: "Կառավարեք լոգոն, շապիկը, հանրային էջի նկարագրությունն ու որոնման տեսանելիությունը։", shortDescription: "Կարճ նկարագրություն", fullDescription: "Լրիվ նկարագրություն", profileEnabled: "Հանրային էջը ակտիվ է", marketplaceVisible: "Ցուցադրել գլխավոր էջում", showLogo: "Ցուցադրել լոգոն", showCover: "Ցուցադրել շապիկը", showStaff: "Ցուցադրել թիմը", showDoctors: "Ցուցադրել բժիշկներին", showServices: "Ցուցադրել ծառայությունները",
    social: "Սոցիալական հղումներ", socialText: "Հղումները կերևան հանրային էջում և կօգնեն գրանցումների աղբյուրները հասկանալ։", instagram: "Instagram հղում", facebook: "Facebook հղում", whatsapp: "WhatsApp համար", messenger: "Messenger հղում", telegramTitle: "Telegram ծանուցումներ", telegramText: "Միացրեք Vizit բոտը՝ նոր, տեղափոխված և չեղարկված ամրագրումները Telegram-ում ստանալու համար։", telegramConnect: "Միացնել բոտը", telegramConnected: "Միացված է", telegramDisconnect: "Անջատել", telegramConnecting: "Բացում ենք…", telegramUnavailable: "Telegram բոտը դեռ կարգավորված չէ սերվերում։", telegramConnectError: "Չհաջողվեց ստեղծել Telegram-ի միացման հղումը", telegramDisconnectError: "Չհաջողվեց անջատել Telegram-ը", logo: "Լոգո", uploadLogo: "Վերբեռնել լոգոն", logoHint: "Լավագույն արդյունքի համար օգտագործեք քառակուսի նկար։", cover: "Շապիկ", coverPreview: "Շապիկի նախադիտում", uploadCover: "Վերբեռնել շապիկը", businessDefault: "Ձեր բիզնեսը", previewDefault: "Հանրային էջի նախադիտումը կերևա այստեղ։", publicPage: "Հանրային էջ", marketplace: "Գլխավոր ցուցակ", ready: "Պատրաստ է", hidden: "Թաքցված է", visible: "Տեսանելի է", notVisible: "Չի ցուցադրվում",
    billingBadge: "Սեփականատիրոջ վճարումների կենտրոն", billingTitle: "Պլան և վճարումներ", billingText: "Պլանները, բաժանորդագրությունը, հաշիվներն ու բանկային վճարումները կառավարվում են առանձին, միայն սեփականատիրոջ համար հասանելի էջում։", openBilling: "Բացել պլանը և վճարումները", quickNote: "ԱՐԱԳ ՀԻՇԵՑՈՒՄ", ownerOnly: "Միայն սեփականատիրոջ համար", ownerOnlyText: "Վճարումների բաժինը հասանելի չէ կառավարիչներին և աշխատակիցներին։", hosted: "Անվտանգ բանկային վճարում", hostedText: "Վճարումը կատարվում է բանկի էջում, ապա օգտատերը վերադառնում է Vizit.am։", annual: "Տարեկան պլան", annualText: "Տարեկան պլանի 2 ամիս անվճար տարբերակը ցուցադրվում է վճարումների էջում։",
    settingsLoadFailed: "Չհաջողվեց բեռնել բիզնեսի կարգավորումները", scheduleLoadFailed: "Չհաջողվեց բեռնել գրաֆիկը", loading: "Բեռնում ենք…", general: "Ընդհանուր", editable: "Կարող եք խմբագրել", readOnly: "Միայն դիտում", phone: "Հեռախոս", phonePlaceholder: "օր․ 077 12 34 56", bookingStep: "Ամրագրման քայլ", bookingStepHint: "15 րոպե քայլով ժամերը կլինեն 09:00, 09:15, 09:30։ Սա ծառայության տևողությունը չէ։", minutes: "րոպե", primaryAddress: "Գլխավոր հասցե", addressPlaceholder: "օր․ Երևան, Աբովյան 10",
    branches: "Մասնաճյուղեր և հասցեներ", branchesText: "Կարող եք ավելացնել մինչև {limit} հասցե։ Գլխավոր հասցեն ցուցադրվում է հանրային էջում։", addAddress: "Ավելացնել հասցե", address: "Հասցե", primary: "Գլխավոր", mapSet: "Քարտեզում նշված է", mapMissing: "Քարտեզի դիրքը նշված չէ", mapTitle: "Բիզնեսի տեղը Yandex քարտեզում", mapText: "Տեղադրեք նշիչը հենց մուտքի վրա և պահպանեք դիրքը։", selectedAddress: "Ընտրված հասցե", noAddress: "Հասցե նշված չէ", savePosition: "Պահպանել դիրքը", editAddress: "Խմբագրել հասցեն", newAddress: "Նոր հասցե", locationNamePlaceholder: "Անվանում (օր․ Կենտրոն)", fullAddress: "Լրիվ հասցե", makePrimary: "Սարքել գլխավոր հասցե", updateAddress: "Թարմացնել հասցեն", saveAddress: "Պահպանել հասցեն", cancel: "Չեղարկել", addAnother: "Ավելացնել ևս մեկ հասցե",
    timezone: "Ժամային գոտի", timezoneHint: "Հայաստանի համար՝ Asia/Yerevan", armenia: "Հայաստան", workStart: "Աշխատանքի սկիզբ", workEnd: "Աշխատանքի ավարտ", publicBookingLink: "Հանրային ամրագրման հղում", weeklySchedule: "Շաբաթական գրաֆիկ", breakOptional: "Ընդմիջումն ընտրովի է", open: "Բաց է", start: "Սկիզբ", end: "Ավարտ", break: "Ընդմիջում (ընտրովի)", removeBreak: "Հեռացնել ընդմիջումը", saveScheduleOnly: "Պահպանել միայն գրաֆիկը",
  },
  ru: {
    saved: "Сохранено", saveFailed: "Не удалось сохранить", locationUpdated: "Адрес обновлен", locationAdded: "Адрес добавлен", locationSaveFailed: "Не удалось сохранить адрес", locationDeleted: "Адрес удален", locationDeleteFailed: "Не удалось удалить адрес", mapSaved: "Положение на карте сохранено", mapSaveFailed: "Не удалось сохранить положение на карте", copyFailed: "Не удалось скопировать ссылку", scheduleSaved: "Расписание сохранено", scheduleSaveFailed: "Не удалось сохранить расписание",
    badge: "Настройки бизнеса", medicalBadge: "Настройки клиники", title: "Настройки", intro: "Управляйте данными, рабочими часами, публичной ссылкой записи и недельным расписанием.", medicalIntro: "Управляйте данными клиники, филиалами, картой Yandex, часами приема и публичной страницей.", copied: "Скопировано", copy: "Копировать", markOnMap: "Отметить на карте", save: "Сохранить",
    branding: "Публичная страница и бренд", brandingText: "Управляйте логотипом, обложкой, описанием и видимостью в поиске.", shortDescription: "Краткое описание", fullDescription: "Полное описание", profileEnabled: "Публичная страница активна", marketplaceVisible: "Показывать на главной", showLogo: "Показывать логотип", showCover: "Показывать обложку", showStaff: "Показывать команду", showDoctors: "Показывать врачей", showServices: "Показывать услуги",
    social: "Социальные ссылки", socialText: "Ссылки появятся на публичной странице и помогут отслеживать источники записей.", instagram: "Ссылка Instagram", facebook: "Ссылка Facebook", whatsapp: "Номер WhatsApp", messenger: "Ссылка Messenger", telegramTitle: "Уведомления Telegram", telegramText: "Подключите бота Vizit, чтобы получать новые, перенесённые и отменённые записи в Telegram.", telegramConnect: "Подключить бота", telegramConnected: "Подключено", telegramDisconnect: "Отключить", telegramConnecting: "Открываем…", telegramUnavailable: "Telegram-бот ещё не настроен на сервере.", telegramConnectError: "Не удалось создать ссылку подключения Telegram", telegramDisconnectError: "Не удалось отключить Telegram", logo: "Логотип", uploadLogo: "Загрузить логотип", logoHint: "Для лучшего результата используйте квадратное изображение.", cover: "Обложка", coverPreview: "Предпросмотр обложки", uploadCover: "Загрузить обложку", businessDefault: "Ваш бизнес", previewDefault: "Здесь появится предпросмотр публичной страницы.", publicPage: "Публичная страница", marketplace: "Главный каталог", ready: "Готова", hidden: "Скрыта", visible: "Видна", notVisible: "Не показывается",
    billingBadge: "Платежный центр владельца", billingTitle: "Тариф и платежи", billingText: "Тарифы, подписка, счета и банковские платежи управляются на отдельной странице, доступной только владельцу.", openBilling: "Открыть тариф и платежи", quickNote: "КРАТКОЕ НАПОМИНАНИЕ", ownerOnly: "Только для владельца", ownerOnlyText: "Раздел платежей недоступен менеджерам и сотрудникам.", hosted: "Безопасная оплата в банке", hostedText: "Оплата проходит на странице банка, затем пользователь возвращается в Vizit.am.", annual: "Годовой тариф", annualText: "Вариант с 2 бесплатными месяцами доступен на странице платежей.",
    settingsLoadFailed: "Не удалось загрузить настройки бизнеса", scheduleLoadFailed: "Не удалось загрузить расписание", loading: "Загрузка…", general: "Общее", editable: "Можно редактировать", readOnly: "Только чтение", phone: "Телефон", phonePlaceholder: "напр. 077 12 34 56", bookingStep: "Шаг записи", bookingStepHint: "При шаге 15 минут доступны 09:00, 09:15, 09:30. Это не длительность услуги.", minutes: "мин", primaryAddress: "Основной адрес", addressPlaceholder: "напр. Ереван, Абовяна 10",
    branches: "Филиалы и адреса", branchesText: "Можно добавить до {limit} адресов. Основной адрес показывается на публичной странице.", addAddress: "Добавить адрес", address: "Адрес", primary: "Основной", mapSet: "Отмечено на карте", mapMissing: "Положение на карте не указано", mapTitle: "Расположение на карте Yandex", mapText: "Поставьте маркер у входа и сохраните положение.", selectedAddress: "Выбранный адрес", noAddress: "Адрес не указан", savePosition: "Сохранить положение", editAddress: "Редактировать адрес", newAddress: "Новый адрес", locationNamePlaceholder: "Название (напр. Центр)", fullAddress: "Полный адрес", makePrimary: "Сделать основным", updateAddress: "Обновить адрес", saveAddress: "Сохранить адрес", cancel: "Отменить", addAnother: "Добавить еще один адрес",
    timezone: "Часовой пояс", timezoneHint: "Для Армении: Asia/Yerevan", armenia: "Армения", workStart: "Начало работы", workEnd: "Конец работы", publicBookingLink: "Публичная ссылка записи", weeklySchedule: "Недельное расписание", breakOptional: "Перерыв необязателен", open: "Открыто", start: "Начало", end: "Конец", break: "Перерыв (необязательно)", removeBreak: "Убрать перерыв", saveScheduleOnly: "Сохранить только расписание",
  },
  en: {
    saved: "Saved", saveFailed: "Could not save", locationUpdated: "Address updated", locationAdded: "Address added", locationSaveFailed: "Could not save the address", locationDeleted: "Address deleted", locationDeleteFailed: "Could not delete the address", mapSaved: "Map position saved", mapSaveFailed: "Could not save the map position", copyFailed: "Could not copy the link", scheduleSaved: "Schedule saved", scheduleSaveFailed: "Could not save the schedule",
    badge: "Business settings", medicalBadge: "Clinic settings", title: "Settings", intro: "Manage business details, working hours, the public booking link and weekly schedule.", medicalIntro: "Manage clinic details, locations, the Yandex map, consultation hours and public page.", copied: "Copied", copy: "Copy", markOnMap: "Mark on map", save: "Save",
    branding: "Public page & branding", brandingText: "Manage the logo, cover, public description and search visibility.", shortDescription: "Short description", fullDescription: "Full description", profileEnabled: "Public page enabled", marketplaceVisible: "Show on home page", showLogo: "Show logo", showCover: "Show cover", showStaff: "Show team", showDoctors: "Show doctors", showServices: "Show services",
    social: "Social links", socialText: "Links appear on the public page and help track booking sources.", instagram: "Instagram link", facebook: "Facebook link", whatsapp: "WhatsApp number", messenger: "Messenger link", telegramTitle: "Telegram notifications", telegramText: "Connect the Vizit bot to receive new, rescheduled and cancelled bookings in Telegram.", telegramConnect: "Connect bot", telegramConnected: "Connected", telegramDisconnect: "Disconnect", telegramConnecting: "Opening…", telegramUnavailable: "The Telegram bot is not configured on the server yet.", telegramConnectError: "Could not create the Telegram connection link", telegramDisconnectError: "Could not disconnect Telegram", logo: "Logo", uploadLogo: "Upload logo", logoHint: "Use a square image for the best result.", cover: "Cover", coverPreview: "Cover preview", uploadCover: "Upload cover", businessDefault: "Your business", previewDefault: "Your public page preview will appear here.", publicPage: "Public page", marketplace: "Main directory", ready: "Ready", hidden: "Hidden", visible: "Visible", notVisible: "Not shown",
    billingBadge: "Owner billing center", billingTitle: "Plan & payments", billingText: "Plans, subscriptions, invoices and bank payments are managed on a separate owner-only page.", openBilling: "Open plan and payments", quickNote: "QUICK REMINDER", ownerOnly: "Owner access only", ownerOnlyText: "Billing is not available to managers or staff.", hosted: "Secure hosted payment", hostedText: "Payment is completed on the bank page, then the user returns to Vizit.am.", annual: "Annual plan", annualText: "The annual option with 2 free months appears on the billing page.",
    settingsLoadFailed: "Could not load business settings", scheduleLoadFailed: "Could not load the schedule", loading: "Loading…", general: "General", editable: "Editable", readOnly: "Read only", phone: "Phone", phonePlaceholder: "e.g. 077 12 34 56", bookingStep: "Booking interval", bookingStepHint: "A 15-minute step gives 09:00, 09:15, 09:30. It is not the service duration.", minutes: "min", primaryAddress: "Primary address", addressPlaceholder: "e.g. 10 Abovyan St, Yerevan",
    branches: "Locations & addresses", branchesText: "You can add up to {limit} addresses. The primary address appears on the public page.", addAddress: "Add address", address: "Address", primary: "Primary", mapSet: "Marked on map", mapMissing: "Map position not set", mapTitle: "Business location on Yandex Maps", mapText: "Place the marker at the entrance and save the position.", selectedAddress: "Selected address", noAddress: "Address not set", savePosition: "Save position", editAddress: "Edit address", newAddress: "New address", locationNamePlaceholder: "Name (e.g. Downtown)", fullAddress: "Full address", makePrimary: "Make primary", updateAddress: "Update address", saveAddress: "Save address", cancel: "Cancel", addAnother: "Add another address",
    timezone: "Time zone", timezoneHint: "For Armenia: Asia/Yerevan", armenia: "Armenia", workStart: "Opening time", workEnd: "Closing time", publicBookingLink: "Public booking link", weeklySchedule: "Weekly schedule", breakOptional: "Break is optional", open: "Open", start: "Start", end: "End", break: "Break (optional)", removeBreak: "Remove break", saveScheduleOnly: "Save schedule only",
  },
} satisfies Record<Locale, Record<string, string>>;

const weekdays: Record<Locale, Array<{ k: number; label: string }>> = {
  hy: ["Երկուշաբթի", "Երեքշաբթի", "Չորեքշաբթի", "Հինգշաբթի", "Ուրբաթ", "Շաբաթ", "Կիրակի"].map((label, index) => ({ k: index + 1, label })),
  ru: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"].map((label, index) => ({ k: index + 1, label })),
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((label, index) => ({ k: index + 1, label })),
};

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
  const { locale } = useLanguage();
  const text = settingsCopy[locale];
  const weekDays = weekdays[locale];
  const vertical = String(user?.vertical ?? user?.business_type ?? "").toLowerCase();
  const isHealthcare = ["healthcare", "dental", "clinic", "medical", "doctor", "health"].includes(vertical);

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

  const telegramQ = useQuery({
    queryKey: ["telegram-connection"],
    queryFn: fetchTelegramConnection,
    enabled: Boolean(user && canEdit),
    retry: false,
    refetchOnWindowFocus: true,
  });

  const connectTelegramMut = useMutation({
    mutationFn: createTelegramConnectionLink,
    onSuccess: (connection) => {
      window.location.assign(connection.url);
    },
    onError: (error: unknown) => {
      setToast({ open: true, text: getErrorMessage(error, text.telegramConnectError), type: "error" });
      window.setTimeout(() => setToast((previous) => ({ ...previous, open: false })), 2600);
    },
  });

  const disconnectTelegramMut = useMutation({
    mutationFn: disconnectTelegram,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["telegram-connection"] });
    },
    onError: (error: unknown) => {
      setToast({ open: true, text: getErrorMessage(error, text.telegramDisconnectError), type: "error" });
      window.setTimeout(() => setToast((previous) => ({ ...previous, open: false })), 2600);
    },
  });

  const [form, setForm] = useState<Partial<BusinessSettings>>({});
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [locationDraft, setLocationDraft] = useState<LocationDraft>(emptyLocationDraft());
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [isLocationEditorOpen, setIsLocationEditorOpen] = useState(false);
  const [selectedMapLocationId, setSelectedMapLocationId] = useState<number | null>(null);
  const [mapDrafts, setMapDrafts] = useState<Record<number, MapCoordinates>>({});

  useEffect(() => {
    if (settingsQ.data) setForm(settingsQ.data);
  }, [settingsQ.data]);

  useEffect(() => {
    const raw = scheduleQ.data?.days ?? [];
    if (!raw.length) {
      setDays(weekDays.map((w) => normalizeDay({ weekday: w.k, is_closed: w.k === 7 })));
      return;
    }

    const map = new Map<number, ScheduleDay>();
    raw.forEach((d) => map.set(d.weekday, normalizeDay(d)));
    setDays(weekDays.map((w) => map.get(w.k) ?? normalizeDay({ weekday: w.k })));
  }, [scheduleQ.data, weekDays]);

  const locationLimit = Number(form.location_limit ?? settingsQ.data?.location_limit ?? 1);
  const locations = (form.locations ?? settingsQ.data?.locations ?? []) as BusinessLocation[];
  const canAddLocation = canEdit && locations.length < locationLimit;
  const primaryLocation = locations.find((location) => location.is_primary) ?? locations[0] ?? null;
  const mapLocation = locations.find((location) => location.id === selectedMapLocationId) ?? primaryLocation;
  const mapCoordinates = mapLocation
    ? (Object.prototype.hasOwnProperty.call(mapDrafts, mapLocation.id)
        ? mapDrafts[mapLocation.id]
        : {
            latitude: mapLocation.latitude == null ? null : Number(mapLocation.latitude),
            longitude: mapLocation.longitude == null ? null : Number(mapLocation.longitude),
          })
    : null;

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
      setToast({ open: true, text: `${text.saved} ✓`, type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    },
    onError: (error: unknown) => {
      setToast({
        open: true,
        text: getErrorMessage(error, text.saveFailed),
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
      const savedLocation = editingLocationId
        ? data.locations.find((location) => location.id === editingLocationId)
        : data.locations[data.locations.length - 1];
      syncLocations(data.locations, data.location_limit);
      if (savedLocation) setSelectedMapLocationId(savedLocation.id);
      resetLocationEditor();
      await qc.invalidateQueries({ queryKey: ['business-settings'] });
      setToast({ open: true, text: `${editingLocationId ? text.locationUpdated : text.locationAdded} ✓`, type: 'success' });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    },
    onError: (error: unknown) => {
      setToast({ open: true, text: getErrorMessage(error, text.locationSaveFailed), type: 'error' });
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
      setToast({ open: true, text: `${text.locationDeleted} ✓`, type: 'success' });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    },
    onError: (error: unknown) => {
      setToast({ open: true, text: getErrorMessage(error, text.locationDeleteFailed), type: 'error' });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2600);
    },
  });

  const saveMapLocationMut = useMutation({
    mutationFn: ({ location, coordinates }: { location: BusinessLocation; coordinates: MapCoordinates }) =>
      updateBusinessLocation(location.id, {
        name: location.name ?? null,
        address: location.address,
        phone: location.phone ?? null,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        is_primary: location.is_primary,
      }),
    onSuccess: async (data) => {
      const savedId = mapLocation?.id;
      syncLocations(data.locations, data.location_limit);
      if (savedId) {
        setMapDrafts((prev) => {
          const next = { ...prev };
          delete next[savedId];
          return next;
        });
      }
      await qc.invalidateQueries({ queryKey: ["business-settings"] });
      setToast({ open: true, text: `${text.mapSaved} ✓`, type: "success" });
      setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 2200);
    },
    onError: (error: unknown) => {
      setToast({ open: true, text: getErrorMessage(error, text.mapSaveFailed), type: "error" });
      setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 2600);
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
      setToast({ open: true, text: text.copyFailed, type: "error" });
      window.setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    }
  };

  const saveScheduleMut = useMutation({
    mutationFn: updateSchedule,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["schedule"] });
      setToast({ open: true, text: `${text.scheduleSaved} ✓`, type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    },
    onError: (error: unknown) => {
      setToast({
        open: true,
        text: getErrorMessage(error, text.scheduleSaveFailed),
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
              className="rounded-[28px] border border-[#d39a43]/24 bg-[radial-gradient(circle_at_90%_0%,rgba(232,194,174,.62),transparent_34%),linear-gradient(135deg,#fffdf9,#f8eee4)] p-5 shadow-[0_20px_58px_rgba(70,34,49,.08)] dark:border-[#e7bc6b]/15 dark:bg-[radial-gradient(circle_at_90%_0%,rgba(109,42,99,.34),transparent_34%),linear-gradient(135deg,#2f182e,#1d121f)] sm:p-7"
          >
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  <Sparkles className="h-4 w-4" />
                  {isHealthcare ? text.medicalBadge : text.badge}
                </div>
                <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-slate-950">{text.title}</h1>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {isHealthcare ? text.medicalIntro : text.intro}
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
                        {copiedLink ? text.copied : text.copy}
                      </button>
                    </div>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!mapLocation) {
                      startLocationCreate();
                      return;
                    }
                    document.getElementById("business-location-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="gap-2"
                >
                  <MapPin size={16} /> {text.markOnMap}
                </Button>

                <Button onClick={saveAll} disabled={!canEdit || loading || saving} className="gap-2">
                  {saving ? <Spinner size={16} /> : <Save size={16} />}
                  {text.save}
                </Button>
              </div>
            </div>
          </motion.div>


          <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
            <SectionCard className="p-4 sm:p-6 md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{text.branding}</h2>
                  <p className="mt-1 text-sm text-slate-500">{text.brandingText}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <InputShell label={text.shortDescription} icon={<Sparkles className="h-4 w-4 text-violet-500" />}>
                    <textarea value={form.short_description ?? ""} onChange={(e) => setForm((p) => ({ ...p, short_description: e.target.value }))} className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
                  </InputShell>
                  <InputShell label={text.fullDescription} icon={<Globe className="h-4 w-4 text-violet-500" />}>
                    <textarea value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
                  </InputShell>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {([
                      ["is_public_profile_enabled", text.profileEnabled],
                      ["is_marketplace_visible", text.marketplaceVisible],
                      ["show_logo", text.showLogo],
                      ["show_cover", text.showCover],
                      ["show_staff", isHealthcare ? text.showDoctors : text.showStaff],
                      ["show_services", text.showServices],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/40">
                        <input type="checkbox" checked={Boolean(form[key])} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))} />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-sm font-semibold text-slate-900">{text.social}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{text.socialText}</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <InputShell label={text.instagram} icon={<LinkIcon className="h-4 w-4 text-violet-500" />}>
                        <input value={form.instagram_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, instagram_url: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="https://instagram.com/..." />
                      </InputShell>
                      <InputShell label={text.facebook} icon={<LinkIcon className="h-4 w-4 text-violet-500" />}>
                        <input value={form.facebook_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, facebook_url: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="https://facebook.com/..." />
                      </InputShell>
                      <InputShell label={text.whatsapp} icon={<Phone className="h-4 w-4 text-violet-500" />}>
                        <input value={form.whatsapp_phone ?? ""} onChange={(e) => setForm((p) => ({ ...p, whatsapp_phone: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="+374..." />
                      </InputShell>
                      <InputShell label={text.messenger} icon={<LinkIcon className="h-4 w-4 text-violet-500" />}>
                        <input value={form.messenger_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, messenger_url: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="https://m.me/..." />
                      </InputShell>
                    </div>
                    <div className="mt-4 flex flex-col gap-4 rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-500 text-white shadow-sm">
                          <Send className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{text.telegramTitle}</div>
                          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600">{text.telegramText}</p>
                          {telegramQ.data && !telegramQ.data.available && !telegramQ.data.connected ? (
                            <p className="mt-2 text-xs font-medium text-amber-700">{text.telegramUnavailable}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {telegramQ.isLoading ? <Spinner size={18} /> : null}
                        {telegramQ.data?.connected ? (
                          <>
                            <span className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
                              <CheckCircle2 className="h-4 w-4" /> {text.telegramConnected}
                            </span>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={disconnectTelegramMut.isPending}
                              onClick={() => disconnectTelegramMut.mutate()}
                            >
                              {disconnectTelegramMut.isPending ? <Spinner size={15} /> : <Unplug className="h-4 w-4" />}
                              {text.telegramDisconnect}
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={!telegramQ.data?.available || connectTelegramMut.isPending}
                            onClick={() => connectTelegramMut.mutate()}
                          >
                            {connectTelegramMut.isPending ? <Spinner size={15} /> : <Send className="h-4 w-4" />}
                            {connectTelegramMut.isPending ? text.telegramConnecting : text.telegramConnect}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-800">{text.logo}</div>
                    <div className="flex items-center gap-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                      <div className="h-20 w-20 overflow-hidden rounded-3xl bg-white shadow-sm ring-4 ring-white">{form.logo_url ? <img src={form.logo_url} alt="logo" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-slate-400">Logo</div>}</div>
                      <div className="space-y-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                          {text.uploadLogo}
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadMedia(file, 'branding'); setForm((p) => ({ ...p, logo_url: url })); e.currentTarget.value = ''; }} />
                        </label>
                        <div className="text-xs text-slate-500">{text.logoHint}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-800">{text.cover}</div>
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50/70 p-3">
                      <div className="h-40 overflow-hidden rounded-3xl bg-white shadow-sm">{form.cover_url ? <img src={form.cover_url} alt="banner" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-slate-400">{text.coverPreview}</div>}</div>
                      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                        {text.uploadCover}
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
                          <div className="text-lg font-semibold">{form.name ?? settingsQ.data?.name ?? text.businessDefault}</div>
                          <div className="mt-1 text-sm text-white/75">{form.short_description || text.previewDefault}</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3 p-5 text-sm text-white/80 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/50">{text.publicPage}</div>
                        <div className="mt-2 font-semibold text-white">{form.is_public_profile_enabled ? text.ready : text.hidden}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/50">{text.marketplace}</div>
                        <div className="mt-2 font-semibold text-white">{form.is_marketplace_visible ? text.visible : text.notVisible}</div>
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
                        {text.billingBadge}
                      </div>

                      <h2 className="text-2xl font-semibold text-slate-950">{text.billingTitle}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                        {text.billingText}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link to="/app/billing">
                          <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20"
                          >
                            {text.openBilling}
                            <ArrowRight size={16} />
                          </button>
                        </Link>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 bg-slate-50/60 p-6 lg:border-l lg:border-t-0">
                      <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">{text.quickNote}</div>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-sm font-semibold text-slate-950">{text.ownerOnly}</div>
                          <div className="mt-1 text-xs text-slate-500">{text.ownerOnlyText}</div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-sm font-semibold text-slate-950">{text.hosted}</div>
                          <div className="mt-1 text-xs text-slate-500">{text.hostedText}</div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-sm font-semibold text-slate-950">{text.annual}</div>
                          <div className="mt-1 text-xs text-slate-500">{text.annualText}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
          )}

          {settingsQ.error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600">
                {getErrorMessage(settingsQ.error, text.settingsLoadFailed)}
              </div>
          )}

          {scheduleQ.error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600">
                {getErrorMessage(scheduleQ.error, text.scheduleLoadFailed)}
              </div>
          )}

          {loading ? (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                    <SectionCard key={i} className="p-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Spinner />
                        {text.loading}
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
                        <div className="text-lg font-semibold text-slate-950">{text.general}</div>
                      </div>

                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        {canEdit ? text.editable : text.readOnly}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <InputShell label={text.phone} icon={<Phone size={14} className="text-violet-600" />}>
                        <input
                            disabled={!canEdit}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                            value={form.phone ?? ""}
                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                            placeholder={text.phonePlaceholder}
                        />
                      </InputShell>

                      <InputShell label={text.bookingStep} icon={<Clock size={14} className="text-violet-600" />} hint={text.bookingStepHint}>
                        <select
                            disabled={!canEdit}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                            value={Number(form.slot_step_minutes ?? 15)}
                            onChange={(e) => setForm((p) => ({ ...p, slot_step_minutes: Number(e.target.value) }))}
                        >
                          {[5, 10, 15, 20, 30].map((v) => (
                              <option key={v} value={v}>
                                {v} {text.minutes}
                              </option>
                          ))}
                        </select>
                      </InputShell>

                      <InputShell label={text.primaryAddress} icon={<MapPin size={14} className="text-violet-600" />}>
                        <input
                            disabled={!canEdit}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                            value={form.address ?? ""}
                            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                            placeholder={text.addressPlaceholder}
                        />
                      </InputShell>

                      <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <Building2 className="h-4 w-4 text-violet-600" /> {text.branches}
                            </div>
                            <div className="mt-1 text-xs leading-5 text-slate-500">
                              {text.branchesText.replace("{limit}", String(locationLimit))}
                            </div>
                          </div>
                          {canAddLocation ? (
                            <button
                              type="button"
                              onClick={startLocationCreate}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
                            >
                              <Plus className="h-4 w-4" /> {text.addAddress}
                            </button>
                          ) : (
                            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                              {locations.length}/{locationLimit} {text.address.toLowerCase()}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 space-y-3">
                          {locations.map((location) => (
                            <div key={location.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-sm font-semibold text-slate-900">{location.name || `${text.address} ${location.sort_order}`}</div>
                                    {location.is_primary ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{text.primary}</span> : null}
                                  </div>
                                  <div className="text-sm leading-6 text-slate-600">{location.address}</div>
                                  {location.phone ? <div className="text-xs text-slate-500">{location.phone}</div> : null}
                                  {location.latitude != null && location.longitude != null ? (
                                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700">
                                      <MapPin className="h-3 w-3" /> {text.mapSet}
                                    </div>
                                  ) : (
                                    <div className="mt-2 text-[11px] font-medium text-amber-700">{text.mapMissing}</div>
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

                        {mapLocation && mapCoordinates ? (
                          <div id="business-location-map" className="mt-4 scroll-mt-24 overflow-hidden rounded-[22px] border border-violet-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 to-cyan-50 px-4 py-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
                                    <MapPin className="h-5 w-5 text-violet-600" /> {text.mapTitle}
                                  </div>
                                  <div className="mt-1 text-xs leading-5 text-slate-600">
                                    {text.mapText}
                                  </div>
                                </div>
                                {locations.length > 1 ? (
                                  <select
                                    value={mapLocation.id}
                                    onChange={(event) => setSelectedMapLocationId(Number(event.target.value))}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                                  >
                                    {locations.map((location) => (
                                      <option key={location.id} value={location.id}>
                                        {location.name || location.address || `${text.address} ${location.sort_order}`}
                                      </option>
                                    ))}
                                  </select>
                                ) : null}
                              </div>
                            </div>
                            <div className="p-3 sm:p-4">
                              <LocationMapPicker
                                key={`visible-location-map-${mapLocation.id}`}
                                latitude={mapCoordinates.latitude}
                                longitude={mapCoordinates.longitude}
                                disabled={!canEdit || saveMapLocationMut.isPending}
                                onChange={(coordinates) => setMapDrafts((prev) => ({
                                  ...prev,
                                  [mapLocation.id]: {
                                    latitude: coordinates?.latitude ?? null,
                                    longitude: coordinates?.longitude ?? null,
                                  },
                                }))}
                              />
                              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs leading-5 text-slate-500">
                                  {text.selectedAddress}՝ <span className="font-medium text-slate-700">{mapLocation.address || text.noAddress}</span>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => saveMapLocationMut.mutate({ location: mapLocation, coordinates: mapCoordinates })}
                                  disabled={!canEdit || saveMapLocationMut.isPending || mapCoordinates.latitude == null || mapCoordinates.longitude == null}
                                >
                                  {saveMapLocationMut.isPending ? <Spinner size={16} /> : <MapPin className="h-4 w-4" />}
                                  {text.savePosition}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {isLocationEditorOpen ? (
                          <div className="mt-4 rounded-[22px] border border-violet-200 bg-white p-4 shadow-sm">
                            <div className="text-sm font-semibold text-slate-900">{editingLocationId ? text.editAddress : text.newAddress}</div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <input
                                value={locationDraft.name}
                                onChange={(e) => setLocationDraft((prev) => ({ ...prev, name: e.target.value }))}
                                disabled={!canEdit}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                                placeholder={text.locationNamePlaceholder}
                              />
                              <input
                                value={locationDraft.phone}
                                onChange={(e) => setLocationDraft((prev) => ({ ...prev, phone: e.target.value }))}
                                disabled={!canEdit}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                                placeholder={text.phone}
                              />
                            </div>
                            <textarea
                              value={locationDraft.address}
                              onChange={(e) => setLocationDraft((prev) => ({ ...prev, address: e.target.value }))}
                              disabled={!canEdit}
                              className="mt-3 min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                              placeholder={text.fullAddress}
                            />
                            <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
                              <input type="checkbox" checked={locationDraft.is_primary} onChange={(e) => setLocationDraft((prev) => ({ ...prev, is_primary: e.target.checked }))} />
                              {text.makePrimary}
                            </label>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button type="button" onClick={submitLocation} disabled={!canEdit || !locationDraft.address.trim() || saveLocationMut.isPending}>
                                {saveLocationMut.isPending ? <Spinner size={16} /> : editingLocationId ? text.updateAddress : text.saveAddress}
                              </Button>
                              <Button type="button" variant="secondary" onClick={resetLocationEditor} disabled={saveLocationMut.isPending}>{text.cancel}</Button>
                            </div>
                          </div>
                        ) : canAddLocation ? (
                          <button
                            type="button"
                            onClick={startLocationCreate}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                          >
                            <Plus className="h-4 w-4" /> {text.addAnother}
                          </button>
                        ) : null}
                      </div>

                      <InputShell
                          label={text.timezone}
                          icon={<Globe size={14} className="text-violet-600" />}
                          hint={text.timezoneHint}
                      >
                        <select
                            disabled={!canEdit}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                            value={form.timezone ?? "Asia/Yerevan"}
                            onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                        >
                          <option value="Asia/Yerevan">Asia/Yerevan ({text.armenia})</option>
                          <option value="Europe/Moscow">Europe/Moscow</option>
                          <option value="Europe/Istanbul">Europe/Istanbul</option>
                          <option value="Asia/Tbilisi">Asia/Tbilisi</option>
                        </select>
                      </InputShell>

                      <div className="grid grid-cols-2 gap-4">
                        <InputShell label={text.workStart} icon={<Clock size={14} className="text-violet-600" />}>
                          <input
                              type="time"
                              disabled={!canEdit}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                              value={form.work_start ?? "09:00"}
                              onChange={(e) => setForm((p) => ({ ...p, work_start: e.target.value }))}
                          />
                        </InputShell>

                        <InputShell label={text.workEnd} icon={<Clock size={14} className="text-violet-600" />}>
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
                              <div className="text-xs font-medium text-slate-500">{text.publicBookingLink}</div>
                              <div className="mt-1 break-all text-sm text-slate-900">{bookingLink}</div>
                            </div>
                            <button type="button" onClick={copyBookingLink} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                              {copiedLink ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                              {copiedLink ? text.copied : text.copy}
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
                        <div className="text-lg font-semibold text-slate-950">{text.weeklySchedule}</div>
                      </div>

                      <div className="text-xs text-slate-500">{text.breakOptional}</div>
                    </div>

                    <div className="max-h-[640px] space-y-3 overflow-y-auto pr-2">
                      {weekDays.map((w) => {
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
                                  {text.open}
                                </label>
                              </div>

                              {!d.is_closed && (
                                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div>
                                      <label className="mb-1 block text-xs text-slate-500">{text.start}</label>
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
                                      <label className="mb-1 block text-xs text-slate-500">{text.end}</label>
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
                                      <div className="mb-2 text-xs text-slate-500">{text.break}</div>

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
                                        {text.removeBreak}
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
                        {text.saveScheduleOnly}
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
