import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Users,
  User,
  Search,
  Shield,
  Briefcase,
  Sparkles,
  Mail,
  Phone,
  CheckCircle2,
  Ban,
  Eye,
  EyeOff,
  ImagePlus,
  Globe2,
  CalendarCheck2,
  Pencil,
  Star,
  Info,
  Clock3,
  X,
  Stethoscope,
} from "lucide-react";

import { page, card, cardTransition } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { cn } from "../lib/cn";
import {
  fetchStaff,
  createStaff,
  activateStaff,
  deactivateStaff,
  updateStaff,
  type StaffUser,
} from "../lib/staffApi";
import { uploadMedia } from "../lib/mediaApi";
import { fetchBusinessSettings } from "../lib/businessSettingsApi";
import { getErrorMessage } from "../lib/http";
import { fetchStaffSchedule, updateStaffSchedule, type ScheduleDay } from "../lib/scheduleApi";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { useAuth } from "../store/auth";

type StaffRoleForm = "staff" | "manager";

type FormState = {
  name: string;
  email: string;
  password: string;
  role: StaffRoleForm;
  phone: string;
  whatsapp_phone: string;
  bio: string;
  show_in_public_team: boolean;
  is_bookable: boolean;
  location_id: number | "";
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "staff",
  phone: "",
  whatsapp_phone: "",
  bio: "",
  show_in_public_team: true,
  is_bookable: true,
  location_id: "",
};

