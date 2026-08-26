import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
    Plus,
    Scissors,
    Pencil,
    Trash2,
    Clock3,
    Wallet,
    Loader2,
    CheckCircle2,
    Search,
    ImagePlus,
    Stethoscope,
} from "lucide-react";

import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Toast } from "../components/ui/Toast";
import {
    fetchServices,
    createService,
    updateService,
    deleteService,
    type Service,
} from "../lib/servicesApi";
import { cn } from "../lib/cn";
import {Spinner} from "@/components/ui/Spinner.tsx";
import { uploadMedia } from "../lib/mediaApi";
import { fetchBusinessSettings } from "../lib/businessSettingsApi";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { useAuth } from "../store/auth";

const serviceCopy = {
    hy: {
        created: "Ծառայությունը ստեղծվեց", createFailed: "Չհաջողվեց ստեղծել ծառայությունը", updated: "Ծառայությունը թարմացվեց", updateFailed: "Չհաջողվեց թարմացնել ծառայությունը", deleted: "Ծառայությունը ջնջվեց", deleteFailed: "Չհաջողվեց ջնջել ծառայությունը",
        primary: "Գլխավոր հասցե", locationRequired: "Մի քանի հասցե ունենալու դեպքում ծառայությունը կապեք կոնկրետ մասնաճյուղի։",
        badge: "Ծառայությունների կառավարում", medicalBadge: "Բժշկական ծառայություններ", title: "Կառավարեք ծառայությունները պարզ ու պրոֆեսիոնալ միջավայրում", medicalTitle: "Բժշկական ծառայությունները՝ մեկ հստակ միջավայրում",
        intro: "Ստեղծեք և խմբագրեք ծառայությունները՝ տևողությամբ, գնով ու ակտիվ կարգավիճակով։", medicalIntro: "Ավելացրեք խորհրդատվությունները, հետազոտությունները և բուժական ծառայությունները՝ տևողությամբ, գնով ու մասնաճյուղով։",
        allLocations: "Բոլոր հասցեները", add: "Ավելացնել ծառայություն", planLimitTitle: "Պլանի ծառայությունների սահմանաչափը լրացել է", listTitle: "Ծառայությունների ցուցակ", listText: "Ակտիվ և ոչ ակտիվ ծառայությունները մեկ վայրում", search: "Փնտրել ծառայություն…",
        services: "Ծառայություններ", locations: "Հասցեներ", specialists: "Մասնագետներ", limitReached: "Ծառայությունների սահմանաչափը լրացել է։", seePlans: "Տեսնել պլանները",
        loadFailed: "Չհաջողվեց բեռնել ծառայությունները", loadHint: "Ստուգեք պլանի կարգավիճակը կամ կրկին փորձեք։", retry: "Կրկին փորձել", planStatus: "Պլանի կարգավիճակ", loading: "Բեռնում ենք ծառայությունները…",
        emptyTitle: "Ծառայություններ չկան", emptyText: "Ավելացրեք առաջին ծառայությունը, որպեսզի սկսեք առցանց գրանցումները։", allBranches: "Բոլոր հասցեների համար", active: "Ակտիվ", inactive: "Ոչ ակտիվ", minutes: "րոպե", noPrice: "Գին նշված չէ", edit: "Խմբագրել", deleteConfirm: "Վստա՞հ եք, որ ուզում եք ջնջել ծառայությունը։",
        editTitle: "Խմբագրել ծառայությունը", newTitle: "Նոր ծառայություն", formText: "Լրացրեք ծառայության անունը, տևողությունը և գինը։", name: "Անուն", namePlaceholder: "օր․ Սրտաբանի խորհրդատվություն", description: "Նկարագրություն", descriptionPlaceholder: "Օր․ խորհրդատվություն, զննում և անհատական բուժման պլան…", branch: "Հասցե / մասնաճյուղ", chooseBranch: "Ընտրեք հասցեն", branchHint: "Մի քանի մասնաճյուղ ունենալու դեպքում ընտրեք կոնկրետ հասցեն։", duration: "Տևողություն (րոպե)", price: "Գին", pricePlaceholder: "օր․ 15000", currency: "Արժույթ", status: "Կարգավիճակ", preview: "Նախադիտում", previewText: "Այսպես ծառայությունը կերևա ամրագրման էջում։", newService: "Նոր ծառայություն", activeService: "Ակտիվ ծառայություն", inactiveService: "Ոչ ակտիվ ծառայություն", image: "Նկար", changeImage: "Փոխել նկարը", uploadImage: "Բեռնել նկար", close: "Փակել", save: "Պահպանել փոփոխությունները", create: "Ստեղծել ծառայությունը",
    },
    ru: {
        created: "Услуга создана", createFailed: "Не удалось создать услугу", updated: "Услуга обновлена", updateFailed: "Не удалось обновить услугу", deleted: "Услуга удалена", deleteFailed: "Не удалось удалить услугу",
        primary: "Основной адрес", locationRequired: "При наличии нескольких адресов привяжите услугу к конкретному филиалу.",
        badge: "Управление услугами", medicalBadge: "Медицинские услуги", title: "Управляйте услугами в простом профессиональном пространстве", medicalTitle: "Все медицинские услуги в одном понятном пространстве",
        intro: "Создавайте и редактируйте услуги, длительность, цену и статус.", medicalIntro: "Добавляйте консультации, обследования и процедуры с длительностью, ценой и филиалом.",
        allLocations: "Все адреса", add: "Добавить услугу", planLimitTitle: "Лимит услуг по тарифу исчерпан", listTitle: "Список услуг", listText: "Активные и неактивные услуги в одном месте", search: "Найти услугу…",
        services: "Услуги", locations: "Адреса", specialists: "Специалисты", limitReached: "Лимит услуг исчерпан.", seePlans: "Посмотреть тарифы",
        loadFailed: "Не удалось загрузить услуги", loadHint: "Проверьте тариф или попробуйте еще раз.", retry: "Повторить", planStatus: "Статус тарифа", loading: "Загружаем услуги…",
        emptyTitle: "Услуг пока нет", emptyText: "Добавьте первую услугу, чтобы начать онлайн-запись.", allBranches: "Для всех адресов", active: "Активна", inactive: "Неактивна", minutes: "мин", noPrice: "Цена не указана", edit: "Изменить", deleteConfirm: "Удалить эту услугу?",
        editTitle: "Редактировать услугу", newTitle: "Новая услуга", formText: "Укажите название, длительность и цену услуги.", name: "Название", namePlaceholder: "напр. Консультация кардиолога", description: "Описание", descriptionPlaceholder: "Напр. консультация, осмотр и индивидуальный план лечения…", branch: "Адрес / филиал", chooseBranch: "Выберите адрес", branchHint: "Для нескольких филиалов выберите конкретный адрес.", duration: "Длительность (мин)", price: "Цена", pricePlaceholder: "напр. 15000", currency: "Валюта", status: "Статус", preview: "Предпросмотр", previewText: "Так услуга будет выглядеть на странице записи.", newService: "Новая услуга", activeService: "Активная услуга", inactiveService: "Неактивная услуга", image: "Изображение", changeImage: "Заменить", uploadImage: "Загрузить", close: "Закрыть", save: "Сохранить изменения", create: "Создать услугу",
    },
    en: {
        created: "Service created", createFailed: "Could not create the service", updated: "Service updated", updateFailed: "Could not update the service", deleted: "Service deleted", deleteFailed: "Could not delete the service",
        primary: "Primary address", locationRequired: "When you have multiple locations, assign the service to a specific branch.",
        badge: "Service management", medicalBadge: "Medical services", title: "Manage services in one clear professional workspace", medicalTitle: "All medical services in one clear workspace",
        intro: "Create and edit services, duration, price and availability.", medicalIntro: "Add consultations, examinations and treatments with a duration, price and location.",
        allLocations: "All locations", add: "Add service", planLimitTitle: "Your plan's service limit has been reached", listTitle: "Service list", listText: "Active and inactive services in one place", search: "Search services…",
        services: "Services", locations: "Locations", specialists: "Specialists", limitReached: "The service limit has been reached.", seePlans: "View plans",
        loadFailed: "Could not load services", loadHint: "Check the plan status or try again.", retry: "Try again", planStatus: "Plan status", loading: "Loading services…",
        emptyTitle: "No services yet", emptyText: "Add the first service to start accepting online bookings.", allBranches: "Available at all locations", active: "Active", inactive: "Inactive", minutes: "min", noPrice: "Price not set", edit: "Edit", deleteConfirm: "Delete this service?",
        editTitle: "Edit service", newTitle: "New service", formText: "Enter the service name, duration and price.", name: "Name", namePlaceholder: "e.g. Cardiology consultation", description: "Description", descriptionPlaceholder: "e.g. consultation, examination and a personalized care plan…", branch: "Address / location", chooseBranch: "Choose a location", branchHint: "Choose a specific address when there are multiple locations.", duration: "Duration (minutes)", price: "Price", pricePlaceholder: "e.g. 15000", currency: "Currency", status: "Status", preview: "Preview", previewText: "This is how the service appears on the booking page.", newService: "New service", activeService: "Active service", inactiveService: "Inactive service", image: "Image", changeImage: "Change image", uploadImage: "Upload image", close: "Close", save: "Save changes", create: "Create service",
    },
} as const;

