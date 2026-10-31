import RentalProfile from "../components/rentals/RentalProfile";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowRight,
    Building2,
    CalendarDays,
    Clock3,
    MapPin,
    Phone,
    Sparkles,
    Stethoscope,
    Users,
    CheckCircle2,
    Instagram,
    Facebook,
    MessageCircleMore,
} from "lucide-react";

import { PublicBusinessFooter, PublicBusinessHeader } from "../components/public/PublicBusinessChrome";
import {
    fetchPublicBusiness,
    fetchPublicServices,
    fetchPublicStaff,
    type PublicBusiness,
    type PublicService,
    type PublicStaff,
} from "../lib/publicApi";
import { safeExternalUrl, whatsappLink } from "../lib/support";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import ServiceDiscountsNotice from "../components/ServiceDiscountsNotice";
import { localizedText } from "@/lib/localizedText";

const copy = {
    hy: {
        dental: "Ատամնաբուժական կլինիկա", beauty: "Գեղեցկության սրահ", unavailableHours: "Ժամերը հասանելի են ամրագրման էջում", askPrice: "Գինը ճշտել", owner: "Սեփականատեր · մասնագետ", manager: "Մենեջեր · մասնագետ", specialist: "Մասնագետ",
        loadingTitle: "Բեռնում ենք բիզնեսի էջը", loadingText: "Խնդրում ենք մի փոքր սպասել։", notFoundTitle: "Բիզնեսը չի գտնվել", notFoundText: "Հնարավոր է էջը ջնջվել է կամ հղումը սխալ է։", home: "Վերադառնալ գլխավոր էջ", bookNow: "Ամրագրել հիմա", defaultDescription: "Տեսեք բիզնեսի հրապարակած ծառայությունները, մասնագետներին և ամրագրման հասանելի ժամերը։", whatsapp: "Բարև, ուզում եմ ամրագրում կատարել",
        workingHours: "Աշխատանքային ժամեր", team: "Թիմ", staffUnit: "մասնագետ", services: "Ծառայություններ", servicesUnit: "ակտիվ ծառայություն", booking: "Ամրագրում", online: "Հասանելի է օնլայն", quick: "Արագ գործողություններ", quickTitle: "Ամրագրեք հիմա", quickText: "Ընտրեք ծառայությունը, մասնագետին և հարմար ժամը մի քանի քայլով։", openBooking: "Անցնել ամրագրման էջ", allBusinesses: "Բոլոր բիզնեսները", locations: "Հասցեներ", mainLocation: "Գլխավոր հասցե", branch: "Մասնաճյուղ", onlineVia: "Օնլայն ամրագրում Vizit հարթակում",
        publicServices: "Հանրային հասանելի ծառայությունները", noServices: "Այս պահին հանրային ծառայություններ դեռ ցուցադրված չեն։", minutes: "րոպե", book: "Ամրագրել", specialists: "Մասնագետներ", teamTitle: "Թիմը", noStaff: "Այս պահին թիմի հանրային ցուցադրում չկա։", onlineBooking: "Օնլայն ամրագրում", publicProfile: "Հանրային էջ", bioFallback: "Մասնագետի մասին մանրամասները հասանելի են ամրագրման ընթացքում։", available: "Հասանելի է օնլայն ամրագրման համար", bookSpecialist: "Ամրագրել այս մասնագետի մոտ",
        why: "Ինչու ընտրել այս բիզնեսը", whyItems: ["Օնլայն ամրագրում առանց զանգերի", "Ծառայությունների և մասնագետների հարմար ընտրություն", "Ազատ ժամերի արագ ստուգում", "Պրոֆեսիոնալ ներկայացում Vizit-ում"], ready: "Պատրա՞ստ եք ամրագրել", chooseTime: "Ընտրեք հարմար ժամը", readyText: "Բացեք ամրագրման էջը և ավարտեք ամրագրումը մի քանի պարզ քայլով։", start: "Սկսել ամրագրումը", viewServices: "Դիտել ծառայությունները",
    },
    ru: {
        dental: "Стоматологическая клиника", beauty: "Салон красоты", unavailableHours: "Время доступно на странице записи", askPrice: "Уточнить цену", owner: "Владелец · специалист", manager: "Менеджер · специалист", specialist: "Специалист",
        loadingTitle: "Загружаем страницу бизнеса", loadingText: "Пожалуйста, подождите немного.", notFoundTitle: "Бизнес не найден", notFoundText: "Возможно, страница удалена или ссылка указана неверно.", home: "Вернуться на главную", bookNow: "Записаться", defaultDescription: "Посмотрите опубликованные бизнесом услуги, специалистов и доступное время для записи.", whatsapp: "Здравствуйте, хочу записаться в",
        workingHours: "Рабочие часы", team: "Команда", staffUnit: "специалистов", services: "Услуги", servicesUnit: "активных услуг", booking: "Запись", online: "Доступна онлайн", quick: "Быстрые действия", quickTitle: "Запишитесь сейчас", quickText: "Выберите услугу, специалиста и удобное время за несколько шагов.", openBooking: "Открыть страницу записи", allBusinesses: "Все бизнесы", locations: "Адреса", mainLocation: "Основной адрес", branch: "Филиал", onlineVia: "Онлайн-запись на платформе Vizit",
        publicServices: "Услуги, доступные для записи", noServices: "Публичные услуги пока не добавлены.", minutes: "мин", book: "Записаться", specialists: "Специалисты", teamTitle: "Команда", noStaff: "Команда пока не показывается публично.", onlineBooking: "Онлайн-запись", publicProfile: "Публичный профиль", bioFallback: "Подробнее о специалисте можно узнать во время записи.", available: "Доступен для онлайн-записи", bookSpecialist: "Записаться к специалисту",
        why: "Почему стоит выбрать этот бизнес", whyItems: ["Онлайн-запись без звонков", "Удобный выбор услуг и специалистов", "Быстрая проверка свободного времени", "Профессиональная страница в Vizit"], ready: "Готовы записаться?", chooseTime: "Выберите удобное время", readyText: "Откройте страницу записи и завершите бронирование за несколько простых шагов.", start: "Начать запись", viewServices: "Посмотреть услуги",
    },
    en: {
        dental: "Dental clinic", beauty: "Beauty salon", unavailableHours: "Times are available on the booking page", askPrice: "Ask for price", owner: "Owner · specialist", manager: "Manager · specialist", specialist: "Specialist",
        loadingTitle: "Loading the business page", loadingText: "Please wait a moment.", notFoundTitle: "Business not found", notFoundText: "The page may have been removed or the link may be incorrect.", home: "Return home", bookNow: "Book now", defaultDescription: "View the services, specialists and available booking times published by this business.", whatsapp: "Hello, I would like to book at",
        workingHours: "Working hours", team: "Team", staffUnit: "specialists", services: "Services", servicesUnit: "active services", booking: "Booking", online: "Available online", quick: "Quick actions", quickTitle: "Book now", quickText: "Choose a service, specialist and convenient time in a few steps.", openBooking: "Open booking page", allBusinesses: "All businesses", locations: "Locations", mainLocation: "Main location", branch: "Branch", onlineVia: "Online booking through Vizit",
        publicServices: "Services available to book", noServices: "No public services are listed yet.", minutes: "min", book: "Book", specialists: "Specialists", teamTitle: "The team", noStaff: "The team is not currently shown publicly.", onlineBooking: "Online booking", publicProfile: "Public profile", bioFallback: "More information about this specialist is available while booking.", available: "Available for online booking", bookSpecialist: "Book this specialist",
        why: "Why choose this business", whyItems: ["Online booking without phone calls", "Convenient service and specialist selection", "Fast availability checks", "A professional profile on Vizit"], ready: "Ready to book?", chooseTime: "Choose a convenient time", readyText: "Open the booking page and complete your booking in a few simple steps.", start: "Start booking", viewServices: "View services",
    },
} as const;

