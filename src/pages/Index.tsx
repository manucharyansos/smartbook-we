import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, type Variants } from "framer-motion";
import {
  Accessibility,
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Camera,
  Car,
  ChevronRight,
  CirclePlus,
  Clock3,
  Droplets,
  Dumbbell,
  Flower2,
  Grid3X3,
  Hand,
  Heart,
  HeartPulse,
  Home,
  Hospital,
  LocateFixed,
  MapPin,
  Menu,
  MessagesSquare,
  MoreHorizontal,
  Scissors,
  Search,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Star,
  Stethoscope,
  TestTube2,
  UserRound,
  Users,
  WandSparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import Seo from "../components/Seo";
import VizitLogo from "../components/VizitLogo";
import YandexMap, { type VizitMapMarker } from "../components/maps/YandexMap";
import { useLanguage } from "../contexts/LanguageContext";
import { cn } from "../lib/cn";
import {
  fetchPublicBusinesses,
  fetchPublicCategories,
  fetchPublicMapPins,
  type PublicBusinessCategory,
  type PublicDirectoryBusiness,
  type PublicMapPin,
} from "../lib/publicApi";
import { publicPlansApi, type PublicPlan } from "../lib/planApi";
import { formatPlanPrice, localizePlanDescription, localizePlanNameForLocale, monthlyPlanPrice } from "../lib/planPresentation";

type BusinessFilter = "all" | "services" | "healthcare";
type LocationStatus = "idle" | "loading" | "active" | "error" | "unsupported";

const defaultPublicCategories: PublicBusinessCategory[] = [
  { slug: "beauty-salon", vertical: "services", name_hy: "Գեղեցկության սրահ", name_ru: "Салон красоты", name_en: "Beauty salon", icon: "sparkles" },
  { slug: "barber-shop", vertical: "services", name_hy: "Բարբերշոփ", name_ru: "Барбершоп", name_en: "Barber shop", icon: "scissors" },
  { slug: "nail-studio", vertical: "services", name_hy: "Մատնահարդարման ստուդիա", name_ru: "Ногтевая студия", name_en: "Nail studio", icon: "hand" },
  { slug: "massage-spa", vertical: "services", name_hy: "Մերսում և սպա", name_ru: "Массаж и спа", name_en: "Massage & spa", icon: "spa" },
  { slug: "fitness-trainer", vertical: "services", name_hy: "Ֆիթնես մարզիչ", name_ru: "Фитнес-тренер", name_en: "Fitness trainer", icon: "dumbbell" },
  { slug: "car-wash", vertical: "services", name_hy: "Ավտոլվացում", name_ru: "Автомойка", name_en: "Car wash", icon: "car" },
  { slug: "auto-service", vertical: "services", name_hy: "Ավտոսերվիս", name_ru: "Автосервис", name_en: "Auto service", icon: "wrench" },
  { slug: "consulting", vertical: "services", name_hy: "Խորհրդատվություն", name_ru: "Консультации", name_en: "Consulting", icon: "messages" },
  { slug: "courses", vertical: "services", name_hy: "Դասընթացներ", name_ru: "Курсы", name_en: "Courses", icon: "book-open" },
  { slug: "photo-studio", vertical: "services", name_hy: "Ֆոտոստուդիա", name_ru: "Фотостудия", name_en: "Photo studio", icon: "camera" },
  { slug: "other-services", vertical: "services", name_hy: "Այլ ծառայություն", name_ru: "Другая услуга", name_en: "Other service", icon: "grid" },
  { slug: "clinic", vertical: "healthcare", name_hy: "Կլինիկա", name_ru: "Клиника", name_en: "Clinic", icon: "hospital" },
  { slug: "dental-clinic", vertical: "healthcare", name_hy: "Ատամնաբուժարան", name_ru: "Стоматология", name_en: "Dental clinic", icon: "tooth" },
  { slug: "private-doctor", vertical: "healthcare", name_hy: "Մասնավոր բժիշկ", name_ru: "Частный врач", name_en: "Private doctor", icon: "stethoscope" },
  { slug: "diagnostic-center", vertical: "healthcare", name_hy: "Ախտորոշիչ կենտրոն", name_ru: "Диагностический центр", name_en: "Diagnostic center", icon: "activity" },
  { slug: "laboratory", vertical: "healthcare", name_hy: "Լաբորատորիա", name_ru: "Лаборатория", name_en: "Laboratory", icon: "test-tube" },
  { slug: "physiotherapy", vertical: "healthcare", name_hy: "Ֆիզիոթերապիա", name_ru: "Физиотерапия", name_en: "Physiotherapy", icon: "heart-pulse" },
  { slug: "rehabilitation", vertical: "healthcare", name_hy: "Ռեաբիլիտացիա", name_ru: "Реабилитация", name_en: "Rehabilitation", icon: "accessibility" },
  { slug: "other-healthcare", vertical: "healthcare", name_hy: "Այլ բժշկական ծառայություն", name_ru: "Другая медицинская услуга", name_en: "Other healthcare", icon: "plus-circle" },
];

type MapPinItem = {
  businessId: number;
  name: string;
  slug: string;
  locationId: number;
  locationName?: string | null;
  address?: string | null;
  categoryName?: string | null;
  vertical: "services" | "healthcare";
  lat: number;
  lng: number;
  bookingUrl: string;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.075 } },
};

const categoryIconRules: Array<{ keywords: string[]; Icon: LucideIcon; tone: string }> = [
  { keywords: ["hair", "barber", "beauty", "salon", "վարս", "գեղեց", "барбер", "салон"], Icon: Scissors, tone: "from-violet-100 to-indigo-50 text-violet-500" },
  { keywords: ["spa", "massage", "մերս", "սպա", "массаж", "спа"], Icon: Sparkles, tone: "from-fuchsia-100 to-pink-50 text-fuchsia-500" },
  { keywords: ["dental", "dent", "tooth", "ատամ", "դենտ", "ստոմ", "зуб"], Icon: HeartPulse, tone: "from-sky-100 to-blue-50 text-sky-500" },
  { keywords: ["medical", "clinic", "health", "hospital", "doctor", "բժշ", "առողջ", "կլինիկ", "մեդ", "врач", "мед", "клиник"], Icon: HeartPulse, tone: "from-cyan-100 to-sky-50 text-cyan-600" },
  { keywords: ["fitness", "gym", "coach", "մարզ", "ֆիթ", "спорт", "фит"], Icon: Dumbbell, tone: "from-emerald-100 to-green-50 text-emerald-500" },
  { keywords: ["nail", "manicure", "մատն", "ногт", "маник"], Icon: WandSparkles, tone: "from-pink-100 to-purple-50 text-pink-500" },
  { keywords: ["car", "auto", "wash", "ավտ", "լվաց", "маш", "авто"], Icon: Car, tone: "from-blue-100 to-cyan-50 text-blue-500" },
];

