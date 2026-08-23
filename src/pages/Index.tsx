import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  Car,
  ChevronRight,
  Grid3X3,
  Heart,
  HeartPulse,
  Home,
  MapPin,
  Menu,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import LanguageToggle from "../components/LanguageToggle";
import ThemeToggle from "../components/ThemeToggle";
import Seo from "../components/Seo";
import { useLanguage } from "../contexts/LanguageContext";
import {
  fetchPublicBusinesses,
  fetchPublicCategories,
  fetchPublicMapPins,
  type PublicBusinessCategory,
  type PublicDirectoryBusiness,
  type PublicMapPin,
} from "../lib/publicApi";

type CategoryVisual = {
  Icon: LucideIcon;
  iconClass: string;
  shellClass: string;
};

const categoryVisuals: Array<{ keywords: string[]; visual: CategoryVisual }> = [
  {
    keywords: ["beauty", "salon", "hair", "barber", "գեղեց", "վարս", "салон", "барбер"],
    visual: { Icon: Sparkles, iconClass: "text-fuchsia-600 dark:text-fuchsia-300", shellClass: "bg-fuchsia-100 dark:bg-fuchsia-500/15" },
  },
  {
    keywords: ["health", "medical", "clinic", "doctor", "dental", "բժշ", "կլինիկ", "ատամ", "мед", "клиник", "стомат"],
    visual: { Icon: HeartPulse, iconClass: "text-cyan-600 dark:text-cyan-300", shellClass: "bg-cyan-100 dark:bg-cyan-500/15" },
  },
  {
    keywords: ["car", "auto", "ավտ", "авто"],
    visual: { Icon: Car, iconClass: "text-amber-600 dark:text-amber-300", shellClass: "bg-amber-100 dark:bg-amber-500/15" },
  },
  {
    keywords: ["repair", "home", "service", "wrench", "տուն", "վերանորոգ", "ремонт"],
    visual: { Icon: Wrench, iconClass: "text-emerald-600 dark:text-emerald-300", shellClass: "bg-emerald-100 dark:bg-emerald-500/15" },
  },
];

const defaultVisual: CategoryVisual = {
  Icon: Grid3X3,
  iconClass: "text-violet-600 dark:text-violet-300",
  shellClass: "bg-violet-100 dark:bg-violet-500/15",
};

function localizedCategoryName(category: PublicBusinessCategory | null | undefined, locale: string, fallback: string) {
  if (!category) return fallback;
  if (locale === "ru") return category.name_ru ?? category.name ?? category.name_hy ?? category.name_en ?? fallback;
  if (locale === "en") return category.name_en ?? category.name ?? category.name_hy ?? category.name_ru ?? fallback;
  return category.name_hy ?? category.name ?? category.name_ru ?? category.name_en ?? fallback;
}

function categoryVisual(category: PublicBusinessCategory | null | undefined): CategoryVisual {
  if (!category) return defaultVisual;
  const value = [category.slug, category.icon, category.name, category.name_hy, category.name_ru, category.name_en]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return categoryVisuals.find((item) => item.keywords.some((keyword) => value.includes(keyword)))?.visual ?? defaultVisual;
}

function businessLocation(item: PublicDirectoryBusiness, fallback: string) {
  return item.locations?.find((location) => location.is_primary)?.address
    ?? item.locations?.[0]?.address
    ?? item.address
    ?? fallback;
}

function matchesCategory(item: PublicDirectoryBusiness, slug: string | null) {
  if (!slug) return true;
  return item.category?.slug === slug;
}

