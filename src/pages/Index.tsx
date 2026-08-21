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
  CirclePlus,
  Droplets,
  Dumbbell,
  Flower2,
  Grid3X3,
  Hand,
  HeartPulse,
  Hospital,
  LocateFixed,
  MapPin,
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
        "vizit-preserve-dark relative min-h-[390px] w-full min-w-0 touch-none overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:min-h-[520px] sm:rounded-[34px]",
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

      <div className="absolute left-3 top-3 z-30 flex max-w-[calc(100%_-_96px)] items-center gap-2 rounded-2xl border border-white/14 bg-slate-950/76 px-3 py-2 text-[11px] font-bold text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:left-5 sm:top-5 sm:px-4 sm:py-3 sm:text-xs">
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
      className="mt-7 w-full max-w-[680px] rounded-[20px] border border-[#e8e2f0] bg-white p-2.5 shadow-[0_20px_55px_rgba(62,31,120,0.14)] dark:border-[#312641] dark:bg-[#151020] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:p-3"
    >
      <div className="grid items-stretch gap-2 md:grid-cols-[1fr_170px_118px]">
        <label className="relative flex min-h-[62px] items-center rounded-[16px] px-3 text-left transition focus-within:bg-[#faf8fc] dark:focus-within:bg-white/[0.05] sm:px-4 md:border-r md:border-[#e8e2f0] dark:md:border-[#312641]">
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
          className="flex min-h-[58px] items-center rounded-[16px] px-3 text-left transition hover:bg-[#faf8fc] disabled:cursor-wait disabled:opacity-70 dark:hover:bg-white/[0.05] sm:px-4"
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

        <button type="submit" className="inline-flex h-[54px] items-center justify-center gap-2 rounded-[16px] bg-[#5b2fa8] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(91,47,168,0.24)] transition hover:bg-[#3e1f78] dark:bg-[#a980f3] dark:text-[#160d22] dark:hover:bg-[#bd9cf8] md:h-auto">
          <Search className="h-4 w-4" /> {t("search.button")}
        </button>
      </div>
      {locationError ? <p className="px-3 pb-1 pt-2 text-left text-xs font-medium text-rose-600" role="status">{locationError}</p> : null}
    </motion.form>
  );
}