const EMPTY_SERVICES: PublicService[] = [];
const EMPTY_STAFF: PublicStaff[] = [];

function businessTypeLabel(type: "beauty" | "dental" | "rentals" | undefined, locale: Locale) {
    return type === "dental" ? copy[locale].dental : copy[locale].beauty;
}

function businessCategoryLabel(
    business: Pick<PublicBusiness, "business_type" | "vertical" | "category" | "custom_category_name">,
    locale: Locale,
) {
    const localizedName = locale === "hy"
        ? business.category?.name_hy
        : locale === "ru"
            ? business.category?.name_ru
            : business.category?.name_en;

    const explicitName = business.custom_category_name || localizedName || business.category?.name;
    if (explicitName) return explicitName;

    const vertical = String(business.vertical ?? "").toLowerCase();
    if (["healthcare", "medical", "clinic", "dental", "doctor", "health"].includes(vertical)) {
        return { hy: "Բժշկական ծառայություններ", ru: "Медицинские услуги", en: "Healthcare services" }[locale];
    }
    if (["services", "service", "beauty", "salon"].includes(vertical)) return copy[locale].services;

    return businessTypeLabel(business.business_type, locale);
}

function formatWorkHours(start: string | null | undefined, end: string | null | undefined, locale: Locale) {
    if (!start || !end) return copy[locale].unavailableHours;
    return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

function formatPrice(price: number | null | undefined, currency: string | undefined, locale: Locale) {
    if (price == null) return copy[locale].askPrice;
    return `${price} ${currency || ""}`.trim();
}

function publicRoleLabel(role: string | null | undefined, locale: Locale) {
    if (role === "owner") return copy[locale].owner;
    if (role === "manager") return copy[locale].manager;
    return copy[locale].specialist;
}

export default function PublicBusinessProfile() {
    const { slug = "" } = useParams();
    const { locale } = useLanguage();
    const text = copy[locale];

    const businessQ = useQuery({
        queryKey: ["public-business-profile", slug],
        queryFn: () => fetchPublicBusiness(slug),
        enabled: !!slug,
    });

    const servicesQ = useQuery({
        queryKey: ["public-business-profile-services", slug],
        queryFn: () => fetchPublicServices(slug),
        enabled: !!slug && !!businessQ.data && businessQ.data.business_type !== "rentals",
    });

    const staffQ = useQuery({
        queryKey: ["public-business-profile-staff", slug],
        queryFn: () => fetchPublicStaff(slug),
        enabled: !!slug && !!businessQ.data && businessQ.data.business_type !== "rentals",
    });

    const business = businessQ.data;
    const instagramUrl = safeExternalUrl(business?.instagram_url);
    const facebookUrl = safeExternalUrl(business?.facebook_url);
    const messengerUrl = safeExternalUrl(business?.messenger_url);
    const whatsappUrl = safeExternalUrl(business?.whatsapp_url)
        || (business?.whatsapp_phone ? whatsappLink(business.whatsapp_phone, `${text.whatsapp} ${business.name}`) : null);
    const services = servicesQ.data ?? EMPTY_SERVICES;
    const staff = staffQ.data ?? EMPTY_STAFF;

    const topServices = useMemo(() => services.slice(0, 6), [services]);
    const topStaff = useMemo(() => staff.slice(0, 6), [staff]);

    const seoJsonLd = useMemo(() => business ? {
        "@context": "https://schema.org",
        "@type": business.business_type === "dental" ? "Dentist" : "BeautySalon",
        name: business.name,
        description: localizedText(business, "short_description", locale) || text.defaultDescription,
        url: `https://vizit.am/businesses/${business.slug}`,
        image: business.cover_url || business.logo_url || undefined,
        telephone: business.phone || undefined,
        address: business.address ? { "@type": "PostalAddress", streetAddress: business.address } : undefined,
        potentialAction: { "@type": "ReserveAction", target: `https://vizit.am/book/${business.slug}` },
    } : null, [business, text.defaultDescription, locale]);

    if (business?.business_type === "rentals") return <RentalProfile key={business.slug} business={business} />;

    if (businessQ.isLoading) {
        return (
            <div className="vizit-public-detail-page min-h-screen bg-[var(--vz-surface-2)] transition-colors dark:text-white">
                <Seo title={`${text.loadingTitle} | Vizit`} description={text.loadingText} />
                <PublicBusinessHeader secondaryHref="/" secondaryLabel="Vizit" />
                <main className="mx-auto max-w-[1480px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                    <div className="h-72 animate-pulse rounded-[34px] border border-[var(--vz-line)] bg-[var(--vz-surface)]" />
                    <div className="mt-8 grid gap-6 2xl:grid-cols-[1fr_340px]">
                        <div className="space-y-6">
                            <div className="h-48 animate-pulse rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)]" />
                            <div className="h-72 animate-pulse rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)]" />
                        </div>
                        <div className="h-80 animate-pulse rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)]" />
                    </div>
                </main>
                <PublicBusinessFooter compact />
            </div>
        );
    }

    if (businessQ.isError || !business) {
        return (
            <div className="vizit-public-detail-page min-h-screen bg-[var(--vz-surface-2)] transition-colors dark:text-white">
                <PublicBusinessHeader secondaryHref="/" secondaryLabel="Vizit" />
                <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                    <div className="rounded-[32px] border border-[var(--vz-danger-line)] bg-[var(--vz-surface)] p-10 text-center shadow-sm">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--vz-danger-soft)] text-[var(--vz-danger)]">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <h1 className="mt-5 text-2xl font-semibold text-[var(--vz-text)]">
                            {text.notFoundTitle}
                        </h1>
                        <p className="mt-3 text-[var(--vz-muted)]">
                            {text.notFoundText}
                        </p>
                        <Link
                            to="/"
                            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--vz-primary)] px-5 py-3 text-sm font-medium text-[var(--vz-on-primary)]"
                        >
                            {text.home}
                        </Link>
                    </div>
                </main>
                <PublicBusinessFooter compact />
            </div>
        );
    }

    const categoryLabel = businessCategoryLabel(business, locale);

    return (
        <div className="vizit-public-detail-page min-h-screen bg-[var(--vz-surface-2)] text-[var(--vz-text)] transition-colors">
            <Seo
                title={`${business.name} | Vizit`}
                description={localizedText(business, "short_description", locale) || text.defaultDescription}
                image={business.cover_url || business.logo_url}
                canonical={`/businesses/${business.slug}`}
                jsonLd={seoJsonLd}
            />
            <PublicBusinessHeader business={business} primaryHref={`/book/${business.slug}?source=website`} primaryLabel={text.bookNow} secondaryHref="/" secondaryLabel="Vizit" />

            <main className="pb-16 pt-8 sm:pt-10">
                <section className="px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1480px]">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="vizit-business-profile-shell relative overflow-hidden rounded-[38px] border border-white/70 bg-[var(--vz-surface)] shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                        >
                            <div className="vizit-business-profile-backdrop absolute inset-0 bg-[var(--vz-surface-2)]" />

                            <div className="vizit-business-profile-hero relative grid gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)] lg:gap-6">
                                <div className="vizit-business-profile-cover relative min-h-[230px] overflow-hidden rounded-[28px] border border-white/70 bg-[var(--vz-surface-2)] shadow-[0_18px_52px_rgba(72,35,49,0.13)] sm:min-h-[300px] lg:min-h-full">
                                    {business.cover_url ? (
                                        <img src={business.cover_url} alt={business.name} className="absolute inset-0 h-full w-full object-cover" />
                                    ) : (
                                        <div className="vizit-business-profile-fallback absolute inset-0 grid place-items-center bg-[var(--vz-surface-2)]">
                                            <div className="vizit-business-profile-fallback-logo grid h-28 w-28 place-items-center overflow-hidden rounded-2xl border border-[#315a77] bg-[var(--vz-surface-2)]/90 text-[#d9eaf7] shadow-[0_24px_70px_rgba(0,0,0,.22)] backdrop-blur-xl">
                                                {business.logo_url ? <img src={business.logo_url} alt={business.name} className="h-full w-full object-cover" /> : <Building2 className="h-11 w-11" />}
                                            </div>
                                        </div>
                                    )}
                                    <div className="vizit-business-profile-cover-overlay absolute inset-0 bg-gradient-to-t from-[var(--vz-page)]/80 via-transparent to-white/10" />
                                    <div className="vizit-business-profile-category absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-[var(--vz-page)]/75 px-3 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-xl">
                                        {business.business_type === "dental" ? <Stethoscope className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                        {categoryLabel}
                                    </div>
                                    <div className="vizit-business-profile-address absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-[var(--vz-page)]/78 px-4 py-3 text-white backdrop-blur-xl">
                                        <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 shrink-0 text-[var(--vz-brand-text)]" /><span className="truncate">{business.address || text.onlineVia}</span></span>
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--vz-brand-text)]" aria-hidden="true" />
                                    </div>
                                </div>

                                <div className="vizit-business-profile-summary min-w-0 px-2 py-3 sm:px-4 sm:py-5 lg:px-3 lg:py-8">
                                    <div className="flex items-start gap-4">
                                        <div className="vizit-business-profile-logo h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#315a77] bg-[var(--vz-surface-2)] text-white shadow-md">
                                            {business.logo_url ? (
                                                <img src={business.logo_url} alt={business.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="grid h-full w-full place-items-center"><Building2 className="h-7 w-7 text-[var(--vz-text-secondary)]" /></div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h1 className="break-words text-3xl font-semibold tracking-tight text-[var(--vz-text)] sm:text-4xl lg:text-5xl">
                                                {business.name}
                                            </h1>
                                            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--vz-text-secondary)]">
                                                {localizedText(business, "short_description", locale) || text.defaultDescription}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="vizit-business-profile-actions mt-7 flex flex-wrap items-center gap-2.5">
                                        <Link
                                            to={`/book/${business.slug}?source=website`}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--vz-primary)] px-6 py-3.5 text-sm font-semibold text-[var(--vz-on-primary)] shadow-[0_14px_34px_rgba(55,138,221,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--vz-primary-hover)] hover:shadow-[0_18px_38px_rgba(55,138,221,0.28)] sm:w-auto"
                                        >
                                            <CalendarDays className="h-4 w-4" /> {text.bookNow}<ArrowRight className="h-4 w-4" />
                                        </Link>
                                        {business.show_services !== false ? (
                                            <a href="#services" className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-5 py-3.5 text-sm font-semibold text-[var(--vz-text-secondary)] backdrop-blur transition hover:bg-[var(--vz-surface)] dark:hover:bg-white/10 sm:w-auto">
                                                {text.viewServices}
                                            </a>
                                        ) : null}
                                        {instagramUrl ? (
                                            <a aria-label="Instagram" href={instagramUrl} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] text-pink-500 transition hover:-translate-y-0.5 hover:bg-[var(--vz-surface)]">
                                                <Instagram className="h-5 w-5" />
                                            </a>
                                        ) : null}
                                        {facebookUrl ? (
                                            <a aria-label="Facebook" href={facebookUrl} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-info)] transition hover:-translate-y-0.5 hover:bg-[var(--vz-surface)]">
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                        ) : null}
                                        {whatsappUrl ? (
                                            <a aria-label="WhatsApp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-success)] transition hover:-translate-y-0.5 hover:bg-[var(--vz-surface)]">
                                                <MessageCircleMore className="h-5 w-5" />
                                            </a>
                                        ) : null}
                                        {messengerUrl ? (
                                            <a aria-label="Messenger" href={messengerUrl} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-brand-text)] transition hover:-translate-y-0.5 hover:bg-[var(--vz-surface)]">
                                                <MessageCircleMore className="h-5 w-5" />
                                            </a>
                                        ) : null}
                                    </div>

                                    <div className="vizit-business-profile-stats mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
                                        <div className="vizit-business-profile-stat rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <div className="flex items-center gap-2 text-sm text-[var(--vz-muted)]">
                                                <Clock3 className="h-4 w-4 text-[var(--vz-brand-text)]" />
                                                {text.workingHours}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-[var(--vz-text)]">
                                                {formatWorkHours(business.work_start, business.work_end, locale)}
                                            </div>
                                        </div>

                                        <div className="vizit-business-profile-stat rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <div className="flex items-center gap-2 text-sm text-[var(--vz-muted)]">
                                                <Users className="h-4 w-4 text-[var(--vz-brand-text)]" />
                                                {text.team}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-[var(--vz-text)]">
                                                {staff.length} {text.staffUnit}
                                            </div>
                                        </div>

                                        <div className="vizit-business-profile-stat rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <div className="flex items-center gap-2 text-sm text-[var(--vz-muted)]">
                                                <Sparkles className="h-4 w-4 text-[var(--vz-brand-text)]" />
                                                {text.services}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-[var(--vz-text)]">
                                                {services.length} {text.servicesUnit}
                                            </div>
                                        </div>

                                        <div className="vizit-business-profile-stat rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <div className="flex items-center gap-2 text-sm text-[var(--vz-muted)]">
                                                <CalendarDays className="h-4 w-4 text-[var(--vz-brand-text)]" />
                                                {text.booking}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-[var(--vz-success)] dark:text-emerald-300">
                                                {text.online}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="vizit-business-profile-contact relative grid gap-3 rounded-[26px] border border-white/70 bg-white/65 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
                                    {business.address ? (
                                        <div className="flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm text-[var(--vz-text-secondary)] dark:bg-white/5">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--vz-brand-text)]" />
                                            <span>{business.address}</span>
                                        </div>
                                    ) : null}
                                    {business.phone ? (
                                        <a href={`tel:${business.phone}`} className="flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm text-[var(--vz-text-secondary)] transition hover:bg-[var(--vz-surface)] dark:bg-white/5 dark:hover:bg-white/10">
                                            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--vz-brand-text)]" />
                                            <span>{business.phone}</span>
                                        </a>
                                    ) : null}
                                    <div className="flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm text-[var(--vz-text-secondary)] dark:bg-white/5">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--vz-success)]" />
                                        <span>{text.onlineVia}</span>
                                    </div>

                                    {Array.isArray(business.locations) && business.locations.length > 1 ? (
                                        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
                                            {business.locations.map((location) => (
                                                <div key={location.id} className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm text-[var(--vz-text-secondary)] dark:border-white/10 dark:bg-white/5">
                                                    <div className="font-semibold text-[var(--vz-text)]">{location.name || (location.is_primary ? text.mainLocation : text.branch)}</div>
                                                    <div className="mt-1 leading-6">{location.address}</div>
                                                    {location.phone ? <a href={`tel:${location.phone}`} className="mt-1 inline-block text-xs hover:text-[var(--vz-text)] dark:hover:text-white">{location.phone}</a> : null}
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="mt-8 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1480px] space-y-6">
                        <ServiceDiscountsNotice slug={business.slug} discounts={business.service_discounts} locale={locale} />
                        <div className="space-y-6">
                            {business.show_services !== false && (
                            <motion.section
                                id="services"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.05 }}
                                className="vizit-profile-section vizit-profile-services-section scroll-mt-24 rounded-[32px] border border-white/70 bg-[var(--vz-surface)] p-5 shadow-sm dark:border-white/10 sm:p-7"
                            >
                                <div>
                                    <div>
                                        <div className="vizit-profile-section-badge inline-flex items-center gap-2 rounded-xl border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--vz-brand-text)]">
                                            <Sparkles className="h-4 w-4" />
                                            {text.services}
                                        </div>
                                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--vz-text)]">
                                            {text.publicServices}
                                        </h2>
                                    </div>
                                </div>

                                {!topServices.length ? (
                                    <div className="mt-6 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-5 text-sm text-[var(--vz-muted)]">
                                        {text.noServices}
                                    </div>
                                ) : (
                                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {topServices.map((service) => (
                                            <div
                                                key={service.id}
                                                className="vizit-profile-service-card rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--vz-line-strong)] hover:bg-[var(--vz-accent-soft)]/40 dark:hover:bg-white/10 sm:p-5"
                                            >
                                                {service.image_url && <div className="vizit-profile-service-image mb-4 h-32 overflow-hidden rounded-2xl"><img src={service.image_url} alt={service.name} className="h-full w-full object-cover" /></div>}
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-[var(--vz-text)]">
                                                            {service.name}
                                                        </h3>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="rounded-full bg-[var(--vz-surface)] px-3 py-1 text-xs font-medium text-[var(--vz-text-secondary)]">
                                                                {service.duration_minutes} {text.minutes}
                                                            </span>
                                                            <span className="rounded-full bg-[var(--vz-surface)] px-3 py-1 text-xs font-medium text-[var(--vz-text-secondary)]">
                                                                {formatPrice(service.price, service.currency, locale)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.section>
                            )}

                            {business.show_staff !== false && (
                            <motion.section
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.08 }}
                                className="vizit-profile-section vizit-profile-team-section rounded-[32px] border border-white/70 bg-[var(--vz-surface)] p-5 shadow-sm dark:border-white/10 sm:p-7"
                            >
                                <div className="vizit-profile-section-badge inline-flex items-center gap-2 rounded-xl border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--vz-brand-text)]">
                                    <Users className="h-4 w-4" />
                                    {text.specialists}
                                </div>

                                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--vz-text)]">
                                    {text.teamTitle}
                                </h2>

                                {!topStaff.length ? (
                                    <div className="mt-6 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-5 text-sm text-[var(--vz-muted)]">
                                        {text.noStaff}
                                    </div>
                                ) : (
                                    <div className="vizit-profile-staff-grid mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {topStaff.map((person) => (
                                            <div
                                                key={person.id}
                                                className="vizit-profile-staff-card rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--vz-line-strong)] hover:bg-[var(--vz-surface)] dark:hover:bg-white/10"
                                            >
                                                <div className="vizit-profile-staff-head flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="h-12 w-12 overflow-hidden rounded-2xl bg-[var(--vz-surface)] shadow-sm">
                                                            {person.avatar_url ? <img src={person.avatar_url} alt={person.name} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center"><Users className="h-5 w-5 text-[var(--vz-muted)]" /></div>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="break-words font-semibold text-[var(--vz-text)]">
                                                                {person.name}
                                                            </div>
                                                            <div className="text-sm text-[var(--vz-muted)]">
                                                                {publicRoleLabel(person.role, locale)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={person.is_bookable ? "vizit-profile-staff-availability rounded-xl border border-[#245171] bg-[var(--vz-accent-soft)] px-3 py-1.5 text-[11px] font-semibold text-[#b9dcfa]" : "vizit-profile-staff-availability rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--vz-muted)]"}>
                                                        {person.is_bookable ? text.onlineBooking : text.publicProfile}
                                                    </div>
                                                </div>

                                                {person.bio ? <div className="mt-4 text-sm leading-6 text-[var(--vz-muted)]">{person.bio}</div> : <div className="mt-4 text-sm leading-6 text-[var(--vz-muted)]">{text.bioFallback}</div>}

                                                <div className="vizit-profile-staff-tags mt-4 flex flex-wrap gap-2">
                                                    <span className="rounded-lg border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 py-1 text-xs font-medium text-[var(--vz-text-secondary)]">{publicRoleLabel(person.role, locale)}</span>
                                                </div>

                                                {person.is_bookable ? (
                                                    <Link
                                                        to={`/book/${business.slug}?staff_id=${person.id}&source=business_profile`}
                                                        className="vizit-profile-staff-book mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--vz-primary)] px-4 text-sm font-semibold text-[var(--vz-on-primary)] transition hover:bg-[var(--vz-primary-hover)]"
                                                    >
                                                        {text.bookSpecialist}<ArrowRight className="h-4 w-4 shrink-0" />
                                                    </Link>
                                                ) : null}

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.section>
                            )}
                        </div>

                        <motion.section
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.12 }}
                            className="vizit-profile-section vizit-profile-why-section overflow-hidden rounded-[32px] border border-white/70 bg-[var(--vz-surface-2)] p-5 shadow-sm dark:border-white/10 sm:p-7"
                        >
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vz-brand-text)] dark:text-[var(--vz-brand-text)]">Vizit</div>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--vz-text)]">{text.why}</h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {text.whyItems.map((item) => (
                                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-4 text-sm font-medium leading-6 text-[var(--vz-text-secondary)] dark:border-white/10 dark:bg-white/5">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--vz-success)]" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    </div>
                </section>
            </main>

            <PublicBusinessFooter compact />
        </div>
    );
}