function matchesSearch(item: PublicDirectoryBusiness, search: string, locale: string, fallback: string) {
  const query = search.trim().toLocaleLowerCase();
  if (!query) return true;
  const haystack = [
    item.name,
    item.address,
    item.short_description,
    item.custom_category_name,
    localizedCategoryName(item.category, locale, fallback),
    ...(item.locations ?? []).map((location) => `${location.name ?? ""} ${location.address ?? ""} ${location.city ?? ""}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
  return query.split(/\s+/).every((part) => haystack.includes(part));
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`${compact ? "h-9 w-9 rounded-[13px]" : "h-11 w-11 rounded-[16px]"} grid place-items-center bg-gradient-to-br from-violet-600 via-violet-500 to-cyan-400 text-white shadow-[0_12px_28px_rgba(124,58,237,0.24)]`}>
        <CalendarDays className={compact ? "h-4.5 w-4.5" : "h-5 w-5"} />
      </span>
      <span className={`${compact ? "text-[18px]" : "text-[22px]"} font-black tracking-[-0.045em] text-slate-950 dark:text-white`}>Vizit.am</span>
    </div>
  );
}

function BusinessThumb({ business, className = "" }: { business: PublicDirectoryBusiness; className?: string }) {
  const src = business.cover_url || business.logo_url;
  if (src) {
    return <img src={src} alt="" className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }
  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-violet-100 via-white to-cyan-100 dark:from-violet-950 dark:via-slate-900 dark:to-cyan-950 ${className}`}>
      <Building2 className="h-7 w-7 text-violet-500/70 dark:text-violet-300/70" />
    </div>
  );
}

function MiniBusinessRow({ business, locale, noAddress, fallbackCategory }: {
  business: PublicDirectoryBusiness;
  locale: string;
  noAddress: string;
  fallbackCategory: string;
}) {
  const category = localizedCategoryName(business.category, locale, business.custom_category_name ?? fallbackCategory);
  return (
    <Link to={`/businesses/${business.slug}`} className="group flex min-w-0 items-center gap-3 rounded-[16px] border border-slate-200/80 bg-white p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-violet-200 dark:border-white/10 dark:bg-white/[0.06]">
      <div className="h-[58px] w-[68px] shrink-0 overflow-hidden rounded-[12px]">
        <BusinessThumb business={business} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-black text-slate-900 dark:text-white">{business.name}</div>
        <div className="mt-1 truncate text-[10px] font-semibold text-slate-500 dark:text-slate-300">{category}</div>
        <div className="mt-1 flex min-w-0 items-center gap-1 text-[9px] font-semibold text-slate-400 dark:text-slate-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{businessLocation(business, noAddress)}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-violet-500" />
    </Link>
  );
}

function MiniCategory({ category, locale, fallback }: { category: PublicBusinessCategory; locale: string; fallback: string }) {
  const visual = categoryVisual(category);
  return (
    <div className="min-w-0 rounded-[14px] border border-slate-200/80 bg-white px-2 py-2 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
      <span className={`mx-auto grid h-8 w-8 place-items-center rounded-[11px] ${visual.shellClass}`}>
        <visual.Icon className={`h-4 w-4 ${visual.iconClass}`} />
      </span>
      <div className="mt-1.5 truncate text-[8px] font-black text-slate-700 dark:text-slate-200">{localizedCategoryName(category, locale, fallback)}</div>
    </div>
  );
}