function HeroTicket() {
  const { t } = useLanguage();
  return (
    <motion.div variants={fadeUp} className="relative mx-auto flex min-h-[390px] w-full max-w-[540px] items-center justify-center px-3 pb-12 pt-8 sm:min-h-[470px] sm:px-8 xl:min-h-[560px] xl:justify-end">
      <div className="absolute left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#1e9e92]/20 blur-3xl dark:bg-[#58d0c4]/15 sm:h-56 sm:w-56" />
      <div className="absolute bottom-[12%] right-[4%] h-44 w-44 rounded-full bg-[#5b2fa8]/20 blur-3xl dark:bg-[#a980f3]/20 sm:h-64 sm:w-64" />

      <div aria-hidden="true" className="absolute left-[19%] top-[27%] h-[245px] w-[70%] max-w-[330px] rotate-[7deg] rounded-[24px] bg-gradient-to-br from-[#1e9e92] to-[#126c64] opacity-55 shadow-[0_28px_60px_rgba(30,158,146,0.25)] sm:h-[300px] xl:left-[22%]" />

      <div role="img" aria-label={`${t("ticket.queue")} A07. ${t("ticket.confirmed")}: ${t("ticket.visitValue")}, ${t("ticket.dateValue")}, 14:30`} className="relative z-10 w-full max-w-[360px] -rotate-[2deg] rounded-[24px] bg-gradient-to-br from-[#3e1f78] via-[#53299a] to-[#6d38bd] p-6 text-white shadow-[0_34px_75px_rgba(62,31,120,0.34)] sm:p-8 dark:shadow-[0_38px_90px_rgba(0,0,0,0.48)]">
        <div aria-hidden="true">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/65">{t("ticket.queue")}</div>
              <div className="vizit-display mt-2 text-5xl font-bold leading-none sm:text-6xl">A07</div>
            </div>
            <CalendarDays className="h-7 w-7 text-[#79ded4]" />
          </div>

          <div className="relative my-6 border-t border-dashed border-white/30 before:absolute before:-left-9 before:-top-[11px] before:h-5 before:w-5 before:rounded-full before:bg-[#faf8fc] after:absolute after:-right-9 after:-top-[11px] after:h-5 after:w-5 after:rounded-full after:bg-[#faf8fc] dark:before:bg-[#090712] dark:after:bg-[#090712] sm:my-7 sm:before:-left-11 sm:after:-right-11" />

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/60">{t("ticket.visit")}</div>
            <div className="mt-1.5 text-sm font-semibold sm:text-base">{t("ticket.visitValue")}</div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white/60">{t("ticket.date")}</div>
              <div className="mt-1 font-semibold">{t("ticket.dateValue")}</div>
            </div>
            <div>
              <div className="text-white/60">{t("ticket.time")}</div>
              <div className="mt-1 font-semibold">14:30</div>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="absolute -bottom-6 right-4 grid h-[74px] w-[74px] rotate-[5deg] place-items-center rounded-full border-4 border-[#faf8fc] bg-[#e8a93c] px-2 text-center text-[11px] font-bold leading-4 text-[#3e2a08] shadow-[0_14px_30px_rgba(232,169,60,0.38)] dark:border-[#090712] sm:-right-5 sm:h-20 sm:w-20">
          {t("ticket.confirmed")}
        </div>
      </div>

      <div aria-hidden="true" className="absolute bottom-[12%] left-[12%] z-20 hidden rotate-[-5deg] rounded-2xl border border-[#e8e2f0] bg-white/90 px-4 py-3 text-[#3e1f78] shadow-xl backdrop-blur sm:block dark:border-[#312641] dark:bg-[#151020]/90 dark:text-[#c3a7ff]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-65">{t("ticket.next")}</div>
        <div className="vizit-display mt-1 text-xl font-bold">B14</div>
      </div>
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
      className="group flex w-[calc(100vw_-_64px)] max-w-[350px] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.09)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-violet-200 dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_20px_60px_rgba(0,0,0,0.24)] dark:hover:bg-white/[0.10] sm:rounded-[28px] lg:w-auto lg:max-w-none"
    >
      <div className="vizit-preserve-dark relative h-[154px] overflow-hidden bg-slate-900 sm:h-44">
        {item.cover_url ? <img src={item.cover_url} alt={item.name} className="h-full w-full object-cover opacity-82 transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.36),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(135deg,#111827,#312e81,#0f172a)]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/24 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%_-_24px)] items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-xl sm:left-4 sm:top-4 sm:text-xs"><Icon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{categoryName}</span></span>
        <div className="absolute bottom-3 left-3 flex min-w-0 items-center gap-3 pr-3 sm:bottom-4 sm:left-4 sm:pr-4">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] border border-white/20 bg-white/12 text-white shadow-2xl backdrop-blur-xl sm:h-12 sm:w-12 sm:rounded-2xl">
            {item.logo_url ? <img src={item.logo_url} alt={item.name} className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-black tracking-tight text-white sm:text-lg">{item.name}</h3>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-white/70 sm:mt-1 sm:text-xs">{primaryLocation?.address || item.address || t("business.card.noAddress")}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="line-clamp-2 min-h-[40px] text-[13px] leading-5 text-slate-600 dark:text-slate-300 sm:min-h-[44px] sm:text-sm sm:leading-[22px]">{item.short_description || t("business.card.defaultDescription")}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 sm:text-xs">
          <div className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.06]"><Sparkles className="h-4 w-4 shrink-0 text-violet-500" /><span className="min-w-0"><span className="font-black text-slate-950 dark:text-white">{item.services_count ?? 0}</span> <span className="truncate">{t("business.card.services")}</span></span></div>
          <div className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.06]"><Users className="h-4 w-4 shrink-0 text-cyan-500" /><span className="min-w-0"><span className="font-black text-slate-950 dark:text-white">{item.staff_count ?? 0}</span> <span className="truncate">{t("business.card.staff")}</span></span></div>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
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
        <section className="relative overflow-hidden bg-[#faf8fc] px-5 pb-10 pt-[108px] transition-colors dark:bg-[#090712] sm:px-8 sm:pt-[126px] lg:pb-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(91,47,168,0.11),transparent_29%),radial-gradient(circle_at_84%_18%,rgba(30,158,146,0.10),transparent_28%),linear-gradient(180deg,#faf8fc_0%,#ffffff_64%,#faf8fc_100%)] dark:bg-[radial-gradient(circle_at_16%_10%,rgba(169,128,243,0.19),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(88,208,196,0.11),transparent_28%),linear-gradient(180deg,#090712_0%,#151020_62%,#090712_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(91,47,168,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(91,47,168,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_76%)] dark:opacity-50" />

          <motion.div variants={stagger} initial="hidden" animate="visible" className="relative mx-auto grid max-w-[1160px] gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center xl:gap-12">
            <div className="max-w-[650px] py-7 text-center lg:py-14 lg:text-left">
              <motion.div variants={fadeUp} className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#1e9e92]/25 bg-[#1e9e92]/[0.08] px-4 py-2 text-[12px] font-semibold text-[#167d74] shadow-sm backdrop-blur-2xl dark:border-[#58d0c4]/25 dark:bg-[#58d0c4]/10 dark:text-[#8be3da] dark:shadow-[0_16px_50px_rgba(0,0,0,0.22)] lg:mx-0">
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

              <motion.div variants={fadeUp} className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[12px] text-[#6b6178] dark:text-[#b7adc5] lg:justify-start">
                {popularChips.length ? popularChips.map((category) => {
                  const label = getCategoryName(category, locale) ?? t("category.fallback");
                  return <button key={category.slug ?? label} type="button" onClick={() => selectCategory(category)} className="rounded-full border border-[#e8e2f0] bg-white px-4 py-2 font-medium text-[#6b6178] transition hover:border-[#5b2fa8]/40 hover:bg-[#f1edf7] hover:text-[#3e1f78] dark:border-[#312641] dark:bg-white/[0.06] dark:text-[#c9bfd5] dark:hover:border-[#a980f3]/40 dark:hover:bg-white/10 dark:hover:text-white">{label}</button>;
                }) : null}
              </motion.div>

              <motion.div variants={fadeUp} className="mt-6 grid gap-2 text-left text-xs text-[#6b6178] dark:text-[#b7adc5] sm:grid-cols-3">
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

        <section id="categories" className="relative scroll-mt-24 bg-[#faf8fc] px-5 pb-8 transition-colors dark:bg-[#090712] sm:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="mx-auto max-w-[1320px] rounded-[26px] border border-[#e8e2f0] bg-white p-5 text-[#241736] shadow-[0_30px_100px_rgba(62,31,120,0.10)] dark:border-[#312641] dark:bg-[#151020] dark:text-white dark:shadow-[0_30px_100px_rgba(0,0,0,0.30)] sm:rounded-[30px] sm:p-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="vizit-display text-2xl sm:text-3xl">{t("categories.title")}</h2>
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-full px-2 text-sm font-semibold text-[#5b2fa8] transition hover:text-[#3e1f78] dark:text-[#b898f4] dark:hover:text-[#d8c6fa]">{t("categories.all")} <ArrowRight className="h-4 w-4" /></button>
            </div>

            {(businessesQ.isLoading || categoriesQ.isLoading) ? (
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 xl:grid-cols-7">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="min-h-[138px] w-[76vw] max-w-[280px] shrink-0 snap-start animate-pulse rounded-[20px] border border-slate-100 bg-slate-100 sm:w-auto sm:max-w-none" />)}</div>
            ) : categories.length ? (
              <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 xl:grid-cols-7">
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

        <section id="how" className="scroll-mt-24 bg-white px-0 py-10 text-[#241736] transition-colors dark:bg-[#090712] dark:text-white sm:px-8 sm:py-14 lg:py-18">
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

        <section id="map" className="scroll-mt-24 bg-slate-50 px-5 pb-8 pt-12 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8 sm:py-16 lg:py-20">
          <div className="mx-auto min-w-0 max-w-[1320px]">
            <div className="mb-8">
              <SectionBadge><MapPin className="h-4 w-4" /> {t("map.badge")}</SectionBadge>
              <h2 className="mt-5 max-w-3xl break-words text-[28px] font-black leading-[1.12] tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl sm:leading-none">{t("map.title")}</h2>
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
              <InteractiveBusinessMap
                key={`${userLocation?.lat ?? "none"}:${userLocation?.lng ?? "none"}|${pins.map((pin) => `${pin.locationId}:${pin.lat.toFixed(5)},${pin.lng.toFixed(5)}`).join("|")}`}
                pins={pins}
                selectedPin={selectedPin}
                selectedPinKey={selectedPinKey}
                setSelectedPinKey={setSelectedPinKey}
                userLocation={userLocation}
              />

              <div className="min-w-0 max-w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:p-5">
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
                  <div className="-mx-4 mt-4 flex min-w-0 max-w-[calc(100%_+_32px)] snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-5 sm:mt-6 sm:max-w-[calc(100%_+_40px)] sm:scroll-px-5 sm:px-5 lg:mx-0 lg:block lg:max-h-[280px] lg:max-w-full lg:space-y-2 lg:overflow-y-auto lg:px-0 lg:pb-0 lg:pr-1">
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

        <section id="businesses" className="scroll-mt-24 bg-white px-5 py-12 text-slate-950 transition-colors dark:bg-[#050b16] dark:text-white sm:px-8 sm:py-16 lg:py-20">
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
              <div className="mb-8 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
              <div className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-[calc((100%_-_350px)/2)] lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0 2xl:grid-cols-3">{Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-[340px] w-[calc(100vw_-_64px)] max-w-[350px] shrink-0 snap-center animate-pulse rounded-[24px] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] lg:w-auto lg:max-w-none" />)}</div>
            ) : businessesQ.isError ? (
              <div className="rounded-[24px] border border-rose-300/20 bg-rose-500/10 p-6 text-rose-100">{t("status.errorBusinesses")}</div>
            ) : !filteredBusinesses.length ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-10 text-center backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-slate-950"><Building2 className="h-7 w-7" /></div>
                <h3 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">{t("businesses.empty.title")}</h3>
              </div>
            ) : (
              <div className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-[calc((100%_-_350px)/2)] lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 2xl:grid-cols-3">{filteredBusinesses.map((item, index) => <BusinessCard key={item.id} item={item} index={index} />)}</div>
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