const staffCopy = {
  hy: {
    primary: "Գլխավոր հասցե", owner: "Սեփականատեր", manager: "Կառավարիչ", superAdmin: "Սուպեր ադմին", staff: "Մասնագետ", doctor: "Բժիշկ",
    managerDescription: "Կառավարում է թիմը և օրվա հոսքը։ Կարող եք անհրաժեշտության դեպքում միացնել հանրային ցուցադրումն ու գրանցումները։",
    specialistDescription: "Ծառայություն մատուցող թիմակից է և կարող է ընդունել առցանց գրանցումներ։",
    doctorDescription: "Բժիշկ կամ բուժաշխատող է և կարող է ընդունել առցանց այցեր։",
    badge: "Թիմի կառավարում", medicalBadge: "Բժշկական թիմ", title: "Աշխատակիցներ", medicalTitle: "Բժիշկներ և թիմ",
    intro: "Կառավարեք մասնագետներին, նրանց տեսանելիությունն ու առցանց գրանցումները մեկ վայրում։",
    medicalIntro: "Ավելացրեք բժիշկներին ու բուժաշխատողներին, նշանակեք մասնաճյուղը և սահմանեք անհատական ընդունելության ժամերը։",
    add: "Նոր աշխատակից", addDoctor: "Ավելացնել բժիշկ", activeStaff: "Ակտիվ մասնագետներ", services: "Ծառայություններ", locations: "Հասցեներ",
    limitReached: "Մասնագետների սահմանաչափը լրացել է։ Կառավարիչների հաշիվները չեն զբաղեցնում մասնագետի տեղ։", seePlans: "Տեսնել պլանները",
    activeMembers: "Ակտիվ անդամներ", publicMembers: "Հանրային էջում", bookableMembers: "Գրանցում ընդունողներ", search: "Փնտրել անունով, էլ. փոստով կամ հեռախոսով…",
    allLocations: "Բոլոր հասցեները", total: "Ընդամենը", members: "անդամ", publicShort: "հանրային", bookableShort: "գրանցվող",
    loadFailed: "Չհաջողվեց բեռնել թիմը", loadHint: "Ստուգեք պլանի կարգավիճակը կամ կրկին փորձեք։", retry: "Կրկին փորձել", planStatus: "Պլանի կարգավիճակ",
    emptyTitle: "Թիմակից չի գտնվել", emptySearch: "Փոխեք որոնումը կամ ավելացրեք նոր անդամ։", emptyText: "Սկսելու համար ավելացրեք առաջին մասնագետին կամ կառավարչին։", emptyMedical: "Սկսելու համար ավելացրեք առաջին բժշկին կամ բուժաշխատողին։",
    active: "Ակտիվ", inactive: "Ոչ ակտիվ", schedule: "Գրաֆիկ", edit: "Խմբագրել", publicVisible: "Երևում է հանրային էջում", publicHidden: "Թաքնված է հանրային էջից", bookingOn: "Ընդունում է գրանցումներ", bookingOff: "Չի ընդունում գրանցումներ",
    noEmail: "Էլ. փոստ նշված չէ", noPhone: "Հեռախոս նշված չէ", noWhatsapp: "WhatsApp նշված չէ", publicSetting: "Ցույց տալ հանրային էջում", bookingSetting: "Հասանելի դարձնել առցանց գրանցման համար", photo: "Լուսանկար",
    deactivate: "Ապաակտիվացնել", activate: "Ակտիվացնել", deactivateConfirm: "Ապաակտիվացնե՞լ «{name}» աշխատակցին։",
    newTitle: "Նոր աշխատակից", newDoctorTitle: "Նոր բժիշկ կամ բուժաշխատող", editTitle: "Խմբագրել աշխատակցին", editDoctorTitle: "Խմբագրել բժշկին",
    createIntro: "Ստեղծեք մասնագետի կամ կառավարչի հաշիվ և կարգավորեք առցանց գրանցումները։", createMedicalIntro: "Մուտքագրեք բժշկի տվյալները, ընտրեք մասնաճյուղը, ապա պահպանելուց հետո սահմանեք ընդունելության գրաֆիկը։",
    editIntro: "Թարմացրեք դերը, կոնտակտները, հանրային տեսանելիությունն ու գրանցման կարգավիճակը։", name: "Անուն և ազգանուն", email: "Էլ. փոստ", password: "Գաղտնաբառ", phone: "Հեռախոս", branch: "Հասցե / մասնաճյուղ", chooseBranch: "Ընտրեք հասցեն",
    branchHint: "Մի քանի մասնաճյուղ ունենալու դեպքում անդամին կապեք կոնկրետ հասցեի հետ։", bio: "Մասնագիտացում և ներկայացում", bioPlaceholder: "Օր․ սրտաբան, 12 տարվա փորձ, մեծահասակների խորհրդատվություն…",
    accessTitle: "Հանրային էջ և գրանցումներ", accessText: "Գրանցում ընդունելու դեպքում աշխատակիցը ավտոմատ երևում է նաև հանրային թիմում։", preview: "Նախադիտում", nameMissing: "Անունը դեռ նշված չէ", allBranches: "Բոլոր հասցեների համար",
    close: "Փակել", create: "Ստեղծել", save: "Պահպանել", staffSlotFull: "Մասնագետի ազատ տեղ չկա։ Ընտրեք «Կառավարիչ» կամ փոխեք պլանը։",
    nameRequired: "Նշեք աշխատակցի անունը։", emailRequired: "Նշեք էլ. փոստը։", emailInvalid: "Նշեք վավեր էլ. փոստի հասցե։", passwordShort: "Գաղտնաբառը պետք է պարունակի առնվազն 8 նիշ։", staffLimitError: "Մասնագետների սահմանաչափը լրացել է։ Կարող եք ավելացնել կառավարիչ կամ փոխել պլանը։", branchRequired: "Մի քանի հասցե ունենալու դեպքում աշխատակցին կապեք կոնկրետ մասնաճյուղի։", saveFailed: "Չհաջողվեց պահպանել փոփոխությունները։",
    scheduleBadge: "Անհատական գրաֆիկ", scheduleText: "Սահմանեք ընդունելության օրերը, ժամերը և ընդմիջումները։ Այս գրաֆիկով կհաշվվեն հասանելի այցերի ժամերը։", scheduleLoading: "Բեռնում ենք գրաֆիկը…", closedDay: "Հանգստյան օր", workDay: "Աշխատանքային օր", closed: "Փակ է", start: "Սկիզբ", end: "Ավարտ", breakStart: "Ընդմիջում՝ սկիզբ", breakEnd: "Ընդմիջում՝ ավարտ", saveSchedule: "Պահպանել գրաֆիկը", scheduleLoadFailed: "Չհաջողվեց բեռնել գրաֆիկը։", scheduleSaveFailed: "Չհաջողվեց պահպանել գրաֆիկը։", invalidHours: "{day} օրվա սկիզբը պետք է փոքր լինի ավարտից։", invalidBreak: "{day} օրվա ընդմիջումը պետք է լինի աշխատանքային ժամերի ներսում։",
  },
  ru: {
    primary: "Основной адрес", owner: "Владелец", manager: "Менеджер", superAdmin: "Суперадмин", staff: "Специалист", doctor: "Врач",
    managerDescription: "Управляет командой и рабочим процессом. Публичный профиль и запись можно включить при необходимости.", specialistDescription: "Оказывает услуги и может принимать онлайн-записи.", doctorDescription: "Врач или медработник, который может принимать онлайн-визиты.",
    badge: "Управление командой", medicalBadge: "Медицинская команда", title: "Сотрудники", medicalTitle: "Врачи и команда", intro: "Управляйте специалистами, видимостью и онлайн-записью в одном месте.", medicalIntro: "Добавляйте врачей и медработников, назначайте филиал и задавайте индивидуальные часы приема.",
    add: "Новый сотрудник", addDoctor: "Добавить врача", activeStaff: "Активные специалисты", services: "Услуги", locations: "Адреса", limitReached: "Лимит специалистов исчерпан. Аккаунты менеджеров не занимают место специалиста.", seePlans: "Посмотреть тарифы",
    activeMembers: "Активные участники", publicMembers: "На публичной странице", bookableMembers: "Принимают запись", search: "Поиск по имени, почте или телефону…", allLocations: "Все адреса", total: "Всего", members: "участников", publicShort: "публичных", bookableShort: "для записи",
    loadFailed: "Не удалось загрузить команду", loadHint: "Проверьте тариф или попробуйте еще раз.", retry: "Повторить", planStatus: "Статус тарифа", emptyTitle: "Сотрудники не найдены", emptySearch: "Измените запрос или добавьте участника.", emptyText: "Добавьте первого специалиста или менеджера.", emptyMedical: "Добавьте первого врача или медработника.",
    active: "Активен", inactive: "Неактивен", schedule: "Расписание", edit: "Изменить", publicVisible: "Виден на публичной странице", publicHidden: "Скрыт с публичной страницы", bookingOn: "Принимает онлайн-запись", bookingOff: "Онлайн-запись отключена", noEmail: "Почта не указана", noPhone: "Телефон не указан", noWhatsapp: "WhatsApp не указан", publicSetting: "Показывать на публичной странице", bookingSetting: "Разрешить онлайн-запись", photo: "Фото", deactivate: "Деактивировать", activate: "Активировать", deactivateConfirm: "Деактивировать сотрудника «{name}»?",
    newTitle: "Новый сотрудник", newDoctorTitle: "Новый врач или медработник", editTitle: "Редактировать сотрудника", editDoctorTitle: "Редактировать врача", createIntro: "Создайте аккаунт специалиста или менеджера и настройте онлайн-запись.", createMedicalIntro: "Введите данные врача, выберите филиал, затем после сохранения задайте график приема.", editIntro: "Обновите роль, контакты, публичную видимость и статус записи.", name: "Имя и фамилия", email: "Эл. почта", password: "Пароль", phone: "Телефон", branch: "Адрес / филиал", chooseBranch: "Выберите адрес", branchHint: "При наличии нескольких филиалов привяжите участника к конкретному адресу.", bio: "Специализация и описание", bioPlaceholder: "Напр. кардиолог, 12 лет опыта, консультации взрослых…",
    accessTitle: "Публичная страница и запись", accessText: "Если сотрудник принимает запись, он автоматически показывается в публичной команде.", preview: "Предпросмотр", nameMissing: "Имя пока не указано", allBranches: "Для всех адресов", close: "Закрыть", create: "Создать", save: "Сохранить", staffSlotFull: "Нет свободного места специалиста. Выберите «Менеджер» или смените тариф.",
    nameRequired: "Укажите имя сотрудника.", emailRequired: "Укажите эл. почту.", emailInvalid: "Укажите корректный адрес эл. почты.", passwordShort: "Пароль должен содержать не менее 8 символов.", staffLimitError: "Лимит специалистов исчерпан. Добавьте менеджера или смените тариф.", branchRequired: "При наличии нескольких адресов выберите конкретный филиал.", saveFailed: "Не удалось сохранить изменения.",
    scheduleBadge: "Индивидуальное расписание", scheduleText: "Задайте дни приема, рабочее время и перерывы. По этому графику рассчитываются доступные часы визитов.", scheduleLoading: "Загружаем расписание…", closedDay: "Выходной", workDay: "Рабочий день", closed: "Закрыто", start: "Начало", end: "Конец", breakStart: "Начало перерыва", breakEnd: "Конец перерыва", saveSchedule: "Сохранить расписание", scheduleLoadFailed: "Не удалось загрузить расписание.", scheduleSaveFailed: "Не удалось сохранить расписание.", invalidHours: "В день «{day}» начало должно быть раньше окончания.", invalidBreak: "В день «{day}» перерыв должен быть внутри рабочих часов.",
  },
  en: {
    primary: "Primary address", owner: "Owner", manager: "Manager", superAdmin: "Super admin", staff: "Specialist", doctor: "Doctor",
    managerDescription: "Manages the team and daily workflow. Public visibility and booking can be enabled when needed.", specialistDescription: "A service provider who can accept online bookings.", doctorDescription: "A doctor or clinician who can accept online visits.",
    badge: "Team management", medicalBadge: "Medical team", title: "Staff", medicalTitle: "Doctors & team", intro: "Manage specialists, public visibility and online booking in one place.", medicalIntro: "Add doctors and clinicians, assign a location and set individual consultation hours.",
    add: "New staff member", addDoctor: "Add doctor", activeStaff: "Active specialists", services: "Services", locations: "Locations", limitReached: "Your specialist limit has been reached. Manager accounts do not use specialist seats.", seePlans: "View plans",
    activeMembers: "Active members", publicMembers: "On public page", bookableMembers: "Accepting bookings", search: "Search by name, email or phone…", allLocations: "All locations", total: "Total", members: "members", publicShort: "public", bookableShort: "bookable",
    loadFailed: "Could not load the team", loadHint: "Check your plan status or try again.", retry: "Try again", planStatus: "Plan status", emptyTitle: "No team members found", emptySearch: "Change the search or add a new member.", emptyText: "Add the first specialist or manager to get started.", emptyMedical: "Add the first doctor or clinician to get started.",
    active: "Active", inactive: "Inactive", schedule: "Schedule", edit: "Edit", publicVisible: "Visible on public page", publicHidden: "Hidden from public page", bookingOn: "Accepts online booking", bookingOff: "Online booking disabled", noEmail: "No email", noPhone: "No phone", noWhatsapp: "No WhatsApp", publicSetting: "Show on public page", bookingSetting: "Available for online booking", photo: "Photo", deactivate: "Deactivate", activate: "Activate", deactivateConfirm: "Deactivate “{name}”?",
    newTitle: "New staff member", newDoctorTitle: "New doctor or clinician", editTitle: "Edit staff member", editDoctorTitle: "Edit doctor", createIntro: "Create a specialist or manager account and configure online booking.", createMedicalIntro: "Enter the doctor's details, choose a location, then set consultation hours after saving.", editIntro: "Update role, contacts, public visibility and booking status.", name: "Full name", email: "Email", password: "Password", phone: "Phone", branch: "Address / location", chooseBranch: "Choose a location", branchHint: "For multiple locations, assign the member to a specific address.", bio: "Specialization and profile", bioPlaceholder: "e.g. cardiologist, 12 years of experience, adult consultations…",
    accessTitle: "Public page & booking", accessText: "When booking is enabled, the team member is automatically visible on the public team.", preview: "Preview", nameMissing: "Name not entered yet", allBranches: "All locations", close: "Close", create: "Create", save: "Save", staffSlotFull: "No specialist seat is available. Choose “Manager” or change the plan.",
    nameRequired: "Enter the staff member's name.", emailRequired: "Enter an email address.", emailInvalid: "Enter a valid email address.", passwordShort: "The password must contain at least 8 characters.", staffLimitError: "The specialist limit has been reached. Add a manager or change the plan.", branchRequired: "When there are multiple locations, choose a specific branch.", saveFailed: "Could not save the changes.",
    scheduleBadge: "Individual schedule", scheduleText: "Set consultation days, working hours and breaks. Available visit times are calculated from this schedule.", scheduleLoading: "Loading schedule…", closedDay: "Day off", workDay: "Working day", closed: "Closed", start: "Start", end: "End", breakStart: "Break start", breakEnd: "Break end", saveSchedule: "Save schedule", scheduleLoadFailed: "Could not load the schedule.", scheduleSaveFailed: "Could not save the schedule.", invalidHours: "On {day}, the start time must be earlier than the end time.", invalidBreak: "On {day}, the break must be within working hours.",
  },
} satisfies Record<Locale, Record<string, string>>;

