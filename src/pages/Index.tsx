import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, type Variants } from "framer-motion";
import {
  Accessibility,
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  Camera,
  Car,
  ChevronRight,
  CirclePlus,
  Dumbbell,
  FlaskConical,
  Grid3X3,
  HeartPulse,
  Hospital,
  LocateFixed,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Navigation,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  WandSparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import Seo from "../components/Seo";
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
import heroWoman from "../assets/vizit-hero-woman.png";

type BusinessFilter = "all" | "services" | "healthcare";
type LocationStatus = "idle" | "loading" | "active" | "error" | "unsupported";

const defaultPublicCategories: PublicBusinessCategory[] = [
  { slug: "beauty-salon", vertical: "services", name_hy: "Գեղեցկության սրահ", name_ru: "Салон красоты", name_en: "Beauty salon", icon: "sparkles" },
  { slug: "barber-shop", vertical: "services", name_hy: "Բարբերշոփ", name_ru: "Барбершоп", name_en: "Barber shop", icon: "scissors" },
  { slug: "nail-studio", vertical: "services", name_hy: "Մատնահարդարման ստուդիա", name_ru: "Ногтевая студия", name_en: "Nail studio", icon: "hand" },
  { slug: "massage-spa", vertical: "services", name_hy: "Մերսում և SPA", name_ru: "Массаж и SPA", name_en: "Massage & SPA", icon: "spa" },
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
  { keywords: ["private-doctor", "stethoscope", "doctor", "բժիշկ", "врач"], Icon: Stethoscope, tone: "from-cyan-100 to-sky-50 text-cyan-600" },
  { keywords: ["diagnostic", "activity", "ախտորոշ", "диагност"], Icon: Activity, tone: "from-blue-100 to-cyan-50 text-blue-600" },
  { keywords: ["laboratory", "test-tube", "լաբոր", "лаборатор"], Icon: FlaskConical, tone: "from-indigo-100 to-sky-50 text-indigo-600" },
  { keywords: ["physiotherapy", "heart-pulse", "ֆիզիոթեր", "физиотерап"], Icon: Activity, tone: "from-emerald-100 to-cyan-50 text-emerald-600" },
  { keywords: ["rehabilitation", "accessibility", "ռեաբիլիտ", "реабилит"], Icon: Accessibility, tone: "from-teal-100 to-emerald-50 text-teal-600" },
  { keywords: ["other-healthcare", "plus-circle"], Icon: CirclePlus, tone: "from-cyan-100 to-blue-50 text-cyan-600" },
  { keywords: ["medical", "clinic", "health", "hospital", "բժշ", "առողջ", "կլինիկ", "մեդ", "мед", "клиник"], Icon: Hospital, tone: "from-cyan-100 to-sky-50 text-cyan-600" },
  { keywords: ["fitness", "gym", "coach", "մարզ", "ֆիթ", "спорт", "фит"], Icon: Dumbbell, tone: "from-emerald-100 to-green-50 text-emerald-500" },
  { keywords: ["nail", "manicure", "մատն", "ногт", "маник"], Icon: WandSparkles, tone: "from-pink-100 to-purple-50 text-pink-500" },
  { keywords: ["auto-service", "wrench", "ավտոսերվիս", "автосервис"], Icon: Wrench, tone: "from-slate-200 to-blue-50 text-slate-600" },
  { keywords: ["car", "auto", "wash", "ավտ", "լվաց", "маш", "авто"], Icon: Car, tone: "from-blue-100 to-cyan-50 text-blue-500" },
  { keywords: ["consult", "messages", "խորհրդ", "консульта"], Icon: MessageCircle, tone: "from-amber-100 to-orange-50 text-amber-600" },
  { keywords: ["course", "book-open", "դասընթաց", "курс"], Icon: BookOpen, tone: "from-orange-100 to-amber-50 text-orange-600" },
  { keywords: ["photo", "camera", "ֆոտո", "фото"], Icon: Camera, tone: "from-rose-100 to-fuchsia-50 text-rose-600" },
  { keywords: ["other", "grid"], Icon: Grid3X3, tone: "from-slate-200 to-violet-50 text-slate-600" },
];

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

function getCategoryPresentation(category: PublicBusinessCategory): { Icon: LucideIcon; tone: string } {
  const value = `${category.slug ?? ""} ${category.icon ?? ""} ${category.name ?? ""} ${category.name_hy ?? ""} ${category.name_ru ?? ""} ${category.name_en ?? ""}`.toLowerCase();
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lonToTileX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat: number, zoom: number) {
  const safeLat = clamp(lat, -85.05112878, 85.05112878);
  const rad = (safeLat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom;
}

function tileXToLon(x: number, zoom: number) {
  return (x / 2 ** zoom) * 360 - 180;
}

function tileYToLat(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
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

type MapTile = { key: string; x: number; y: number; z: number; left: number; top: number; url: string };

function defaultMapCenter(points: Array<{ lat: number; lng: number }>, userLocation: { lat: number; lng: number } | null) {
  const allPoints = [...points, ...(userLocation ? [userLocation] : [])];
  if (!allPoints.length) return { lat: 40.1772, lng: 44.5035 };
  return {
    lat: allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length,
    lng: allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length,
  };
}

function buildMapModel(center: { lat: number; lng: number }, zoom: number) {
  const centerX = lonToTileX(center.lng, zoom);
  const centerY = latToTileY(center.lat, zoom);
  const tiles: MapTile[] = [];

  for (let dx = -3; dx <= 3; dx += 1) {
    for (let dy = -3; dy <= 3; dy += 1) {
      const x = Math.floor(centerX) + dx;
      const y = Math.floor(centerY) + dy;
      const maxTile = 2 ** zoom;
      if (y < 0 || y >= maxTile) continue;
      const wrappedX = ((x % maxTile) + maxTile) % maxTile;
      tiles.push({
        key: `${zoom}-${wrappedX}-${y}`,
        x: wrappedX,
        y,
        z: zoom,
        left: (x - centerX) * 256,
        top: (y - centerY) * 256,
        url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
      });
    }
  }

  const toPixel = (lat: number, lng: number) => ({
    left: (lonToTileX(lng, zoom) - centerX) * 256,
    top: (latToTileY(lat, zoom) - centerY) * 256,
  });

  return { center, zoom, centerX, centerY, tiles, toPixel };
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
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; centerX: number; centerY: number; zoom: number } | null>(null);
  const model = useMemo(() => buildMapModel(center, zoom), [center, zoom]);

  function fitMap() {
    const nextPoints = pins.map((pin) => ({ lat: pin.lat, lng: pin.lng }));
    setCenter(defaultMapCenter(nextPoints, userLocation));
    setZoom(chooseMapZoom(nextPoints));
  }

  function zoomMap(delta: number) {
    setZoom((current) => clamp(current + delta, 7, 17));
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button,a")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      centerX: lonToTileX(center.lng, zoom),
      centerY: latToTileY(center.lat, zoom),
      zoom,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    const nextCenterX = dragRef.current.centerX - dx / 256;
    const nextCenterY = dragRef.current.centerY - dy / 256;
    setCenter({
      lat: clamp(tileYToLat(nextCenterY, dragRef.current.zoom), -85, 85),
      lng: tileXToLon(nextCenterX, dragRef.current.zoom),
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current) {
      try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* pointer may already be released */ }
    }
    dragRef.current = null;
    setIsDragging(false);
  }

  return (
    <div
      className={cn(
        "vizit-preserve-dark relative min-h-[390px] touch-none overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:min-h-[520px] sm:rounded-[34px]",
        isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="absolute inset-0 bg-[#0a1020]" />
      {model.tiles.map((tile) => (
        <img
          key={tile.key}
          src={tile.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          draggable={false}
          className="pointer-events-none absolute h-64 w-64 select-none"
          style={{ left: `calc(50% + ${tile.left}px)`, top: `calc(50% + ${tile.top}px)` }}
        />
      ))}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_18%,rgba(124,58,237,0.16),transparent_28%),linear-gradient(180deg,rgba(5,11,22,0.04),rgba(5,11,22,0.30))]" />

      <div className="absolute left-3 top-3 z-30 flex max-w-[calc(100%-96px)] items-center gap-2 rounded-2xl border border-white/14 bg-slate-950/76 px-3 py-2 text-[11px] font-bold text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:left-5 sm:top-5 sm:px-4 sm:py-3 sm:text-xs">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-cyan-200" />
        <span className="truncate">{t("map.instructions")}</span>
      </div>

      <div onPointerDown={(event) => event.stopPropagation()} className="absolute right-3 top-3 z-30 grid overflow-hidden rounded-2xl border border-white/14 bg-slate-950/78 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:right-5 sm:top-5">
        <button type="button" onClick={() => zoomMap(1)} className="grid h-10 w-10 place-items-center border-b border-white/10 text-lg font-black text-white transition hover:bg-white/10" aria-label={t("map.zoomIn")}>+</button>
        <button type="button" onClick={() => zoomMap(-1)} className="grid h-10 w-10 place-items-center border-b border-white/10 text-lg font-black text-white transition hover:bg-white/10" aria-label={t("map.zoomOut")}>−</button>
        <button type="button" onClick={fitMap} className="grid h-10 w-10 place-items-center text-white transition hover:bg-white/10" aria-label={t("map.center")}><LocateFixed className="h-4 w-4" /></button>
      </div>

      {userLocation ? (() => {
        const point = model.toPixel(userLocation.lat, userLocation.lng);
        return (
          <div
            className="absolute z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-cyan-400 shadow-[0_0_0_12px_rgba(34,211,238,0.18)]"
            style={{ left: `calc(50% + ${point.left}px)`, top: `calc(50% + ${point.top}px)` }}
            title={t("search.location")}
          />
        );
      })() : null}

      {pins.length ? pins.map((pin) => {
        const point = model.toPixel(pin.lat, pin.lng);
        const key = `${pin.businessId}-${pin.locationId}`;
        const active = selectedPinKey === key || (!selectedPinKey && selectedPin?.businessId === pin.businessId && selectedPin?.locationId === pin.locationId);
        return (
          <button
            key={key}
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setSelectedPinKey(key);
              setCenter({ lat: pin.lat, lng: pin.lng });
              setZoom((current) => Math.max(current, 14));
            }}
            className={cn(
              "group absolute z-20 -translate-x-1/2 -translate-y-full rounded-full text-white transition hover:z-30 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-300/35",
              active ? "z-30 scale-110" : "",
            )}
            style={{ left: `calc(50% + ${point.left}px)`, top: `calc(50% + ${point.top}px)` }}
            aria-label={pin.name}
          >
            <span className={cn(
              "grid h-11 w-11 place-items-center rounded-full border border-white/30 shadow-[0_18px_50px_rgba(0,0,0,0.40)] sm:h-12 sm:w-12",
              active
                ? "bg-gradient-to-br from-fuchsia-500 to-cyan-400"
                : pin.vertical === "healthcare"
                  ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                  : "bg-gradient-to-br from-violet-500 to-fuchsia-500",
            )}>
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-950/90 px-3 py-1.5 text-[11px] font-black shadow-xl backdrop-blur-xl group-hover:block sm:block">
              {pin.name}
            </span>
          </button>
        );
      }) : (
        <div className="absolute inset-0 z-10 grid place-items-center p-6 text-center">
          <div className="max-w-md rounded-[28px] border border-white/12 bg-slate-950/78 p-7 backdrop-blur-2xl">
            <MapPin className="mx-auto h-10 w-10 text-cyan-200" />
            <h3 className="mt-4 text-2xl font-black text-white">{t("map.emptyTitle")}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{t("map.emptyText")}</p>
          </div>
        </div>
      )}

      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={(event) => event.stopPropagation()}
        className="absolute bottom-3 right-3 z-20 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm"
      >
        © OpenStreetMap contributors
      </a>
    </div>
  );
}

function SectionBadge({ children }: { children: ReactNode }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-700 shadow-sm backdrop-blur-2xl dark:border-white/12 dark:bg-white/[0.07] dark:text-cyan-100 dark:shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:text-sm">{children}</div>;
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
      className="mt-7 w-full max-w-[680px] rounded-[22px] bg-white p-2.5 shadow-[0_24px_90px_rgba(2,6,23,0.38)] sm:p-3"
    >
      <div className="grid items-stretch gap-2 md:grid-cols-[1fr_170px_118px]">
        <label className="relative flex min-h-[62px] items-center rounded-[16px] px-3 text-left transition focus-within:bg-slate-50 sm:px-4 md:border-r md:border-slate-200">
          <Search className="mr-3 h-[21px] w-[21px] shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-slate-500 sm:text-[14px]">{t("search.label")}</span>
            <input
              id="public-business-search"
              name="search"
              type="search"
              autoComplete="off"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search.placeholder")}
              className="mt-1 w-full bg-transparent text-[14px] font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </span>
        </label>

        <button
          type="button"
          onClick={onUseLocation}
          disabled={locationStatus === "loading"}
          className="flex min-h-[58px] items-center rounded-[16px] px-3 text-left transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70 sm:px-4"
          aria-label={t("search.useLocation")}
          title={t("search.useLocation")}
        >
          <MapPin className="mr-3 h-[21px] w-[21px] shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-slate-500 sm:text-[14px]">{t("search.location")}</span>
            <span className="mt-1 block truncate text-[13px] font-semibold text-slate-500" aria-live="polite">{locationValue}</span>
          </span>
          <LocateFixed className="ml-2 h-4 w-4 shrink-0 text-violet-500" />
        </button>

        <button type="submit" className="inline-flex h-[54px] items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#9a55ff] to-[#26a8ff] px-5 text-[14px] font-black text-white shadow-[0_14px_30px_rgba(38,168,255,0.32)] md:h-auto">
          <Search className="h-4 w-4" /> {t("search.button")}
        </button>
      </div>
      {locationError ? <p className="px-3 pb-1 pt-2 text-left text-xs font-medium text-rose-600" role="status">{locationError}</p> : null}
    </motion.form>
  );
}