const categoryIconPresentations: Record<string, { Icon: LucideIcon; tone: string }> = {
  sparkles: { Icon: Sparkles, tone: "from-violet-100 to-indigo-50 text-violet-500" },
  scissors: { Icon: Scissors, tone: "from-purple-100 to-fuchsia-50 text-purple-500" },
  hand: { Icon: Hand, tone: "from-pink-100 to-rose-50 text-pink-500" },
  spa: { Icon: Flower2, tone: "from-fuchsia-100 to-pink-50 text-fuchsia-500" },
  dumbbell: { Icon: Dumbbell, tone: "from-emerald-100 to-green-50 text-emerald-600" },
  car: { Icon: Droplets, tone: "from-sky-100 to-cyan-50 text-sky-600" },
  wrench: { Icon: Wrench, tone: "from-amber-100 to-orange-50 text-amber-600" },
  messages: { Icon: MessagesSquare, tone: "from-indigo-100 to-blue-50 text-indigo-500" },
  "book-open": { Icon: BookOpen, tone: "from-blue-100 to-indigo-50 text-blue-600" },
  camera: { Icon: Camera, tone: "from-fuchsia-100 to-violet-50 text-fuchsia-600" },
  grid: { Icon: Grid3X3, tone: "from-slate-200 to-slate-50 text-slate-600" },
  hospital: { Icon: Hospital, tone: "from-cyan-100 to-sky-50 text-cyan-600" },
  tooth: { Icon: SmilePlus, tone: "from-sky-100 to-blue-50 text-sky-600" },
  stethoscope: { Icon: Stethoscope, tone: "from-blue-100 to-cyan-50 text-blue-600" },
  activity: { Icon: Activity, tone: "from-teal-100 to-cyan-50 text-teal-600" },
  "test-tube": { Icon: TestTube2, tone: "from-emerald-100 to-teal-50 text-emerald-600" },
  "heart-pulse": { Icon: HeartPulse, tone: "from-rose-100 to-pink-50 text-rose-500" },
  accessibility: { Icon: Accessibility, tone: "from-violet-100 to-purple-50 text-violet-600" },
  "plus-circle": { Icon: CirclePlus, tone: "from-cyan-100 to-blue-50 text-cyan-600" },
};

const categoryIconAliases: Record<string, keyof typeof categoryIconPresentations> = {
  "beauty-salon": "sparkles",
  "barber-shop": "scissors",
  "nail-studio": "hand",
  "massage-spa": "spa",
  "fitness-trainer": "dumbbell",
  "car-wash": "car",
  "auto-service": "wrench",
  consulting: "messages",
  courses: "book-open",
  "photo-studio": "camera",
  "other-services": "grid",
  clinic: "hospital",
  "dental-clinic": "tooth",
  "private-doctor": "stethoscope",
  "diagnostic-center": "activity",
  laboratory: "test-tube",
  physiotherapy: "heart-pulse",
  rehabilitation: "accessibility",
  "other-healthcare": "plus-circle",
};

function normalizeText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function normalizeVertical(value?: string | null): "services" | "healthcare" {
  const v = String(value ?? "").toLowerCase();
  return ["healthcare", "medical", "clinic", "dental"].includes(v) ? "healthcare" : "services";
}

function getCategoryName(category: PublicBusinessCategory | null | undefined, locale: string) {
  if (!category) return null;
  if (locale === "ru") return category.name_ru ?? category.name ?? category.name_hy ?? category.name_en ?? null;
  if (locale === "en") return category.name_en ?? category.name ?? category.name_hy ?? category.name_ru ?? null;
  return category.name_hy ?? category.name ?? category.name_ru ?? category.name_en ?? null;
}

function stableBusinessHash(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getBusinessInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toLocaleUpperCase();

  return initials || "V";
}

function getCategoryPresentation(category: PublicBusinessCategory): { Icon: LucideIcon; tone: string } {
  const value = `${category.slug ?? ""} ${category.icon ?? ""} ${category.name ?? ""} ${category.name_hy ?? ""} ${category.name_ru ?? ""} ${category.name_en ?? ""}`.toLowerCase();
  const iconKey = String(category.icon ?? "").toLowerCase().trim().replace(/_/g, "-");
  const slugKey = String(category.slug ?? "").toLowerCase().trim();
  const exactMatch = categoryIconPresentations[iconKey] ?? categoryIconPresentations[categoryIconAliases[slugKey] ?? slugKey];
  if (exactMatch) return exactMatch;
  const match = categoryIconRules.find((rule) => rule.keywords.some((keyword) => value.includes(keyword)));
  if (match) return { Icon: match.Icon, tone: match.tone };
  return normalizeVertical(category.vertical ?? category.slug) === "healthcare"
    ? { Icon: HeartPulse, tone: "from-cyan-100 to-sky-50 text-cyan-600" }
    : { Icon: Sparkles, tone: "from-violet-100 to-indigo-50 text-violet-500" };
}

function businessHaystack(item: PublicDirectoryBusiness) {
  const category = item.category;
  return normalizeText([
    item.name,
    item.slug,
    item.short_description,
    item.address,
    item.phone,
    item.custom_category_name,
    item.vertical,
    item.business_type,
    category?.slug,
    category?.name,
    category?.name_hy,
    category?.name_ru,
    category?.name_en,
    ...(item.locations ?? []).flatMap((location) => [location.name, location.address, location.city, location.district, location.phone]),
  ].filter(Boolean).join(" "));
}

function matchesSearch(item: PublicDirectoryBusiness, search: string) {
  const needle = normalizeText(search);
  if (!needle) return true;
  const haystack = businessHaystack(item);
  return needle.split(" ").every((part) => haystack.includes(part));
}

function matchesFilter(item: PublicDirectoryBusiness, filter: BusinessFilter) {
  if (filter === "all") return true;
  return normalizeVertical(item.category?.vertical ?? item.vertical ?? item.business_type) === filter;
}

function matchesCategory(item: PublicDirectoryBusiness, selectedCategorySlug: string | null) {
  if (!selectedCategorySlug) return true;
  const selected = normalizeText(selectedCategorySlug);
  const itemCategory = normalizeText(item.category?.slug ?? item.category?.name ?? item.category?.name_hy ?? item.custom_category_name);
  const vertical = normalizeVertical(item.category?.vertical ?? item.vertical ?? item.business_type);
  if (["services", "beauty", "salon"].includes(selected)) return vertical === "services";
  if (["healthcare", "dental", "clinic"].includes(selected)) return vertical === "healthcare";
  return !!itemCategory && (itemCategory.includes(selected) || selected.includes(itemCategory));
}

function deriveCategories(businesses: PublicDirectoryBusiness[]): PublicBusinessCategory[] {
  const map = new Map<string, PublicBusinessCategory>();

  businesses.forEach((business) => {
    const category = business.category;
    if (category?.slug || category?.name || category?.name_hy) {
      const slug = category.slug ?? `category-${category.id ?? business.id}`;
      if (!map.has(slug)) {
        map.set(slug, {
          id: category.id ?? business.id,
          slug,
          name: category.name ?? category.name_hy ?? category.name_ru ?? category.name_en ?? business.custom_category_name ?? "Category",
          name_hy: category.name_hy ?? category.name ?? business.custom_category_name ?? undefined,
          name_ru: category.name_ru,
          name_en: category.name_en,
          vertical: category.vertical ?? business.vertical ?? business.business_type,
          icon: category.icon,
        });
      }
      return;
    }

    const vertical = normalizeVertical(business.vertical ?? business.business_type);
    const slug = vertical === "healthcare" ? "healthcare" : "services";
    if (!map.has(slug)) {
      map.set(slug, {
        id: vertical === "healthcare" ? 2 : 1,
        slug,
        name: vertical === "healthcare" ? "Բժշկական" : "Ծառայություններ",
        name_hy: vertical === "healthcare" ? "Բժշկական" : "Ծառայություններ",
        name_ru: vertical === "healthcare" ? "Медицина" : "Услуги",
        name_en: vertical === "healthcare" ? "Healthcare" : "Services",
        vertical,
      });
    }
  });

  return Array.from(map.values());
}

function mergeCategories(primary: PublicBusinessCategory[], secondary: PublicBusinessCategory[]): PublicBusinessCategory[] {
  const map = new Map<string, PublicBusinessCategory>();

  [...primary, ...secondary].forEach((category, index) => {
    const key = category.slug ?? String(category.id ?? index);
    if (!map.has(key)) map.set(key, category);
  });

  return Array.from(map.values());
}

function numberOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function distanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const radians = (value: number) => (value * Math.PI) / 180;
  const dLat = radians(to.lat - from.lat);
  const dLng = radians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestBusinessDistance(item: PublicDirectoryBusiness, userLocation: { lat: number; lng: number }) {
  const distances = (item.locations ?? []).flatMap((location) => {
    const lat = numberOrNull(location.lat ?? location.latitude);
    const lng = numberOrNull(location.lng ?? location.longitude);
    return lat === null || lng === null ? [] : [distanceKm(userLocation, { lat, lng })];
  });
  return distances.length ? Math.min(...distances) : Number.POSITIVE_INFINITY;
}