const dayNames: Record<Locale, string[]> = {
  hy: ["Երկուշաբթի", "Երեքշաբթի", "Չորեքշաբթի", "Հինգշաբթի", "Ուրբաթ", "Շաբաթ", "Կիրակի"],
  ru: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};

function completeSchedule(days: ScheduleDay[]): ScheduleDay[] {
  const byWeekday = new Map(days.map((day) => [day.weekday, day]));
  return Array.from({ length: 7 }, (_, index) => {
    const weekday = index + 1;
    return byWeekday.get(weekday) ?? {
      weekday,
      is_closed: weekday === 7,
      start: weekday === 7 ? null : "09:00",
      end: weekday === 7 ? null : "18:00",
      break_start: null,
      break_end: null,
    };
  });
}

function roleLabel(role: string, text: Record<string, string>, isHealthcare: boolean) {
  if (role === "owner") return text.owner;
  if (role === "manager") return text.manager;
  if (role === "super_admin") return text.superAdmin;
  return isHealthcare ? text.doctor : text.staff;
}

function roleUi(role: string) {
  if (role === "owner") {
    return {
      cls: "border-violet-200 bg-violet-50 text-violet-700",
      icon: <Shield className="h-3.5 w-3.5" />,
    };
  }
  if (role === "manager") {
    return {
      cls: "border-sky-200 bg-sky-50 text-sky-700",
      icon: <Briefcase className="h-3.5 w-3.5" />,
    };
  }
  if (role === "super_admin") {
    return {
      cls: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
      icon: <Shield className="h-3.5 w-3.5" />,
    };
  }
  return {
    cls: "border-slate-200 bg-slate-50 text-slate-600",
    icon: <User className="h-3.5 w-3.5" />,
  };
}

