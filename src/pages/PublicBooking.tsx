/* eslint-disable react-hooks/set-state-in-effect -- this form reconciles URL, location and async availability state after each external source updates */
import { cloneElement, isValidElement, useEffect, useId, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    CalendarDays,
    Clock3,
    User,
    Phone,
    Mail,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Star,
    Gift,
    Wallet,
    Stethoscope,
    Loader2,
    Plus,
    Trash2,
    Layers3,
    Users,
    Check,
    Copy,
    MapPin,
    ShieldCheck,
} from "lucide-react";
import { PublicBusinessFooter, PublicBusinessHeader } from "../components/public/PublicBusinessChrome";
import Seo from "../components/Seo";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { publicBookingCopy } from "../i18n/publicBooking";
import { getErrorMessage, getHttpStatus, getValidationMessages } from "../lib/http";
import {
    createPublicBooking,
    createPublicBookingLines,
    createPublicBookingMulti,
    fetchPublicAvailability,
    fetchPublicAvailabilityMulti,
    fetchPublicBusiness,
    fetchPublicServices,
    fetchPublicStaff,
    verifyPublicBooking,
    resendPublicBookingCode,
    fetchPublicBookingDetail,
    cancelPublicBooking,
    type PublicBookingDetail,
    type PublicLocation,
    type PublicService,
    type PublicStaff,
    type Slot,
} from "../lib/publicApi";

type BookingMode = "single" | "multi" | "lines";

type LineItem = {
    id: string;
    service_id: number | 0;
    staff_id: number | "any";
    date: string;
    time: string;
};

const EMPTY_SERVICES: PublicService[] = [];
const EMPTY_STAFF: PublicStaff[] = [];
const EMPTY_LOCATIONS: PublicLocation[] = [];
const EMPTY_SLOTS: Slot[] = [];

function storeGuestToken(bookingCode: string, token: string) {
    try {
        sessionStorage.setItem(`guest-booking-token:${bookingCode}`, token);
    } catch {
        // The in-memory token still lets the current tab manage the booking.
    }
}

function readGuestToken(bookingCode: string) {
    try {
        return sessionStorage.getItem(`guest-booking-token:${bookingCode}`) ?? "";
    } catch {
        return "";
    }
}