function buildPinsFromBusinesses(businesses: PublicDirectoryBusiness[], locale: string): MapPinItem[] {
  return businesses.flatMap((business) => {
    const categoryName = getCategoryName(business.category, locale) ?? business.custom_category_name ?? null;
    const vertical = normalizeVertical(business.category?.vertical ?? business.vertical ?? business.business_type);
    return (business.locations ?? []).flatMap((location) => {
      const lat = numberOrNull(location.lat ?? location.latitude);
      const lng = numberOrNull(location.lng ?? location.longitude);
      if (lat === null || lng === null) return [];
      return [{
        businessId: business.id,
        name: business.name,
        slug: business.slug,
        locationId: location.id,
        locationName: location.name,
        address: location.address || business.address,
        categoryName,
        vertical,
        lat,
        lng,
        bookingUrl: `/book/${business.slug}?location_id=${location.id}`,
      }];
    });
  });
}

function chooseMapZoom(points: Array<{ lat: number; lng: number }>) {
  if (points.length <= 1) return 14;
  const latSpan = Math.max(...points.map((p) => p.lat)) - Math.min(...points.map((p) => p.lat));
  const lngSpan = Math.max(...points.map((p) => p.lng)) - Math.min(...points.map((p) => p.lng));
  const span = Math.max(latSpan, lngSpan);
  if (span < 0.015) return 14;
  if (span < 0.04) return 13;
  if (span < 0.09) return 12;
  if (span < 0.22) return 11;
  if (span < 0.55) return 10;
  return 9;
}

function publicPinToMapPin(pin: PublicMapPin): MapPinItem {
  const locationId = Number(pin.location_id || pin.business_id);
  return {
    businessId: Number(pin.business_id),
    name: pin.name,
    slug: pin.slug,
    locationId,
    locationName: pin.location_name ?? null,
    address: pin.address ?? null,
    categoryName: pin.category_name ?? null,
    vertical: normalizeVertical(pin.vertical),
    lat: Number(pin.lat),
    lng: Number(pin.lng),
    bookingUrl: pin.booking_url || `/book/${pin.slug}?location_id=${locationId}`,
  };
}

function matchesPinSearch(pin: MapPinItem, search: string) {
  const needle = normalizeText(search);
  if (!needle) return true;
  const haystack = normalizeText([pin.name, pin.slug, pin.address, pin.locationName, pin.categoryName, pin.vertical].filter(Boolean).join(" "));
  return needle.split(" ").every((part) => haystack.includes(part));
}

function defaultMapCenter(points: Array<{ lat: number; lng: number }>, userLocation: { lat: number; lng: number } | null) {
  const allPoints = [...points, ...(userLocation ? [userLocation] : [])];
  if (!allPoints.length) return { lat: 40.1772, lng: 44.5035 };
  return {
    lat: allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length,
    lng: allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length,
  };
}

function InteractiveBusinessMap({
  pins,
  selectedPin,
  selectedPinKey,
  setSelectedPinKey,
  userLocation,
}: {
  pins: MapPinItem[];
  selectedPin: MapPinItem | null;
  selectedPinKey: string | null;
  setSelectedPinKey: (key: string) => void;
  userLocation: { lat: number; lng: number } | null;
}) {
  const { t } = useLanguage();
  const [center, setCenter] = useState(() => defaultMapCenter(pins, userLocation));
  const [zoom, setZoom] = useState(() => chooseMapZoom(pins));
  const pinByKey = useMemo(() => new Map(pins.map((pin) => [`${pin.businessId}-${pin.locationId}`, pin])), [pins]);
  const markers = useMemo<VizitMapMarker[]>(() => {
    const businessMarkers = pins.map((pin) => {
      const key = `${pin.businessId}-${pin.locationId}`;
      const active = selectedPinKey === key || (!selectedPinKey && selectedPin?.businessId === pin.businessId && selectedPin?.locationId === pin.locationId);
      return {
        id: key,
        latitude: pin.lat,
        longitude: pin.lng,
        label: pin.name,
        active,
        variant: active ? "active" as const : pin.vertical === "healthcare" ? "healthcare" as const : "service" as const,
      };
    });

    return userLocation
      ? [...businessMarkers, {
          id: "user-location",
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          label: t("search.currentLocation"),
          variant: "user" as const,
        }]
      : businessMarkers;
  }, [pins, selectedPin, selectedPinKey, t, userLocation]);

  function fitMap() {
    const nextPoints = pins.map((pin) => ({ lat: pin.lat, lng: pin.lng }));
    setCenter(defaultMapCenter(nextPoints, userLocation));
    setZoom(chooseMapZoom(nextPoints));
  }

  function zoomMap(delta: number) {
    setZoom((current) => Math.min(19, Math.max(7, current + delta)));
  }

  return (
    <YandexMap
      center={{ latitude: center.lat, longitude: center.lng }}
      zoom={zoom}
      markers={markers}
      onLocationChange={(nextCenter, nextZoom) => {
        setCenter({ lat: nextCenter.latitude, lng: nextCenter.longitude });
        setZoom(nextZoom);
      }}
      onMarkerClick={(key) => {
        const pin = pinByKey.get(key);
        if (!pin) return;
        setSelectedPinKey(key);
        setCenter({ lat: pin.lat, lng: pin.lng });
        setZoom((current) => Math.max(current, 14));
      }}
      ariaLabel={t("map.title")}
      className="min-h-[390px] w-full min-w-0 rounded-[28px] border border-[#e8e2f0] shadow-[0_30px_100px_rgba(62,31,120,0.18)] dark:border-white/10 dark:shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:min-h-[520px] sm:rounded-[34px]"
    >
      <div className="pointer-events-none absolute left-3 top-3 z-30 flex max-w-[calc(100%_-_96px)] items-center gap-2 rounded-2xl border border-white/70 bg-white/88 px-3 py-2 text-[11px] font-bold text-[#3e1f78] shadow-[0_18px_60px_rgba(62,31,120,0.16)] backdrop-blur-2xl dark:border-white/14 dark:bg-slate-950/78 dark:text-white sm:left-5 sm:top-5 sm:px-4 sm:py-3 sm:text-xs">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#1e9e92] dark:text-cyan-200" />
        <span className="truncate">{t("map.instructions")}</span>
      </div>

      <div className="absolute right-3 top-3 z-30 grid overflow-hidden rounded-2xl border border-white/70 bg-white/92 text-[#3e1f78] shadow-[0_18px_60px_rgba(62,31,120,0.16)] backdrop-blur-2xl dark:border-white/14 dark:bg-slate-950/80 dark:text-white sm:right-5 sm:top-5">
        <button type="button" onClick={() => zoomMap(1)} className="grid h-10 w-10 place-items-center border-b border-[#e8e2f0] text-lg font-black transition hover:bg-[#f1edf7] dark:border-white/10 dark:hover:bg-white/10" aria-label={t("map.zoomIn")}>+</button>
        <button type="button" onClick={() => zoomMap(-1)} className="grid h-10 w-10 place-items-center border-b border-[#e8e2f0] text-lg font-black transition hover:bg-[#f1edf7] dark:border-white/10 dark:hover:bg-white/10" aria-label={t("map.zoomOut")}>−</button>
        <button type="button" onClick={fitMap} className="grid h-10 w-10 place-items-center transition hover:bg-[#f1edf7] dark:hover:bg-white/10" aria-label={t("map.center")}><LocateFixed className="h-4 w-4" /></button>
      </div>

      {!pins.length ? (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center p-6 text-center">
          <div className="max-w-md rounded-[28px] border border-white/70 bg-white/88 p-7 shadow-xl backdrop-blur-2xl dark:border-white/12 dark:bg-slate-950/78">
            <MapPin className="mx-auto h-10 w-10 text-[#1e9e92] dark:text-cyan-200" />
            <h3 className="mt-4 text-2xl font-black text-[#241736] dark:text-white">{t("map.emptyTitle")}</h3>
            <p className="mt-3 text-sm leading-7 text-[#6b6178] dark:text-slate-300">{t("map.emptyText")}</p>
          </div>
        </div>
      ) : null}
    </YandexMap>
  );
}

