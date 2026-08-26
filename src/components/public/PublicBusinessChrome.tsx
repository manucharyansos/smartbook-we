import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, Globe2, MapPin, MessageCircleMore, Phone } from "lucide-react";

import type { PublicBusiness } from "../../lib/publicApi";
import { useLanguage, type Locale } from "../../contexts/LanguageContext";
import LanguageToggle from "../LanguageToggle";
import ThemeToggle from "../ThemeToggle";
import { safeExternalUrl } from "../../lib/support";

const copy = {
  hy: { clinic: "Կլինիկա", page: "Բիզնես էջ", booking: "Ամրագրման միջավայր", home: "Գլխավոր", back: "Վերադառնալ նախորդ էջ", powered: "Vizit-ի աջակցությամբ", defaultPage: "Բիզնես էջ", summary: "Ամրագրում, կոնտակտ և բիզնեսի հիմնական տվյալները մեկ էջում։", locations: "հասցե", primary: "Գլխավոր հասցե", branch: "Մասնաճյուղ", hours: "Տես ամրագրման ժամերը", website: "Կայք", book: "Ամրագրել հիմա" },
  ru: { clinic: "Клиника", page: "Страница бизнеса", booking: "Онлайн-запись", home: "Главная", back: "Вернуться на предыдущую страницу", powered: "Работает на Vizit", defaultPage: "Страница бизнеса", summary: "Запись, контакты и основная информация о бизнесе на одной странице.", locations: "адреса", primary: "Основной адрес", branch: "Филиал", hours: "Смотрите время на странице записи", website: "Сайт", book: "Записаться" },
  en: { clinic: "Clinic", page: "Business page", booking: "Online booking", home: "Home", back: "Go back to the previous page", powered: "Powered by Vizit", defaultPage: "Business page", summary: "Booking, contact details and essential business information in one place.", locations: "locations", primary: "Main location", branch: "Branch", hours: "See times on the booking page", website: "Website", book: "Book now" },
} as const;

function businessTypeLabel(type: "beauty" | "dental" | undefined, locale: Locale) {
  return type === "dental" ? copy[locale].clinic : copy[locale].page;
}