function ymd(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

const todayYmd = ymd(new Date());

function makeLine(defaultDate = todayYmd): LineItem {
    return {
        id: Math.random().toString(36).slice(2, 10),
        service_id: 0,
        staff_id: "any",
        date: defaultDate,
        time: "",
    };
}

function locationOptionLabel(location: PublicLocation, locale: Locale) {
    const text = publicBookingCopy[locale];
    const name = location.name?.trim() || (location.is_primary ? text.mainLocation : text.branch);
    const address = location.address?.trim();
    return address && address !== name ? `${name} — ${address}` : (address || name);
}

function explicitLineOverlap(lines: LineItem[], services: PublicService[]) {
    const durationByService = new Map(services.map((service) => [service.id, Number(service.duration_minutes || 0)]));
    const prepared = lines.flatMap((line, index) => {
        if (line.staff_id === "any" || !line.service_id || !line.date || !line.time) return [];
        const duration = durationByService.get(Number(line.service_id)) ?? 0;
        const start = new Date(`${line.date}T${line.time}:00`).getTime();
        if (!duration || !Number.isFinite(start)) return [];
        return [{ index, staffId: Number(line.staff_id), start, end: start + duration * 60_000 }];
    });

    for (let index = 0; index < prepared.length; index += 1) {
        for (let otherIndex = index + 1; otherIndex < prepared.length; otherIndex += 1) {
            const current = prepared[index];
            const other = prepared[otherIndex];
            if (current.staffId === other.staffId && current.start < other.end && current.end > other.start) {
                return { first: current.index + 1, second: other.index + 1 };
            }
        }
    }

    return null;
}

function getTimezoneDisplay(timezone: string, locale: Locale) {
    const text = publicBookingCopy[locale];
    const map: Record<string, string> = {
        "Asia/Yerevan": text.yerevanTz,
        "Europe/Moscow": text.moscowTz,
        "Europe/Tbilisi": text.tbilisiTz,
    };
    return map[timezone] || timezone;
}

function formatMoney(price: number | null | undefined, currency = "AMD", locale: Locale = "hy") {
    if (price == null) return publicBookingCopy[locale].priceMissing;
    const intlLocale = { hy: "hy-AM", ru: "ru-RU", en: "en-US" }[locale];
    return `${new Intl.NumberFormat(intlLocale).format(price)} ${currency}`;
}

function formatDateTime(value: string, timezone: string | null | undefined, locale: Locale) {
    const intlLocale = { hy: "hy-AM", ru: "ru-RU", en: "en-US" }[locale];
    try {
        return new Intl.DateTimeFormat(intlLocale, {
            timeZone: timezone || "Asia/Yerevan",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value));
    } catch {
        return new Date(value).toLocaleString(intlLocale);
    }
}

function getStatusMeta(status: string, label: string | undefined, locale: Locale) {
    const text = publicBookingCopy[locale];
    if (status === "confirmed") {
        return {
            label: label || text.statusConfirmed,
            badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:border-emerald-400/25 dark:bg-emerald-500/15 dark:text-emerald-200",
        };
    }

    if (status === "cancelled") {
        return {
            label: label || text.statusCancelled,
            badgeClass: "bg-rose-100 text-rose-700 border-rose-200 dark:border-rose-400/25 dark:bg-rose-500/15 dark:text-rose-200",
        };
    }

    if (status === "done" || status === "completed") {
        return {
            label: label || text.statusCompleted,
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:border-[#312641] dark:bg-white/[0.06] dark:text-slate-200",
        };
    }

    return {
        label: label || text.statusPending,
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200 dark:border-amber-400/25 dark:bg-amber-500/15 dark:text-amber-200",
    };
}

function mergeClass(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-[#312641] dark:bg-[#100c18] dark:text-white dark:focus:border-[#a980f3] dark:focus:ring-[#a980f3]/15";

function slotLabel(slot: Slot, showStaff = false) {
    const st = slot.starts_at.slice(11, 16);
    const en = slot.ends_at.slice(11, 16);
    if (showStaff && slot.staff_name) {
        return `${st} – ${en} · ${slot.staff_name}`;
    }
    return `${st} – ${en}`;
}

function slotKey(slot: Slot) {
    return `${slot.starts_at}|${slot.staff_id ?? "na"}`;
}

function localizeSmartReason(reason: string | null | undefined, locale: Locale) {
    const text = publicBookingCopy[locale];
    const normalized = String(reason ?? "").trim();
    if (normalized === "Մոտ է զբաղված հատվածին") return text.smartNearBusy;
    if (normalized === "Սովորական ազատ ժամ") return text.smartStandard;
    return locale === "hy" && normalized ? normalized : text.smartFallback;
}

function formatApiError(error: unknown, fallback: string) {
    const base = getErrorMessage(error, fallback);
    const details = getValidationMessages(error).filter((message) => message !== base);
    return details.length ? `${base} — ${details[0]}` : base;
}

function SmartSuggestions({
    slots,
    value,
    onSelect,
    showStaff = false,
}: {
    slots: Slot[];
    value: string;
    onSelect: (slot: Slot) => void;
    showStaff?: boolean;
}) {
    const { locale } = useLanguage();
    const text = publicBookingCopy[locale];
    if (!slots.length) return null;

    return (
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-violet-50 p-4 dark:border-emerald-400/25 dark:from-emerald-950/45 dark:via-[#151020] dark:to-violet-950/45">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                <Sparkles className="h-4 w-4" />
                {text.smartTitle}
            </div>
            <div className="mt-1 text-sm text-slate-600">
                {text.smartText}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {slots.map((slot) => {
                    const active = value === slotKey(slot);
                    return (
                        <button
                            key={slotKey(slot)}
                            type="button"
                            onClick={() => onSelect(slot)}
                            className={mergeClass(
                                "rounded-2xl border px-3 py-3 text-left transition-all",
                                active
                                    ? "border-emerald-400 bg-emerald-100 shadow-sm dark:border-emerald-400/45 dark:bg-emerald-500/15"
                                    : "border-white/70 bg-white/90 hover:border-emerald-300 hover:bg-white dark:border-[#312641] dark:hover:border-emerald-400/35 dark:hover:bg-white/[0.08]"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-slate-900">{slotLabel(slot, showStaff)}</div>
                                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                    #{slot.recommendation_rank ?? "★"}
                                </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{localizeSmartReason(slot.smart_reason, locale)}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

type LineCardProps = {
    line: LineItem;
    index: number;
    slug: string;
    services: PublicService[];
    staff: PublicStaff[];
    locationId?: number;
    onChange: (id: string, patch: Partial<LineItem>) => void;
    onRemove: (id: string) => void;
};

function LineBookingCard({
                             line,
                             index,
                             slug,
                             services,
                             staff,
                             locationId,
                             onChange,
                             onRemove,
                         }: LineCardProps) {
    const { locale } = useLanguage();
    const text = publicBookingCopy[locale];
    const availabilityQ = useQuery({
        queryKey: [
            "public-line-availability",
            slug,
            line.id,
            line.service_id,
            line.staff_id,
            line.date,
            locationId || "all",
        ],
        queryFn: () =>
            fetchPublicAvailability({
                slug,
                service_id: Number(line.service_id),
                date: line.date,
                staff_id: line.staff_id === "any" ? undefined : line.staff_id,
                location_id: locationId,
            }),
        enabled: !!slug && !!line.service_id && !!line.date,
        retry: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const slots = availabilityQ.data ?? [];
    const selectedService = services.find((s) => s.id === line.service_id);

    useEffect(() => {
        if (slots.length && !line.time) {
            onChange(line.id, { time: slots[0].starts_at.slice(11, 16) });
        }
    }, [slots, line.time, line.id, onChange]);

    return (
        <div className="rounded-[26px] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-rose-50 p-4 shadow-sm dark:border-orange-400/25 dark:from-orange-950/35 dark:via-[#151020] dark:to-rose-950/35 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-300">
                        {text.serviceNumber} #{index + 1}
                    </div>
                    <div className="text-lg font-semibold text-slate-900">
                        {selectedService?.name || text.chooseService}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(line.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                    <Trash2 className="h-4 w-4" />
                    {text.remove}
                </button>
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                <Field label={`${text.service} *`}>
                    <select
                        className={inputClass}
                        value={line.service_id}
                        onChange={(e) =>
                            onChange(line.id, {
                                service_id: Number(e.target.value),
                                time: "",
                            })
                        }
                    >
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} • {s.duration_minutes} {text.minuteShort}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label={text.staff}>
                    <select
                        className={inputClass}
                        value={line.staff_id}
                        onChange={(e) => {
                            const v = e.target.value;
                            onChange(line.id, {
                                staff_id: v === "any" ? "any" : Number(v),
                                time: "",
                            });
                        }}
                    >
                        <option value="any">{text.anyStaff}</option>
                        {staff.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label={`${text.date} *`} icon={<CalendarDays className="h-4 w-4" />}>
                    <input
                        type="date"
                        min={todayYmd}
                        className={inputClass}
                        value={line.date}
                        onChange={(e) =>
                            onChange(line.id, {
                                date: e.target.value,
                                time: "",
                            })
                        }
                    />
                </Field>

                <Field label={`${text.time} *`} icon={<Clock3 className="h-4 w-4" />}>
                    <select
                        className={inputClass}
                        value={line.time}
                        onChange={(e) => onChange(line.id, { time: e.target.value })}
                        disabled={availabilityQ.isLoading || !slots.length}
                    >
                        {availabilityQ.isLoading && <option>{text.loading}</option>}
                        {!availabilityQ.isLoading && !slots.length && (
                            <option>{text.noTimes}</option>
                        )}
                        {slots.map((s) => {
                            const st = s.starts_at.slice(11, 16);
                            const en = s.ends_at.slice(11, 16);
                            return (
                                <option key={s.starts_at} value={st}>
                                    {st} – {en}
                                </option>
                            );
                        })}
                    </select>
                </Field>
            </div>

            {selectedService && (
                <div className="mt-4">
                    <ServicePreviewCard service={selectedService} tone="amber" compact />
                </div>
            )}
        </div>
    );
}

export default function PublicBooking() {
    const { slug = "" } = useParams();
    const { locale } = useLanguage();
    const text = publicBookingCopy[locale];
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const [mode, setMode] = useState<BookingMode>("single");
    const [selectedLocationId, setSelectedLocationId] = useState<number | "">("");

    const [serviceId, setServiceId] = useState<number>(0);
    const [staffId, setStaffId] = useState<number | "any">("any");
    const [date, setDate] = useState<string>(todayYmd);
    const [time, setTime] = useState<string>("");
    const [singleSlotKey, setSingleSlotKey] = useState<string>("");

    const [multiServiceIds, setMultiServiceIds] = useState<number[]>([]);
    const [multiStaffId, setMultiStaffId] = useState<number | "any">("any");
    const [multiDate, setMultiDate] = useState<string>(todayYmd);
    const [multiTime, setMultiTime] = useState<string>("");
    const [multiSlotKey, setMultiSlotKey] = useState<string>("");

    const [lines, setLines] = useState<LineItem[]>([makeLine(), makeLine()]);

    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [notes, setNotes] = useState("");
    const [redeemPoints, setRedeemPoints] = useState('');
    const [giftCardCode, setGiftCardCode] = useState('');
    const [giftCardAmount, setGiftCardAmount] = useState('');

    const [msg, setMsg] = useState<string | null>(null);
    const [msgType, setMsgType] = useState<"success" | "error">("success");
    const [resultCode, setResultCode] = useState<string | null>(null);
    const [activeBookingCode, setActiveBookingCode] = useState<string>(searchParams.get("booking") ?? "");
    const [guestToken, setGuestToken] = useState<string>(searchParams.get("token") ?? "");
    const [otp, setOtp] = useState("");
    const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
    const [otpPanelOpen, setOtpPanelOpen] = useState<boolean>(Boolean(searchParams.get("booking") && !searchParams.get("token")));

    const businessQ = useQuery({
        queryKey: ["public-business", slug],
        queryFn: () => fetchPublicBusiness(slug),
        enabled: !!slug,
    });

    const business = businessQ.data;
    const locations = business?.locations ?? EMPTY_LOCATIONS;
    const locationSelectionRequired = locations.length > 1 && !selectedLocationId;

    const servicesQ = useQuery({
        queryKey: ["public-services", slug, selectedLocationId || "all"],
        queryFn: () => fetchPublicServices(slug, { location_id: selectedLocationId ? Number(selectedLocationId) : undefined }),
        enabled: !!slug && !!business && !locationSelectionRequired,
    });

    const staffQ = useQuery({
        queryKey: ["public-staff", slug, selectedLocationId || "all", "bookable"],
        queryFn: () => fetchPublicStaff(slug, {
            location_id: selectedLocationId ? Number(selectedLocationId) : undefined,
            bookable_only: true,
        }),
        enabled: !!slug && !!business && !locationSelectionRequired,
    });

    const services = locationSelectionRequired ? EMPTY_SERVICES : servicesQ.data ?? EMPTY_SERVICES;
    const staff = locationSelectionRequired ? EMPTY_STAFF : staffQ.data ?? EMPTY_STAFF;
    const bookingSource = searchParams.get("source") ?? "website";

    useEffect(() => {
        const bookingFromQuery = searchParams.get("booking") ?? "";
        const tokenFromQuery = searchParams.get("token") ?? "";

        if (bookingFromQuery) {
            setActiveBookingCode(bookingFromQuery);
            setOtpPanelOpen(!tokenFromQuery);
        }

        if (bookingFromQuery && tokenFromQuery) {
            storeGuestToken(bookingFromQuery, tokenFromQuery);
            setGuestToken(tokenFromQuery);
            const next = new URLSearchParams(searchParams);
            next.delete("token");
            setSearchParams(next, { replace: true });
        } else if (bookingFromQuery) {
            const stored = readGuestToken(bookingFromQuery);
            if (stored) {
                setGuestToken(stored);
                setOtpPanelOpen(false);
            }
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const fromQuery = Number(searchParams.get("location_id") || 0);
        if (fromQuery && locations.some((location) => location.id === fromQuery)) {
            setSelectedLocationId(fromQuery);
            return;
        }
        if (!fromQuery && locations.length === 1) {
            setSelectedLocationId(locations[0].id);
        }
    }, [searchParams, locations]);

    function changeLocation(nextLocationId: number | "") {
        setSelectedLocationId(nextLocationId);
        const nextParams = new URLSearchParams(searchParams);
        if (nextLocationId) nextParams.set("location_id", String(nextLocationId));
        else nextParams.delete("location_id");
        setSearchParams(nextParams, { replace: true });
    }

    useEffect(() => {
        const fromQuery = Number(searchParams.get("staff_id") || 0);
        if (!fromQuery || !staff.length) return;

        const matched = staff.find((item) => item.id === fromQuery);
        if (!matched) return;

        setStaffId(fromQuery);
        setMultiStaffId(fromQuery);
    }, [searchParams, staff]);

    useEffect(() => {
        setStaffId("any");
        setMultiStaffId("any");
        setSingleSlotKey("");
        setMultiSlotKey("");
        setTime("");
        setMultiTime("");
    }, [selectedLocationId]);

    useEffect(() => {
        if (!serviceId && services.length) {
            setServiceId(services[0].id);
        }
    }, [serviceId, services]);

    useEffect(() => {
        if (services.length && multiServiceIds.length === 0) {
            setMultiServiceIds([services[0].id]);
        }
    }, [services, multiServiceIds.length]);

    useEffect(() => {
        if (!services.length) {
            setServiceId((prev) => (prev === 0 ? prev : 0));
            setMultiServiceIds((prev) => (prev.length === 0 ? prev : []));
            setLines((prev) => {
                const needsReset = prev.some((line) => line.service_id !== 0 || line.time !== "" || line.staff_id !== "any");
                return needsReset
                    ? prev.map((line) => ({ ...line, service_id: 0, time: "", staff_id: "any" }))
                    : prev;
            });
            return;
        }

        const validServiceIds = new Set(services.map((item) => item.id));

        setServiceId((prev) => (prev && validServiceIds.has(prev) ? prev : services[0].id));
        setMultiServiceIds((prev) => {
            const next = prev.filter((id) => validServiceIds.has(id));
            if (next.length === prev.length && next.every((id, index) => id === prev[index])) {
                return prev;
            }
            return next.length ? next : [services[0].id];
        });
        setLines((prev) => {
            let changed = false;
            const next = prev.map((line, index) => {
                const fallbackId = services[Math.min(index, services.length - 1)]?.id ?? services[0].id;
                const nextServiceId = line.service_id && validServiceIds.has(line.service_id) ? line.service_id : fallbackId;
                if (nextServiceId !== line.service_id) {
                    changed = true;
                    return { ...line, service_id: nextServiceId };
                }
                return line;
            });
            return changed ? next : prev;
        });
    }, [services]);

    useEffect(() => {
        const validStaffIds = new Set(staff.map((item) => item.id));

        setStaffId((prev) => (prev !== "any" && !validStaffIds.has(prev) ? "any" : prev));
        setMultiStaffId((prev) => (prev !== "any" && !validStaffIds.has(prev) ? "any" : prev));
        setLines((prev) => {
            let changed = false;
            const next = prev.map((line) => {
                const nextStaffId = line.staff_id !== "any" && !validStaffIds.has(Number(line.staff_id)) ? "any" : line.staff_id;
                if (nextStaffId !== line.staff_id) {
                    changed = true;
                    return { ...line, staff_id: nextStaffId };
                }
                return line;
            });
            return changed ? next : prev;
        });
    }, [staff]);

    const singleAvailabilityQ = useQuery({
        queryKey: ["public-availability", slug, serviceId, staffId, date, selectedLocationId || "all"],
        queryFn: () =>
            fetchPublicAvailability({
                slug,
                service_id: serviceId,
                date,
                staff_id: staffId === "any" ? undefined : staffId,
                location_id: selectedLocationId ? Number(selectedLocationId) : undefined,
            }),
        enabled: !!slug && !!serviceId && !!date && mode === "single",
        retry: false,
    });

    const multiAvailabilityQ = useQuery({
        queryKey: [
            "public-availability-multi",
            slug,
            multiServiceIds,
            multiStaffId,
            multiDate,
            selectedLocationId || "all",
        ],
        queryFn: () =>
            fetchPublicAvailabilityMulti({
                slug,
                service_ids: multiServiceIds,
                date: multiDate,
                staff_id: multiStaffId === "any" ? undefined : multiStaffId,
                location_id: selectedLocationId ? Number(selectedLocationId) : undefined,
            }),
        enabled: !!slug && multiServiceIds.length > 0 && !!multiDate && mode === "multi",
        retry: false,
    });

    const singleSlots = singleAvailabilityQ.data ?? EMPTY_SLOTS;
    const multiSlots = multiAvailabilityQ.data ?? EMPTY_SLOTS;

    const recommendedSingleSlots = useMemo(
        () => singleSlots.filter((slot) => slot.is_recommended).slice(0, 3),
        [singleSlots]
    );

    const recommendedMultiSlots = useMemo(
        () => multiSlots.filter((slot) => slot.is_recommended).slice(0, 3),
        [multiSlots]
    );

    const availabilityErrorText =
        mode === "single"
            ? (singleAvailabilityQ.isError ? formatApiError(singleAvailabilityQ.error, text.availabilityError) : "")
            : mode === "multi"
                ? (multiAvailabilityQ.isError ? formatApiError(multiAvailabilityQ.error, text.availabilityError) : "")
                : "";

    useEffect(() => {
        if (mode !== "single") return;
        if (!singleSlots.length) {
            setSingleSlotKey("");
            setTime("");
            return;
        }
        const preferred = singleSlots.find((slot) => slotKey(slot) === singleSlotKey) ?? recommendedSingleSlots[0] ?? singleSlots[0];
        setSingleSlotKey(slotKey(preferred));
        setTime(preferred.starts_at.slice(11, 16));
    }, [singleSlots, recommendedSingleSlots, singleSlotKey, mode]);

    useEffect(() => {
        if (mode !== "multi") return;
        if (!multiSlots.length) {
            setMultiSlotKey("");
            setMultiTime("");
            return;
        }
        const preferred = multiSlots.find((slot) => slotKey(slot) === multiSlotKey) ?? recommendedMultiSlots[0] ?? multiSlots[0];
        setMultiSlotKey(slotKey(preferred));
        setMultiTime(preferred.starts_at.slice(11, 16));
    }, [multiSlots, recommendedMultiSlots, multiSlotKey, mode]);

    const bookingDetailQ = useQuery({
        queryKey: ["public-booking-detail", activeBookingCode, guestToken],
        queryFn: () => fetchPublicBookingDetail({ booking_code: activeBookingCode, token: guestToken }),
        enabled: !!activeBookingCode && !!guestToken,
        retry: false,
    });

    useEffect(() => {
        if (!bookingDetailQ.error || !activeBookingCode || !guestToken) return;

        const status = getHttpStatus(bookingDetailQ.error);
        if (status !== 401 && status !== 403) return;

        setGuestToken("");
        setOtpPanelOpen(true);
        setMsgType("error");
        setMsg(text.accessExpired);

        const next = new URLSearchParams(searchParams);
        next.set("booking", activeBookingCode);
        next.delete("token");
        setSearchParams(next, { replace: true });

        try {
            sessionStorage.removeItem(`guest-booking-token:${activeBookingCode}`);
        } catch {
            // ignore storage failures
        }
    }, [bookingDetailQ.error, activeBookingCode, guestToken, searchParams, setSearchParams, text.accessExpired]);

    const invalidateAvailabilityQueries = () => {
        queryClient.invalidateQueries({
            predicate: (query) => {
                const key0 = Array.isArray(query.queryKey) ? String(query.queryKey[0] ?? "") : "";
                return key0 === "public-availability" || key0 === "public-availability-multi" || key0 === "public-line-availability";
            },
        });
    };

    const verifyMut = useMutation({
        mutationFn: verifyPublicBooking,
        onSuccess: (res) => {
            invalidateAvailabilityQueries();
            if (res.manage_token && activeBookingCode) {
                storeGuestToken(activeBookingCode, res.manage_token);
                setGuestToken(res.manage_token);
                const next = new URLSearchParams(searchParams);
                next.set("booking", activeBookingCode);
                next.delete("token");
                setSearchParams(next, { replace: true });
            }
            setOtpPanelOpen(false);
            setOtp("");
            setMsgType("success");
            setMsg(text.bookingConfirmed);
        },
        onError: (error: unknown) => {
            setMsgType("error");
            setMsg(formatApiError(error, text.codeRejected));
        },
    });

    const resendMut = useMutation({
        mutationFn: resendPublicBookingCode,
        onSuccess: (res) => {
            if (res.manage_token && activeBookingCode) {
                storeGuestToken(activeBookingCode, res.manage_token);
                setGuestToken(res.manage_token);
                setOtpPanelOpen(false);
                const next = new URLSearchParams(searchParams);
                next.set("booking", activeBookingCode);
                next.delete("token");
                setSearchParams(next, { replace: true });
                setMsgType("success");
                setMsg(text.accessRestored);
                return;
            }

            if (res.expires_at) setOtpExpiresAt(res.expires_at);
            setOtpPanelOpen(true);
            setMsgType("success");
            setMsg(text.codeSent);
        },
        onError: (error: unknown) => {
            setMsgType("error");
            setMsg(formatApiError(error, text.codeSendError));
        },
    });

    const cancelMut = useMutation({
        mutationFn: cancelPublicBooking,
        onSuccess: () => {
            invalidateAvailabilityQueries();
            setMsgType("success");
            setMsg(text.bookingCancelled);
            bookingDetailQ.refetch();
        },
        onError: (error: unknown) => {
            setMsgType("error");
            setMsg(formatApiError(error, text.bookingCancelError));
        },
    });

    const createSingleMut = useMutation({
        mutationFn: createPublicBooking,
        onSuccess: (res) => {
            invalidateAvailabilityQueries();
            setMsgType("success");
            setResultCode(res?.data?.booking_code ?? null);
            setMsg(text.bookingCreated);
            setActiveBookingCode(res?.data?.booking_code ?? "");
            setGuestToken("");
            setOtpExpiresAt(res?.data?.expires_at ?? null);
            setOtpPanelOpen(true);
            const next = new URLSearchParams(searchParams);
            if (res?.data?.booking_code) next.set("booking", res.data.booking_code);
            next.delete("token");
            setSearchParams(next, { replace: true });
            resetClientForm();
        },
        onError: (error: unknown) => {
            setMsgType("error");
            setMsg(formatApiError(error, text.bookingCreateError));
        },
    });

    const createMultiMut = useMutation({
        mutationFn: createPublicBookingMulti,
        onSuccess: (res) => {
            invalidateAvailabilityQueries();
            setMsgType("success");
            setResultCode(res?.data?.booking_code ?? null);
            setMsg(text.multiCreated);
            setActiveBookingCode(res?.data?.booking_code ?? "");
            setGuestToken("");
            setOtpExpiresAt(res?.data?.expires_at ?? null);
            setOtpPanelOpen(true);
            const next = new URLSearchParams(searchParams);
            if (res?.data?.booking_code) next.set("booking", res.data.booking_code);
            next.delete("token");
            setSearchParams(next, { replace: true });
            resetClientForm();
        },
        onError: (error: unknown) => {
            setMsgType("error");
            setMsg(
                formatApiError(error, text.multiCreateError)
            );
        },
    });

    const createLinesMut = useMutation({
        mutationFn: createPublicBookingLines,
        onSuccess: (res) => {
            invalidateAvailabilityQueries();
            setMsgType("success");
            setResultCode(res?.data?.booking_code ?? null);
            setMsg(text.linesCreated);
            setActiveBookingCode(res?.data?.booking_code ?? "");
            setGuestToken("");
            setOtpExpiresAt(res?.data?.expires_at ?? null);
            setOtpPanelOpen(true);
            const next = new URLSearchParams(searchParams);
            if (res?.data?.booking_code) next.set("booking", res.data.booking_code);
            next.delete("token");
            setSearchParams(next, { replace: true });
            resetClientForm();
        },
        onError: (error: unknown) => {
            setMsgType("error");
            setMsg(
                formatApiError(error, text.linesCreateError)
            );
        },
    });

    function resetClientForm() {
        setClientName("");
        setClientPhone("");
        setClientEmail("");
        setNotes("");
    }

    function startNewBooking() {
        if (activeBookingCode) {
            try {
                sessionStorage.removeItem(`guest-booking-token:${activeBookingCode}`);
            } catch {
                // ignore storage failures
            }
        }

        setActiveBookingCode("");
        setGuestToken("");
        setOtp("");
        setOtpExpiresAt(null);
        setOtpPanelOpen(false);
        setResultCode(null);
        setMsg(null);
        setTime("");
        setSingleSlotKey("");
        setMultiTime("");
        setMultiSlotKey("");
        resetClientForm();

        const next = new URLSearchParams(searchParams);
        next.delete("booking");
        next.delete("token");
        setSearchParams(next, { replace: true });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const selectedSingleService = useMemo(
        () => services.find((s) => s.id === serviceId),
        [services, serviceId]
    );

    const selectedMultiServices = useMemo(
        () => services.filter((s) => multiServiceIds.includes(s.id)),
        [services, multiServiceIds]
    );

    const multiTotal = useMemo(() => {
        return selectedMultiServices.reduce(
            (acc, s) => ({
                duration: acc.duration + (s.duration_minutes || 0),
                price: acc.price + (s.price ?? 0),
            }),
            { duration: 0, price: 0 }
        );
    }, [selectedMultiServices]);

    const lineOverlap = useMemo(() => explicitLineOverlap(lines, services), [lines, services]);

    function toggleMultiService(id: number) {
        setMultiTime("");
        setMultiServiceIds((prev) => {
            if (prev.includes(id)) {
                if (prev.length === 1) return prev;
                return prev.filter((x) => x !== id);
            }
            return [...prev, id];
        });
    }

    function addLine() {
        setLines((prev) => [...prev, makeLine()]);
    }

    function removeLine(id: string) {
        setLines((prev) => (prev.length <= 1 ? prev : prev.filter((line) => line.id !== id)));
    }

    function updateLine(id: string, patch: Partial<LineItem>) {
        setLines((prev) =>
            prev.map((line) => {
                if (line.id !== id) return line;
                return { ...line, ...patch };
            })
        );
    }

    function hasDuplicateLineServices() {
        const ids = lines.map((l) => l.service_id).filter(Boolean);
        return new Set(ids).size !== ids.length;
    }

    function validateCommonFields() {
        if (clientName.trim().length < 2) {
            setMsgType("error");
            setMsg(text.nameRequired);
            return false;
        }
        if (clientPhone.trim().length < 5) {
            setMsgType("error");
            setMsg(text.phoneRequired);
            return false;
        }
        return true;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setResultCode(null);

        if (locations.length > 1 && !selectedLocationId) {
            setMsgType("error");
            setMsg(text.selectBranchFirst);
            return;
        }

        if (!validateCommonFields()) return;

        if (mode === "single") {
            if (!serviceId) {
                setMsgType("error");
                return setMsg(text.selectService);
            }
            if (!time) {
                setMsgType("error");
                return setMsg(text.selectTime);
            }

            const chosen = singleSlots.find((s) => slotKey(s) === singleSlotKey) ?? singleSlots.find((s) => s.starts_at.slice(11, 16) === time);
            if (!chosen) {
                setMsgType("error");
                return setMsg(text.timeUnavailable);
            }

            await createSingleMut.mutateAsync({
                slug,
                service_id: serviceId,
                staff_id: staffId === "any" ? chosen.staff_id : staffId,
                starts_at: chosen.starts_at.slice(0, 16),
                client_name: clientName.trim(),
                client_phone: clientPhone.trim(),
                client_email: clientEmail.trim() || undefined,
                notes: notes.trim() || null,
                source: bookingSource,
                location_id: selectedLocationId ? Number(selectedLocationId) : undefined,
                redeem_points: redeemPoints ? Number(redeemPoints) : undefined,
                gift_card_code: giftCardCode.trim() || undefined,
                gift_card_amount: giftCardAmount ? Number(giftCardAmount) : undefined,
            });
            return;
        }

        if (mode === "multi") {
            if (!multiServiceIds.length) {
                setMsgType("error");
                return setMsg(text.selectOneService);
            }
            if (!multiTime) {
                setMsgType("error");
                return setMsg(text.selectCommonStart);
            }

            const chosen = multiSlots.find((s) => slotKey(s) === multiSlotKey) ?? multiSlots.find(
                (s) => s.starts_at.slice(11, 16) === multiTime
            );
            if (!chosen) {
                setMsgType("error");
                return setMsg(text.timeUnavailable);
            }

            await createMultiMut.mutateAsync({
                slug,
                service_ids: multiServiceIds,
                staff_id: multiStaffId === "any" ? chosen.staff_id : multiStaffId,
                starts_at: chosen.starts_at.slice(0, 16),
                client_name: clientName.trim(),
                client_phone: clientPhone.trim(),
                client_email: clientEmail.trim() || undefined,
                notes: notes.trim() || null,
                source: bookingSource,
                location_id: selectedLocationId ? Number(selectedLocationId) : undefined,
                redeem_points: redeemPoints ? Number(redeemPoints) : undefined,
                gift_card_code: giftCardCode.trim() || undefined,
                gift_card_amount: giftCardAmount ? Number(giftCardAmount) : undefined,
            });
            return;
        }

        if (!lines.length) {
            setMsgType("error");
            return setMsg(text.addOneService);
        }
        if (hasDuplicateLineServices()) {
            setMsgType("error");
            return setMsg(text.duplicateService);
        }
        if (lineOverlap) {
            setMsgType("error");
            return setMsg(`${text.overlapPrefix} ${lineOverlap.first}/${lineOverlap.second}. ${text.overlapAction}`);
        }

        const validServiceIds = new Set(services.map((item) => item.id));
        const validStaffIds = new Set(staff.map((item) => item.id));

        const payloadLines = lines.map((line) => {
            if (!line.service_id) {
                throw new Error(text.chooseEveryService);
            }
            if (!validServiceIds.has(Number(line.service_id))) {
                throw new Error(text.serviceUnavailableAtLocation);
            }
            if (!line.time) {
                throw new Error(text.chooseEveryTime);
            }
            if (line.staff_id !== "any" && !validStaffIds.has(Number(line.staff_id))) {
                throw new Error(text.staffUnavailableAtLocation);
            }

            const startsAt = `${line.date} ${line.time}`;

            return {
                service_id: Number(line.service_id),
                staff_id: line.staff_id === "any" ? undefined : Number(line.staff_id),
                starts_at: startsAt,
            };
        });

        try {
            await createLinesMut.mutateAsync({
                slug,
                lines: payloadLines,
                client_name: clientName.trim(),
                client_phone: clientPhone.trim(),
                client_email: clientEmail.trim() || undefined,
                notes: notes.trim() || null,
                source: bookingSource,
                location_id: selectedLocationId ? Number(selectedLocationId) : undefined,
            });
        } catch (error: unknown) {
            const message = getErrorMessage(error, "");
            if (message) {
                setMsgType("error");
                setMsg(message);
            }
        }
    }

    const isSubmitting =
        createSingleMut.isPending ||
        createMultiMut.isPending ||
        createLinesMut.isPending;

    const commonFieldsReady = clientName.trim().length >= 2 && clientPhone.trim().length >= 5;
    const locationReady = locations.length <= 1 || Boolean(selectedLocationId);
    const selectionReady = mode === "single"
        ? Boolean(serviceId && time && staff.length)
        : mode === "multi"
            ? Boolean(multiServiceIds.length && multiTime && staff.length)
            : Boolean(lines.length && lines.every((line) => line.service_id && line.date && line.time) && !hasDuplicateLineServices() && !lineOverlap && staff.length);
    const canSubmit = commonFieldsReady && locationReady && selectionReady && services.length > 0;

    const manageAccessExpired = (() => {
        const status = getHttpStatus(bookingDetailQ.error);
        return status === 401 || status === 403;
    })();

    if (businessQ.isLoading || servicesQ.isLoading || staffQ.isLoading) {
        return (
            <div className="vizit-booking-page min-h-screen bg-[radial-gradient(circle_at_top,_#faf8fc,_#f4effa_50%,_#ffffff)] transition-colors dark:bg-[radial-gradient(circle_at_top,_#211632,_#151020_52%,_#090712)] dark:text-white">
                <PublicBusinessHeader secondaryHref="/" secondaryLabel="Vizit" />
                <div className="flex items-center justify-center px-4 py-10">
                <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl px-8 py-10 text-center max-w-md w-full">
                    <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-fuchsia-500" />
                    <h2 className="text-xl font-semibold text-slate-900">
                        {text.loadingPage}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {text.wait}
                    </p>
                </div>
                </div>
                <PublicBusinessFooter compact />
            </div>
        );
    }

    if (!business) {
        return (
            <div className="vizit-booking-page min-h-screen bg-[#faf8fc] transition-colors dark:bg-[#090712] dark:text-white">
                <Seo title={`${text.notFound} | Vizit`} description={text.checkLink} robots="noindex,nofollow" />
                <PublicBusinessHeader secondaryHref="/" secondaryLabel="Vizit" />
                <div className="flex items-center justify-center px-4 py-10">
                <div className="max-w-md w-full rounded-3xl bg-white p-8 shadow-xl border border-slate-200 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900">
                        {text.notFound}
                    </h2>
                    <p className="text-slate-500 mt-2">
                        {text.checkLink}
                    </p>
                </div>
                </div>
                <PublicBusinessFooter compact />
            </div>
        );
    }

    const isBeauty = business.business_type === "beauty";

    return (
        <div className="vizit-booking-page min-h-screen bg-[radial-gradient(circle_at_top_left,_#f3edf9,_#faf8fc_44%,_#eaf8f6_76%,_#ffffff)] transition-colors dark:bg-[radial-gradient(circle_at_top_left,_#25173a,_#151020_44%,_#0d2423_78%,_#090712)] dark:text-white">
            <Seo
                title={`${text.bookNow} — ${business.name} | Vizit`}
                description={business.short_description || (isBeauty ? text.beautyIntro : text.clinicIntro)}
                image={business.cover_url || business.logo_url}
                canonical={`/book/${business.slug}`}
            />
            <PublicBusinessHeader business={business} primaryHref={`/businesses/${business.slug}`} primaryLabel={text.businessPage} secondaryHref="/" secondaryLabel="Vizit" />
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    className="grid gap-4 sm:gap-6 xl:grid-cols-[1fr_1.5fr]"
                >
                    <div className="space-y-6">
                        <div className="rounded-[28px] bg-gradient-to-br from-fuchsia-600 via-violet-600 to-sky-500 text-white shadow-2xl p-6 sm:p-8 overflow-hidden relative">
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                            <div className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                                    {isBeauty ? <Sparkles size={14} /> : <Stethoscope size={14} />}
                                    <span>{isBeauty ? text.beautyBadge : text.clinicBadge}</span>
                                </div>

                                <h1 className="mt-5 text-3xl sm:text-4xl font-bold leading-tight">
                                    {business.name}
                                </h1>

                                <p className="mt-3 text-white/85 text-sm sm:text-base leading-6">
                                    {isBeauty ? text.beautyIntro : text.clinicIntro}
                                </p>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur">
                                        <div className="text-white/75 text-xs">{text.workingHours}</div>
                                        <div className="mt-1 font-semibold">
                                            {String(business.work_start || "09:00").slice(0,5)} – {String(business.work_end || "18:00").slice(0,5)}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur">
                                        <div className="text-white/75 text-xs">{text.timezone}</div>
                                        <div className="mt-1 font-semibold">
                                            {business.timezone
                                                ? getTimezoneDisplay(business.timezone, locale)
                                                : "Asia/Yerevan"}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {!activeBookingCode && <div className="rounded-[24px] border border-white/70 bg-white/88 p-4 shadow-lg backdrop-blur-xl sm:p-5">
                            <div className="text-sm font-semibold text-slate-900">{text.chooseMode}</div>
                            <div className="mt-1 text-xs leading-5 text-slate-500">{text.modeIntro}</div>
                            <div className="mt-4 grid gap-2.5">
                                <ModeCard
                                    active={mode === "single"}
                                    icon={<Check className="h-5 w-5" />}
                                    title={text.singleMode}
                                    description={text.singleModeText}
                                    onClick={() => setMode("single")}
                                    color="from-sky-500 to-cyan-500"
                                />
                                <ModeCard
                                    active={mode === "multi"}
                                    icon={<Layers3 className="h-5 w-5" />}
                                    title={text.multiMode}
                                    description={text.multiModeText}
                                    onClick={() => setMode("multi")}
                                    color="from-violet-500 to-fuchsia-500"
                                />
                                <ModeCard
                                    active={mode === "lines"}
                                    icon={<Users className="h-5 w-5" />}
                                    title={text.linesMode}
                                    description={text.linesModeText}
                                    onClick={() => setMode("lines")}
                                    color="from-amber-500 to-orange-500"
                                />
                            </div>
                        </div>}
                    </div>

                    <div className="rounded-[24px] sm:rounded-[30px] bg-white/80 backdrop-blur-xl border border-white/70 shadow-2xl p-4 sm:p-6">
                        {msg && (
                            <div
                                className={mergeClass(
                                    "mb-6 rounded-2xl border px-4 py-4 flex items-start gap-3",
                                    msgType === "success"
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                        : "bg-rose-50 border-rose-200 text-rose-800"
                                )}
                            >
                                {msgType === "success" ? (
                                    <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                )}
                                <div>
                                    <div className="font-medium">{msg}</div>
                                    {resultCode && (
                                        <div className="mt-1 text-sm opacity-80">
                                            {text.bookingCode}: <span className="font-semibold">{resultCode}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {availabilityErrorText && mode !== "lines" && (
                            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                    <div>
                                        <div className="font-medium">{text.availabilityErrorTitle}</div>
                                        <div className="mt-1 leading-6">{availabilityErrorText}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(otpPanelOpen || (!!activeBookingCode && !guestToken)) && (
                            <div className="mb-6">
                                <OtpVerifyPanel
                                    bookingCode={activeBookingCode}
                                    otp={otp}
                                    expiresAt={otpExpiresAt}
                                    isSubmitting={verifyMut.isPending}
                                    isResending={resendMut.isPending}
                                    onOtpChange={setOtp}
                                    onVerify={() => verifyMut.mutate({ booking_code: activeBookingCode, otp })}
                                    onResend={() => activeBookingCode && resendMut.mutate(activeBookingCode)}
                                />
                            </div>
                        )}

                        {manageAccessExpired && activeBookingCode && (
                            <div className="mb-6 rounded-[24px] border border-amber-200 bg-amber-50/80 px-5 py-4 text-sm text-amber-900">
                                {text.expiredBanner}
                            </div>
                        )}

                        {bookingDetailQ.data?.data && (
                            <div className="mb-6">
                                <ManageBookingCard
                                    key={bookingDetailQ.data.data.booking_code}
                                    detail={bookingDetailQ.data.data}
                                    isLoading={bookingDetailQ.isFetching}
                                    onCancel={() => activeBookingCode && guestToken && cancelMut.mutate({ booking_code: activeBookingCode, token: guestToken })}
                                    isCancelling={cancelMut.isPending}
                                />
                            </div>
                        )}

                        {!activeBookingCode ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {locations.length > 1 && (
                                <section className="space-y-5">
                                    <SectionTitle
                                        title={text.locationTitle}
                                        subtitle={text.locationSubtitle}
                                    />
                                    <Field label={text.locationLabel} icon={<MapPin className="h-4 w-4" />}>
                                        <select
                                            name="location_id"
                                            className={inputClass}
                                            value={selectedLocationId}
                                            onChange={(e) => changeLocation(e.target.value ? Number(e.target.value) : "")}
                                        >
                                            <option value="">{text.chooseLocation}</option>
                                            {locations.map((location) => (
                                                <option key={location.id} value={location.id}>{locationOptionLabel(location, locale)}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </section>
                            )}
                            {selectedLocationId && servicesQ.isSuccess && !servicesQ.isFetching && services.length === 0 ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                                    {text.noLocationServices}
                                </div>
                            ) : null}
                            {mode === "single" && (
                                <section className="space-y-5">
                                    <SectionTitle
                                        title={text.singleTitle}
                                        subtitle={text.singleSubtitle}
                                    />

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Field label={`${text.service} *`}>
                                            <select
                                                className={inputClass}
                                                value={serviceId}
                                                onChange={(e) => {
                                                    setServiceId(Number(e.target.value));
                                                    setTime("");
                                                    setSingleSlotKey("");
                                                }}
                                            >
                                                {services.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name} • {s.duration_minutes} {text.minuteShort} • {formatMoney(s.price, s.currency, locale)}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>

                                        <Field label={text.staff}>
                                            <select
                                                className={inputClass}
                                                value={staffId}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setStaffId(v === "any" ? "any" : Number(v));
                                                    setTime("");
                                                    setSingleSlotKey("");
                                                }}
                                            >
                                                <option value="any">{text.anyStaff}</option>
                                                {staff.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>

                                        {!staffQ.isLoading && !staff.length && (
                                            <div className="xl:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                                {text.noBookableStaff}
                                            </div>
                                        )}

                                        <Field label={`${text.date} *`} icon={<CalendarDays className="h-4 w-4" />}>
                                            <input
                                                type="date"
                                                min={todayYmd}
                                                className={inputClass}
                                                value={date}
                                                onChange={(e) => {
                                                    setDate(e.target.value);
                                                    setTime("");
                                                    setSingleSlotKey("");
                                                }}
                                            />
                                        </Field>

                                        <Field label={`${text.time} *`} icon={<Clock3 className="h-4 w-4" />}>
                                            <select
                                                className={inputClass}
                                                value={singleSlotKey}
                                                onChange={(e) => {
                                                    const selected = singleSlots.find((slot) => slotKey(slot) === e.target.value);
                                                    setSingleSlotKey(e.target.value);
                                                    setTime(selected?.starts_at.slice(11, 16) ?? "");
                                                }}
                                                disabled={singleAvailabilityQ.isLoading || !singleSlots.length}
                                            >
                                                {singleAvailabilityQ.isLoading && <option>{text.loading}</option>}
                                                {!singleAvailabilityQ.isLoading && !singleSlots.length && (
                                                    <option>{text.noTimes}</option>
                                                )}
                                                {singleSlots.map((s) => {
                                                    return (
                                                        <option key={slotKey(s)} value={slotKey(s)}>
                                                            {slotLabel(s, staffId === "any")}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </Field>
                                    </div>

                                    {!singleAvailabilityQ.isLoading && !singleSlots.length && serviceId > 0 && (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                            {text.noDaySlots}
                                        </div>
                                    )}

                                    <SmartSuggestions
                                        slots={recommendedSingleSlots}
                                        value={singleSlotKey}
                                        onSelect={(slot) => {
                                            setSingleSlotKey(slotKey(slot));
                                            setTime(slot.starts_at.slice(11, 16));
                                        }}
                                        showStaff={staffId === "any"}
                                    />

                                    {selectedSingleService && (
                                        <ServicePreviewCard service={selectedSingleService} tone="sky" />
                                    )}
                                </section>
                            )}

                            {mode === "multi" && (
                                <section className="space-y-5">
                                    <SectionTitle
                                        title={text.multiTitle}
                                        subtitle={text.multiSubtitle}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-3">
                                            {text.chooseServices} *
                                        </label>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {services.map((service) => {
                                                const active = multiServiceIds.includes(service.id);
                                                return (
                                                    <button
                                                        key={service.id}
                                                        type="button"
                                                        onClick={() => toggleMultiService(service.id)}
                                                        className={mergeClass(
                                                            "text-left rounded-2xl border px-4 py-4 transition-all",
                                                            active
                                                                ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-100"
                                                                : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <div className="font-semibold text-slate-900">
                                                                    {service.name}
                                                                </div>
                                                                <div className="mt-1 text-sm text-slate-500">
                                                                    {service.duration_minutes} {text.minuteShort}
                                                                </div>
                                                            </div>
                                                            {active && (
                                                                <div className="rounded-full bg-violet-600 text-white p-1">
                                                                    <Check className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 text-sm text-violet-700 font-medium">
                                                            {formatMoney(service.price, service.currency, locale)}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        <Field label={text.staff}>
                                            <select
                                                className={inputClass}
                                                value={multiStaffId}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setMultiStaffId(v === "any" ? "any" : Number(v));
                                                    setMultiTime("");
                                                    setMultiSlotKey("");
                                                }}
                                            >
                                                <option value="any">{text.anyStaff}</option>
                                                {staff.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>

                                        <Field label={`${text.date} *`} icon={<CalendarDays className="h-4 w-4" />}>
                                            <input
                                                type="date"
                                                min={todayYmd}
                                                className={inputClass}
                                                value={multiDate}
                                                onChange={(e) => {
                                                    setMultiDate(e.target.value);
                                                    setMultiTime("");
                                                    setMultiSlotKey("");
                                                }}
                                            />
                                        </Field>

                                        <Field label={`${text.startTime} *`} icon={<Clock3 className="h-4 w-4" />}>
                                            <select
                                                className={inputClass}
                                                value={multiSlotKey}
                                                onChange={(e) => {
                                                    const selected = multiSlots.find((slot) => slotKey(slot) === e.target.value);
                                                    setMultiSlotKey(e.target.value);
                                                    setMultiTime(selected?.starts_at.slice(11, 16) ?? "");
                                                }}
                                                disabled={multiAvailabilityQ.isLoading || !multiSlots.length}
                                            >
                                                {multiAvailabilityQ.isLoading && <option>{text.loading}</option>}
                                                {!multiAvailabilityQ.isLoading && !multiSlots.length && (
                                                    <option>{text.noTimes}</option>
                                                )}
                                                {multiSlots.map((s) => {
                                                    return (
                                                        <option key={slotKey(s)} value={slotKey(s)}>
                                                            {slotLabel(s, multiStaffId === "any")}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </Field>
                                    </div>

                                    <SmartSuggestions
                                        slots={recommendedMultiSlots}
                                        value={multiSlotKey}
                                        onSelect={(slot) => {
                                            setMultiSlotKey(slotKey(slot));
                                            setMultiTime(slot.starts_at.slice(11, 16));
                                        }}
                                        showStaff={multiStaffId === "any"}
                                    />

                                    {!multiAvailabilityQ.isLoading && !multiSlots.length && multiServiceIds.length > 0 && (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                            {text.noCommonSlot}
                                        </div>
                                    )}

                                    <div className="rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-5 dark:border-violet-400/25 dark:from-violet-950/40 dark:to-fuchsia-950/35">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm text-slate-500">
                                                    {text.selectedServices}
                                                </div>
                                                <div className="mt-1 font-semibold text-slate-900">
                                                    {selectedMultiServices.length} {text.serviceCount}
                                                </div>
                                            </div>
                                            <div className="flex gap-3 flex-wrap">
                                                <StatPill
                                                    label={text.totalDuration}
                                                    value={`${multiTotal.duration} ${text.minuteShort}`}
                                                />
                                                <StatPill
                                                    label={text.totalPrice}
                                                    value={formatMoney(multiTotal.price, "AMD", locale)}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3">
                                            {selectedMultiServices.map((s) => (
                                                <div
                                                    key={s.id}
                                                    className="rounded-2xl bg-white/80 border border-white px-4 py-3 flex items-center justify-between gap-3"
                                                >
                                                    <div>
                                                        <div className="font-medium text-slate-900">{s.name}</div>
                                                        <div className="text-sm text-slate-500">
                                                            {s.duration_minutes} {text.minuteShort}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-semibold text-violet-700">
                                                        {formatMoney(s.price, s.currency, locale)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {mode === "lines" && (
                                <section className="space-y-5">
                                    <SectionTitle
                                        title={text.linesTitle}
                                        subtitle={text.linesSubtitle}
                                    />

                                    {hasDuplicateLineServices() && (
                                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                                            {text.duplicateBanner}
                                        </div>
                                    )}

                                    {lineOverlap ? (
                                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                                            {text.overlapPrefix} {lineOverlap.first}/{lineOverlap.second}. {text.overlapAction}
                                        </div>
                                    ) : null}

                                    <div className="space-y-4">
                                        {lines.map((line, index) => (
                                            <LineBookingCard
                                                key={line.id}
                                                line={line}
                                                index={index}
                                                slug={slug}
                                                services={services}
                                                staff={staff}
                                                locationId={selectedLocationId ? Number(selectedLocationId) : undefined}
                                                onChange={updateLine}
                                                onRemove={removeLine}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addLine}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-3 shadow-lg hover:opacity-95"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {text.addService}
                                    </button>
                                </section>
                            )}

                            <section className="space-y-5">
                                <SectionTitle
                                    title={text.yourDetails}
                                    subtitle={text.detailsSubtitle}
                                />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label={`${text.name} *`} icon={<User className="h-4 w-4" />}>
                                        <input
                                            name="client_name"
                                            autoComplete="name"
                                            className={inputClass}
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            placeholder={text.namePlaceholder}
                                        />
                                    </Field>

                                    <Field label={`${text.phone} *`} icon={<Phone className="h-4 w-4" />}>
                                        <input
                                            type="tel"
                                            name="client_phone"
                                            autoComplete="tel"
                                            className={inputClass}
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            placeholder={text.phonePlaceholder}
                                        />
                                    </Field>

                                    <Field label={text.emailOptional} icon={<Mail className="h-4 w-4" />}>
                                        <input
                                            type="email"
                                            name="client_email"
                                            autoComplete="email"
                                            className={inputClass}
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                            placeholder="example@mail.com"
                                        />
                                    </Field>

                                    <Field label={text.notes} icon={<MessageSquare className="h-4 w-4" />}>
                                        <input
                                            name="notes"
                                            className={inputClass}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder={text.notesPlaceholder}
                                        />
                                    </Field>
                                </div>

                                {mode !== 'lines' ? (
                                    <details className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                                            {text.discounts}
                                        </summary>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            <Field label={text.points} icon={<Star className="h-4 w-4" />}>
                                                <input type="number" name="redeem_points" min="0" className={inputClass} value={redeemPoints} onChange={(e) => setRedeemPoints(e.target.value)} placeholder={text.pointsPlaceholder} />
                                            </Field>
                                            <Field label={text.giftCode} icon={<Gift className="h-4 w-4" />}>
                                                <input name="gift_card_code" autoComplete="off" className={inputClass} value={giftCardCode} onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())} placeholder={text.giftCodePlaceholder} />
                                            </Field>
                                            <Field label={text.giftAmount} icon={<Wallet className="h-4 w-4" />}>
                                                <input type="number" name="gift_card_amount" min="0" className={inputClass} value={giftCardAmount} onChange={(e) => setGiftCardAmount(e.target.value)} placeholder={text.giftAmountPlaceholder} />
                                            </Field>
                                        </div>
                                    </details>
                                ) : null}
                            </section>

                            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-[#312641] dark:from-[#21162f] dark:to-[#151020] sm:p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="text-sm text-slate-500">{text.ready}</div>
                                        <div className="text-lg font-semibold text-slate-900">
                                            {mode === "single"
                                                ? text.readySingle
                                                : mode === "multi"
                                                    ? text.readyMulti
                                                    : text.readyLines}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !canSubmit}
                                        className={mergeClass(
                                            "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-white font-semibold shadow-xl transition-all",
                                            mode === "single" && "bg-gradient-to-r from-sky-500 to-cyan-500",
                                            mode === "multi" && "bg-gradient-to-r from-violet-500 to-fuchsia-500",
                                            mode === "lines" && "bg-gradient-to-r from-orange-500 to-rose-500",
                                            (isSubmitting || !canSubmit) && "opacity-60 cursor-not-allowed"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                {text.sending}
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-5 w-5" />
                                                {text.bookNow}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                        ) : (
                            <div className="mt-2 border-t border-slate-200 pt-5">
                                <button
                                    type="button"
                                    onClick={startNewBooking}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3.5 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 sm:w-auto"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    {text.newBooking}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
            <PublicBusinessFooter compact />
        </div>
    );
}

function SectionTitle({
                          title,
                          subtitle,
                      }: {
    title: string;
    subtitle: string;
}) {
    return (
        <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
    );
}

function Field({
                   label,
                   children,
                   icon,
               }: {
    label: string;
    children: ReactNode;
    icon?: ReactNode;
}) {
    const fieldId = useId();
    const existingId = isValidElement(children) ? (children as ReactElement<{ id?: string }>).props.id : undefined;
    const controlId = existingId ?? fieldId;
    const control = isValidElement(children)
        ? cloneElement(children as ReactElement<{ id?: string }>, { id: controlId })
        : children;

    return (
        <div>
            <label htmlFor={controlId} className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {icon}
                    </div>
                )}
                <div className={icon ? "[&>input]:pl-10 [&>select]:pl-10" : ""}>{control}</div>
            </div>
        </div>
    );
}

function ModeCard({
                      active,
                      icon,
                      title,
                      description,
                      onClick,
                      color,
                  }: {
    active: boolean;
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    color: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={mergeClass(
                "w-full rounded-2xl border p-3 text-left transition-all sm:p-4",
                active
                    ? "border-violet-300 bg-violet-50 shadow-sm ring-2 ring-violet-100"
                    : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
            )}
        >
            <div className="flex items-start gap-3">
                <div className={mergeClass("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r text-white", color)}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                        {title}
                        {active ? <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-600" /> : null}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{description}</div>
                </div>
            </div>
        </button>
    );
}
function StatPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white border border-violet-100 px-4 py-3 min-w-0">
            <div className="text-xs text-slate-500">{label}</div>
            <div className="mt-1 font-semibold text-slate-900">{value}</div>
        </div>
    );
}

function OtpVerifyPanel({
    bookingCode,
    otp,
    expiresAt,
    isSubmitting,
    isResending,
    onOtpChange,
    onVerify,
    onResend,
}: {
    bookingCode: string;
    otp: string;
    expiresAt: string | null;
    isSubmitting: boolean;
    isResending: boolean;
    onOtpChange: (value: string) => void;
    onVerify: () => void;
    onResend: () => void;
}) {
    const { locale } = useLanguage();
    const text = publicBookingCopy[locale];
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

    useEffect(() => {
        if (!expiresAt) return;

        const tick = () => {
            const next = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
            setRemainingSeconds(next);
        };

        const initialTimer = window.setTimeout(tick, 0);
        const timer = window.setInterval(tick, 1000);
        return () => {
            window.clearTimeout(initialTimer);
            window.clearInterval(timer);
        };
    }, [expiresAt]);

    const visibleRemainingSeconds = expiresAt ? remainingSeconds : 0;
    const minutes = String(Math.floor(visibleRemainingSeconds / 60)).padStart(2, "0");
    const seconds = String(visibleRemainingSeconds % 60).padStart(2, "0");

    return (
        <div className="rounded-[28px] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm dark:border-violet-400/25 dark:from-violet-950/40 dark:via-[#151020] dark:to-fuchsia-950/35 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-sm font-medium text-violet-700 dark:text-violet-300">{text.otpStep}</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{text.otpTitle}</div>
                    <div className="mt-2 text-sm text-slate-500">
                        {text.otpBookingCode}: <span className="font-semibold text-slate-900">{bookingCode}</span>
                    </div>
                </div>
                <div className="rounded-2xl bg-white border border-violet-100 px-4 py-3 text-sm text-slate-600">
                    <div className="font-semibold text-slate-900">{text.contactChannels}</div>
                    <div className="mt-1">{text.otpValid}: {expiresAt ? `${minutes}:${seconds}` : "--:--"}</div>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-violet-100 bg-white/90 px-4 py-4 text-sm text-slate-600">
                {text.otpHelp}
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto_auto]">
                <input
                    value={otp}
                    onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    name="booking_otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label={text.otpTitle}
                    placeholder={text.otpPlaceholder}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg font-semibold tracking-[0.35em] text-slate-900 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
                <button
                    type="button"
                    onClick={onVerify}
                    disabled={otp.trim().length < 4 || isSubmitting}
                    className="rounded-2xl bg-slate-900 px-5 py-4 font-semibold text-white disabled:opacity-60"
                >
                    {isSubmitting ? text.checking : text.confirm}
                </button>
                <button
                    type="button"
                    onClick={onResend}
                    disabled={isResending}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-700 disabled:opacity-60"
                >
                    {isResending ? text.resending : text.resend}
                </button>
            </div>
        </div>
    );
}

function ManageBookingCard({
    detail,
    isLoading,
    onCancel,
    isCancelling,
}: {
    detail: PublicBookingDetail;
    isLoading: boolean;
    onCancel: () => void;
    isCancelling: boolean;
}) {
    const { locale } = useLanguage();
    const text = publicBookingCopy[locale];
    const statusMeta = getStatusMeta(detail.status, detail.status_label, locale);
    const timezone = detail.business.timezone || "Asia/Yerevan";
    const [confirmingCancel, setConfirmingCancel] = useState(false);
    const cancellableBookings = detail.bookings.filter((booking) => !["cancelled", "done", "completed", "no_show"].includes(booking.status));

    async function copyBookingCode() {
        try {
            await navigator.clipboard.writeText(detail.booking_code);
        } catch {
            // ignore clipboard failures
        }
    }

    return (
        <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm dark:border-emerald-400/25 dark:from-emerald-950/40 dark:via-[#151020] dark:to-sky-950/35 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                        <ShieldCheck className="h-4 w-4" />
                        {text.secureActive}
                    </div>
                    <h3 className="mt-3 text-2xl font-bold text-slate-900">{detail.business.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                        <span>{text.customer}: {detail.client_name}</span>
                        <span>• {detail.client_phone}</span>
                        {detail.client_email ? <span>• {detail.client_email}</span> : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>
                            {statusMeta.label}
                        </span>
                        {detail.guest_access_expires_at ? (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                {text.manageUntil} {formatDateTime(detail.guest_access_expires_at, timezone, locale)}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={copyBookingCode}
                        aria-label={text.copiedLabel}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                    >
                        <Copy className="h-4 w-4" />
                        {detail.booking_code}
                    </button>
                    <button
                        type="button"
                        onClick={() => setConfirmingCancel(true)}
                        disabled={isCancelling || detail.status === "cancelled" || detail.can_cancel === false}
                        className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 disabled:opacity-60"
                    >
                        {isCancelling
                            ? text.cancelling
                            : detail.status === "cancelled"
                                ? text.cancelled
                                : cancellableBookings.length > 1
                                    ? `${text.cancelMany} (${cancellableBookings.length})`
                                    : text.cancelOne}
                    </button>
                </div>
            </div>

            {confirmingCancel ? (
                <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 p-4 sm:p-5">
                    <div className="font-semibold text-rose-900">
                        {cancellableBookings.length > 1
                            ? `${text.cancelManyWarning} (${cancellableBookings.length})`
                            : text.cancelOneWarning}
                    </div>
                    <div className="mt-3 space-y-2">
                        {cancellableBookings.map((booking) => (
                            <div key={booking.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">
                                <span>{booking.service?.name ?? text.service} · {formatDateTime(booking.starts_at, timezone, locale)}</span>
                                <span className="font-semibold">#{booking.booking_code}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setConfirmingCancel(false);
                                onCancel();
                            }}
                            disabled={isCancelling}
                            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {text.yesCancel}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmingCancel(false)}
                            disabled={isCancelling}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                        >
                            {text.goBack}
                        </button>
                    </div>
                </div>
            ) : null}

            <div className="mt-5 grid gap-3 2xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-3">
                    {detail.bookings.map((booking) => (
                        <div data-booking-id={booking.id} key={booking.id} className="rounded-3xl border border-white bg-white/90 px-4 py-4 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="font-semibold text-slate-900">{booking.service?.name ?? text.service}</div>
                                    <div className="mt-1 text-sm text-slate-500">
                                        {formatDateTime(booking.starts_at, timezone, locale)}
                                        {booking.staff?.name ? ` • ${booking.staff.name}` : ""}
                                    </div>
                                </div>
                                <div className="text-right text-sm">
                                    <div className="font-semibold text-slate-900">{formatMoney(booking.final_price ?? booking.service?.price, booking.currency ?? booking.service?.currency ?? detail.currency ?? "AMD", locale)}</div>
                                    <div className="mt-1 text-slate-500">#{booking.booking_code}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-3xl border border-white bg-white/90 px-4 py-4 shadow-sm space-y-4">
                    <div>
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{text.contact}</div>
                        <div className="mt-2 space-y-2 text-sm text-slate-600">
                            {detail.business.address ? (
                                <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-slate-400" /> <span>{detail.business.address}</span></div>
                            ) : null}
                            {detail.business.phone ? (
                                <div className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-slate-400" /> <a href={`tel:${detail.business.phone}`} className="hover:text-slate-900">{detail.business.phone}</a></div>
                            ) : null}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{text.total}</div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">
                            {formatMoney(detail.total_price, detail.currency ?? "AMD", locale)}
                        </div>
                    </div>

                    {detail.notes ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            {text.notes}: {detail.notes}
                        </div>
                    ) : null}
                </div>
            </div>

            {isLoading && <div className="mt-4 text-sm text-slate-500">{text.updating}</div>}
        </div>
    );
}

function ServicePreviewCard({
                                service,
                                tone,
                                compact = false,
                            }: {
    service: PublicService;
    tone: "sky" | "amber";
    compact?: boolean;
}) {
    const { locale } = useLanguage();
    const text = publicBookingCopy[locale];
    const tones =
        tone === "sky"
            ? "from-sky-50 to-cyan-50 border-sky-200 text-sky-700 dark:from-sky-950/45 dark:to-cyan-950/35 dark:border-sky-400/25 dark:text-sky-300"
            : "from-amber-50 to-orange-50 border-amber-200 text-amber-700 dark:from-amber-950/45 dark:to-orange-950/35 dark:border-amber-400/25 dark:text-amber-300";

    return (
        <div
            className={mergeClass(
                "rounded-3xl border bg-gradient-to-r p-4",
                tones,
                compact ? "p-4" : "p-5"
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="font-semibold text-slate-900">{service.name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                        {service.duration_minutes} {text.minuteShort} • {formatMoney(service.price, service.currency, locale)}
                    </div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-medium border border-white shadow-sm">
                    {text.selected}
                </div>
            </div>
        </div>
    );
}