function SectionBadge({ children }: { children: ReactNode }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-[#1e9e92]/25 bg-[#1e9e92]/[0.08] px-4 py-2 text-xs font-semibold text-[#167d74] shadow-sm backdrop-blur-2xl dark:border-[#58d0c4]/25 dark:bg-[#58d0c4]/10 dark:text-[#8be3da] dark:shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:text-sm">{children}</div>;
}

function SearchPanel({
  search,
  setSearch,
  onSubmit,
  locationStatus,
  onUseLocation,
}: {
  search: string;
  setSearch: (value: string) => void;
  onSubmit: () => void;
  locationStatus: LocationStatus;
  onUseLocation: () => void;
}) {
  const { t } = useLanguage();
  const locationValue = locationStatus === "loading"
    ? t("search.locating")
    : locationStatus === "active"
      ? t("search.currentLocation")
      : t("search.city");
  const locationError = locationStatus === "unsupported"
    ? t("search.locationUnsupported")
    : locationStatus === "error"
      ? t("search.locationError")
      : null;

  return (
    <motion.form
      variants={fadeUp}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="vizit-search-panel mt-7 w-full max-w-[680px] rounded-[20px] border border-[#e8e2f0] bg-white p-2.5 shadow-[0_20px_55px_rgba(62,31,120,0.14)] dark:border-[#312641] dark:bg-[#151020] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:p-3"
    >
      <div className="grid items-stretch gap-2 md:grid-cols-[1fr_170px_118px]">
        <label className="vizit-search-field relative flex min-h-[62px] items-center rounded-[16px] px-3 text-left transition focus-within:bg-[#faf8fc] dark:focus-within:bg-white/[0.05] sm:px-4 md:border-r md:border-[#e8e2f0] dark:md:border-[#312641]">
          <Search className="mr-3 h-[21px] w-[21px] shrink-0 text-[#8f829e] dark:text-[#9488a3]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-[#6b6178] dark:text-[#b7adc5] sm:text-[14px]">{t("search.label")}</span>
            <input
              id="public-business-search"
              name="search"
              type="search"
              autoComplete="off"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search.placeholder")}
              className="mt-1 w-full bg-transparent text-[14px] font-medium text-[#241736] outline-none placeholder:text-[#a79db5] dark:text-white dark:placeholder:text-[#766b83]"
            />
          </span>
        </label>

        <button
          type="button"
          onClick={onUseLocation}
          disabled={locationStatus === "loading"}
          className="vizit-location-button flex min-h-[58px] items-center rounded-[16px] px-3 text-left transition hover:bg-[#faf8fc] disabled:cursor-wait disabled:opacity-70 dark:hover:bg-white/[0.05] sm:px-4"
          aria-label={t("search.useLocation")}
          title={t("search.useLocation")}
        >
          <MapPin className="mr-3 h-[21px] w-[21px] shrink-0 text-[#8f829e] dark:text-[#9488a3]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-[#6b6178] dark:text-[#b7adc5] sm:text-[14px]">{t("search.location")}</span>
            <span className="mt-1 block truncate text-[13px] font-medium text-[#6b6178] dark:text-[#b7adc5]" aria-live="polite">{locationValue}</span>
          </span>
          <LocateFixed className="ml-2 h-4 w-4 shrink-0 text-[#1e9e92] dark:text-[#58d0c4]" />
        </button>

        <button type="submit" className="vizit-search-submit inline-flex h-[54px] items-center justify-center gap-2 rounded-[16px] bg-[#5b2fa8] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(91,47,168,0.24)] transition hover:bg-[#3e1f78] dark:bg-[#a980f3] dark:text-[#160d22] dark:hover:bg-[#bd9cf8] md:h-auto">
          <Search className="h-4 w-4" /> {t("search.button")}
        </button>
      </div>
      {locationError ? <p className="px-3 pb-1 pt-2 text-left text-xs font-medium text-rose-600" role="status">{locationError}</p> : null}
    </motion.form>
  );
}

function HeroTicket() {
  const { t } = useLanguage();
  const previewCategories = [
    { label: t("businesses.services"), Icon: Sparkles, tone: "peach" },
    { label: t("businesses.healthcare"), Icon: HeartPulse, tone: "lilac" },
    { label: t("category.fallback"), Icon: Home, tone: "sage" },
    { label: t("categories.all"), Icon: Grid3X3, tone: "gold" },
  ];
  const previewBusinesses = [
    { name: "Nairi Clinic", label: t("businesses.healthcare"), Icon: Hospital, rating: "4.9" },
    { name: "Luna Beauty", label: t("businesses.services"), Icon: Sparkles, rating: "4.8" },
    { name: "Auto Premium", label: t("businesses.services"), Icon: Car, rating: "4.7" },
  ];

  return (
    <motion.div variants={fadeUp} className="vizit-hero-showcase" aria-label={t("seo.imageAlt")}>
      <div className="vizit-floating-card vizit-floating-card-time" aria-hidden="true">
        <Clock3 />
        <span><small>{t("ticket.dateValue")}</small><strong>14:30</strong></span>
      </div>
      <div className="vizit-floating-card vizit-floating-card-place" aria-hidden="true">
        <MapPin />
        <span><small>{t("map.selectedAddress")}</small><strong>{t("search.city")}</strong></span>
      </div>

      <div className="vizit-phone-frame">
        <span className="vizit-phone-speaker" aria-hidden="true" />
        <div className="vizit-phone-screen">
          <div className="vizit-phone-header">
            <Menu aria-hidden="true" />
            <VizitLogo />
            <span className="vizit-phone-bell"><Bell aria-hidden="true" /><i /></span>
          </div>

          <div className="vizit-phone-search"><Search aria-hidden="true" /><span>{t("search.label")}</span></div>
          <div className="vizit-phone-location"><MapPin aria-hidden="true" /><span>{t("search.city")}</span><ChevronRight aria-hidden="true" /></div>

          <div className="vizit-phone-categories">
            {previewCategories.map(({ label, Icon, tone }) => (
              <div key={label} className="vizit-phone-category">
                <span className={`vizit-phone-category-icon is-${tone}`}><Icon aria-hidden="true" /></span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="vizit-phone-section-head">
            <strong>{t("businesses.badge")}</strong>
            <span>{t("categories.all")} <ArrowRight aria-hidden="true" /></span>
          </div>

          <div className="vizit-phone-businesses">
            {previewBusinesses.map(({ name, label, Icon, rating }, index) => (
              <div key={name} className="vizit-phone-business">
                <span className={`vizit-phone-business-cover is-${index + 1}`}><Icon aria-hidden="true" /></span>
                <span className="vizit-phone-business-copy">
                  <strong>{name}</strong>
                  <small>{label}</small>
                  <span><Star aria-hidden="true" /> {rating}</span>
                </span>
                <span className="vizit-phone-business-place">{t("search.city")}</span>
              </div>
            ))}
          </div>

          <div className="vizit-phone-dock" aria-hidden="true">
            <span className="is-active"><Home /><small>{t("nav.home")}</small></span>
            <span><CalendarDays /><small>{t("nav.services")}</small></span>
            <span><Heart /><small>{t("nav.businesses")}</small></span>
            <span><MapPin /><small>{t("nav.map")}</small></span>
            <span><UserRound /><small>{t("nav.login")}</small></span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BusinessCardVisual({
  item,
  Icon,
  categoryName,
  locationLabel,
}: {
  item: PublicDirectoryBusiness;
  Icon: LucideIcon;
  categoryName: string;
  locationLabel: string;
}) {
  const [coverFailed, setCoverFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const coverUrl = coverFailed ? null : item.cover_url;
  const logoUrl = logoFailed ? null : item.logo_url;
  const initials = getBusinessInitials(item.name);
  const visualVariant = stableBusinessHash(`${item.slug}:${item.name}`) % 6;

  return (
    <div className="vizit-business-card-media vizit-preserve-dark relative h-[154px] overflow-hidden bg-slate-900 sm:h-44">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onError={() => setCoverFailed(true)}
          className="vizit-business-cover-image h-full w-full object-cover opacity-82 transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className={cn("vizit-business-cover-fallback", `is-${visualVariant}`, logoUrl && "has-logo")} aria-hidden="true">
          <span className="vizit-business-cover-orb is-top" />
          <span className="vizit-business-cover-orb is-bottom" />
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setLogoFailed(true)}
              className="vizit-business-logo-backdrop"
            />
          ) : (
            <span className="vizit-business-fallback-symbol">
              <Icon />
              <strong>{initials}</strong>
            </span>
          )}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/24 to-transparent" />
      <span className="vizit-business-category-pill absolute left-3 top-3 hidden max-w-[calc(100%_-_24px)] items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-xl md:inline-flex sm:left-4 sm:top-4 sm:text-xs">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{categoryName}</span>
      </span>
      <div className="vizit-business-overlay-identity absolute bottom-3 left-3 hidden min-w-0 items-center gap-3 pr-3 md:flex sm:bottom-4 sm:left-4 sm:pr-4">
        <div className="vizit-business-logo-tile grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] border border-white/20 bg-white/12 text-white shadow-2xl backdrop-blur-xl sm:h-12 sm:w-12 sm:rounded-2xl">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={item.name}
              loading="lazy"
              decoding="async"
              onError={() => setLogoFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="vizit-business-monogram" aria-hidden="true">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-black tracking-tight text-white sm:text-lg">{item.name}</h3>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-white/70 sm:mt-1 sm:text-xs">{locationLabel}</p>
        </div>
      </div>
    </div>
  );
}

function BusinessCard({ item, index }: { item: PublicDirectoryBusiness; index: number }) {
  const { locale, t } = useLanguage();
  const vertical = normalizeVertical(item.category?.vertical ?? item.vertical ?? item.business_type);
  const isHealthcare = vertical === "healthcare";
  const Icon = isHealthcare ? HeartPulse : Sparkles;
  const categoryName = getCategoryName(item.category, locale) ?? item.custom_category_name ?? (isHealthcare ? t("businesses.healthcare") : t("businesses.services"));
  const primaryLocation = item.locations?.find((location) => location.is_primary) ?? item.locations?.[0];
  // A directory card represents the whole business. When there are several
  // branches, let the customer choose instead of silently sending them to a
  // primary branch that may not offer the advertised services.
  const onlyLocation = item.locations?.length === 1 ? item.locations[0] : null;
  const bookingUrl = `/book/${item.slug}${onlyLocation?.id ? `?location_id=${onlyLocation.id}` : ""}`;
  const locationLabel = primaryLocation?.address || item.address || t("business.card.noAddress");

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      transition={{ delay: Math.min(index, 8) * 0.025 }}
      className="vizit-business-directory-card group grid w-[calc(100vw_-_36px)] max-w-[360px] shrink-0 snap-center grid-cols-[108px_minmax(0,1fr)] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.09)] backdrop-blur-2xl transition duration-300 hover:border-violet-200 dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_20px_60px_rgba(0,0,0,0.24)] dark:hover:bg-white/[0.10] md:flex md:w-auto md:max-w-none md:flex-col md:rounded-[28px] md:hover:-translate-y-1"
    >
      <BusinessCardVisual
        key={`${item.id}:${item.cover_url ?? ""}:${item.logo_url ?? ""}`}
        item={item}
        Icon={Icon}
        categoryName={categoryName}
        locationLabel={locationLabel}
      />
      <div className="vizit-business-card-body flex flex-1 flex-col p-4 sm:p-5">
        <header className="vizit-business-mobile-identity flex h-full min-w-0 flex-col md:hidden">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={`/businesses/${item.slug}`} className="block truncate text-[15px] font-black tracking-[-0.02em] text-[#321735] dark:text-[#fff8f2]">{item.name}</Link>
              <p className="mt-1 truncate text-[11px] font-semibold text-[#8a7182] dark:text-[#d7c8d4]">{categoryName}</p>
            </div>
            <Link to={bookingUrl} className="vizit-business-mobile-book grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#d39a43]/30 bg-[#fff8ef] text-[#a66f28] dark:border-[#e8c77f]/20 dark:bg-white/[0.07] dark:text-[#f0cf8d]" aria-label={`${t("business.card.book")} — ${item.name}`}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-auto grid gap-1.5 pt-3 text-[10px] font-semibold text-[#786675] dark:text-[#cdbfca]">
            <span className="inline-flex min-w-0 items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 shrink-0 text-[#d39a43]" /><b className="text-[#442044] dark:text-white">{item.services_count ?? 0}</b> {t("business.card.services")}</span>
            <span className="inline-flex min-w-0 items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-[#6d2a63] dark:text-[#e6bd76]" /><span className="truncate">{locationLabel}</span></span>
          </div>
        </header>
        <p className="vizit-business-description hidden min-h-[40px] text-[13px] leading-5 text-slate-600 dark:text-slate-300 md:line-clamp-2 sm:min-h-[44px] sm:text-sm sm:leading-[22px]">{item.short_description || t("business.card.defaultDescription")}</p>
        <div className="vizit-business-stats mt-4 hidden grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 md:grid sm:text-xs">
          <div className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.06]"><Sparkles className="h-4 w-4 shrink-0 text-violet-500" /><span className="min-w-0"><span className="font-black text-slate-950 dark:text-white">{item.services_count ?? 0}</span> <span className="truncate">{t("business.card.services")}</span></span></div>
          <div className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.06]"><Users className="h-4 w-4 shrink-0 text-cyan-500" /><span className="min-w-0"><span className="font-black text-slate-950 dark:text-white">{item.staff_count ?? 0}</span> <span className="truncate">{t("business.card.staff")}</span></span></div>
        </div>
        <div className="vizit-business-actions mt-auto hidden grid-cols-2 gap-2 pt-4 md:grid">
          <Link to={bookingUrl} className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-r from-violet-600 to-sky-500 px-3 py-3 text-[12px] font-black text-white shadow-[0_12px_28px_rgba(124,58,237,0.22)] transition hover:brightness-105 sm:text-sm">{t("business.card.book")} <ArrowRight className="h-4 w-4 shrink-0" /></Link>
          <Link to={`/businesses/${item.slug}`} className="inline-flex min-w-0 items-center justify-center rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-3 text-[12px] font-bold text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.10] sm:text-sm">{t("business.card.view")}</Link>
        </div>
      </div>
    </motion.article>
  );
}

function HomePlansSection() {
  const { t, locale } = useLanguage();
  const plansQ = useQuery({
    queryKey: ["home-public-plans-preview"],
    queryFn: async () => {
      const res = await publicPlansApi.list();
      return (res.data?.data ?? []) as PublicPlan[];
    },
  });

  return (
    <section id="plans" className="vizit-plans-section scroll-mt-24 bg-slate-50 px-5 py-16 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-9 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <SectionBadge><BadgeCheck className="h-4 w-4" /> {t("plans.badge")}</SectionBadge>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">{t("plans.title")}</h2>
          </div>
          <Link to="/pricing" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:border-white/12 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/[0.12]">{t("cta.pricing")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {plansQ.isLoading ? (
          <div className="vizit-plans-grid grid gap-5 md:grid-cols-3">{Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-[230px] animate-pulse rounded-[26px] border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.06]" />)}</div>
        ) : plansQ.isError ? (
          <div className="rounded-[24px] border border-rose-300/20 bg-rose-500/10 p-6 text-rose-100">{t("status.errorPlans")}</div>
        ) : (
          <div className="vizit-plans-grid grid gap-5 md:grid-cols-3">
            {(plansQ.data ?? []).slice(0, 3).map((plan) => (
              <div key={plan.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950">{t("plans.businessPlan")}</div>
                <h3 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">{localizePlanNameForLocale(plan, locale)}</h3>
                <div className="mt-4 text-3xl font-black text-slate-950 dark:text-white">{formatPlanPrice(monthlyPlanPrice(plan), plan.currency ?? undefined)}</div>
                <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500 dark:text-slate-300">{localizePlanDescription(plan, locale)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MobileDock() {
  const { t } = useLanguage();
  const items = [
    { href: "#top", label: t("nav.home"), Icon: Home },
    { href: "#categories", label: t("nav.services"), Icon: Grid3X3 },
    { href: "#businesses", label: t("nav.businesses"), Icon: Heart },
    { href: "#map", label: t("nav.map"), Icon: MapPin },
  ];

  return (
    <nav className="vizit-mobile-dock" aria-label={t("footer.navigation")}>
      {items.map(({ href, label, Icon }, index) => (
        <a key={href} href={href} className={index === 0 ? "is-active" : undefined}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
      <Link to="/login">
        <UserRound aria-hidden="true" />
        <span>{t("nav.login")}</span>
      </Link>
    </nav>
  );
}

export default function Index() {
  const { t, locale } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BusinessFilter>("all");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedPinKey, setSelectedPinKey] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  const businessesQ = useQuery({
    queryKey: ["public-businesses-home-final"],
    queryFn: () => fetchPublicBusinesses(),
    retry: 1,
    staleTime: 60_000,
  });

  const categoriesQ = useQuery({
    queryKey: ["public-business-categories", locale],
    queryFn: () => fetchPublicCategories({ locale }),
    retry: 1,
    staleTime: 5 * 60_000,
  });

  const mapPinsQ = useQuery({
    queryKey: ["public-business-map-pins", filter, selectedCategorySlug, search, userLocation?.lat ?? null, userLocation?.lng ?? null],
    queryFn: async () => fetchPublicMapPins({
      vertical: filter !== "all" ? filter : undefined,
      category: selectedCategorySlug ?? undefined,
      search: search || undefined,
      lat: userLocation?.lat,
      lng: userLocation?.lng,
      radius: userLocation ? 100 : undefined,
    }).catch(() => []),
    retry: false,
    staleTime: 60_000,
  });

  const allBusinesses = useMemo(() => businessesQ.data ?? [], [businessesQ.data]);
  const categories = useMemo(() => mergeCategories(mergeCategories(categoriesQ.data ?? [], defaultPublicCategories), deriveCategories(allBusinesses)), [allBusinesses, categoriesQ.data]);
  const filteredBusinesses = useMemo(() => {
    const matching = allBusinesses.filter((business) => matchesFilter(business, filter) && matchesCategory(business, selectedCategorySlug) && matchesSearch(business, search));
    return userLocation
      ? [...matching].sort((a, b) => nearestBusinessDistance(a, userLocation) - nearestBusinessDistance(b, userLocation))
      : matching;
  }, [allBusinesses, filter, search, selectedCategorySlug, userLocation]);
  const apiPins = useMemo(() => (mapPinsQ.data ?? []).map(publicPinToMapPin).filter((pin) => matchesPinSearch(pin, search)), [mapPinsQ.data, search]);
  const pins = useMemo(() => {
    const source = apiPins.length || userLocation ? apiPins : buildPinsFromBusinesses(filteredBusinesses, locale);
    return source.filter((pin) => matchesPinSearch(pin, search));
  }, [apiPins, filteredBusinesses, locale, search, userLocation]);
  const selectedPin = pins.find((pin) => `${pin.businessId}-${pin.locationId}` === selectedPinKey) ?? pins[0] ?? null;
  const popularChips = categories.slice(0, 5);

  const stats = useMemo(() => ({
    total: allBusinesses.length,
    services: allBusinesses.reduce((sum, item) => sum + Number(item.services_count ?? 0), 0),
    staff: allBusinesses.reduce((sum, item) => sum + Number(item.staff_count ?? 0), 0),
    categories: categories.length,
  }), [allBusinesses, categories.length]);

  const businessStat = (value: number) => businessesQ.isLoading ? "..." : businessesQ.isError ? "—" : value;
  const categoryStat = businessesQ.isLoading || categoriesQ.isLoading ? "..." : businessesQ.isError ? "—" : stats.categories;

  const bookingSteps = useMemo(() => [
    { number: "1", title: t("steps.search.title"), text: t("steps.search.text"), Icon: Search },
    { number: "2", title: t("steps.time.title"), text: t("steps.time.text"), Icon: CalendarDays },
    { number: "3", title: t("steps.confirm.title"), text: t("steps.confirm.text"), Icon: BadgeCheck },
  ], [t]);

  function selectCategory(category: PublicBusinessCategory) {
    const vertical = normalizeVertical(category.vertical ?? category.slug);
    setFilter(vertical);
    setSelectedCategorySlug(category.slug ?? null);
    requestAnimationFrame(() => document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function resetFilters() {
    setSearch("");
    setFilter("all");
    setSelectedCategorySlug(null);
    requestAnimationFrame(() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function scrollToResults() {
    requestAnimationFrame(() => document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setSelectedPinKey(null);
        setLocationStatus("active");
        requestAnimationFrame(() => document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }


  return (
    <div className="vizit-public-page min-h-screen overflow-x-clip bg-[#faf8fc] text-[#241736] transition-colors dark:bg-[#090712] dark:text-white">
      <Seo title={t("seo.homeTitle")} description={t("seo.homeDescription")} image="/og-default.svg" />
      <LandingNavbar />

      <main>
        <section id="top" className="vizit-hero-section relative overflow-hidden bg-[#faf8fc] px-5 pb-10 pt-[108px] transition-colors dark:bg-[#090712] sm:px-8 sm:pt-[126px] lg:pb-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(91,47,168,0.11),transparent_29%),radial-gradient(circle_at_84%_18%,rgba(30,158,146,0.10),transparent_28%),linear-gradient(180deg,#faf8fc_0%,#ffffff_64%,#faf8fc_100%)] dark:bg-[radial-gradient(circle_at_16%_10%,rgba(169,128,243,0.19),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(88,208,196,0.11),transparent_28%),linear-gradient(180deg,#090712_0%,#151020_62%,#090712_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(91,47,168,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(91,47,168,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_76%)] dark:opacity-50" />

          <motion.div variants={stagger} initial="hidden" animate="visible" className="vizit-hero-grid relative mx-auto grid max-w-[1160px] gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center xl:gap-12">
            <div className="vizit-hero-copy max-w-[650px] py-7 text-center lg:py-14 lg:text-left">
              <motion.div variants={fadeUp} className="vizit-hero-badge mx-auto inline-flex items-center gap-2 rounded-full border border-[#1e9e92]/25 bg-[#1e9e92]/[0.08] px-4 py-2 text-[12px] font-semibold text-[#167d74] shadow-sm backdrop-blur-2xl dark:border-[#58d0c4]/25 dark:bg-[#58d0c4]/10 dark:text-[#8be3da] dark:shadow-[0_16px_50px_rgba(0,0,0,0.22)] lg:mx-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1e9e92] dark:bg-[#58d0c4]" /> {t("hero.badge")}
              </motion.div>

              <motion.h1 variants={fadeUp} className="vizit-display mt-7 text-[clamp(2.25rem,10vw,3.25rem)] leading-[1.12] text-[#241736] dark:text-white sm:mt-8 sm:text-[58px] lg:text-[62px]">
                {t("hero.title1")} <span className="text-[#5b2fa8] dark:text-[#b898f4]">{t("hero.title2")}</span>{t("hero.titlePunctuation")}
              </motion.h1>

              <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-[560px] text-[15px] leading-7 text-[#6b6178] dark:text-[#b7adc5] sm:mt-6 sm:text-[17px] sm:leading-8 lg:mx-0">{t("hero.subtitle")}</motion.p>

              <SearchPanel search={search} setSearch={setSearch} onSubmit={scrollToResults} locationStatus={locationStatus} onUseLocation={useCurrentLocation} />

              {businessesQ.isError ? (
                <motion.div variants={fadeUp} className="mt-4 rounded-2xl border border-rose-300/50 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-300/25 dark:bg-rose-500/10 dark:text-rose-200">
                  {t("status.errorBusinesses")}
                </motion.div>
              ) : null}

              <motion.div variants={fadeUp} className="vizit-hero-chips mt-5 flex flex-wrap items-center justify-center gap-2 text-[12px] text-[#6b6178] dark:text-[#b7adc5] lg:justify-start">
                {popularChips.length ? popularChips.map((category) => {
                  const label = getCategoryName(category, locale) ?? t("category.fallback");
                  return <button key={category.slug ?? label} type="button" onClick={() => selectCategory(category)} className="rounded-full border border-[#e8e2f0] bg-white px-4 py-2 font-medium text-[#6b6178] transition hover:border-[#5b2fa8]/40 hover:bg-[#f1edf7] hover:text-[#3e1f78] dark:border-[#312641] dark:bg-white/[0.06] dark:text-[#c9bfd5] dark:hover:border-[#a980f3]/40 dark:hover:bg-white/10 dark:hover:text-white">{label}</button>;
                }) : null}
              </motion.div>

              <motion.div variants={fadeUp} className="vizit-hero-proof mt-6 grid gap-2 text-left text-xs text-[#6b6178] dark:text-[#b7adc5] sm:grid-cols-3">
                {[
                  { label: t("hero.proof.availability"), Icon: CalendarDays },
                  { label: t("hero.proof.noCalls"), Icon: ShieldCheck },
                  { label: t("hero.proof.reminders"), Icon: BadgeCheck },
                ].map(({ label, Icon }) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl px-1 py-1.5">
                    <Icon className="h-4 w-4 shrink-0 text-[#1e9e92] dark:text-[#58d0c4]" />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <HeroTicket />
          </motion.div>
        </section>

        <section id="categories" className="vizit-categories-section relative scroll-mt-24 bg-[#faf8fc] px-5 pb-8 transition-colors dark:bg-[#090712] sm:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="mx-auto max-w-[1320px] rounded-[26px] border border-[#e8e2f0] bg-white p-5 text-[#241736] shadow-[0_30px_100px_rgba(62,31,120,0.10)] dark:border-[#312641] dark:bg-[#151020] dark:text-white dark:shadow-[0_30px_100px_rgba(0,0,0,0.30)] sm:rounded-[30px] sm:p-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="vizit-display text-2xl sm:text-3xl">{t("categories.title")}</h2>
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-full px-2 text-sm font-semibold text-[#5b2fa8] transition hover:text-[#3e1f78] dark:text-[#b898f4] dark:hover:text-[#d8c6fa]">{t("categories.all")} <ArrowRight className="h-4 w-4" /></button>
            </div>

            {(businessesQ.isLoading || categoriesQ.isLoading) ? (
              <div className="vizit-category-slider -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 xl:grid-cols-7">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="min-h-[138px] w-[76vw] max-w-[280px] shrink-0 snap-start animate-pulse rounded-[20px] border border-slate-100 bg-slate-100 sm:w-auto sm:max-w-none" />)}</div>
            ) : categories.length ? (
              <div className="vizit-category-slider -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 xl:grid-cols-7">
                {categories.map((category) => {
                  const { Icon, tone } = getCategoryPresentation(category);
                  const label = getCategoryName(category, locale) ?? t("category.fallback");
                  const active = selectedCategorySlug === category.slug;
                  return (
                    <button key={category.slug ?? label} type="button" onClick={() => selectCategory(category)} className={cn("group min-h-[132px] w-[68vw] max-w-[250px] shrink-0 snap-start rounded-[20px] border p-4 text-center shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-violet-200 dark:shadow-black/20 sm:w-auto sm:max-w-none", active ? "border-violet-300 bg-violet-50 dark:border-violet-400/50 dark:bg-violet-500/15" : "border-slate-100 bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.10]")}>
                      <span className={cn("mx-auto grid h-[58px] w-[58px] place-items-center rounded-[18px] bg-gradient-to-br", tone)}><Icon className="h-8 w-8" /></span>
                      <span className="mt-4 block text-[13px] font-black leading-5 text-slate-950 dark:text-white">{label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
                <MoreHorizontal className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">{t("categories.empty.title")}</h3>
              </div>
            )}
          </motion.div>
        </section>

        <section id="how" className="vizit-how-section scroll-mt-24 bg-white px-0 py-10 text-[#241736] transition-colors dark:bg-[#090712] dark:text-white sm:px-8 sm:py-14 lg:py-18">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.16 }} className="mx-auto max-w-[1160px] rounded-none border-y border-[#e8e2f0] bg-[#faf8fc] p-5 shadow-[0_20px_70px_rgba(62,31,120,0.07)] dark:border-[#312641] dark:bg-[#151020] dark:shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:rounded-[34px] sm:border sm:p-8 lg:p-10">
            <motion.div variants={fadeUp} className="text-center">
              <SectionBadge><Sparkles className="h-4 w-4" /> {t("how.badge")}</SectionBadge>
              <h2 className="vizit-display mt-4 text-[28px] text-[#241736] dark:text-white sm:text-4xl">{t("how.title")}</h2>
            </motion.div>

            <div className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-3">
              {bookingSteps.map(({ number, title, text, Icon }) => (
                <motion.div key={number} variants={fadeUp} className="relative rounded-[22px] border border-[#e8e2f0] bg-white p-5 text-left shadow-[0_12px_38px_rgba(62,31,120,0.06)] dark:border-[#312641] dark:bg-white/[0.055] dark:shadow-[0_14px_42px_rgba(0,0,0,0.17)] sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="vizit-display grid h-10 w-10 place-items-center rounded-xl border-2 border-[#5b2fa8]/35 text-lg text-[#5b2fa8] dark:border-[#a980f3]/45 dark:text-[#c3a7ff]">{number}</span>
                    <Icon className="h-5 w-5 text-[#1e9e92] dark:text-[#58d0c4]" />
                  </div>
                  <h3 className="vizit-display mt-5 text-[18px] text-[#241736] dark:text-white">{title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#6b6178] dark:text-[#b7adc5]">{text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-5 grid grid-cols-2 gap-1 rounded-[18px] border border-[#e8e2f0] bg-white p-2 dark:border-[#312641] dark:bg-white/[0.055] sm:mt-7 sm:grid-cols-4 sm:gap-3 sm:rounded-[22px] sm:p-4">
              {[
                { value: businessStat(stats.total), label: t("stats.businesses"), Icon: Building2 },
                { value: businessStat(stats.services), label: t("stats.services"), Icon: Sparkles },
                { value: businessStat(stats.staff), label: t("stats.staff"), Icon: Users },
                { value: categoryStat, label: t("stats.categories"), Icon: Star },
              ].map(({ value, label, Icon }) => (
                <div key={label} className="flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-[14px] px-1 py-3 text-center sm:flex-row sm:gap-4 sm:rounded-[18px] sm:px-3 sm:py-4 sm:text-left xl:justify-center">
                  <Icon className="h-5 w-5 shrink-0 text-[#1e9e92] dark:text-[#58d0c4] sm:h-7 sm:w-7" />
                  <span className="min-w-0"><span className="vizit-display block text-xl font-bold leading-none text-[#5b2fa8] dark:text-[#b898f4] sm:text-[26px]">{value}</span><span className="mt-1.5 block text-[10px] font-medium leading-3 text-[#6b6178] dark:text-[#b7adc5] sm:mt-2 sm:text-[12px] sm:leading-4">{label}</span></span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section id="map" className="vizit-map-section scroll-mt-24 bg-slate-50 px-5 pb-8 pt-12 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8 sm:py-16 lg:py-20">
          <div className="mx-auto min-w-0 max-w-[1320px]">
            <div className="mb-8">
              <SectionBadge><MapPin className="h-4 w-4" /> {t("map.badge")}</SectionBadge>
              <h2 className="mt-5 max-w-3xl break-words text-[28px] font-black leading-[1.12] tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl sm:leading-none">{t("map.title")}</h2>
            </div>

            <div className="vizit-map-layout grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
              <InteractiveBusinessMap
                key={`${userLocation?.lat ?? "none"}:${userLocation?.lng ?? "none"}|${pins.map((pin) => `${pin.locationId}:${pin.lat.toFixed(5)},${pin.lng.toFixed(5)}`).join("|")}`}
                pins={pins}
                selectedPin={selectedPin}
                selectedPinKey={selectedPinKey}
                setSelectedPinKey={setSelectedPinKey}
                userLocation={userLocation}
              />

              <div className="vizit-map-panel min-w-0 max-w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:p-5">
                {selectedPin ? (
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 dark:border-white/12 dark:bg-white/[0.08] dark:text-cyan-100"><MapPin className="h-3.5 w-3.5" /> {t("map.selectedAddress")}</div>
                    <h3 className="mt-3 line-clamp-2 break-words text-xl font-black leading-7 text-slate-950 dark:text-white sm:mt-4 sm:text-2xl">{selectedPin.name}</h3>
                    <p className="mt-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">{selectedPin.categoryName || (selectedPin.vertical === "healthcare" ? t("businesses.healthcare") : t("businesses.services"))}</p>
                    <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-slate-500 dark:text-slate-300 sm:mt-4 sm:leading-7">{selectedPin.locationName ? `${selectedPin.locationName} · ` : ""}{selectedPin.address || t("business.card.noAddress")}</p>
                    <div className="mt-4 grid min-w-0 gap-2 sm:mt-5 sm:gap-3">
                      <Link to={selectedPin.bookingUrl} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-slate-100 sm:px-5 sm:py-3">{t("map.bookAddress")} <ArrowRight className="h-4 w-4 shrink-0" /></Link>
                      <Link to={`/businesses/${selectedPin.slug}`} className="inline-flex min-w-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:border-white/12 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.10] sm:px-5 sm:py-3">{t("business.card.view")}</Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <MapPin className="mx-auto h-10 w-10 text-cyan-200" />
                    <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{t("map.choosePin")}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-300">{t("map.choosePinText")}</p>
                  </div>
                )}

                {pins.length ? (
                  <div className="vizit-map-slider -mx-4 mt-4 flex min-w-0 max-w-[calc(100%_+_32px)] snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-5 sm:mt-6 sm:max-w-[calc(100%_+_40px)] sm:scroll-px-5 sm:px-5 lg:mx-0 lg:block lg:max-h-[280px] lg:max-w-full lg:space-y-2 lg:overflow-y-auto lg:px-0 lg:pb-0 lg:pr-1">
                    {pins.map((pin) => {
                      const active = selectedPin?.businessId === pin.businessId && selectedPin?.locationId === pin.locationId;
                      return (
                        <button
                          key={`list-${pin.businessId}-${pin.locationId}`}
                          type="button"
                          onClick={() => setSelectedPinKey(`${pin.businessId}-${pin.locationId}`)}
                          className={cn(
                            "flex w-[calc(100vw_-_80px)] max-w-[292px] shrink-0 snap-start items-start gap-3 rounded-2xl border p-3 text-left transition lg:w-full lg:max-w-none",
                            active
                              ? "border-violet-300 bg-violet-50 shadow-sm dark:border-violet-400/40 dark:bg-violet-500/15"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.045] dark:hover:bg-white/[0.09]",
                          )}
                        >
                          <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl", active ? "bg-gradient-to-br from-violet-600 to-sky-500 text-white" : "bg-white text-slate-950")}><MapPin className="h-4 w-4" /></span>
                          <span className="min-w-0"><span className="block truncate text-sm font-black text-slate-950 dark:text-white">{pin.name}</span><span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-300">{pin.address}</span></span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section id="businesses" className="vizit-businesses-section scroll-mt-24 bg-white px-5 py-12 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8 sm:py-16 lg:py-20">
          <div className="mx-auto min-w-0 max-w-[1320px]">
            <div className="mb-8 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="min-w-0">
                <SectionBadge><Star className="h-4 w-4" /> {t("businesses.badge")}</SectionBadge>
                <h2 className="mt-5 max-w-3xl break-words text-[28px] font-black leading-[1.12] tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl sm:leading-none">{t("businesses.title")}</h2>
              </div>
              <div className="min-w-0 max-w-full overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50 p-1 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.07]">
                <div className="flex max-w-full gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[
                    { key: "all", label: t("businesses.all") },
                    { key: "services", label: t("businesses.services") },
                    { key: "healthcare", label: t("businesses.healthcare") },
                  ].map((item) => (
                    <button key={item.key} type="button" onClick={() => { setFilter(item.key as BusinessFilter); setSelectedCategorySlug(null); }} className={cn("whitespace-nowrap rounded-[14px] px-4 py-2.5 text-sm font-black transition", filter === item.key && !selectedCategorySlug ? "bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950" : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white")}>{item.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {categories.length ? (
              <div className="mb-8 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible">
                {categories.map((category) => {
                  const label = getCategoryName(category, locale) ?? t("category.fallback");
                  const active = selectedCategorySlug === category.slug;
                  return (
                    <button
                      key={`business-filter-${category.slug ?? category.id ?? label}`}
                      type="button"
                      onClick={() => selectCategory(category)}
                      className={cn(
                        "whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-bold transition",
                        active
                          ? "border-violet-600 bg-violet-600 text-white dark:border-white dark:bg-white dark:text-slate-950"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.14] dark:hover:text-white",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {businessesQ.isLoading ? (
              <div className="vizit-business-slider flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-[calc((100%_-_350px)/2)] lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 8 }).map((_, idx) => <div key={idx} className="h-[340px] w-[calc(100vw_-_64px)] max-w-[350px] shrink-0 snap-center animate-pulse rounded-[24px] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] lg:w-auto lg:max-w-none" />)}</div>
            ) : businessesQ.isError ? (
              <div className="rounded-[24px] border border-rose-300/20 bg-rose-500/10 p-6 text-rose-100">{t("status.errorBusinesses")}</div>
            ) : !filteredBusinesses.length ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-10 text-center backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-slate-950"><Building2 className="h-7 w-7" /></div>
                <h3 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">{t("businesses.empty.title")}</h3>
              </div>
            ) : (
              <div className="vizit-business-slider flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-[calc((100%_-_350px)/2)] lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-3 2xl:grid-cols-4">{filteredBusinesses.map((item, index) => <BusinessCard key={item.id} item={item} index={index} />)}</div>
            )}
          </div>
        </section>

        <HomePlansSection />

        <section className="vizit-business-cta bg-white px-5 pb-20 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.16 }} className="mx-auto max-w-[1320px] overflow-hidden rounded-[34px] border border-violet-200 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(236,72,153,0.12),transparent_32%),rgba(248,250,252,0.96)] p-8 shadow-[0_34px_120px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/12 dark:bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(236,72,153,0.20),transparent_32%),rgba(255,255,255,0.07)] dark:shadow-[0_34px_120px_rgba(0,0,0,0.28)] sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <SectionBadge><BadgeCheck className="h-4 w-4" /> {t("cta.badge")}</SectionBadge>
                <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">{t("cta.title")}</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">{t("cta.text")}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100">{t("nav.start")} <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/pricing" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:border-white/12 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.10]">{t("cta.pricing")}</Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <MobileDock />
      <Footer />
    </div>
  );
}