function HeroVisual({ businessCount, servicesCount, staffCount }: { businessCount: number | string; servicesCount: number | string; staffCount: number | string }) {
  const { t } = useLanguage();
  return (
    <motion.div variants={fadeUp} className="relative hidden min-h-[560px] xl:block">
      <div className="absolute left-[7%] top-[116px] h-[335px] w-[360px] skew-x-[-16deg] rounded-[24px] bg-gradient-to-br from-[#1b315e]/65 via-[#3d3f96]/55 to-[#8f4cff]/55 opacity-70" />
      <div className="absolute left-[30%] top-[202px] h-[278px] w-[410px] skew-x-[-16deg] rounded-[26px] bg-gradient-to-br from-[#5231a7]/80 via-[#8d54ee]/68 to-[#273a82]/65 opacity-80" />
      <img src={heroWoman} alt={t("seo.imageAlt")} className="absolute bottom-0 left-[56px] z-10 h-[520px] w-auto select-none object-contain drop-shadow-[0_34px_70px_rgba(0,0,0,0.35)]" draggable={false} />

      {[
        { top: "72px", value: businessCount, label: t("stats.businesses"), Icon: Building2, color: "text-[#93b5ff]", trend: true },
        { top: "218px", value: servicesCount, label: t("stats.services"), Icon: Sparkles, color: "text-[#ffc857]", trend: false },
        { top: "360px", value: staffCount, label: t("stats.staff"), Icon: CalendarDays, color: "text-cyan-200", trend: false },
      ].map(({ top, value, label, Icon, color, trend }) => (
        <motion.div key={label} variants={fadeUp} className="absolute right-[4px] z-20 w-[224px] rounded-[20px] border border-white/10 bg-white/[0.105] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl" style={{ top }}>
          <div className="flex items-center gap-4">
            <span className={cn("grid h-[52px] w-[52px] place-items-center rounded-[15px] bg-white/10", color)}>
              <Icon className="h-7 w-7" />
            </span>
            <span className="min-w-0">
              <span className="block text-[19px] font-black leading-none">{value}</span>
              <span className="mt-2 block text-[11px] font-bold leading-4 text-white/72">{label}</span>
              {trend ? <TrendingUp className="mt-2 h-6 w-12 text-emerald-300" /> : null}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function MobileStats({ stats }: { stats: { total: number | string; services: number | string; staff: number | string } }) {
  const { t } = useLanguage();
  const items = [
    { value: stats.total, label: t("stats.businesses"), Icon: Building2 },
    { value: stats.services, label: t("stats.services"), Icon: Sparkles },
    { value: stats.staff, label: t("stats.staff"), Icon: Users },
  ];
  return (
    <motion.div variants={fadeUp} className="mt-7 grid grid-cols-3 gap-2 xl:hidden">
      {items.map(({ value, label, Icon }) => (
        <div key={label} className="rounded-[18px] border border-slate-200 bg-white/80 p-3 text-center shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08] sm:p-4">
          <Icon className="mx-auto h-5 w-5 text-violet-500 dark:text-cyan-200" />
          <div className="mt-2 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{value}</div>
          <div className="mt-1 text-[10px] font-bold leading-4 text-slate-600 dark:text-slate-200 sm:text-xs">{label}</div>
        </div>
      ))}
    </motion.div>
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

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      transition={{ delay: index * 0.025 }}
      className="group flex w-[84vw] min-w-[286px] max-w-[330px] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.09)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-violet-200 dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_20px_60px_rgba(0,0,0,0.24)] dark:hover:bg-white/[0.10] sm:rounded-[28px] lg:w-auto lg:min-w-0 lg:max-w-none"
    >
      <div className="vizit-preserve-dark relative h-[148px] overflow-hidden bg-slate-900 sm:h-44">
        {item.cover_url ? <img src={item.cover_url} alt={item.name} className="h-full w-full object-cover opacity-82 transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.36),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(135deg,#111827,#312e81,#0f172a)]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/24 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-64px)] items-center gap-2 rounded-full border border-white/15 bg-slate-950/52 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-xl sm:left-4 sm:top-4 sm:text-xs"><Icon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{categoryName}</span></span>
        {item.is_featured ? <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/15 text-amber-300 backdrop-blur-xl sm:right-4 sm:top-4"><Star className="h-4 w-4 fill-current" /></span> : null}
        <div className="absolute bottom-3 left-3 flex min-w-0 items-center gap-3 pr-3 sm:bottom-4 sm:left-4 sm:pr-4">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] border border-white/20 bg-white/12 text-white shadow-2xl backdrop-blur-xl sm:h-[50px] sm:w-[50px] sm:rounded-2xl">
            {item.logo_url ? <img src={item.logo_url} alt={item.name} className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-black tracking-tight text-white sm:text-lg">{item.name}</h3>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-white/70 sm:mt-1 sm:text-xs"><MapPin className="mr-1 inline h-3 w-3" />{primaryLocation?.address || item.address || t("business.card.noAddress")}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="line-clamp-2 min-h-[40px] text-[13px] leading-[1.55] text-slate-600 dark:text-slate-300 sm:min-h-[48px] sm:text-sm sm:leading-6">{item.short_description || t("business.card.defaultDescription")}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.06]"><Sparkles className="h-3.5 w-3.5 text-violet-500" /><span className="font-black text-slate-950 dark:text-white">{item.services_count ?? 0}</span> {t("business.card.services")}</div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.06]"><Users className="h-3.5 w-3.5 text-cyan-500" /><span className="font-black text-slate-950 dark:text-white">{item.staff_count ?? 0}</span> {t("business.card.staff")}</div>
        </div>
        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-4">
          <Link to={bookingUrl} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 px-3 py-3 text-[13px] font-black text-white shadow-[0_12px_28px_rgba(124,58,237,0.24)] transition hover:brightness-105 sm:px-4 sm:text-sm">{t("business.card.book")} <ArrowRight className="h-4 w-4 shrink-0" /></Link>
          <Link to={`/businesses/${item.slug}`} aria-label={t("business.card.view")} title={t("business.card.view")} className="inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-[12px] font-bold text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.10] sm:gap-2 sm:text-sm"><span>{t("business.card.view")}</span><ChevronRight className="h-4 w-4 shrink-0" /></Link>
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
    <section id="plans" className="scroll-mt-24 bg-slate-50 px-5 py-16 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-9 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <SectionBadge><BadgeCheck className="h-4 w-4" /> {t("plans.badge")}</SectionBadge>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">{t("plans.title")}</h2>
          </div>
          <Link to="/pricing" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:border-white/12 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/[0.12]">{t("cta.pricing")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {plansQ.isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">{Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-[230px] animate-pulse rounded-[26px] border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.06]" />)}</div>
        ) : plansQ.isError ? (
          <div className="rounded-[24px] border border-rose-300/20 bg-rose-500/10 p-6 text-rose-100">{t("status.errorPlans")}</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
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

  const benefitCards = useMemo(() => [
    { title: t("benefits.fast.title"), text: t("benefits.fast.text"), Icon: Sparkles, tone: "from-violet-500/30 to-violet-500/5 text-violet-200" },
    { title: t("benefits.secure.title"), text: t("benefits.secure.text"), Icon: ShieldCheck, tone: "from-emerald-500/30 to-emerald-500/5 text-emerald-200" },
    { title: t("benefits.real.title"), text: t("benefits.real.text"), Icon: BadgeCheck, tone: "from-fuchsia-500/30 to-fuchsia-500/5 text-fuchsia-200" },
    { title: t("benefits.growth.title"), text: t("benefits.growth.text"), Icon: Navigation, tone: "from-sky-500/30 to-sky-500/5 text-sky-200" },
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
    <div className="vizit-public-page min-h-screen overflow-x-clip bg-slate-50 text-slate-950 transition-colors dark:bg-[#050816] dark:text-white">
      <Seo title={t("seo.homeTitle")} description={t("seo.homeDescription")} image="/og-default.svg" />
      <LandingNavbar />

      <main>
        <section className="relative overflow-hidden bg-white px-5 pb-8 pt-[108px] transition-colors dark:bg-[#050816] sm:px-8 sm:pt-[126px] lg:pb-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(125,92,255,0.14),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(38,168,255,0.10),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_58%,#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_18%_14%,rgba(125,92,255,0.22),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(38,168,255,0.14),transparent_28%),linear-gradient(180deg,#07101f_0%,#080d1a_58%,#050816_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_76%)]" />

          <motion.div variants={stagger} initial="hidden" animate="visible" className="relative mx-auto grid max-w-[1320px] gap-8 xl:grid-cols-[1fr_610px] xl:items-end">
            <div className="max-w-[705px] pb-8 text-center xl:pb-[120px] xl:text-left">
              <motion.div variants={fadeUp} className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-[12px] font-bold text-slate-700 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.075] dark:text-slate-100 dark:shadow-[0_16px_50px_rgba(0,0,0,0.22)] xl:mx-0">
                <Star className="h-4 w-4 fill-[#6aa5ff] text-[#6aa5ff]" /> {t("hero.badge")}
              </motion.div>

              <motion.h1 variants={fadeUp} className="mt-7 text-[clamp(2.15rem,10vw,2.75rem)] font-black leading-[1.06] tracking-[-0.045em] text-slate-950 dark:text-white sm:mt-8 sm:text-[64px] sm:leading-[0.98] sm:tracking-[-0.055em] lg:text-[78px]">
                {t("hero.title1")} <span className="mt-2 block bg-gradient-to-r from-[#a855f7] via-[#6c7bff] to-[#22d3ee] bg-clip-text text-transparent">{t("hero.title2")}</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-2xl text-[15px] font-medium leading-7 text-slate-600 dark:text-slate-200 sm:mt-6 sm:text-[17px] sm:leading-8 xl:mx-0">{t("hero.subtitle")}</motion.p>

              <SearchPanel search={search} setSearch={setSearch} onSubmit={scrollToResults} locationStatus={locationStatus} onUseLocation={useCurrentLocation} />

              {businessesQ.isError ? (
                <motion.div variants={fadeUp} className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-500/12 px-4 py-3 text-sm font-semibold text-rose-100">
                  {t("status.errorBusinesses")}
                </motion.div>
              ) : null}

              <motion.div variants={fadeUp} className="-mx-5 mt-5 flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-5 pb-1 text-[12px] text-slate-600 [scrollbar-width:none] dark:text-slate-200 [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 xl:justify-start">
                {popularChips.length ? popularChips.map((category) => {
                  const label = getCategoryName(category, locale) ?? t("category.fallback");
                  return <button key={category.slug ?? label} type="button" onClick={() => selectCategory(category)} className="shrink-0 snap-start rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/15 dark:bg-white/[0.08] dark:text-slate-100 dark:hover:border-cyan-200/40 dark:hover:bg-white/[0.14] dark:hover:text-white">{label}</button>;
                }) : null}
              </motion.div>

              <MobileStats stats={{ total: businessStat(stats.total), services: businessStat(stats.services), staff: businessStat(stats.staff) }} />
            </div>

            <HeroVisual businessCount={businessStat(stats.total)} servicesCount={businessStat(stats.services)} staffCount={businessStat(stats.staff)} />
          </motion.div>
        </section>

        <section id="categories" className="relative scroll-mt-24 bg-slate-100 px-4 pb-8 transition-colors dark:bg-[#050816] sm:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="mx-auto max-w-[1320px] overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_30px_100px_rgba(2,6,23,0.12)] dark:border-white/10 dark:bg-[#07101f] dark:text-white dark:shadow-[0_30px_100px_rgba(0,0,0,0.30)] sm:rounded-[30px] sm:p-7">
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">{t("categories.title")}</h2>
              <button type="button" onClick={resetFilters} className="inline-flex shrink-0 items-center gap-1 rounded-full px-1 text-xs font-bold text-violet-600 transition hover:text-violet-700 sm:gap-2 sm:px-2 sm:text-sm">{t("categories.all")} <ArrowRight className="h-4 w-4" /></button>
            </div>

            {(businessesQ.isLoading || categoriesQ.isLoading) ? (
              <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 xl:grid-cols-7">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="min-h-[126px] w-[43vw] min-w-[142px] max-w-[170px] shrink-0 snap-start animate-pulse rounded-[20px] border border-slate-100 bg-slate-100 sm:w-auto sm:max-w-none" />)}</div>
            ) : categories.length ? (
              <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 xl:grid-cols-7">
                {categories.map((category) => {
                  const { Icon, tone } = getCategoryPresentation(category);
                  const label = getCategoryName(category, locale) ?? t("category.fallback");
                  const active = selectedCategorySlug === category.slug;
                  return (
                    <button key={category.slug ?? label} type="button" onClick={() => selectCategory(category)} className={cn("group relative min-h-[126px] w-[43vw] min-w-[142px] max-w-[170px] shrink-0 snap-start overflow-hidden rounded-[20px] border p-4 text-left shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-violet-200 dark:shadow-black/20 sm:w-auto sm:max-w-none", active ? "border-violet-300 bg-violet-50 dark:border-violet-400/50 dark:bg-violet-500/15" : "border-slate-100 bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.10]")}>
                      <span className={cn("absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-35 blur-2xl", tone)} />
                      <span className={cn("relative grid h-[50px] w-[50px] place-items-center rounded-[16px] bg-gradient-to-br shadow-sm ring-1 ring-white/70 dark:ring-white/10", tone)}><Icon className="h-6 w-6" /></span>
                      <span className="relative mt-3 flex items-end justify-between gap-2"><span className="block text-[12px] font-black leading-[1.35] text-slate-950 dark:text-white sm:text-[13px]">{label}</span><ChevronRight className="mb-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500 dark:text-white/30" /></span>
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

        <section id="how" className="scroll-mt-24 bg-white px-0 py-12 text-slate-950 transition-colors dark:bg-[#050816] dark:text-white sm:px-8 sm:py-14 lg:py-18">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.16 }} className="mx-auto max-w-[1320px] overflow-hidden border-y border-slate-200 bg-slate-50 py-8 shadow-[0_30px_100px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#07101f] dark:shadow-[0_30px_100px_rgba(0,0,0,0.30)] sm:rounded-[34px] sm:border sm:p-8 lg:p-10">
            <div className="px-5 sm:px-0">
              <motion.h2 variants={fadeUp} className="text-center text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">{t("how.title")}</motion.h2>
              <motion.div variants={fadeUp} className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
            </div>

            <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10 sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-4 sm:divide-y-0 sm:border-y-0 xl:grid-cols-4">
              {benefitCards.map(({ title, text, Icon, tone }) => (
                <motion.div key={title} variants={fadeUp} className="grid grid-cols-[50px_1fr] items-start gap-4 bg-white/70 px-5 py-5 text-left backdrop-blur-2xl dark:bg-white/[0.035] sm:block sm:rounded-[22px] sm:border sm:border-slate-200 sm:bg-white sm:p-5 sm:shadow-[0_18px_60px_rgba(15,23,42,0.07)] sm:dark:border-white/10 sm:dark:bg-white/[0.065] sm:dark:shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
                  <span className={cn("grid h-[50px] w-[50px] place-items-center rounded-[16px] bg-gradient-to-br sm:h-[60px] sm:w-[60px] sm:rounded-[18px]", tone)}><Icon className="h-6 w-6 sm:h-7 sm:w-7" /></span>
                  <span>
                    <h3 className="text-[16px] font-black text-slate-950 dark:text-white sm:mt-4">{title}</h3>
                    <p className="mt-1.5 text-[13px] font-medium leading-6 text-slate-600 dark:text-slate-300 sm:mt-2">{text}</p>
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-6 grid grid-cols-2 gap-1 border-y border-slate-200 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.035] sm:rounded-[22px] sm:border sm:bg-white sm:p-4 sm:dark:bg-white/[0.055] xl:grid-cols-4">
              {[
                { value: businessStat(stats.total), label: t("stats.businesses"), Icon: Building2 },
                { value: businessStat(stats.services), label: t("stats.services"), Icon: Sparkles },
                { value: businessStat(stats.staff), label: t("stats.staff"), Icon: Users },
                { value: categoryStat, label: t("stats.categories"), Icon: Star },
              ].map(({ value, label, Icon }) => (
                <div key={label} className="flex min-w-0 items-center justify-center gap-3 rounded-[16px] px-2 py-3 text-left sm:gap-4 sm:px-3 xl:justify-center">
                  <Icon className="h-6 w-6 shrink-0 text-[#6aa5ff] sm:h-7 sm:w-7" />
                  <span className="min-w-0"><span className="block bg-gradient-to-r from-[#7b65ff] to-[#35b7ff] bg-clip-text text-[23px] font-black leading-none text-transparent sm:text-[26px]">{value}</span><span className="mt-1.5 block text-[10px] font-semibold leading-4 text-slate-600 dark:text-slate-200 sm:mt-2 sm:text-[12px]">{label}</span></span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section id="map" className="scroll-mt-24 bg-slate-50 px-5 py-16 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8 lg:py-20">
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-8">
              <SectionBadge><MapPin className="h-4 w-4" /> {t("map.badge")}</SectionBadge>
              <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">{t("map.title")}</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <InteractiveBusinessMap
                key={`${userLocation?.lat ?? "none"}:${userLocation?.lng ?? "none"}|${pins.map((pin) => `${pin.locationId}:${pin.lat.toFixed(5)},${pin.lng.toFixed(5)}`).join("|")}`}
                pins={pins}
                selectedPin={selectedPin}
                selectedPinKey={selectedPinKey}
                setSelectedPinKey={setSelectedPinKey}
                userLocation={userLocation}
              />

              <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                {selectedPin ? (
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700 dark:border-white/12 dark:bg-white/[0.08] dark:text-cyan-100"><MapPin className="h-3.5 w-3.5" /> {t("map.selectedAddress")}</div>
                    <h3 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{selectedPin.name}</h3>
                    <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{selectedPin.categoryName || (selectedPin.vertical === "healthcare" ? t("businesses.healthcare") : t("businesses.services"))}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-300">{selectedPin.locationName ? `${selectedPin.locationName} · ` : ""}{selectedPin.address || t("business.card.noAddress")}</p>
                    <div className="mt-5 grid gap-3">
                      <Link to={selectedPin.bookingUrl} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100">{t("map.bookAddress")} <ArrowRight className="h-4 w-4" /></Link>
                      <Link to={`/businesses/${selectedPin.slug}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:border-white/12 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.10]">{t("business.card.view")}</Link>
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
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400 dark:text-slate-400">{pins.length} · {t("map.badge")}</span>
                      <span className="inline-flex items-center text-violet-500 lg:hidden" aria-hidden="true"><ChevronRight className="h-4 w-4" /><ChevronRight className="-ml-2 h-4 w-4" /></span>
                    </div>
                    <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:max-h-[280px] lg:block lg:space-y-2 lg:overflow-y-auto lg:px-0 lg:pb-0 lg:pr-1">
                      {pins.slice(0, 12).map((pin) => {
                        const active = selectedPin?.businessId === pin.businessId && selectedPin?.locationId === pin.locationId;
                        return (
                          <button key={`list-${pin.businessId}-${pin.locationId}`} type="button" onClick={() => setSelectedPinKey(`${pin.businessId}-${pin.locationId}`)} className={cn("flex w-[76vw] min-w-[230px] max-w-[285px] shrink-0 snap-start items-start gap-3 rounded-2xl border p-3 text-left shadow-sm transition lg:w-full lg:min-w-0 lg:max-w-none", active ? "border-violet-300 bg-violet-50 dark:border-violet-400/40 dark:bg-violet-500/15" : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.045] dark:hover:bg-white/[0.09]")}>
                            <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl", active ? "bg-gradient-to-br from-violet-500 to-cyan-400 text-white" : "bg-white text-slate-950")}><MapPin className="h-4 w-4" /></span>
                            <span className="min-w-0"><span className="block truncate text-sm font-black text-slate-950 dark:text-white">{pin.name}</span><span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-300">{pin.address}</span></span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section id="businesses" className="scroll-mt-24 bg-white px-5 py-16 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8 lg:py-20">
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <SectionBadge><Star className="h-4 w-4" /> {t("businesses.badge")}</SectionBadge>
                <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">{t("businesses.title")}</h2>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-1 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.07]">
                <div className="flex gap-1 overflow-x-auto">
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
              <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
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
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0 2xl:grid-cols-3">{Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-[356px] w-[84vw] min-w-[286px] max-w-[330px] shrink-0 snap-center animate-pulse rounded-[24px] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] lg:w-auto lg:min-w-0 lg:max-w-none" />)}</div>
            ) : businessesQ.isError ? (
              <div className="rounded-[24px] border border-rose-300/20 bg-rose-500/10 p-6 text-rose-100">{t("status.errorBusinesses")}</div>
            ) : !filteredBusinesses.length ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-10 text-center backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-slate-950"><Building2 className="h-7 w-7" /></div>
                <h3 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">{t("businesses.empty.title")}</h3>
              </div>
            ) : (
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 2xl:grid-cols-3">{filteredBusinesses.map((item, index) => <BusinessCard key={item.id} item={item} index={index} />)}</div>
            )}
          </div>
        </section>

        <HomePlansSection />

        <section className="bg-white px-5 pb-20 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8">
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

      <Footer />
    </div>
  );
}