function rolePreset(role: StaffRoleForm, text: Record<string, string>, isHealthcare: boolean) {
  if (role === "manager") {
    return {
      title: text.manager,
      description: text.managerDescription,
      show_in_public_team: false,
      is_bookable: false,
      icon: Briefcase,
      accent: "from-sky-500 to-cyan-500",
      soft: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  return {
    title: isHealthcare ? text.doctor : text.staff,
    description: isHealthcare ? text.doctorDescription : text.specialistDescription,
    show_in_public_team: true,
    is_bookable: true,
    icon: Sparkles,
    accent: "from-violet-600 to-fuchsia-600",
    soft: "border-violet-200 bg-violet-50 text-violet-700",
  };
}

function normalizeFormFromPerson(person: StaffUser): FormState {
  return {
    name: person.name ?? "",
    email: person.email ?? "",
    password: "",
    role: person.role === "manager" ? "manager" : "staff",
    phone: person.phone ?? "",
    whatsapp_phone: person.whatsapp_phone ?? "",
    bio: person.bio ?? "",
    show_in_public_team: person.show_in_public_team,
    is_bookable: person.is_bookable,
    location_id: person.location_id ?? "",
  };
}

export default function Staff() {
  const qc = useQueryClient();
  const { locale } = useLanguage();
  const text = staffCopy[locale];
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const vertical = String(user?.vertical ?? user?.business_type ?? "").toLowerCase();
  const isHealthcare = ["healthcare", "dental", "clinic", "medical", "doctor", "health"].includes(vertical);

  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(() => searchParams.get("new") === "1");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedLocationId, setSelectedLocationId] = useState<number | "">("");
  const [schedulePerson, setSchedulePerson] = useState<StaffUser | null>(null);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const settingsQ = useQuery({
    queryKey: ["business-settings"],
    queryFn: fetchBusinessSettings,
    staleTime: 60_000,
  });

  const staffQ = useQuery({
    queryKey: ["staff", selectedLocationId || "all"],
    queryFn: () => fetchStaff({ location_id: selectedLocationId ? Number(selectedLocationId) : undefined }),
  });

  const createMut = useMutation({
    mutationFn: createStaff,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["staff"] }),
        qc.invalidateQueries({ queryKey: ["business-settings"] }),
      ]);
    },
  });

  const deactivateMut = useMutation({
    mutationFn: deactivateStaff,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["staff"] }),
        qc.invalidateQueries({ queryKey: ["business-settings"] }),
      ]);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateStaff>[1] }) => updateStaff(id, payload),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["staff"] }),
        qc.invalidateQueries({ queryKey: ["business-settings"] }),
      ]);
    },
  });

  const activateMut = useMutation({
    mutationFn: activateStaff,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["staff"] }),
        qc.invalidateQueries({ queryKey: ["business-settings"] }),
      ]);
    },
  });

  const staff = useMemo(() => staffQ.data ?? [], [staffQ.data]);
  const locations = useMemo(() => settingsQ.data?.locations ?? [], [settingsQ.data?.locations]);
  const usage = settingsQ.data?.usage;
  const staffSlotFull = usage?.staff_limit != null && usage.active_staff >= usage.staff_limit;
  const locationNameById = useMemo(() => new Map(locations.map((location) => [location.id, location.name || (location.is_primary ? text.primary : location.address)])), [locations, text.primary]);

  const hasMultipleLocations = locations.length > 1;
  const preferredLocationId = useMemo<number | "">(() => {
    if (selectedLocationId) return selectedLocationId;
    if (locations.length === 1) return locations[0].id;
    return "";
  }, [locations, selectedLocationId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;

    return staff.filter((s: StaffUser) => {
      return (
        (s.name ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.phone ?? "").toLowerCase().includes(q) ||
        (s.whatsapp_phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [staff, search]);

  const totals = useMemo(() => {
    const active = filtered.filter((item) => item.is_active).length;
    const publicCount = filtered.filter((item) => item.show_in_public_team).length;
    const bookable = filtered.filter((item) => item.is_bookable).length;
    return { active, publicCount, bookable };
  }, [filtered]);

  function closePanel() {
    setPanelOpen(false);
    setMode("create");
    setEditingId(null);
    setShowPassword(false);
    setFormError(null);
    setForm({ ...emptyForm, location_id: preferredLocationId });
  }

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setShowPassword(false);
    setFormError(null);
    setForm({ ...emptyForm, location_id: preferredLocationId });
    setPanelOpen(true);
  }

  function openEdit(person: StaffUser) {
    setMode("edit");
    setEditingId(person.id);
    setShowPassword(false);
    setFormError(null);
    setForm({ ...normalizeFormFromPerson(person), location_id: person.location_id ?? preferredLocationId });
    setPanelOpen(true);
  }

  async function openSchedule(person: StaffUser) {
    setSchedulePerson(person);
    setScheduleDays([]);
    setScheduleError(null);
    setScheduleLoading(true);
    try {
      const response = await fetchStaffSchedule(person.id);
      setScheduleDays(completeSchedule(response.days));
    } catch (error: unknown) {
      setScheduleDays(completeSchedule([]));
      setScheduleError(getErrorMessage(error, text.scheduleLoadFailed));
    } finally {
      setScheduleLoading(false);
    }
  }

  function closeSchedule() {
    if (scheduleSaving) return;
    setSchedulePerson(null);
    setScheduleDays([]);
    setScheduleError(null);
  }

  function updateScheduleDay(weekday: number, payload: Partial<ScheduleDay>) {
    setScheduleDays((current) => current.map((day) => day.weekday === weekday ? { ...day, ...payload } : day));
  }

  async function saveSchedule() {
    if (!schedulePerson) return;
    setScheduleError(null);

    const invalidDay = scheduleDays.find((day) => !day.is_closed && (!day.start || !day.end || day.start >= day.end));
    if (invalidDay) {
      setScheduleError(text.invalidHours.replace("{day}", dayNames[locale][invalidDay.weekday - 1]));
      return;
    }

    const invalidBreak = scheduleDays.find((day) => {
      if (day.is_closed) return false;
      const hasBreakStart = Boolean(day.break_start);
      const hasBreakEnd = Boolean(day.break_end);
      if (hasBreakStart !== hasBreakEnd) return true;
      if (!hasBreakStart || !hasBreakEnd || !day.start || !day.end) return false;
      return day.break_start! >= day.break_end! || day.break_start! < day.start || day.break_end! > day.end;
    });
    if (invalidBreak) {
      setScheduleError(text.invalidBreak.replace("{day}", dayNames[locale][invalidBreak.weekday - 1]));
      return;
    }

    setScheduleSaving(true);
    try {
      await updateStaffSchedule(schedulePerson.id, { days: scheduleDays });
      setSchedulePerson(null);
      setScheduleDays([]);
    } catch (error: unknown) {
      setScheduleError(getErrorMessage(error, text.scheduleSaveFailed));
    } finally {
      setScheduleSaving(false);
    }
  }

  function applyRolePreset(nextRole: StaffRoleForm) {
    const preset = rolePreset(nextRole, text, isHealthcare);
    setForm((prev) => {
      const shouldAutoApplyManagerPreset = nextRole === "manager" && prev.role === "staff" && prev.show_in_public_team && prev.is_bookable;
      const shouldAutoApplyStaffPreset = nextRole === "staff" && prev.role === "manager" && !prev.show_in_public_team && !prev.is_bookable;

      return {
        ...prev,
        role: nextRole,
        show_in_public_team: shouldAutoApplyManagerPreset || shouldAutoApplyStaffPreset ? preset.show_in_public_team : prev.show_in_public_team,
        is_bookable: shouldAutoApplyManagerPreset || shouldAutoApplyStaffPreset ? preset.is_bookable : prev.is_bookable,
      };
    });
  }

  async function submit() {
    setFormError(null);

    if (!form.name.trim()) {
      setFormError(text.nameRequired);
      return;
    }

    if (mode === "create") {
      if (!form.email.trim()) {
        setFormError(text.emailRequired);
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
        setFormError(text.emailInvalid);
        return;
      }
      if (form.password.length < 8) {
        setFormError(text.passwordShort);
        return;
      }
      if (form.role === "staff" && staffSlotFull) {
        setFormError(text.staffLimitError);
        return;
      }
    }

    if (hasMultipleLocations && form.location_id === "") {
      setFormError(text.branchRequired);
      return;
    }

    try {
      if (mode === "create") {
        await createMut.mutateAsync({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          phone: form.phone.trim() || null,
          whatsapp_phone: form.whatsapp_phone.trim() || null,
          bio: form.bio.trim() || null,
          show_in_public_team: form.show_in_public_team,
          is_bookable: form.is_bookable,
          location_id: form.location_id === "" ? (preferredLocationId === "" ? null : Number(preferredLocationId)) : Number(form.location_id),
        });
      } else if (editingId) {
        await updateMut.mutateAsync({
          id: editingId,
          payload: {
            name: form.name.trim(),
            role: form.role,
            phone: form.phone.trim() || null,
            whatsapp_phone: form.whatsapp_phone.trim() || null,
            bio: form.bio.trim() || null,
            show_in_public_team: form.show_in_public_team,
            is_bookable: form.is_bookable,
            location_id: form.location_id === "" ? (preferredLocationId === "" ? null : Number(preferredLocationId)) : Number(form.location_id),
          },
        });
      }

      closePanel();
    } catch (error: unknown) {
      setFormError(getErrorMessage(error, text.saveFailed));
    }
  }

  const isSubmitting = createMut.isPending || updateMut.isPending;
  const currentPreset = rolePreset(form.role, text, isHealthcare);
  const CurrentPresetIcon = currentPreset.icon;

  return (
    <motion.div {...page} className="admin-page space-y-4">
      <section className="relative overflow-hidden rounded-[28px] border border-[#d39a43]/25 bg-[radial-gradient(circle_at_91%_10%,rgba(232,194,174,.70),transparent_30%),linear-gradient(135deg,#fffdf9_0%,#f8eee4_68%,#f0ddcf_100%)] p-5 shadow-[0_22px_65px_rgba(70,34,49,.09)] dark:border-[#e7bc6b]/15 dark:bg-[radial-gradient(circle_at_90%_0%,rgba(109,42,99,.34),transparent_32%),linear-gradient(135deg,#2f182e,#1d121f)] sm:p-8">
        <div className="absolute -bottom-24 -right-16 h-60 w-60 rounded-full border border-[#d39a43]/20" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d39a43]/25 bg-white/65 px-3 py-1.5 text-xs font-bold text-[#6d2a63] backdrop-blur dark:bg-white/8 dark:text-[#efcb87]">
              {isHealthcare ? <Stethoscope className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {isHealthcare ? text.medicalBadge : text.badge}
            </span>
            <h1 className="mt-4 font-serif text-[2rem] font-semibold tracking-[-.035em] text-[#2b0d35] dark:text-[#fff8f2] sm:text-[2.7rem]">{isHealthcare ? text.medicalTitle : text.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#746777] dark:text-[#cbbdca] sm:text-base">{isHealthcare ? text.medicalIntro : text.intro}</p>
          </div>
          <button type="button" onClick={openCreate} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2b0d35] to-[#6d2a63] px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(74,22,74,.2)] transition hover:-translate-y-0.5">
            <Plus className="h-4 w-4" />{isHealthcare ? text.addDoctor : text.add}
          </button>
        </div>
      </section>

      {usage ? (
        <Card className="rounded-[24px] border border-[#d39a43]/20 bg-[#fffdf9]/95 p-4 shadow-[0_14px_36px_rgba(70,34,49,.06)] dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90 sm:p-5">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="rounded-full border border-[#d39a43]/25 bg-[#f8eee4] px-3 py-1 font-semibold text-[#6d2a63] dark:bg-white/8 dark:text-[#efcb87]">{settingsQ.data?.plan?.name ?? "Plan"}</span>
            <span>{text.activeStaff}՝ <strong className="text-slate-950">{usage.active_staff}</strong> / <strong className="text-slate-950">{usage.staff_limit ?? "∞"}</strong></span>
            <span>{text.services}՝ <strong className="text-slate-950">{usage.services_count}</strong> / <strong className="text-slate-950">{usage.services_limit ?? "∞"}</strong></span>
            <span>{text.locations}՝ <strong className="text-slate-950">{usage.locations_count}</strong> / <strong className="text-slate-950">{usage.locations_limit}</strong></span>
          </div>
          {staffSlotFull ? <div className="mt-3 text-sm text-amber-700">{text.limitReached} <Link to="/app/billing" className="font-semibold underline underline-offset-4">{text.seePlans}</Link></div> : null}
        </Card>
      ) : null}

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { label: text.activeMembers, value: totals.active, icon: Users, tone: "text-[#6d2a63]" },
          { label: text.publicMembers, value: totals.publicCount, icon: Globe2, tone: "text-[#a66f28]" },
          { label: text.bookableMembers, value: totals.bookable, icon: CalendarCheck2, tone: "text-emerald-700" },
        ].map((item) => (
          <motion.div key={item.label} variants={card} initial="initial" animate="animate" transition={cardTransition}>
            <Card className="rounded-[24px] border border-[#d39a43]/18 bg-[#fffdf9]/95 p-5 shadow-[0_14px_36px_rgba(70,34,49,.06)] dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</div>
                </div>
                <div className={cn("grid h-11 w-11 place-items-center rounded-2xl bg-slate-50", item.tone)}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
        <Card className="rounded-[24px] border border-[#d39a43]/18 bg-[#fffdf9]/95 p-5 shadow-sm dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90">
          <div className="flex flex-col gap-3">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={text.search}
                  className="pl-11 pr-4"
                />
              </div>
              {locations.length > 1 ? (
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : "")}
                  className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">{text.allLocations}</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>{location.name || (location.is_primary ? text.primary : location.address)}</option>
                  ))}
                </select>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <div className="bb-stat-pill">{text.total} {filtered.length} {text.members}</div>
              <div className="bb-stat-pill">{totals.publicCount} {text.publicShort}</div>
              <div className="bb-stat-pill">{totals.bookable} {text.bookableShort}</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {staffQ.isError ? (
        <Card className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <div className="font-semibold">{text.loadFailed}</div>
          <p className="mt-1 text-sm leading-6">{getErrorMessage(staffQ.error, text.loadHint)}</p>
          <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => staffQ.refetch()}>{text.retry}</Button><Link to="/app/billing" className="inline-flex items-center rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold">{text.planStatus}</Link></div>
        </Card>
      ) : staffQ.isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[280px] animate-pulse rounded-[28px] border border-slate-200 bg-white/80" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="sm:col-span-2 2xl:col-span-3">
              <EmptyState
                icon={Users}
                title={text.emptyTitle}
                description={search ? text.emptySearch : isHealthcare ? text.emptyMedical : text.emptyText}
                action={!search ? (
                  <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {isHealthcare ? text.addDoctor : text.add}
                  </Button>
                ) : undefined}
              />
            </div>
          ) : filtered.map((person) => {
            const role = roleUi(person.role);

            return (
              <motion.div key={person.id} variants={card} initial="initial" animate="animate" transition={cardTransition}>
                <Card className="rounded-[26px] border border-[#d39a43]/18 bg-[#fffdf9]/95 p-5 shadow-[0_16px_42px_rgba(70,34,49,.07)] dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]/90">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#2b0d35] to-[#6d2a63] text-white shadow-lg">
                        {person.avatar_url ? (
                          <img src={person.avatar_url} alt={person.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center"><Users className="h-5 w-5" /></div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-slate-950">{person.name}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium", role.cls)}>
                            {role.icon}
                            {roleLabel(person.role, text, isHealthcare)}
                          </div>
                          <div className={cn(
                            "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium",
                            person.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"
                          )}>
                            {person.is_active ? text.active : text.inactive}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <Button variant="secondary" size="sm" className="gap-2 rounded-2xl" onClick={() => openSchedule(person)}>
                        <Clock3 className="h-4 w-4" />
                        {text.schedule}
                      </Button>
                      {person.role !== "owner" ? (
                        <Button variant="secondary" size="sm" className="gap-2 rounded-2xl" onClick={() => openEdit(person)}>
                          <Pencil className="h-4 w-4" />
                          {text.edit}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", person.show_in_public_team ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                      <Globe2 className="mr-1 h-3.5 w-3.5" />
                      {person.show_in_public_team ? text.publicVisible : text.publicHidden}
                    </div>
                    <div className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", person.is_bookable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                      <CalendarCheck2 className="mr-1 h-3.5 w-3.5" />
                      {person.is_bookable ? text.bookingOn : text.bookingOff}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{person.email || text.noEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{person.phone || text.noPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="truncate">{person.whatsapp_phone || text.noWhatsapp}</span>
                    </div>
                    {person.bio ? (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs leading-6 text-slate-600">{person.bio}</div>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-3">
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-violet-500" /> {text.publicSetting}</span>
                      <input
                        type="checkbox"
                        checked={person.show_in_public_team}
                        onChange={(e) => updateMut.mutate({ id: person.id, payload: { show_in_public_team: e.target.checked, is_bookable: e.target.checked ? person.is_bookable : false } })}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <span className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4 text-emerald-500" /> {text.bookingSetting}</span>
                      <input
                        type="checkbox"
                        checked={person.is_bookable}
                        onChange={(e) => updateMut.mutate({ id: person.id, payload: { is_bookable: e.target.checked, show_in_public_team: e.target.checked ? true : person.show_in_public_team } })}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </label>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50">
                      {updateMut.isPending ? <Spinner size={16} /> : <ImagePlus className="h-4 w-4" />}
                      {text.photo}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadMedia(file, "staff");
                          updateMut.mutate({ id: person.id, payload: { avatar_url: url } });
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>

                    {person.role === "owner" ? null : person.is_active ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const ok = window.confirm(text.deactivateConfirm.replace("{name}", person.name));
                          if (ok) deactivateMut.mutate(person.id);
                        }}
                        className="w-full gap-2 rounded-2xl border border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        <Ban className="h-4 w-4" />
                        {text.deactivate}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => activateMut.mutate(person.id)}
                        className="w-full gap-2 rounded-2xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {text.activate}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {panelOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 backdrop-blur-sm" onClick={closePanel}>
            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl rounded-t-[28px] border border-white/20 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:rounded-[30px] sm:p-8"
              >
                {/* Mobile drag handle */}
                <div className="mb-4 flex justify-center sm:hidden">
                  <div className="h-1 w-10 rounded-full bg-slate-300" />
                </div>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {mode === "create"
                        ? (isHealthcare ? text.newDoctorTitle : text.newTitle)
                        : (isHealthcare ? text.editDoctorTitle : text.editTitle)}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      {mode === "create" ? (isHealthcare ? text.createMedicalIntro : text.createIntro) : text.editIntro}
                    </p>
                  </div>

                  <div className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium", currentPreset.soft)}>
                    <CurrentPresetIcon className="h-4 w-4" />
                    {currentPreset.title}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(["staff", "manager"] as StaffRoleForm[]).map((role) => {
                        const preset = rolePreset(role, text, isHealthcare);
                        const Icon = preset.icon;
                        const active = form.role === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => applyRolePreset(role)}
                            className={cn(
                              "rounded-[24px] border px-4 py-4 text-left transition",
                              active ? "border-transparent bg-slate-950 text-white shadow-lg" : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50"
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className={cn("grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br text-white", preset.accent)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              {active ? <CheckCircle2 className="h-4 w-4" /> : null}
                            </div>
                            <div className="mt-3 text-sm font-semibold">{preset.title}</div>
                            <div className={cn("mt-2 text-xs leading-6", active ? "text-white/75" : "text-slate-500")}>{preset.description}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">{text.name}</label>
                        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                      </div>

                      {mode === "create" ? (
                        <>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">{text.email}</label>
                            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">{text.password}</label>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                className="pr-12"
                              />
                              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : null}

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">{text.phone}</label>
                        <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">WhatsApp</label>
                        <Input value={form.whatsapp_phone} onChange={(e) => setForm((p) => ({ ...p, whatsapp_phone: e.target.value }))} />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">{text.branch}</label>
                        <select
                          value={form.location_id}
                          onChange={(e) => setForm((p) => ({ ...p, location_id: e.target.value ? Number(e.target.value) : "" }))}
                          className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                        >
                          {hasMultipleLocations ? <option value="" disabled>{text.chooseBranch}</option> : null}
                          {locations.map((location) => (
                            <option key={location.id} value={location.id}>{location.name || (location.is_primary ? text.primary : location.address)}</option>
                          ))}
                        </select>
                        {hasMultipleLocations ? (
                          <p className="mt-2 text-xs text-slate-500">{text.branchHint}</p>
                        ) : null}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">{text.bio}</label>
                        <textarea
                          value={form.bio}
                          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                          rows={4}
                          className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                          placeholder={text.bioPlaceholder}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Info className="h-4 w-4 text-violet-500" />
                        {text.accessTitle}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {text.accessText}
                      </p>

                      <div className="mt-4 grid gap-3">
                        <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          <span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-violet-500" /> {text.publicSetting}</span>
                          <input
                            type="checkbox"
                            checked={form.show_in_public_team}
                            onChange={(e) => setForm((p) => ({ ...p, show_in_public_team: e.target.checked, is_bookable: e.target.checked ? p.is_bookable : false }))}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />
                        </label>

                        <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          <span className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4 text-emerald-500" /> {text.bookingSetting}</span>
                          <input
                            type="checkbox"
                            checked={form.is_bookable}
                            onChange={(e) => setForm((p) => ({ ...p, is_bookable: e.target.checked, show_in_public_team: e.target.checked ? true : p.show_in_public_team }))}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Star className="h-4 w-4 text-amber-500" />
                        {text.preview}
                      </div>
                      <div className="mt-4 rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
                        <div className="text-base font-semibold text-slate-900">{form.name || text.nameMissing}</div>
                        <div className="mt-1 text-sm text-slate-500">{currentPreset.title}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium", form.show_in_public_team ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                            <Globe2 className="h-3.5 w-3.5" /> {form.show_in_public_team ? text.publicVisible : text.publicHidden}
                          </span>
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium", form.is_bookable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                            <CalendarCheck2 className="h-3.5 w-3.5" /> {form.is_bookable ? text.bookingOn : text.bookingOff}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
                            {form.location_id === "" ? text.allBranches : (locationNameById.get(Number(form.location_id)) ?? `#${form.location_id}`)}
                          </span>
                        </div>
                        {form.bio ? <div className="mt-3 text-sm leading-6 text-slate-500">{form.bio}</div> : null}
                      </div>
                    </div>
                  </div>
                </div>

                {formError ? (
                  <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
                ) : null}

                {mode === "create" && form.role === "staff" && staffSlotFull ? (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{text.staffSlotFull} <Link to="/app/billing" className="font-semibold underline underline-offset-4">{text.seePlans}</Link></div>
                ) : null}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={closePanel} className="rounded-2xl">{text.close}</Button>
                  <Button onClick={submit} disabled={isSubmitting || (mode === "create" && form.role === "staff" && staffSlotFull)} className="rounded-2xl">
                    {isSubmitting ? <Spinner size={16} /> : mode === "create" ? text.create : text.save}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {schedulePerson ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:p-4" onClick={closeSchedule}>
            <div className="flex min-h-full items-end justify-center sm:items-center">
              <motion.div
                initial={{ opacity: 0, y: 38, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 28, scale: 0.98 }}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-4xl rounded-t-[30px] border border-white/30 bg-white/95 p-5 shadow-[0_28px_90px_rgba(31,15,36,0.24)] sm:rounded-[32px] sm:p-7"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"><Clock3 className="h-3.5 w-3.5" /> {text.scheduleBadge}</div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{schedulePerson.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{text.scheduleText}</p>
                  </div>
                  <button type="button" onClick={closeSchedule} disabled={scheduleSaving} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" aria-label={text.close}><X className="h-4 w-4" /></button>
                </div>

                {scheduleError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{scheduleError}</div> : null}

                {scheduleLoading ? (
                  <div className="grid min-h-[280px] place-items-center text-sm text-slate-500"><span className="inline-flex items-center gap-2"><Spinner size={16} /> {text.scheduleLoading}</span></div>
                ) : (
                  <div className="mt-5 grid gap-3">
                    {scheduleDays.map((day) => (
                      <div key={day.weekday} className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-[150px_104px_repeat(4,minmax(105px,1fr))] lg:items-end">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{dayNames[locale][day.weekday - 1]}</div>
                          <div className="mt-1 text-xs text-slate-500">{day.is_closed ? text.closedDay : text.workDay}</div>
                        </div>
                        <label className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-slate-600">
                          <input
                            type="checkbox"
                            checked={day.is_closed}
                            onChange={(event) => updateScheduleDay(day.weekday, { is_closed: event.target.checked, start: event.target.checked ? null : (day.start || "09:00"), end: event.target.checked ? null : (day.end || "18:00") })}
                            className="h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-500"
                          />
                          {text.closed}
                        </label>
                        {([
                          { key: "start", label: text.start, value: day.start },
                          { key: "end", label: text.end, value: day.end },
                          { key: "break_start", label: text.breakStart, value: day.break_start },
                          { key: "break_end", label: text.breakEnd, value: day.break_end },
                        ] as const).map((field) => (
                          <label key={field.key} className="grid gap-1.5 text-[11px] font-semibold text-slate-500">
                            {field.label}
                            <input
                              type="time"
                              value={field.value ?? ""}
                              disabled={day.is_closed}
                              onChange={(event) => updateScheduleDay(day.weekday, { [field.key]: event.target.value || null } as Partial<ScheduleDay>)}
                              className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none disabled:cursor-not-allowed disabled:opacity-45"
                            />
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={closeSchedule} disabled={scheduleSaving} className="rounded-2xl">{text.close}</Button>
                  <Button onClick={saveSchedule} disabled={scheduleLoading || scheduleSaving || scheduleDays.length !== 7} className="gap-2 rounded-2xl">
                    {scheduleSaving ? <Spinner size={16} /> : <Clock3 className="h-4 w-4" />}
                    {text.saveSchedule}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