function numberLocale(locale: Locale) {
    return locale === "hy" ? "hy-AM" : locale === "ru" ? "ru-RU" : "en-US";
}

type ToastState = {
    open: boolean;
    text: string;
    type: "success" | "error";
};

type ServiceForm = {
    name: string;
    description: string;
    duration_minutes: number;
    price: number | "";
    currency: string;
    image_url?: string | null;
    is_active: boolean;
    location_id: number | "";
};

const initialForm: ServiceForm = {
    name: "",
    description: "",
    duration_minutes: 30,
    price: "",
    currency: "AMD",
    image_url: null,
    is_active: true,
    location_id: "",
};

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

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        return response?.data?.message || fallback;
    }
    return fallback;
}

export default function ServicesPage() {
    const queryClient = useQueryClient();
    const { locale } = useLanguage();
    const text = serviceCopy[locale];
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const vertical = String(user?.vertical ?? user?.business_type ?? "").toLowerCase();
    const isHealthcare = ["healthcare", "dental", "clinic", "medical", "doctor", "health"].includes(vertical);

    const [toast, setToast] = useState<ToastState>({
        open: false,
        text: "",
        type: "success",
    });

    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(() => searchParams.get("new") === "1");
    const [editing, setEditing] = useState<Service | null>(null);
    const [form, setForm] = useState<ServiceForm>(initialForm);
    const [selectedLocationId, setSelectedLocationId] = useState<number | "">("");

    const settingsQ = useQuery({
        queryKey: ["business-settings"],
        queryFn: fetchBusinessSettings,
        staleTime: 60_000,
    });

    const servicesQ = useQuery({
        queryKey: ["services", selectedLocationId || "all"],
        queryFn: () => fetchServices({ location_id: selectedLocationId ? Number(selectedLocationId) : undefined }),
        staleTime: 20_000,
    });

    const createMut = useMutation({
        mutationFn: createService,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["services"] }),
                queryClient.invalidateQueries({ queryKey: ["business-settings"] }),
            ]);
            setToast({ open: true, text: `${text.created} ✓`, type: "success" });
            setShowForm(false);
            setForm({ ...initialForm, location_id: preferredLocationId });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
        },
        onError: (error: unknown) => {
            setToast({ open: true, text: getErrorMessage(error, text.createFailed), type: "error" });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2400);
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateService>[1] }) => updateService(id, payload),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["services"] }),
                queryClient.invalidateQueries({ queryKey: ["business-settings"] }),
            ]);
            setToast({ open: true, text: `${text.updated} ✓`, type: "success" });
            setShowForm(false);
            setEditing(null);
            setForm({ ...initialForm, location_id: preferredLocationId });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
        },
        onError: (error: unknown) => {
            setToast({ open: true, text: getErrorMessage(error, text.updateFailed), type: "error" });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2400);
        },
    });

    const uploadImageMut = useMutation({
        mutationFn: async ({ serviceId, file }: { serviceId: number; file: File }) => {
            const image_url = await uploadMedia(file, "services");
            return updateService(serviceId, { image_url });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });

    const deleteMut = useMutation({
        mutationFn: deleteService,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["services"] }),
                queryClient.invalidateQueries({ queryKey: ["business-settings"] }),
            ]);
            setToast({ open: true, text: `${text.deleted} ✓`, type: "success" });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
        },
        onError: (error: unknown) => {
            setToast({ open: true, text: getErrorMessage(error, text.deleteFailed), type: "error" });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2400);
        },
    });

    const locations = useMemo(() => settingsQ.data?.locations ?? [], [settingsQ.data?.locations]);
    const serviceUsage = settingsQ.data?.usage;
    const serviceLimitReached = serviceUsage?.services_limit != null && serviceUsage.services_count >= serviceUsage.services_limit;
    const locationNameById = useMemo(() => new Map(locations.map((location) => [location.id, location.name || (location.is_primary ? text.primary : location.address)])), [locations, text.primary]);

    const hasMultipleLocations = locations.length > 1;
    const preferredLocationId: number | "" = (() => {
        if (selectedLocationId) return selectedLocationId;
        if (locations.length === 1) return locations[0].id;
        return "";
    })();

    const services = useMemo(() => {
        const rows = servicesQ.data ?? [];
        if (!search.trim()) return rows;
        const q = search.toLowerCase().trim();
        return rows.filter((item) => item.name.toLowerCase().includes(q));
    }, [servicesQ.data, search]);

    function openCreate() {
        setEditing(null);
        setForm({ ...initialForm, location_id: preferredLocationId });
        setShowForm(true);
    }

    function openEdit(service: Service) {
        setEditing(service);
        setForm({
            name: service.name,
            description: service.description ?? "",
            duration_minutes: service.duration_minutes,
            price: service.price ?? "",
            currency: service.currency ?? "AMD",
            image_url: service.image_url ?? null,
            is_active: service.is_active,
            location_id: service.location_id ?? preferredLocationId,
        });
        setShowForm(true);
    }

    function submitForm() {
        if (hasMultipleLocations && form.location_id === "") {
            setToast({ open: true, text: text.locationRequired, type: "error" });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2400);
            return;
        }

        const payload = {
            name: form.name,
            description: form.description.trim() || null,
            duration_minutes: Number(form.duration_minutes),
            price: form.price === "" ? null : Number(form.price),
            currency: form.currency,
            image_url: form.image_url ?? null,
            is_active: form.is_active,
            location_id: form.location_id === "" ? (preferredLocationId === "" ? null : Number(preferredLocationId)) : Number(form.location_id),
        };

        if (editing) {
            updateMut.mutate({ id: editing.id, payload });
        } else {
            createMut.mutate(payload);
        }
    }

    const busy = createMut.isPending || updateMut.isPending;

    return (
        <>
            <Toast open={toast.open} text={toast.text} type={toast.type} />

            <motion.div {...page} className="admin-page space-y-4">
                <SectionCard className="overflow-hidden border-[#d39a43]/25 bg-[radial-gradient(circle_at_top_right,rgba(232,194,174,0.58),transparent_35%),linear-gradient(135deg,#fffdf9,#f8eee4)] p-5 dark:bg-[radial-gradient(circle_at_top_right,rgba(109,42,99,0.34),transparent_35%),#2f182e] sm:p-8">
                    <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#d39a43]/30 bg-white/65 px-3 py-1.5 text-xs font-semibold text-[#6d2a63] dark:bg-white/10 dark:text-[#efcb87]">
                                {isHealthcare ? <Stethoscope className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
                                {isHealthcare ? text.medicalBadge : text.badge}
                            </div>

                            <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-4xl xl:text-[44px]">
                                {isHealthcare ? text.medicalTitle : text.title}
                            </h1>

                            <p className="mt-3 text-base leading-8 text-slate-600">
                                {isHealthcare ? text.medicalIntro : text.intro}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {locations.length > 1 ? (
                                <select
                                    value={selectedLocationId}
                                    onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : "")}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                >
                                    <option value="">{text.allLocations}</option>
                                    {locations.map((location) => (
                                        <option key={location.id} value={location.id}>{location.name || (location.is_primary ? text.primary : location.address)}</option>
                                    ))}
                                </select>
                            ) : null}
                            <Button onClick={openCreate} className="gap-2" disabled={serviceLimitReached} title={serviceLimitReached ? text.planLimitTitle : undefined}>
                                <Plus size={16} />
                                {text.add}
                            </Button>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-lg font-semibold text-slate-950">{text.listTitle}</div>
                            <div className="mt-1 text-sm text-slate-500">
                                {text.listText}
                            </div>
                        </div>

                        <div className="relative w-full max-w-sm">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={text.search}
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                    </div>

                    {serviceUsage ? (
                        <div className="mt-6 mb-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-medium text-violet-700">
                                    {settingsQ.data?.plan?.name ?? 'Plan'}
                                </span>
                                <span>{text.services}: <strong className="text-slate-950">{serviceUsage.services_count}</strong> / <strong className="text-slate-950">{serviceUsage.services_limit ?? '∞'}</strong></span>
                                <span>{text.locations}: <strong className="text-slate-950">{serviceUsage.locations_count}</strong> / <strong className="text-slate-950">{serviceUsage.locations_limit}</strong></span>
                                <span>{text.specialists}: <strong className="text-slate-950">{serviceUsage.active_staff}</strong> / <strong className="text-slate-950">{serviceUsage.staff_limit ?? '∞'}</strong></span>
                            </div>
                            {serviceLimitReached ? <div className="mt-2 flex flex-wrap items-center gap-2 text-rose-600">{text.limitReached} <Link to="/app/billing" className="font-semibold underline underline-offset-4">{text.seePlans}</Link></div> : null}
                        </div>
                    ) : null}

                    <div className="mt-6">
                        {servicesQ.isError ? (
                            <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-rose-800">
                                <div className="font-semibold">{text.loadFailed}</div>
                                <p className="mt-1 text-sm leading-6">{getErrorMessage(servicesQ.error, text.loadHint)}</p>
                                <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => servicesQ.refetch()}>{text.retry}</Button><Link to="/app/billing" className="inline-flex items-center rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold">{text.planStatus}</Link></div>
                            </div>
                        ) : servicesQ.isLoading ? (
                            <div className="flex items-center justify-center py-14 text-slate-500">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {text.loading}
                            </div>
                        ) : services.length === 0 ? (
                            <EmptyState
                                icon={Scissors}
                                title={text.emptyTitle}
                                description={text.emptyText}
                                className="border-0 shadow-none"
                            />
                        ) : (
                            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="rounded-[26px] border border-[#d39a43]/20 bg-[#fffdf9] p-4 shadow-[0_14px_38px_rgba(70,34,49,.07)] transition hover:-translate-y-1 hover:border-[#d39a43]/45 dark:bg-[#2f182e]/90 sm:p-5"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                                {service.image_url ? (
                                                    <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="grid h-full w-full place-items-center text-slate-400"><Scissors className="h-5 w-5" /></div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xl font-semibold text-slate-950">{service.name}</div>
                                                {service.description ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{service.description}</p> : null}
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                                                    {service.is_active ? (
                                                        <>
                                                            <CheckCircle2 size={13} className="text-emerald-600" />
                                                            {text.active}
                                                        </>
                                                    ) : (
                                                        <>{text.inactive}</>
                                                    )}
                                                </div>
                                                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                                                    {service.location_id ? (locationNameById.get(service.location_id) ?? `#${service.location_id}`) : text.allBranches}
                                                </div>
                                            </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock3 size={16} className="text-violet-600" />
                                                {service.duration_minutes} {text.minutes}
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Wallet size={16} className="text-violet-600" />
                                                {service.price != null ? `${service.price.toLocaleString(numberLocale(locale))} ${service.currency}` : text.noPrice}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex gap-2">
                                            <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-700 transition hover:border-violet-200 hover:bg-violet-50">
                                                {uploadImageMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        uploadImageMut.mutate({ serviceId: service.id, file });
                                                        e.currentTarget.value = "";
                                                    }}
                                                />
                                            </label>

                                            <Button variant="secondary" className="flex-1 gap-2" onClick={() => openEdit(service)}>
                                                <Pencil size={15} />
                                                {text.edit}
                                            </Button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const ok = window.confirm(text.deleteConfirm);
                                                    if (ok) deleteMut.mutate(service.id);
                                                }}
                                                className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-rose-700 transition hover:bg-rose-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SectionCard>

                <AnimatePresence>
                    {showForm && (
                        <>
                            <motion.div
                                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => {
                                    if (!busy) {
                                        setShowForm(false);
                                        setEditing(null);
                                        setForm({ ...initialForm, location_id: preferredLocationId });
                                    }
                                }}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                                className="fixed inset-x-0 bottom-0 top-0 z-50 mx-auto w-full max-h-full overflow-y-auto sm:inset-x-4 sm:top-6 sm:bottom-auto sm:max-h-[calc(100vh-3rem)] sm:w-[min(92vw,720px)] rounded-t-[28px] sm:rounded-[32px]"
                            >
                                <SectionCard className="p-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-2xl font-semibold text-slate-950">
                                                {editing ? text.editTitle : text.newTitle}
                                            </div>
                                            <div className="mt-1 text-sm text-slate-500">
                                                {text.formText}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 sm:gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-800">{text.name}</label>
                                                <input
                                                    value={form.name}
                                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    placeholder={text.namePlaceholder}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-800">{text.description}</label>
                                                <textarea
                                                    value={form.description}
                                                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                                    rows={3}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    placeholder={text.descriptionPlaceholder}
                                                />
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">{text.branch}</label>
                                                    <select
                                                        value={form.location_id}
                                                        onChange={(e) => setForm((p) => ({ ...p, location_id: e.target.value ? Number(e.target.value) : "" }))}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    >
                                                        {hasMultipleLocations ? <option value="" disabled>{text.chooseBranch}</option> : null}
                                                        {locations.map((location) => (
                                                            <option key={location.id} value={location.id}>{location.name || (location.is_primary ? text.primary : location.address)}</option>
                                                        ))}
                                                    </select>
                                                    {hasMultipleLocations ? <p className="mt-2 text-xs text-slate-500">{text.branchHint}</p> : null}
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">{text.duration}</label>
                                                    <input
                                                        type="number"
                                                        value={form.duration_minutes}
                                                        onChange={(e) =>
                                                            setForm((p) => ({ ...p, duration_minutes: Number(e.target.value) }))
                                                        }
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">{text.price}</label>
                                                    <input
                                                        type="number"
                                                        value={form.price}
                                                        onChange={(e) =>
                                                            setForm((p) => ({
                                                                ...p,
                                                                price: e.target.value === "" ? "" : Number(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                        placeholder={text.pricePlaceholder}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">{text.currency}</label>
                                                    <select
                                                        value={form.currency}
                                                        onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    >
                                                        <option value="AMD">AMD</option>
                                                        <option value="USD">USD</option>
                                                        <option value="EUR">EUR</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">{text.status}</label>
                                                    <select
                                                        value={form.is_active ? "1" : "0"}
                                                        onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === "1" }))}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    >
                                                        <option value="1">{text.active}</option>
                                                        <option value="0">{text.inactive}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-[28px] border border-[#d39a43]/20 bg-[linear-gradient(180deg,#fff8ef_0%,#fffdf9_55%)] p-4 dark:bg-[linear-gradient(180deg,#3b2039,#2f182e)]">
                                            <div className="text-sm font-semibold text-slate-900">{text.preview}</div>
                                            <div className="mt-1 text-xs text-slate-500">{text.previewText}</div>

                                            <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                                                <div className="h-40 w-full overflow-hidden bg-slate-100">
                                                    {form.image_url ? (
                                                        <img src={form.image_url} alt={form.name || 'service'} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="grid h-full w-full place-items-center text-slate-400"><ImagePlus className="h-6 w-6" /></div>
                                                    )}
                                                </div>
                                                <div className="space-y-2 p-4">
                                                    <div className="text-lg font-semibold text-slate-950">{form.name || text.newService}</div>
                                                    {form.description ? <p className="line-clamp-3 text-xs leading-5 text-slate-500">{form.description}</p> : null}
                                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                                        <span>{form.duration_minutes || 0} {text.minutes}</span>
                                                        <span>{form.price === '' ? text.noPrice : `${form.price} ${form.currency}`}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                                            {form.is_active ? text.activeService : text.inactiveService}
                                                        </div>
                                                        <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                                            {form.location_id === "" ? text.allBranches : (locationNameById.get(Number(form.location_id)) ?? `#${form.location_id}`)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="mb-2 block text-sm font-medium text-slate-800">{text.image}</label>
                                                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50">
                                                    {uploadImageMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                                                    {form.image_url ? text.changeImage : text.uploadImage}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            uploadMedia(file, 'services').then((url) => setForm((p) => ({ ...p, image_url: url })));
                                                            e.currentTarget.value = '';
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                if (!busy) {
                                                    setShowForm(false);
                                                    setEditing(null);
                                                    setForm({ ...initialForm, location_id: preferredLocationId });
                                                }
                                            }}
                                        >
                                            {text.close}
                                        </Button>

                                        <Button
                                            onClick={submitForm}
                                            disabled={!form.name.trim() || busy}
                                            className="gap-2"
                                        >
                                            {busy ? <Spinner size={16} /> : <SaveIcon />}
                                            {editing ? text.save : text.create}
                                        </Button>
                                    </div>
                                </SectionCard>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}

function SaveIcon() {
    return <Plus size={16} />;
}