function formatWorkHours(start: string | null | undefined, end: string | null | undefined, locale: Locale) {
  if (!start || !end) return copy[locale].hours;
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

export function PublicBusinessHeader({
  business,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  business?: Partial<PublicBusiness> | null;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  const { locale } = useLanguage();
  const text = copy[locale];
  const fallbackHref = secondaryHref || "/";

  return (
    <header className="vizit-public-chrome sticky top-0 z-40 border-b border-[#e8e2f0] bg-[#faf8fc]/90 shadow-sm backdrop-blur-xl dark:border-[#312641] dark:bg-[#151020]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to={fallbackHref} aria-label={business ? text.back : text.home} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e8e2f0] bg-white text-[#5b2fa8] shadow-sm transition hover:bg-[#f1edf7] dark:border-[#312641] dark:bg-white/[0.06] dark:text-[#c3a7ff] dark:hover:bg-white/10 sm:h-11 sm:w-11">
            {business ? <ArrowLeft className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-[#e8e2f0] bg-gradient-to-br from-[#5b2fa8] to-[#1e9e92] text-white shadow-sm dark:border-[#312641] sm:h-11 sm:w-11">
              {business?.logo_url ? (
                <img src={business.logo_url} alt={business.name || text.defaultPage} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center"><CalendarDays className="h-4 w-4" aria-hidden="true" /></div>
              )}
            </div>
            <div className="min-w-0">
              <div className="vizit-display truncate text-sm font-semibold text-[#241736] dark:text-white sm:text-base">{business?.name || "Vizit"}</div>
              <div className="truncate text-xs text-[#6b6178] dark:text-[#b7adc5]">{business ? businessTypeLabel(business.business_type, locale) : text.booking}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link to={fallbackHref} className="hidden rounded-full border border-[#e8e2f0] bg-white px-4 py-2 text-sm font-medium text-[#5f536e] transition hover:bg-[#f1edf7] dark:border-[#312641] dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10 md:inline-flex">
            {secondaryLabel || text.home}
          </Link>
          <LanguageToggle compact className="rounded-full border border-[#e8e2f0] bg-white text-[#5f536e] dark:border-[#312641] dark:bg-white/[0.06] dark:text-white" />
          <ThemeToggle compact className="h-10 w-10 border-[#e8e2f0] bg-white text-[#5f536e] dark:border-[#312641] dark:bg-white/[0.06] dark:text-white sm:h-11 sm:w-11" />
          {primaryHref && primaryLabel ? (
            <Link to={primaryHref} className="hidden items-center justify-center rounded-full bg-[#3e1f78] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5b2fa8] sm:inline-flex dark:bg-[#a980f3] dark:text-[#160d22] dark:hover:bg-[#bd9cf8]">
              {primaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function PublicBusinessFooter({
  business,
  compact = false,
}: {
  business?: PublicBusiness | null;
  compact?: boolean;
}) {
  const { locale } = useLanguage();
  const text = copy[locale];

  if (compact) {
    return (
      <footer className="vizit-public-chrome vizit-public-footer-compact border-t border-[#e8e2f0] bg-[#faf8fc]/90 dark:border-[#312641] dark:bg-[#090712]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2.5 text-[#241736] dark:text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3e1f78] text-white shadow-sm dark:bg-[#e7bd72] dark:text-[#2d102d]">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-sm font-semibold">Vizit</strong>
              <small className="block text-[11px] text-[#756777] dark:text-[#cbbfc6]">{text.booking}</small>
            </span>
          </Link>
          <span className="text-xs text-[#756777] dark:text-[#cbbfc6]">© {new Date().getFullYear()} Vizit</span>
        </div>
      </footer>
    );
  }

  const websiteUrl = safeExternalUrl(business?.website_url);
  const messengerUrl = safeExternalUrl(business?.messenger_url);
  const whatsappUrl = safeExternalUrl(business?.whatsapp_url);

  return (
    <footer className="vizit-public-chrome border-t border-[#e8e2f0] bg-[#faf8fc]/90 dark:border-[#312641] dark:bg-[#090712]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 rounded-[30px] border border-[#e8e2f0] bg-white p-5 shadow-sm dark:border-[#312641] dark:bg-[#151020] sm:p-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1e9e92]/25 bg-[#1e9e92]/[0.08] px-3 py-2 text-xs font-medium text-[#167d74] dark:border-[#58d0c4]/25 dark:bg-[#58d0c4]/10 dark:text-[#8be3da]">{text.powered}</div>
            <h3 className="vizit-display mt-4 text-xl text-[#241736] dark:text-white">{business?.name || text.defaultPage}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6b6178] dark:text-[#b7adc5]">{business?.short_description || text.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#6b6178] dark:text-[#b7adc5]">
              {business?.address ? <span className="inline-flex items-center gap-2 rounded-full border border-[#e8e2f0] bg-[#faf8fc] px-3 py-2 dark:border-[#312641] dark:bg-white/[0.05]"><MapPin className="h-3.5 w-3.5" />{business.address}</span> : null}
              {Array.isArray(business?.locations) && business.locations.length > 1 ? <span className="inline-flex items-center gap-2 rounded-full border border-[#5b2fa8]/20 bg-[#5b2fa8]/[0.08] px-3 py-2 text-[#5b2fa8] dark:border-[#a980f3]/25 dark:bg-[#a980f3]/10 dark:text-[#c3a7ff]"><MapPin className="h-3.5 w-3.5" />{business.locations.length} {text.locations}</span> : null}
              {business?.phone ? <a href={`tel:${business.phone}`} className="inline-flex items-center gap-2 rounded-full border border-[#e8e2f0] bg-[#faf8fc] px-3 py-2 transition hover:bg-[#f1edf7] dark:border-[#312641] dark:bg-white/[0.05] dark:hover:bg-white/10"><Phone className="h-3.5 w-3.5" />{business.phone}</a> : null}
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8e2f0] bg-[#faf8fc] px-3 py-2 dark:border-[#312641] dark:bg-white/[0.05]"><Clock3 className="h-3.5 w-3.5" />{formatWorkHours(business?.work_start, business?.work_end, locale)}</span>
            </div>
            {Array.isArray(business?.locations) && business.locations.length > 1 ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {business.locations.map((location) => (
                  <div key={location.id} className="rounded-2xl border border-[#e8e2f0] bg-[#faf8fc] px-4 py-3 text-sm text-[#6b6178] dark:border-[#312641] dark:bg-white/[0.05] dark:text-[#b7adc5]">
                    <div className="font-medium text-[#241736] dark:text-white">{location.name || (location.is_primary ? text.primary : text.branch)}</div>
                    <div className="mt-1 leading-6">{location.address}</div>
                    {location.phone ? <a href={`tel:${location.phone}`} className="mt-1 inline-block text-xs text-slate-500 hover:text-slate-900">{location.phone}</a> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {websiteUrl ? <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e2f0] bg-[#faf8fc] px-4 py-3 text-sm font-medium text-[#5f536e] transition hover:bg-[#f1edf7] dark:border-[#312641] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10"><Globe2 className="h-4 w-4" /> {text.website}</a> : null}
            {messengerUrl ? <a href={messengerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e2f0] bg-[#faf8fc] px-4 py-3 text-sm font-medium text-[#5f536e] transition hover:bg-[#f1edf7] dark:border-[#312641] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10"><MessageCircleMore className="h-4 w-4" /> Messenger</a> : null}
            {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e2f0] bg-[#faf8fc] px-4 py-3 text-sm font-medium text-[#5f536e] transition hover:bg-[#f1edf7] dark:border-[#312641] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10"><MessageCircleMore className="h-4 w-4" /> WhatsApp</a> : null}
            <Link to={business?.slug ? `/book/${business.slug}` : "/"} className="inline-flex items-center justify-center rounded-2xl bg-[#3e1f78] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5b2fa8] dark:bg-[#a980f3] dark:text-[#160d22] dark:hover:bg-[#bd9cf8]">{text.book}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