function MapPreview({ pins, compact = false }: { pins: PublicMapPin[]; compact?: boolean }) {
  const visiblePins = pins.slice(0, compact ? 4 : 7);
  const positions = compact
    ? [[18, 34], [67, 27], [48, 67], [80, 72]]
    : [[12, 28], [29, 60], [47, 35], [62, 70], [78, 26], [88, 58], [40, 82]];

  return (
    <div className={`${compact ? "h-[140px] rounded-[18px]" : "h-[150px] rounded-[20px]"} relative overflow-hidden border border-slate-200 bg-[#eef4f7] dark:border-white/10 dark:bg-[#0c1424]`}>
      <div className="absolute inset-0 opacity-90 dark:opacity-45" style={{
        backgroundImage: "linear-gradient(28deg,transparent 0 43%,rgba(148,163,184,.35) 44% 46%,transparent 47%), linear-gradient(110deg,transparent 0 48%,rgba(148,163,184,.28) 49% 51%,transparent 52%), linear-gradient(rgba(148,163,184,.16) 1px,transparent 1px), linear-gradient(90deg,rgba(148,163,184,.16) 1px,transparent 1px)",
        backgroundSize: "100% 100%,100% 100%,38px 38px,38px 38px",
      }} />
      <div className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-cyan-200/55 blur-2xl dark:bg-cyan-500/10" />
      <div className="absolute -bottom-14 left-8 h-32 w-48 rounded-full bg-violet-200/60 blur-3xl dark:bg-violet-500/10" />
      {visiblePins.map((pin, index) => {
        const [left, top] = positions[index % positions.length];
        return (
          <Link
            key={`${pin.business_id}-${pin.location_id}-${index}`}
            to={pin.booking_url || `/book/${pin.slug}`}
            title={pin.name}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition hover:scale-110"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-violet-600 to-cyan-400 text-white shadow-[0_8px_18px_rgba(124,58,237,0.28)]">
              <MapPin className="h-3.5 w-3.5" />
            </span>
          </Link>
        );
      })}
      {!visiblePins.length ? (
        <div className="absolute inset-0 grid place-items-center text-xs font-bold text-slate-500 dark:text-slate-300">
          <MapPin className="mr-1 inline h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}

function LaptopShowcase({ businesses, categories, pins, locale, t }: {
  businesses: PublicDirectoryBusiness[];
  categories: PublicBusinessCategory[];
  pins: PublicMapPin[];
  locale: string;
  t: (key: string) => string;
}) {
  const visibleBusinesses = businesses.slice(0, 4);
  const visibleCategories = categories.slice(0, 6);

  return (
    <div className="relative mx-auto w-full max-w-[720px] pb-[76px] pt-4">
      <div className="relative rounded-[26px] border-[10px] border-slate-900 bg-slate-900 shadow-[0_40px_90px_rgba(15,23,42,0.24)] dark:border-slate-700 dark:shadow-black/50">
        <div className="overflow-hidden rounded-[16px] bg-slate-50 dark:bg-[#07101f]">
          <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-white px-5 dark:border-white/10 dark:bg-[#0a1220]">
            <BrandMark compact />
            <div className="flex items-center gap-5 text-[8px] font-bold text-slate-500 dark:text-slate-300">
              <span>{t("nav.services")}</span>
              <span>{t("nav.businesses")}</span>
              <span>{t("nav.map")}</span>
              <span className="rounded-full bg-violet-600 px-3 py-1.5 text-white">{t("nav.start")}</span>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-[9px] font-semibold text-slate-400 shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400">
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1">{t("search.label")}</span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-300"><MapPin className="h-3.5 w-3.5" /> {t("search.city")}</span>
            </div>

            <div className="mt-3 grid grid-cols-6 gap-2">
              {visibleCategories.map((category, index) => <MiniCategory key={category.slug ?? category.id ?? index} category={category} locale={locale} fallback={t("category.fallback")} />)}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-[11px] font-black text-slate-900 dark:text-white">{t("businesses.badge")}</div>
              <div className="text-[8px] font-black text-violet-600 dark:text-violet-300">{t("categories.all")}</div>
            </div>

            <div className="mt-2 grid grid-cols-4 gap-2">
              {visibleBusinesses.map((business) => (
                <Link key={business.id} to={`/businesses/${business.slug}`} className="overflow-hidden rounded-[13px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="h-[70px] overflow-hidden"><BusinessThumb business={business} /></div>
                  <div className="p-2">
                    <div className="truncate text-[8px] font-black text-slate-900 dark:text-white">{business.name}</div>
                    <div className="mt-1 flex items-center gap-1 text-[7px] text-slate-400"><Sparkles className="h-2.5 w-2.5 text-violet-500" />{business.services_count} {t("business.card.services")}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 text-[11px] font-black text-slate-900 dark:text-white">{t("map.title")}</div>
            <div className="mt-2"><MapPreview pins={pins} /></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[45px] left-1/2 h-[32px] w-[58%] -translate-x-1/2 rounded-b-[24px] bg-gradient-to-b from-slate-300 to-slate-400 shadow-[0_16px_30px_rgba(15,23,42,0.18)] dark:from-slate-600 dark:to-slate-700" />
      <div className="absolute bottom-[32px] left-1/2 h-[14px] w-[82%] -translate-x-1/2 rounded-full bg-slate-300 shadow-[0_12px_18px_rgba(15,23,42,0.16)] dark:bg-slate-700" />
    </div>
  );
}

function PhoneShowcase({ businesses, categories, locale, t }: {
  businesses: PublicDirectoryBusiness[];
  categories: PublicBusinessCategory[];
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <div className="absolute -bottom-6 right-0 z-20 hidden w-[236px] rounded-[34px] border-[7px] border-slate-900 bg-slate-900 p-1 shadow-[0_36px_70px_rgba(15,23,42,0.28)] 2xl:block dark:border-slate-700 dark:shadow-black/50">
      <div className="overflow-hidden rounded-[25px] bg-slate-50 dark:bg-[#07101f]">
        <div className="mx-auto mt-2 h-4 w-16 rounded-full bg-slate-950 dark:bg-black" />
        <div className="flex items-center justify-between px-3 pb-2 pt-3">
          <Menu className="h-4 w-4 text-slate-800 dark:text-white" />
          <BrandMark compact />
          <Bell className="h-4 w-4 text-slate-800 dark:text-white" />
        </div>
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[8px] text-slate-400 dark:border-white/10 dark:bg-white/[0.05]"><Search className="h-3 w-3" />{t("search.label")}</div>
          <div className="mt-2 flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[8px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"><MapPin className="h-3 w-3" />{t("search.city")}</div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {categories.slice(0, 4).map((category, index) => <MiniCategory key={category.slug ?? category.id ?? index} category={category} locale={locale} fallback={t("category.fallback")} />)}
          </div>
          <div className="mt-3 text-[9px] font-black text-slate-900 dark:text-white">{t("businesses.badge")}</div>
          <div className="mt-2 space-y-1.5">
            {businesses.slice(0, 3).map((business) => <MiniBusinessRow key={business.id} business={business} locale={locale} noAddress={t("business.card.noAddress")} fallbackCategory={t("category.fallback")} />)}
          </div>
        </div>
        <div className="grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 dark:border-white/10 dark:bg-[#0a1220]">
          {[Home, CalendarDays, Heart, MessageSquare, UserRound].map((Icon, index) => <span key={index} className={`grid place-items-center ${index === 0 ? "text-violet-600 dark:text-violet-300" : "text-slate-400"}`}><Icon className="h-3.5 w-3.5" /></span>)}
        </div>
      </div>
    </div>
  );
}

function DesktopDeviceHero({ businesses, categories, pins, locale, t }: {
  businesses: PublicDirectoryBusiness[];
  categories: PublicBusinessCategory[];
  pins: PublicMapPin[];
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <div className="relative min-h-[600px]">
      <div className="absolute left-[4%] top-[6%] h-52 w-52 rounded-full bg-violet-300/20 blur-[70px] dark:bg-violet-500/10" />
      <div className="absolute right-[2%] top-[8%] h-44 w-44 rounded-full bg-cyan-300/20 blur-[70px] dark:bg-cyan-500/10" />
      <LaptopShowcase businesses={businesses} categories={categories} pins={pins} locale={locale} t={t} />
      <PhoneShowcase businesses={businesses} categories={categories} locale={locale} t={t} />
    </div>
  );
}

function DirectoryBusinessCard({ business, locale, t }: {
  business: PublicDirectoryBusiness;
  locale: string;
  t: (key: string) => string;
}) {
  const category = localizedCategoryName(business.category, locale, business.custom_category_name ?? t("category.fallback"));
  return (
    <article className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_60px_rgba(124,58,237,0.12)] dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/20">
      <Link to={`/businesses/${business.slug}`} className="block h-[190px] overflow-hidden"><BusinessThumb business={business} className="transition duration-500 group-hover:scale-[1.03]" /></Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/businesses/${business.slug}`} className="block truncate text-lg font-black text-slate-950 hover:text-violet-600 dark:text-white dark:hover:text-violet-300">{business.name}</Link>
            <div className="mt-1 truncate text-xs font-bold text-violet-600 dark:text-violet-300">{category}</div>
          </div>
          {business.is_featured ? <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"><Star className="h-4 w-4 fill-current" /></span> : null}
        </div>
        <div className="mt-4 flex items-start gap-2 text-sm font-medium text-slate-500 dark:text-slate-300"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><span className="line-clamp-2">{businessLocation(business, t("business.card.noAddress"))}</span></div>
        <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-violet-500" />{business.services_count} {t("business.card.services")}</span>
          <span className="flex items-center gap-1.5"><UserRound className="h-4 w-4 text-cyan-500" />{business.staff_count} {t("business.card.staff")}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link to={`/businesses/${business.slug}`} className="inline-flex items-center justify-center rounded-[14px] border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[0.08]">{t("business.card.view")}</Link>
          <Link to={`/book/${business.slug}`} className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(124,58,237,0.22)]">{t("business.card.book")}<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </article>
  );
}

export default function Index() {
  const { locale, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoriesQ = useQuery({
    queryKey: ["public-home-categories", locale],
    queryFn: () => fetchPublicCategories({ locale }),
    staleTime: 5 * 60_000,
  });
  const businessesQ = useQuery({
    queryKey: ["public-home-businesses"],
    queryFn: () => fetchPublicBusinesses({ type: "all", per_page: 24 }),
    staleTime: 60_000,
  });
  const mapPinsQ = useQuery({
    queryKey: ["public-home-map-pins"],
    queryFn: () => fetchPublicMapPins({ type: "all" }),
    staleTime: 60_000,
  });

  const categories = categoriesQ.data ?? [];
  const businesses = businessesQ.data ?? [];
  const pins = mapPinsQ.data ?? [];

  const filteredBusinesses = useMemo(
    () => businesses.filter((item) => matchesCategory(item, selectedCategory) && matchesSearch(item, search, locale, t("category.fallback"))),
    [businesses, selectedCategory, search, locale, t],
  );

  const featuredBusinesses = useMemo(() => {
    const featured = businesses.filter((item) => item.is_featured);
    return (featured.length ? featured : businesses).slice(0, 6);
  }, [businesses]);

  const visibleCategories = categories.slice(0, 10);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="vizit-public-page min-h-screen overflow-x-clip bg-[#f7f9fc] text-slate-950 transition-colors dark:bg-[#050816] dark:text-white">
      <Seo title={t("seo.homeTitle")} description={t("seo.homeDescription")} image="/og-default.svg" />

      <div className="hidden md:block"><LandingNavbar /></div>

      <main>
        <section className="hidden overflow-hidden bg-white px-8 pb-10 pt-[126px] transition-colors dark:bg-[#050816] md:block">
          <div className="relative mx-auto max-w-[1420px] overflow-hidden rounded-[42px] border border-slate-200 bg-[radial-gradient(circle_at_85%_12%,rgba(34,211,238,.10),transparent_28%),radial-gradient(circle_at_10%_10%,rgba(124,58,237,.12),transparent_28%),linear-gradient(135deg,#ffffff_0%,#f8fafc_58%,#f3f7fb_100%)] px-8 py-12 shadow-[0_32px_100px_rgba(15,23,42,0.09)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_85%_12%,rgba(34,211,238,.12),transparent_28%),radial-gradient(circle_at_10%_10%,rgba(124,58,237,.18),transparent_28%),linear-gradient(135deg,#07101f_0%,#080d1a_58%,#050816_100%)] dark:shadow-black/30 lg:px-12 xl:px-16 xl:py-14">
            <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full border-[52px] border-violet-500/10 dark:border-violet-400/5" />
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-cyan-400/20" />

            <div className="relative grid items-center gap-10 xl:grid-cols-[0.82fr_1.18fr]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-[610px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-4 py-2 text-xs font-black text-violet-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.07] dark:text-violet-200"><Star className="h-4 w-4 fill-current" />{t("hero.badge")}</div>
                <h1 className="mt-7 text-[clamp(3.1rem,5.2vw,5.35rem)] font-black leading-[0.96] tracking-[-0.065em] text-slate-950 dark:text-white">{t("hero.title1")}<span className="mt-2 block bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent">{t("hero.title2")}</span></h1>
                <p className="mt-6 max-w-xl text-[17px] font-medium leading-8 text-slate-600 dark:text-slate-200">{t("hero.subtitle")}</p>

                <form onSubmit={submitSearch} className="mt-8 rounded-[24px] border border-slate-200 bg-white p-2.5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20">
                  <div className="grid gap-2 lg:grid-cols-[1fr_150px_116px]">
                    <label className="flex min-h-[60px] items-center gap-3 rounded-[17px] bg-slate-50 px-4 dark:bg-white/[0.05]">
                      <Search className="h-5 w-5 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1"><span className="block text-[11px] font-black text-slate-500 dark:text-slate-300">{t("search.label")}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search.placeholder")} className="mt-1 w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 dark:text-white" /></span>
                    </label>
                    <div className="flex min-h-[60px] items-center gap-2 rounded-[17px] bg-slate-50 px-4 text-sm font-bold text-slate-600 dark:bg-white/[0.05] dark:text-slate-200"><MapPin className="h-4 w-4 text-violet-500" />{t("search.city")}</div>
                    <button type="submit" className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[17px] bg-gradient-to-r from-violet-600 to-cyan-500 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(124,58,237,0.23)]"><Search className="h-4 w-4" />{t("search.button")}</button>
                  </div>
                </form>

                <div className="mt-5 flex flex-wrap gap-2">
                  {visibleCategories.slice(0, 5).map((category, index) => {
                    const active = selectedCategory === category.slug;
                    return <button key={category.slug ?? category.id ?? index} type="button" onClick={() => setSelectedCategory(active ? null : category.slug ?? null)} className={`rounded-full border px-4 py-2 text-xs font-black transition ${active ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"}`}>{localizedCategoryName(category, locale, t("category.fallback"))}</button>;
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.06 }} className="relative">
                <DesktopDeviceHero businesses={featuredBusinesses} categories={visibleCategories} pins={pins} locale={locale} t={t} />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="min-h-screen bg-[radial-gradient(circle_at_90%_4%,rgba(34,211,238,.10),transparent_24%),radial-gradient(circle_at_10%_7%,rgba(124,58,237,.12),transparent_26%),linear-gradient(180deg,#ffffff,#f6f8fc)] px-4 pb-24 pt-4 dark:bg-[radial-gradient(circle_at_90%_4%,rgba(34,211,238,.11),transparent_24%),radial-gradient(circle_at_10%_7%,rgba(124,58,237,.16),transparent_26%),linear-gradient(180deg,#050816,#07101f)] md:hidden">
          <div className="mx-auto max-w-md">
            <div className="sticky top-3 z-40 flex items-center justify-between rounded-[22px] border border-slate-200/90 bg-white/92 px-3 py-2.5 shadow-[0_16px_45px_rgba(15,23,42,.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#07101f]/92 dark:shadow-black/20">
              <button type="button" className="grid h-10 w-10 place-items-center rounded-[15px] bg-slate-100 text-slate-700 dark:bg-white/[0.07] dark:text-white" aria-label={t("nav.openMenu")}><Menu className="h-5 w-5" /></button>
              <BrandMark compact />
              <div className="flex items-center gap-1"><LanguageToggle compact className="border-0 bg-transparent px-2 text-slate-700 dark:text-white" /><ThemeToggle compact className="border-0 bg-transparent text-slate-700 dark:text-white" /></div>
            </div>

            <div className="px-1 pt-8 text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3.5 py-2 text-[11px] font-black text-violet-700 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-violet-200"><Star className="h-3.5 w-3.5 fill-current" />{t("hero.badge")}</div>
              <h1 className="mt-5 text-[38px] font-black leading-[0.98] tracking-[-0.06em] text-slate-950 dark:text-white">{t("hero.title1")}<span className="mt-2 block bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">{t("hero.title2")}</span></h1>
              <p className="mx-auto mt-4 max-w-sm text-[14px] font-medium leading-6 text-slate-600 dark:text-slate-300">{t("hero.subtitle")}</p>
            </div>

            <form onSubmit={submitSearch} className="mt-7 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_18px_55px_rgba(15,23,42,.08)] dark:border-white/10 dark:bg-white/[0.06]">
              <label className="flex min-h-[58px] items-center gap-3 rounded-[17px] bg-slate-50 px-4 dark:bg-white/[0.05]"><Search className="h-5 w-5 shrink-0 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search.label")} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 dark:text-white" /><ChevronRight className="h-4 w-4 text-slate-300" /></label>
              <div className="mt-2 flex min-h-[52px] items-center gap-3 rounded-[17px] bg-slate-50 px-4 text-sm font-bold text-slate-600 dark:bg-white/[0.05] dark:text-slate-200"><MapPin className="h-5 w-5 text-violet-500" /><span className="flex-1">{t("search.city")}</span><ChevronRight className="h-4 w-4 text-slate-300" /></div>
            </form>

            <div className="mt-7 flex items-end justify-between px-1"><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">{t("categories.title")}</h2><button type="button" onClick={() => setSelectedCategory(null)} className="text-xs font-black text-violet-600 dark:text-violet-300">{t("categories.all")}</button></div>
            <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleCategories.map((category, index) => {
                const visual = categoryVisual(category);
                const active = selectedCategory === category.slug;
                return (
                  <button key={category.slug ?? category.id ?? index} type="button" onClick={() => setSelectedCategory(active ? null : category.slug ?? null)} className={`w-[92px] shrink-0 snap-start rounded-[20px] border p-3 text-center shadow-[0_10px_30px_rgba(15,23,42,.05)] transition ${active ? "border-violet-500 bg-violet-50 dark:bg-violet-500/15" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.055]"}`}>
                    <span className={`mx-auto grid h-12 w-12 place-items-center rounded-[16px] ${visual.shellClass}`}><visual.Icon className={`h-6 w-6 ${visual.iconClass}`} /></span>
                    <span className="mt-2 block line-clamp-2 text-[10px] font-black leading-4 text-slate-800 dark:text-white">{localizedCategoryName(category, locale, t("category.fallback"))}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex items-end justify-between px-1"><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">{t("businesses.badge")}</h2><a href="#directory" className="text-xs font-black text-violet-600 dark:text-violet-300">{t("categories.all")}</a></div>
            <div className="mt-4 space-y-3">
              {(featuredBusinesses.length ? featuredBusinesses : filteredBusinesses).slice(0, 5).map((business) => (
                <Link key={business.id} to={`/businesses/${business.slug}`} className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_14px_36px_rgba(15,23,42,.055)] dark:border-white/10 dark:bg-white/[0.055]">
                  <div className="h-[82px] w-[104px] shrink-0 overflow-hidden rounded-[17px]"><BusinessThumb business={business} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-black text-slate-950 dark:text-white">{business.name}</div>
                    <div className="mt-1 truncate text-[11px] font-bold text-violet-600 dark:text-violet-300">{localizedCategoryName(business.category, locale, business.custom_category_name ?? t("category.fallback"))}</div>
                    <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-300"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{businessLocation(business, t("business.card.noAddress"))}</span></div>
                    <div className="mt-2 flex items-center gap-3 text-[10px] font-black text-slate-400"><span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-violet-500" />{business.services_count}</span><span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5 text-cyan-500" />{business.staff_count}</span></div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                </Link>
              ))}
            </div>

            <div className="mt-8 rounded-[26px] border border-slate-200 bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,.06)] dark:border-white/10 dark:bg-white/[0.055]"><div className="mb-3 flex items-center justify-between px-1"><h2 className="text-lg font-black text-slate-950 dark:text-white">{t("map.title")}</h2><MapPin className="h-5 w-5 text-violet-500" /></div><MapPreview pins={pins} compact /></div>

            <div className="sticky bottom-3 z-30 mt-8 grid grid-cols-5 rounded-[22px] border border-slate-200 bg-white/94 px-2 py-2.5 shadow-[0_18px_55px_rgba(15,23,42,.13)] backdrop-blur-xl dark:border-white/10 dark:bg-[#07101f]/94 dark:shadow-black/30">
              {[
                { Icon: Home, label: t("nav.home"), active: true },
                { Icon: Search, label: t("nav.services") },
                { Icon: MapPin, label: t("nav.map") },
                { Icon: Heart, label: t("businesses.badge") },
                { Icon: UserRound, label: t("nav.login") },
              ].map(({ Icon, label, active }) => <span key={label} className={`grid place-items-center gap-1 text-[8px] font-black ${active ? "text-violet-600 dark:text-violet-300" : "text-slate-400"}`}><Icon className="h-5 w-5" /><span className="max-w-[62px] truncate">{label}</span></span>)}
            </div>
          </div>
        </section>

        <section id="directory" className="scroll-mt-24 bg-[#f7f9fc] px-5 py-12 dark:bg-[#050816] sm:px-8 sm:py-16">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div><div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200"><Building2 className="h-4 w-4" />{t("businesses.badge")}</div><h2 className="mt-4 max-w-3xl text-[32px] font-black tracking-[-0.055em] text-slate-950 dark:text-white sm:text-[46px]">{t("businesses.title")}</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">{t("businesses.text")}</p></div>
              <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSelectedCategory(null)} className={`rounded-full px-4 py-2.5 text-xs font-black transition ${!selectedCategory ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"}`}>{t("businesses.all")}</button>{visibleCategories.slice(0, 4).map((category, index) => <button key={category.slug ?? category.id ?? index} type="button" onClick={() => setSelectedCategory(category.slug ?? null)} className={`rounded-full px-4 py-2.5 text-xs font-black transition ${selectedCategory === category.slug ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"}`}>{localizedCategoryName(category, locale, t("category.fallback"))}</button>)}</div>
            </div>

            {(businessesQ.isLoading || categoriesQ.isLoading) ? <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[390px] animate-pulse rounded-[24px] bg-slate-200 dark:bg-white/[0.06]" />)}</div> : filteredBusinesses.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredBusinesses.slice(0, 12).map((business) => <DirectoryBusinessCard key={business.id} business={business} locale={locale} t={t} />)}</div> : <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.04]"><Search className="mx-auto h-8 w-8 text-slate-400" /><h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{t("businesses.empty.title")}</h3></div>}
          </div>
        </section>

        <section className="bg-white px-5 pb-14 dark:bg-[#050816] sm:px-8 sm:pb-20">
          <div className="mx-auto grid max-w-[1320px] overflow-hidden rounded-[34px] border border-slate-200 bg-slate-50 shadow-[0_24px_80px_rgba(15,23,42,.07)] dark:border-white/10 dark:bg-[#07101f] dark:shadow-black/20 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="flex flex-col justify-center p-7 sm:p-10"><div className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-100 px-3 py-2 text-xs font-black text-violet-700 dark:bg-violet-500/15 dark:text-violet-200"><MapPin className="h-4 w-4" />{t("map.badge")}</div><h2 className="mt-5 text-[30px] font-black tracking-[-0.05em] text-slate-950 dark:text-white sm:text-[40px]">{t("map.title")}</h2><p className="mt-4 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">{t("map.instructions")}</p><Link to="#directory" className="mt-6 inline-flex w-fit items-center gap-2 rounded-[16px] bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-black text-white">{t("search.button")}<ArrowRight className="h-4 w-4" /></Link></div>
            <div className="p-4 sm:p-6"><MapPreview pins={pins} /></div>
          </div>
        </section>
      </main>

      <div className="hidden md:block"><Footer /></div>
    </div>
  );
}
