import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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

type ToastState = {
    open: boolean;
    text: string;
    type: "success" | "error";
};

type ServiceForm = {
    name: string;
    duration_minutes: number;
    price: number | "";
    currency: string;
    image_url?: string | null;
    is_active: boolean;
    location_id: number | "";
};

const initialForm: ServiceForm = {
    name: "",
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

    const [toast, setToast] = useState<ToastState>({
        open: false,
        text: "",
        type: "success",
    });

    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
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
            setToast({ open: true, text: "Ծառայությունը ստեղծվեց ✅", type: "success" });
            setShowForm(false);
            setForm({ ...initialForm, location_id: preferredLocationId });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
        },
        onError: (error: unknown) => {
            setToast({ open: true, text: getErrorMessage(error, "Չհաջողվեց ստեղծել"), type: "error" });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2400);
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: any }) => updateService(id, payload),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["services"] }),
                queryClient.invalidateQueries({ queryKey: ["business-settings"] }),
            ]);
            setToast({ open: true, text: "Ծառայությունը թարմացվեց ✅", type: "success" });
            setShowForm(false);
            setEditing(null);
            setForm({ ...initialForm, location_id: preferredLocationId });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
        },
        onError: (error: unknown) => {
            setToast({ open: true, text: getErrorMessage(error, "Չհաջողվեց թարմացնել"), type: "error" });
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
            setToast({ open: true, text: "Ծառայությունը ջնջվեց ✅", type: "success" });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
        },
        onError: (error: unknown) => {
            setToast({ open: true, text: getErrorMessage(error, "Չհաջողվեց ջնջել"), type: "error" });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2400);
        },
    });

    const locations = settingsQ.data?.locations ?? [];
    const serviceUsage = settingsQ.data?.usage;
    const serviceLimitReached = serviceUsage?.services_limit != null && serviceUsage.services_count >= serviceUsage.services_limit;
    const locationNameById = useMemo(() => new Map(locations.map((location) => [location.id, location.name || (location.is_primary ? "Գլխավոր հասցե" : location.address)])), [locations]);

    const hasMultipleLocations = locations.length > 1;
    const preferredLocationId = useMemo<number | "">(() => {
        if (selectedLocationId) return selectedLocationId;
        if (locations.length === 1) return locations[0].id;
        return "";
    }, [locations, selectedLocationId]);

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
            setToast({ open: true, text: "Մի քանի հասցե ունենալու դեպքում ծառայությունը պետք է կապել կոնկրետ հասցեի։", type: "error" });
            setTimeout(() => setToast((p) => ({ ...p, open: false })), 2400);
            return;
        }

        const payload = {
            name: form.name,
            duration_minutes: Number(form.duration_minutes),
            price: form.price === "" ? null : Number(form.price),
            currency: form.currency,
            image_url: form.image_url ?? null,
            is_active: form.is_active,
            location_id: form.location_id === "" ? null : Number(form.location_id),
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
                <SectionCard className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_35%),white] p-5 sm:p-8">
                    <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                <Scissors className="h-4 w-4" />
                                Ծառայությունների կառավարում
                            </div>

                            <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-4xl xl:text-[44px]">
                                Ծառայությունները կառավարիր պարզ ու պրեմիում միջավայրում
                            </h1>

                            <p className="mt-3 text-base leading-8 text-slate-600">
                                Ստեղծիր, խմբագրիր և պահիր քո ծառայությունները՝ տևողությամբ, գնով և ակտիվ կարգավիճակով։
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {locations.length > 1 ? (
                                <select
                                    value={selectedLocationId}
                                    onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : "")}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                >
                                    <option value="">Բոլոր հասցեները</option>
                                    {locations.map((location) => (
                                        <option key={location.id} value={location.id}>{location.name || (location.is_primary ? "Գլխավոր հասցե" : location.address)}</option>
                                    ))}
                                </select>
                            ) : null}
                            <Button onClick={openCreate} className="gap-2" disabled={serviceLimitReached}>
                                <Plus size={16} />
                                Ավելացնել ծառայություն
                            </Button>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-lg font-semibold text-slate-950">Ծառայությունների ցուցակ</div>
                            <div className="mt-1 text-sm text-slate-500">
                                Ակտիվ, ոչ ակտիվ և խմբագրվող ծառայությունները մեկ վայրում
                            </div>
                        </div>

                        <div className="relative w-full max-w-sm">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Փնտրել ծառայություն..."
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
                                <span>Ծառայություններ՝ <strong className="text-slate-950">{serviceUsage.services_count}</strong> / <strong className="text-slate-950">{serviceUsage.services_limit ?? '∞'}</strong></span>
                                <span>Հասցեներ՝ <strong className="text-slate-950">{serviceUsage.locations_count}</strong> / <strong className="text-slate-950">{serviceUsage.locations_limit}</strong></span>
                                <span>Մասնագետներ՝ <strong className="text-slate-950">{serviceUsage.active_staff}</strong> / <strong className="text-slate-950">{serviceUsage.staff_limit ?? '∞'}</strong></span>
                            </div>
                            {serviceLimitReached ? <div className="mt-2 text-rose-600">Ծառայությունների limit-ը սպառված է․ upgrade արա կամ ջնջիր ավելորդ ծառայությունը։</div> : null}
                        </div>
                    ) : null}

                    <div className="mt-6">
                        {servicesQ.isLoading ? (
                            <div className="flex items-center justify-center py-14 text-slate-500">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Բեռնում ենք ծառայությունները…
                            </div>
                        ) : services.length === 0 ? (
                            <EmptyState
                                icon={Scissors}
                                title="Ծառայություններ չկան"
                                description="Ստեղծիր առաջին ծառայությունը, որպեսզի սկսես ամրագրումները։"
                                className="border-0 shadow-none"
                            />
                        ) : (
                            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_18px_50px_rgba(124,58,237,0.08)]"
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
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                                                    {service.is_active ? (
                                                        <>
                                                            <CheckCircle2 size={13} className="text-emerald-600" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>Inactive</>
                                                    )}
                                                </div>
                                                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                                                    {service.location_id ? (locationNameById.get(service.location_id) ?? `#${service.location_id}`) : "Բոլոր հասցեների համար"}
                                                </div>
                                            </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock3 size={16} className="text-violet-600" />
                                                {service.duration_minutes} րոպե
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Wallet size={16} className="text-violet-600" />
                                                {service.price != null ? `${service.price.toLocaleString("hy-AM")} ${service.currency}` : "Գին նշված չէ"}
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
                                                Խմբագրել
                                            </Button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const ok = window.confirm("Վստա՞հ եք, որ ուզում եք ջնջել ծառայությունը։");
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
                                                {editing ? "Խմբագրել ծառայությունը" : "Նոր ծառայություն"}
                                            </div>
                                            <div className="mt-1 text-sm text-slate-500">
                                                Լրացրու ծառայության անունը, տևողությունը և գինը
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 sm:gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-800">Անուն</label>
                                                <input
                                                    value={form.name}
                                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    placeholder="օր․ Մազերի կտրում"
                                                />
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">Հասցե / մասնաճյուղ</label>
                                                    <select
                                                        value={form.location_id}
                                                        onChange={(e) => setForm((p) => ({ ...p, location_id: e.target.value ? Number(e.target.value) : "" }))}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    >
                                                        {hasMultipleLocations ? <option value="" disabled>Ընտրիր հասցեն</option> : null}
                                                        {locations.map((location) => (
                                                            <option key={location.id} value={location.id}>{location.name || (location.is_primary ? "Գլխավոր հասցե" : location.address)}</option>
                                                        ))}
                                                    </select>
                                                    {hasMultipleLocations ? <p className="mt-2 text-xs text-slate-500">Multi-location business-ի համար ծառայությունը պետք է կապվի կոնկրետ հասցեի հետ։</p> : null}
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">Տևողություն (րոպե)</label>
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
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">Գին</label>
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
                                                        placeholder="օր․ 5000"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">Արժույթ</label>
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
                                                    <label className="mb-2 block text-sm font-medium text-slate-800">Կարգավիճակ</label>
                                                    <select
                                                        value={form.is_active ? "1" : "0"}
                                                        onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === "1" }))}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    >
                                                        <option value="1">Ակտիվ</option>
                                                        <option value="0">Ոչ ակտիվ</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#faf5ff_0%,#ffffff_55%)] p-4">
                                            <div className="text-sm font-semibold text-slate-900">Նախադիտում</div>
                                            <div className="mt-1 text-xs text-slate-500">Ահա ինչպես ծառայությունը կերևա public booking-ում և քո admin քարտերում։</div>

                                            <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                                                <div className="h-40 w-full overflow-hidden bg-slate-100">
                                                    {form.image_url ? (
                                                        <img src={form.image_url} alt={form.name || 'service'} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="grid h-full w-full place-items-center text-slate-400"><ImagePlus className="h-6 w-6" /></div>
                                                    )}
                                                </div>
                                                <div className="space-y-2 p-4">
                                                    <div className="text-lg font-semibold text-slate-950">{form.name || 'Նոր ծառայություն'}</div>
                                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                                        <span>{form.duration_minutes || 0} րոպե</span>
                                                        <span>{form.price === '' ? 'Գինը նշված չէ' : `${form.price} ${form.currency}`}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                                            {form.is_active ? 'Ակտիվ ծառայություն' : 'Ոչ ակտիվ ծառայություն'}
                                                        </div>
                                                        <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                                            {form.location_id === "" ? 'Բոլոր հասցեների համար' : (locationNameById.get(Number(form.location_id)) ?? `#${form.location_id}`)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="mb-2 block text-sm font-medium text-slate-800">Նկար</label>
                                                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50">
                                                    {uploadImageMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                                                    {form.image_url ? 'Փոխել նկարը' : 'Բեռնել նկար'}
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
                                            Փակել
                                        </Button>

                                        <Button
                                            onClick={submitForm}
                                            disabled={!form.name.trim() || busy}
                                            className="gap-2"
                                        >
                                            {busy ? <Spinner size={16} /> : <SaveIcon />}
                                            {editing ? "Պահպանել փոփոխությունները" : "Ստեղծել ծառայությունը"}
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
