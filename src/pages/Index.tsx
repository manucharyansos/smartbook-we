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
  CheckCircle2,
  ChevronRight,
  Grid3X3,
  Heart,
  HeartPulse,
  Home,
  MapPin,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
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

type CategoryVisual = { Icon: LucideIcon; iconClass: string; shellClass: string };

const fallbackCategories: PublicBusinessCategory[] = [
  { slug: "beauty-salon", vertical: "services", name_hy: "Գեղեցկություն", name_ru: "Красота", name_en: "Beauty", icon: "beauty" },
  { slug: "clinic", vertical: "healthcare", name_hy: "Առողջություն", name_ru: "Здоровье", name_en: "Health", icon: "health" },
  { slug: "home-services", vertical: "services", name_hy: "Տուն և վերանորոգում", name_ru: "Дом и ремонт", name_en: "Home & repair", icon: "home" },
  { slug: "auto-service", vertical: "services", name_hy: "Ավտո", name_ru: "Авто", name_en: "Auto", icon: "car" },
  { slug: "other-services", vertical: "services", name_hy: "Այլ", name_ru: "Другое", name_en: "Other", icon: "other" },
];

const categoryVisuals: Array<{ keywords: string[]; visual: CategoryVisual }> = [
  {
    keywords: ["beauty", "salon", "hair", "barber", "գեղեց", "վարս", "салон", "барбер"],
    visual: { Icon: Sparkles, iconClass: "text-[#7a365f]", shellClass: "bg-[#f8e7ed]" },
  },
  {
    keywords: ["health", "medical", "clinic", "doctor", "dental", "բժշ", "կլինիկ", "ատամ", "мед", "клиник", "стомат"],
    visual: { Icon: HeartPulse, iconClass: "text-[#544d86]", shellClass: "bg-[#eceafa]" },
  },
  {
    keywords: ["home", "repair", "house", "տուն", "վերանորոգ", "ремонт"],
    visual: { Icon: Home, iconClass: "text-[#3b7b67]", shellClass: "bg-[#e7f3ed]" },
  },
  {
    keywords: ["car", "auto", "ավտ", "авто"],
    visual: { Icon: Car, iconClass: "text-[#a56d1d]", shellClass: "bg-[#fbf0dc]" },
  },
];

const defaultVisual: CategoryVisual = {
  Icon: Grid3X3,
  iconClass: "text-[#4d2f73]",
  shellClass: "bg-[#eee8f8]",
};

function localizedCategoryName(category: PublicBusinessCategory | null | undefined, locale: string, fallback: string) {
  if (!category) return fallback;
  if (locale === "ru") return category.name_ru ?? category.name ?? category.name_hy ?? category.name_en ?? fallback;
  if (locale === "en") return category.name_en ?? category.name ?? category.name_hy ?? category.name_ru ?? fallback;
  return category.name_hy ?? category.name ?? category.name_ru ?? category.name_en ?? fallback;
}

function categoryKey(category: PublicBusinessCategory, index: number) {
  return category.slug ?? String(category.id ?? index);
}

function getCategoryVisual(category: PublicBusinessCategory | null | undefined): CategoryVisual {
  if (!category) return defaultVisual;
  const value = [category.slug, category.icon, category.name, category.name_hy, category.name_ru, category.name_en]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return categoryVisuals.find((item) => item.keywords.some((keyword) => value.includes(keyword)))?.visual ?? defaultVisual;
}

function mergeCategories(apiCategories: PublicBusinessCategory[], businesses: PublicDirectoryBusiness[]) {
  const map = new Map<string, PublicBusinessCategory>();
  apiCategories.forEach((category, index) => map.set(categoryKey(category, index), category));
  businesses.forEach((business, index) => {
    if (!business.category) return;
    const key = categoryKey(business.category, index + 1000);
    if (!map.has(key)) map.set(key, business.category);
  });
  if (!map.size) fallbackCategories.forEach((category, index) => map.set(categoryKey(category, index), category));
  return Array.from(map.values());
}

function businessLocation(item: PublicDirectoryBusiness, fallback: string) {
  return item.locations?.find((location) => location.is_primary)?.address
    ?? item.locations?.[0]?.address
    ?? item.address
    ?? fallback;
}

function matchesBusiness(item: PublicDirectoryBusiness, search: string, selectedCategory: string | null, locale: string, fallback: string) {
  if (selectedCategory && item.category?.slug !== selectedCategory) return false;
  const query = search.trim().toLocaleLowerCase();
  if (!query) return true;
  const haystack = [
    item.name,
    item.address,
    item.short_description,
    item.custom_category_name,
    localizedCategoryName(item.category, locale, fallback),
    ...(item.locations ?? []).map((location) => `${location.name ?? ""} ${location.address ?? ""} ${location.city ?? ""}`),
  ].filter(Boolean).join(" ").toLocaleLowerCase();
  return query.split(/\s+/).every((part) => haystack.includes(part));
}

function BrandMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`${compact ? "h-8 w-8" : "h-11 w-11"} grid place-items-center text-[#d49b3a]`}>
        <Heart className={`${compact ? "h-7 w-7" : "h-10 w-10"} rotate-[-2deg]`} strokeWidth={2.4} />
      </span>
      <span className={`${compact ? "text-[17px]" : "text-[27px]"} font-black tracking-[-0.045em] ${inverse ? "text-white" : "text-[#2b0834] dark:text-white"}`}>Vizit.am</span>
    </div>
  );
}

function BusinessThumb({ business, className = "" }: { business: PublicDirectoryBusiness; className?: string }) {
  const src = business.cover_url || business.logo_url;
  if (src) return <img src={src} alt="" className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-[#f6e7df] via-[#fffaf5] to-[#eadbea] dark:from-[#31182d] dark:via-[#160d19] dark:to-[#2e1a38] ${className}`}>
      <Building2 className="h-7 w-7 text-[#7b4566] dark:text-[#e4b866]" />
    </div>
  );
}

function CategoryTile({ category, locale, fallback, compact = false }: {
  category: PublicBusinessCategory;
  locale: string;
  fallback: string;
  compact?: boolean;
}) {
  const visual = getCategoryVisual(category);
  const Icon = visual.Icon;
  return (
    <div className={`${compact ? "rounded-[12px] px-1.5 py-2" : "rounded-[18px] px-3 py-3"} min-w-0 border border-[#eadfd7] bg-white/90 text-center shadow-[0_10px_28px_rgba(69,37,43,0.05)] dark:border-white/10 dark:bg-white/[0.06]`}>
      <span className={`${compact ? "h-8 w-8 rounded-[10px]" : "h-11 w-11 rounded-[14px]"} mx-auto grid place-items-center ${visual.shellClass}`}>
        <Icon className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${visual.iconClass}`} />
      </span>
      <div className={`${compact ? "mt-1 text-[7px]" : "mt-2 text-[10px]"} line-clamp-2 font-extrabold leading-4 text-[#3b2b37] dark:text-white`}>{localizedCategoryName(category, locale, fallback)}</div>
    </div>
  );
}

function MapPreview({ pins, compact = false }: { pins: PublicMapPin[]; compact?: boolean }) {
  const visiblePins = pins.slice(0, compact ? 4 : 7);
  const positions = compact ? [[18, 34], [67, 27], [48, 67], [80, 72]] : [[12, 28], [29, 60], [47, 35], [62, 70], [78, 26], [88, 58], [40, 82]];
  return (
    <div className={`${compact ? "h-[150px] rounded-[18px]" : "h-[170px] rounded-[18px]"} relative overflow-hidden border border-[#ded9cc] bg-[#edf0e8] dark:border-white/10 dark:bg-[#17111a]`}>
      <div className="absolute inset-0 opacity-80 dark:opacity-25" style={{
        backgroundImage: "linear-gradient(29deg,transparent 0 43%,rgba(148,163,184,.38) 44% 46%,transparent 47%),linear-gradient(111deg,transparent 0 49%,rgba(148,163,184,.30) 50% 52%,transparent 53%),linear-gradient(rgba(148,163,184,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.15) 1px,transparent 1px)",
        backgroundSize: "100% 100%,100% 100%,44px 44px,44px 44px",
      }} />
      <div className="absolute left-[16%] top-[26%] h-3 w-[68%] rotate-[8deg] rounded-full bg-white/70 dark:bg-white/10" />
      <div className="absolute left-[22%] top-[62%] h-3 w-[58%] -rotate-[12deg] rounded-full bg-white/65 dark:bg-white/10" />
      {visiblePins.map((pin, index) => {
        const [left, top] = positions[index % positions.length];
        return (
          <Link key={`${pin.business_id}-${pin.location_id}-${index}`} to={pin.booking_url || `/book/${pin.slug}`} title={pin.name} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition hover:scale-110" style={{ left: `${left}%`, top: `${top}%` }}>
            <span className={`${compact ? "h-7 w-7" : "h-8 w-8"} grid place-items-center rounded-full border-2 border-white bg-[#3b0b3d] text-white shadow-[0_8px_20px_rgba(59,11,61,0.25)]`}><MapPin className="h-4 w-4" /></span>
          </Link>
        );
      })}
    </div>
  );
}

function DeviceBusinessCard({ business, locale, t, mobile = false }: {
  business: PublicDirectoryBusiness;
  locale: string;
  t: (key: string) => string;
  mobile?: boolean;
}) {
  const category = localizedCategoryName(business.category, locale, business.custom_category_name ?? t("category.fallback"));
  if (mobile) {
    return (
      <Link to={`/businesses/${business.slug}`} className="flex items-center gap-2 rounded-[13px] border border-[#eadfd7] bg-white p-2 shadow-[0_8px_22px_rgba(79,42,48,0.06)] dark:border-white/10 dark:bg-white/[0.06]">
        <div className="h-[48px] w-[58px] shrink-0 overflow-hidden rounded-[10px]"><BusinessThumb business={business} /></div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[9px] font-black text-[#29122d] dark:text-white">{business.name}</div>
          <div className="mt-0.5 truncate text-[7px] font-semibold text-[#75676f] dark:text-slate-300">{category}</div>
          <div className="mt-1 flex items-center gap-1 text-[7px] font-bold text-[#9b8b92] dark:text-slate-400"><Star className="h-2.5 w-2.5 fill-[#d99a31] text-[#d99a31]" />{Math.max(4.7, 4.7 + (business.id % 3) * 0.1).toFixed(1)} <span className="ml-auto truncate">{businessLocation(business, t("business.card.noAddress"))}</span></div>
        </div>
      </Link>
    );
  }
  return (
    <Link to={`/businesses/${business.slug}`} className="overflow-hidden rounded-[12px] border border-[#eadfd7] bg-white shadow-[0_9px_24px_rgba(75,40,45,0.06)] dark:border-white/10 dark:bg-white/[0.06]">
      <div className="h-[72px] overflow-hidden"><BusinessThumb business={business} /></div>
      <div className="p-2.5">
        <div className="truncate text-[8px] font-black text-[#2b172e] dark:text-white">{business.name}</div>
        <div className="mt-1 truncate text-[6px] font-semibold text-[#7d6d75] dark:text-slate-300">{category}</div>
        <div className="mt-2 flex items-center gap-1 text-[6px] font-bold text-[#9e8c92]"><Star className="h-2.5 w-2.5 fill-[#d99a31] text-[#d99a31]" />{Math.max(4.7, 4.7 + (business.id % 3) * 0.1).toFixed(1)} <span className="ml-auto truncate">{t("search.city")}</span></div>
      </div>
    </Link>
  );
}

function LaptopMockup({ businesses, categories, pins, locale, t }: {
  businesses: PublicDirectoryBusiness[];
  categories: PublicBusinessCategory[];
  pins: PublicMapPin[];
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[900px] pb-[82px] pt-6">
      <div className="relative rounded-[24px] border-[10px] border-[#1d1c20] bg-[#1d1c20] shadow-[0_45px_100px_rgba(60,30,38,0.24)] dark:shadow-black/55">
        <div className="overflow-hidden rounded-[14px] bg-[#fffaf5] dark:bg-[#110b12]">
          <div className="flex h-11 items-center justify-between border-b border-[#eee4dc] bg-[#fffdf9] px-5 dark:border-white/10 dark:bg-[#160e17]">
            <BrandMark compact />
            <div className="flex items-center gap-4 text-[7px] font-bold text-[#4f4049] dark:text-slate-200">
              <span>{t("nav.services")}</span><span>{t("nav.businesses")}</span><span>{t("nav.map")}</span><span>{t("nav.login")}</span>
              <span className="rounded-[7px] bg-[#35103c] px-3 py-1.5 text-white">{t("nav.start")}</span>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 rounded-[12px] border border-[#e8dfd7] bg-white px-4 py-3 text-[8px] font-semibold text-[#9a8f94] shadow-[0_7px_20px_rgba(68,38,44,0.06)] dark:border-white/10 dark:bg-white/[0.05]">
              <Search className="h-3.5 w-3.5" /><span className="flex-1">{t("search.label")}</span><MapPin className="h-3.5 w-3.5 text-[#d49b3a]" /><span>{t("search.city")}</span>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-2">{categories.slice(0, 6).map((category, index) => <CategoryTile key={categoryKey(category, index)} category={category} locale={locale} fallback={t("category.fallback")} compact />)}</div>
            <div className="mt-5 flex items-center justify-between"><div className="text-[10px] font-black text-[#2d1830] dark:text-white">{t("businesses.badge")}</div><div className="text-[7px] font-black text-[#c88d31]">{t("categories.all")} →</div></div>
            <div className="mt-2 grid grid-cols-4 gap-2">{businesses.slice(0, 4).map((business) => <DeviceBusinessCard key={business.id} business={business} locale={locale} t={t} />)}</div>
            <div className="mt-5 text-[10px] font-black text-[#2d1830] dark:text-white">{t("map.title")}</div>
            <div className="mt-2"><MapPreview pins={pins} /></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[43px] left-1/2 h-[34px] w-[61%] -translate-x-1/2 rounded-b-[26px] bg-gradient-to-b from-[#c8c9cc] via-[#aeb0b4] to-[#919399] shadow-[0_15px_30px_rgba(59,39,43,0.20)]" />
      <div className="absolute bottom-[28px] left-1/2 h-[18px] w-[92%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-[#d6d7d9] to-[#a8aaae] shadow-[0_10px_18px_rgba(59,39,43,0.16)]" />
    </div>
  );
}

function PhoneMockup({ businesses, categories, locale, t }: {
  businesses: PublicDirectoryBusiness[];
  categories: PublicBusinessCategory[];
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <div className="absolute bottom-[10px] right-[-16px] z-20 hidden w-[238px] rounded-[35px] border-[7px] border-[#171619] bg-[#171619] p-1 shadow-[0_35px_70px_rgba(53,28,35,0.30)] xl:block 2xl:right-[-22px] 2xl:w-[254px]">
      <div className="overflow-hidden rounded-[27px] bg-[#fffaf5] dark:bg-[#110b12]">
        <div className="mx-auto mt-2 h-4 w-16 rounded-full bg-black" />
        <div className="flex items-center justify-between px-3 pb-2 pt-3"><Menu className="h-4 w-4 text-[#392c34] dark:text-white" /><BrandMark compact /><Bell className="h-4 w-4 text-[#392c34] dark:text-white" /></div>
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 rounded-[11px] border border-[#eadfd7] bg-white px-3 py-2 text-[7px] text-[#9a8f94] shadow-sm dark:border-white/10 dark:bg-white/[0.05]"><Search className="h-3 w-3" />{t("search.label")}</div>
          <div className="mt-2 flex items-center gap-2 rounded-[11px] border border-[#eadfd7] bg-white px-3 py-2 text-[7px] font-bold text-[#655760] dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"><MapPin className="h-3 w-3 text-[#d49b3a]" />{t("search.city")}<ChevronRight className="ml-auto h-3 w-3" /></div>
          <div className="mt-3 grid grid-cols-5 gap-1.5">{categories.slice(0, 5).map((category, index) => <CategoryTile key={categoryKey(category, index)} category={category} locale={locale} fallback={t("category.fallback")} compact />)}</div>
          <div className="mt-4 flex items-center justify-between"><div className="text-[8px] font-black text-[#2f1931] dark:text-white">{t("businesses.badge")}</div><div className="text-[6px] font-black text-[#c88d31]">{t("categories.all")} →</div></div>
          <div className="mt-2 space-y-1.5">{businesses.slice(0, 3).map((business) => <DeviceBusinessCard key={business.id} business={business} locale={locale} t={t} mobile />)}</div>
        </div>
        <div className="grid grid-cols-5 border-t border-[#eadfd7] bg-white px-2 py-2 dark:border-white/10 dark:bg-[#160e17]">
          {[Home, CalendarDays, Heart, MessageSquare, UserRound].map((Icon, index) => <span key={index} className={`grid place-items-center ${index === 0 ? "text-[#3b0b3d] dark:text-[#e2b85b]" : "text-[#9b9297]"}`}><Icon className="h-3.5 w-3.5" /></span>)}
        </div>
      </div>
    </div>
  );
}

function SearchBar({ search, setSearch, onSubmit, t }: {
  search: string;
  setSearch: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  t: (key: string) => string;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-[22px] border border-[#eadfd7] bg-white/95 p-2.5 shadow-[0_18px_50px_rgba(65,35,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
      <div className="grid gap-2 sm:grid-cols-[1fr_155px_112px]">
        <label className="flex min-h-[56px] items-center gap-3 rounded-[16px] bg-[#fbf7f3] px-4 dark:bg-white/[0.05]"><Search className="h-5 w-5 text-[#887b82]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search.label")} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#392c34] outline-none placeholder:text-[#a79aa1] dark:text-white" /></label>
        <div className="flex min-h-[56px] items-center gap-2 rounded-[16px] bg-[#fbf7f3] px-4 text-sm font-bold text-[#665760] dark:bg-white/[0.05] dark:text-slate-200"><MapPin className="h-4 w-4 text-[#d49b3a]" />{t("search.city")}</div>
        <button type="submit" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[16px] bg-[#3b0b3d] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(59,11,61,0.22)] transition hover:bg-[#4b164c] dark:bg-[#d49b3a] dark:text-[#241126] dark:hover:bg-[#e0aa4f]"><Search className="h-4 w-4" />{t("search.button")}</button>
      </div>
    </form>
  );
}

function DirectoryCard({ business, locale, t }: {
  business: PublicDirectoryBusiness;
  locale: string;
  t: (key: string) => string;
}) {
  const category = localizedCategoryName(business.category, locale, business.custom_category_name ?? t("category.fallback"));
  return (
    <article className="group overflow-hidden rounded-[24px] border border-[#eadfd7] bg-white shadow-[0_16px_46px_rgba(73,39,45,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(73,39,45,0.11)] dark:border-white/10 dark:bg-white/[0.055]">
      <Link to={`/businesses/${business.slug}`} className="block h-[190px] overflow-hidden"><BusinessThumb business={business} className="transition duration-500 group-hover:scale-[1.03]" /></Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link to={`/businesses/${business.slug}`} className="block truncate text-lg font-black text-[#2f1633] hover:text-[#6b2b67] dark:text-white">{business.name}</Link><div className="mt-1 truncate text-xs font-bold text-[#b47d2d]">{category}</div></div>{business.is_featured ? <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fbefd9] text-[#c58b2d]"><Star className="h-4 w-4 fill-current" /></span> : null}</div>
        <div className="mt-4 flex items-start gap-2 text-sm font-medium text-[#786a72] dark:text-slate-300"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c58b2d]" /><span className="line-clamp-2">{businessLocation(business, t("business.card.noAddress"))}</span></div>
        <div className="mt-4 flex items-center gap-4 text-xs font-bold text-[#8c7c84] dark:text-slate-300"><span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-[#7b4566]" />{business.services_count} {t("business.card.services")}</span><span className="flex items-center gap-1.5"><UserRound className="h-4 w-4 text-[#c58b2d]" />{business.staff_count} {t("business.card.staff")}</span></div>
        <div className="mt-5 grid grid-cols-2 gap-2"><Link to={`/businesses/${business.slug}`} className="inline-flex items-center justify-center rounded-[14px] border border-[#eadfd7] px-4 py-3 text-sm font-black text-[#5a4651] transition hover:bg-[#fbf3ed] dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[0.08]">{t("business.card.view")}</Link><Link to={`/book/${business.slug}`} className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#3b0b3d] px-4 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(59,11,61,0.18)] dark:bg-[#d49b3a] dark:text-[#241126]">{t("business.card.book")}<ArrowRight className="h-4 w-4" /></Link></div>
      </div>
    </article>
  );
}

export default function Index() {
  const { locale, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const categoriesQ = useQuery({ queryKey: ["public-home-categories", locale], queryFn: () => fetchPublicCategories({ locale }), staleTime: 5 * 60_000 });
  const businessesQ = useQuery({ queryKey: ["public-home-businesses"], queryFn: () => fetchPublicBusinesses({ type: "all", per_page: 24 }), staleTime: 60_000 });
  const mapPinsQ = useQuery({ queryKey: ["public-home-map-pins"], queryFn: () => fetchPublicMapPins({ type: "all" }), staleTime: 60_000 });

  const businesses = useMemo(() => businessesQ.data ?? [], [businessesQ.data]);
  const categories = useMemo(() => mergeCategories(categoriesQ.data ?? [], businesses), [categoriesQ.data, businesses]);
  const pins = mapPinsQ.data ?? [];
  const visibleCategories = categories.slice(0, 10);

  const filteredBusinesses = useMemo(
    () => businesses.filter((item) => matchesBusiness(item, search, selectedCategory, locale, t("category.fallback"))),
    [businesses, search, selectedCategory, locale, t],
  );
  const featuredBusinesses = useMemo(() => {
    const featured = businesses.filter((item) => item.is_featured);
    return (featured.length ? featured : businesses).slice(0, 6);
  }, [businesses]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function chooseCategory(category: PublicBusinessCategory) {
    const slug = category.slug ?? null;
    setSelectedCategory((current) => current === slug ? null : slug);
    requestAnimationFrame(() => document.getElementById("directory")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const showcaseBusinesses = featuredBusinesses.length ? featuredBusinesses : filteredBusinesses;

  return (
    <div className="vizit-public-page min-h-screen overflow-x-clip bg-[#fffaf6] text-[#2f1931] transition-colors dark:bg-[#0d080f] dark:text-white">
      <Seo title={t("seo.homeTitle")} description={t("seo.homeDescription")} image="/og-default.svg" />

      <div className="hidden md:block"><LandingNavbar /></div>

      <main>
        <section className="relative hidden overflow-hidden bg-[#fffaf6] px-6 pb-16 pt-[118px] dark:bg-[#0d080f] md:block lg:px-8">
          <div className="pointer-events-none absolute -left-32 top-[30%] h-[520px] w-[520px] rounded-full border border-[#e8bf75]/40" />
          <div className="pointer-events-none absolute -right-28 -top-48 h-[520px] w-[520px] rounded-full border border-[#e8bf75]/45" />
          <div className="pointer-events-none absolute right-[-90px] top-[120px] h-[520px] w-[240px] rounded-[50%] bg-[#f7e4df]/70 blur-[2px] dark:bg-[#3b1f32]/30" />
          <div className="pointer-events-none absolute bottom-[-190px] left-[-110px] h-[430px] w-[620px] rotate-[10deg] rounded-[48%] bg-[#3a0b3d] dark:bg-[#240726]" />
          <div className="pointer-events-none absolute bottom-[-155px] left-[-80px] h-[300px] w-[520px] rotate-[10deg] rounded-[48%] border border-[#d8a241]/70" />

          <div className="relative mx-auto max-w-[1480px]">
            <div className="grid items-center gap-6 xl:grid-cols-[0.72fr_1.28fr] xl:gap-8">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-[590px] pb-10 xl:pb-20">
                <BrandMark />
                <div className="mt-14 text-[18px] font-bold text-[#c48a31] dark:text-[#e3b65b]">{t("hero.badge")}</div>
                <h1 className="mt-7 text-[clamp(3rem,4.7vw,5.1rem)] font-black leading-[1.02] tracking-[-0.06em] text-[#2f0b35] dark:text-white">{t("hero.title1")}<span className="mt-2 block">{t("hero.title2")}</span></h1>
                <p className="mt-7 max-w-xl text-[17px] font-medium leading-8 text-[#665660] dark:text-slate-300">{t("hero.subtitle")}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button type="button" onClick={() => document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-4 rounded-[16px] bg-[#3b0b3d] px-8 py-4 text-base font-black text-white shadow-[0_16px_35px_rgba(59,11,61,0.24)] transition hover:-translate-y-0.5 hover:bg-[#4b164c] dark:bg-[#d49b3a] dark:text-[#241126]">{t("nav.start")}<ArrowRight className="h-5 w-5 text-[#e0aa4f] dark:text-[#241126]" /></button>
                  <button type="button" onClick={() => document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 rounded-[16px] border border-[#e4d4c7] bg-white/70 px-6 py-4 text-sm font-black text-[#5f4b56] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"><MapPin className="h-4 w-4 text-[#c58b2d]" />{t("nav.map")}</button>
                </div>
                <div className="mt-9 grid max-w-[560px] grid-cols-3 gap-4 text-[11px] font-bold text-[#6d5d65] dark:text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#d49b3a]" />{t("businesses.badge")}</div>
                  <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 shrink-0 text-[#d49b3a]" />{t("search.button")}</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 shrink-0 text-[#d49b3a]" />{t("nav.login")}</div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.08 }} className="relative min-w-0 pb-4 pt-5">
                <LaptopMockup businesses={showcaseBusinesses} categories={visibleCategories} pins={pins} locale={locale} t={t} />
                <PhoneMockup businesses={showcaseBusinesses} categories={visibleCategories} locale={locale} t={t} />
              </motion.div>
            </div>

            <div className="relative z-20 mx-auto mt-2 max-w-[1180px]"><SearchBar search={search} setSearch={setSearch} onSubmit={submitSearch} t={t} /></div>
          </div>
        </section>

        <section className="relative min-h-screen overflow-hidden bg-[#fffaf6] px-4 pb-28 pt-4 dark:bg-[#0d080f] md:hidden">
          <div className="pointer-events-none absolute -right-28 -top-20 h-72 w-72 rounded-full border border-[#e8bf75]/45" />
          <div className="pointer-events-none absolute -left-32 top-[38%] h-72 w-72 rounded-full border border-[#e8bf75]/35" />
          <div className="mx-auto max-w-md">
            <div className="sticky top-3 z-40 flex items-center justify-between rounded-[22px] border border-[#eadfd7] bg-[#fffdfa]/94 px-3 py-2.5 shadow-[0_16px_42px_rgba(70,38,44,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#160e17]/94">
              <button type="button" onClick={() => setMobileMenu(true)} className="grid h-10 w-10 place-items-center rounded-[14px] text-[#3b2c35] dark:text-white" aria-label={t("nav.openMenu")}><Menu className="h-5 w-5" /></button>
              <BrandMark compact />
              <div className="flex items-center gap-1"><LanguageToggle compact className="border-0 bg-transparent px-1.5 text-[#4a3943] dark:text-white" /><ThemeToggle compact className="border-0 bg-transparent text-[#4a3943] dark:text-white" /></div>
            </div>

            {mobileMenu ? (
              <div className="fixed inset-0 z-50 bg-[#2b0a31]/30 p-4 backdrop-blur-sm" onClick={() => setMobileMenu(false)}>
                <div className="mx-auto mt-2 max-w-md rounded-[26px] border border-[#eadfd7] bg-[#fffdfa] p-4 shadow-2xl dark:border-white/10 dark:bg-[#160e17]" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-between"><BrandMark compact /><button type="button" onClick={() => setMobileMenu(false)} className="grid h-10 w-10 place-items-center rounded-full bg-[#f7eee8] text-[#3b2c35] dark:bg-white/[0.08] dark:text-white"><X className="h-5 w-5" /></button></div>
                  <div className="mt-5 grid gap-2">{[["/", t("nav.home")], ["/pricing", t("nav.pricing")], ["/about", t("nav.about")], ["/contact", t("nav.contact")], ["/login", t("nav.login")], ["/register", t("nav.start")]].map(([to, label]) => <Link key={to} to={to} onClick={() => setMobileMenu(false)} className="rounded-[16px] border border-[#eadfd7] px-4 py-3 text-sm font-black text-[#493641] dark:border-white/10 dark:text-white">{label}</Link>)}</div>
                </div>
              </div>
            ) : null}

            <div className="px-1 pt-8 text-center"><div className="text-[12px] font-black uppercase tracking-[0.12em] text-[#c58b2d]">Vizit.am</div><h1 className="mx-auto mt-4 max-w-[340px] text-[39px] font-black leading-[1.02] tracking-[-0.055em] text-[#2f0b35] dark:text-white">{t("hero.title1")}<span className="mt-1 block">{t("hero.title2")}</span></h1><p className="mx-auto mt-4 max-w-sm text-[14px] font-medium leading-6 text-[#6e5e66] dark:text-slate-300">{t("hero.subtitle")}</p></div>

            <div className="mt-7"><SearchBar search={search} setSearch={setSearch} onSubmit={submitSearch} t={t} /></div>

            <div className="mt-7 flex items-end justify-between px-1"><h2 className="text-xl font-black tracking-[-0.04em] text-[#2f1931] dark:text-white">{t("categories.title")}</h2><button type="button" onClick={() => setSelectedCategory(null)} className="text-xs font-black text-[#c58b2d]">{t("categories.all")}</button></div>
            <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{visibleCategories.map((category, index) => { const active = selectedCategory === category.slug; return <button key={categoryKey(category, index)} type="button" onClick={() => chooseCategory(category)} className={`w-[96px] shrink-0 snap-start rounded-[20px] border p-2.5 transition ${active ? "border-[#c58b2d] bg-[#fff1dc] dark:bg-[#d49b3a]/10" : "border-[#eadfd7] bg-white dark:border-white/10 dark:bg-white/[0.055]"}`}><CategoryTile category={category} locale={locale} fallback={t("category.fallback")} /></button>; })}</div>

            <div className="mt-7 flex items-end justify-between px-1"><h2 className="text-xl font-black tracking-[-0.04em] text-[#2f1931] dark:text-white">{t("businesses.badge")}</h2><a href="#directory" className="text-xs font-black text-[#c58b2d]">{t("categories.all")}</a></div>
            <div className="mt-4 space-y-3">{(showcaseBusinesses.length ? showcaseBusinesses : filteredBusinesses).slice(0, 5).map((business) => <Link key={business.id} to={`/businesses/${business.slug}`} className="flex items-center gap-3 rounded-[22px] border border-[#eadfd7] bg-white p-3 shadow-[0_13px_34px_rgba(73,39,45,0.05)] dark:border-white/10 dark:bg-white/[0.055]"><div className="h-[82px] w-[106px] shrink-0 overflow-hidden rounded-[16px]"><BusinessThumb business={business} /></div><div className="min-w-0 flex-1"><div className="truncate text-[15px] font-black text-[#2f1931] dark:text-white">{business.name}</div><div className="mt-1 truncate text-[11px] font-bold text-[#b47d2d]">{localizedCategoryName(business.category, locale, business.custom_category_name ?? t("category.fallback"))}</div><div className="mt-2 flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-[#786a72] dark:text-slate-300"><MapPin className="h-3.5 w-3.5 shrink-0 text-[#c58b2d]" /><span className="truncate">{businessLocation(business, t("business.card.noAddress"))}</span></div><div className="mt-2 flex items-center gap-3 text-[10px] font-black text-[#9a8c93]"><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#d99a31] text-[#d99a31]" />{Math.max(4.7, 4.7 + (business.id % 3) * 0.1).toFixed(1)}</span><span>{business.services_count} {t("business.card.services")}</span></div></div><ChevronRight className="h-5 w-5 shrink-0 text-[#cdbfc5]" /></Link>)}</div>

            <div id="map-section" className="mt-8 rounded-[26px] border border-[#eadfd7] bg-white p-3 shadow-[0_16px_42px_rgba(73,39,45,0.05)] dark:border-white/10 dark:bg-white/[0.055]"><div className="mb-3 flex items-center justify-between px-1"><h2 className="text-lg font-black text-[#2f1931] dark:text-white">{t("map.title")}</h2><MapPin className="h-5 w-5 text-[#c58b2d]" /></div><MapPreview pins={pins} compact /></div>

            <div className="sticky bottom-3 z-30 mt-8 grid grid-cols-5 rounded-[22px] border border-[#eadfd7] bg-white/94 px-2 py-2.5 shadow-[0_18px_50px_rgba(66,34,41,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#160e17]/94">{[
              { to: "/", Icon: Home, label: t("nav.home"), active: true },
              { to: "#directory", Icon: Search, label: t("nav.services") },
              { to: "#map-section", Icon: MapPin, label: t("nav.map") },
              { to: "/contact", Icon: MessageSquare, label: t("nav.contact") },
              { to: "/client/login", Icon: UserRound, label: t("nav.login") },
            ].map(({ to, Icon, label, active }) => to.startsWith("#") ? <a key={to} href={to} className={`grid place-items-center gap-1 text-[8px] font-black ${active ? "text-[#3b0b3d] dark:text-[#e3b65b]" : "text-[#9c9196]"}`}><Icon className="h-5 w-5" /><span className="max-w-[60px] truncate">{label}</span></a> : <Link key={to} to={to} className={`grid place-items-center gap-1 text-[8px] font-black ${active ? "text-[#3b0b3d] dark:text-[#e3b65b]" : "text-[#9c9196]"}`}><Icon className="h-5 w-5" /><span className="max-w-[60px] truncate">{label}</span></Link>)}</div>
          </div>
        </section>

        <section id="directory" className="scroll-mt-24 bg-[#fffaf6] px-5 py-14 dark:bg-[#0d080f] sm:px-8 sm:py-18">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full border border-[#eadfd7] bg-white px-3 py-2 text-xs font-black text-[#8a5b23] dark:border-white/10 dark:bg-white/[0.05] dark:text-[#e3b65b]"><Building2 className="h-4 w-4" />{t("businesses.badge")}</div><h2 className="mt-4 max-w-3xl text-[32px] font-black tracking-[-0.055em] text-[#2f1931] dark:text-white sm:text-[46px]">{t("businesses.title")}</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#71616a] dark:text-slate-300">{t("businesses.text")}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSelectedCategory(null)} className={`rounded-full px-4 py-2.5 text-xs font-black transition ${!selectedCategory ? "bg-[#3b0b3d] text-white dark:bg-[#d49b3a] dark:text-[#241126]" : "border border-[#eadfd7] bg-white text-[#65535d] dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"}`}>{t("businesses.all")}</button>{visibleCategories.slice(0, 5).map((category, index) => <button key={categoryKey(category, index)} type="button" onClick={() => chooseCategory(category)} className={`rounded-full px-4 py-2.5 text-xs font-black transition ${selectedCategory === category.slug ? "bg-[#3b0b3d] text-white dark:bg-[#d49b3a] dark:text-[#241126]" : "border border-[#eadfd7] bg-white text-[#65535d] dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"}`}>{localizedCategoryName(category, locale, t("category.fallback"))}</button>)}</div></div>

            {(businessesQ.isLoading || categoriesQ.isLoading) ? <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[390px] animate-pulse rounded-[24px] bg-[#eee4dc] dark:bg-white/[0.06]" />)}</div> : filteredBusinesses.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredBusinesses.slice(0, 12).map((business) => <DirectoryCard key={business.id} business={business} locale={locale} t={t} />)}</div> : <div className="mt-8 rounded-[28px] border border-dashed border-[#dacbc0] bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.04]"><Search className="mx-auto h-8 w-8 text-[#a18f98]" /><h3 className="mt-4 text-xl font-black text-[#2f1931] dark:text-white">{t("businesses.empty.title")}</h3></div>}
          </div>
        </section>

        <section id="map-section" className="bg-[#fffaf6] px-5 pb-16 dark:bg-[#0d080f] sm:px-8 sm:pb-20">
          <div className="mx-auto grid max-w-[1320px] overflow-hidden rounded-[34px] border border-[#eadfd7] bg-white shadow-[0_22px_75px_rgba(73,39,45,0.06)] dark:border-white/10 dark:bg-[#160e17] lg:grid-cols-[0.72fr_1.28fr]">
            <div className="flex flex-col justify-center p-7 sm:p-10"><div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#fbefd9] px-3 py-2 text-xs font-black text-[#946321] dark:bg-[#d49b3a]/10 dark:text-[#e3b65b]"><MapPin className="h-4 w-4" />{t("map.badge")}</div><h2 className="mt-5 text-[30px] font-black tracking-[-0.05em] text-[#2f1931] dark:text-white sm:text-[40px]">{t("map.title")}</h2><p className="mt-4 text-sm font-medium leading-7 text-[#71616a] dark:text-slate-300">{t("map.instructions")}</p><a href="#directory" className="mt-6 inline-flex w-fit items-center gap-2 rounded-[16px] bg-[#3b0b3d] px-5 py-3 text-sm font-black text-white dark:bg-[#d49b3a] dark:text-[#241126]">{t("search.button")}<ArrowRight className="h-4 w-4" /></a></div>
            <div className="p-4 sm:p-6"><MapPreview pins={pins} /></div>
          </div>
        </section>
      </main>

      <div className="hidden md:block"><Footer /></div>
    </div>
  );
}
