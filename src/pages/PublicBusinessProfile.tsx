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
    type PublicService,
    type PublicStaff,
} from "../lib/publicApi";
import { safeExternalUrl, whatsappLink } from "../lib/support";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import Seo from "../components/Seo";

const copy = {
    hy: {
        dental: "Ատամնաբուժական կլինիկա", beauty: "Գեղեցկության սրահ", unavailableHours: "Ժամերը հասանելի են ամրագրման էջում", askPrice: "Գինը ճշտել", owner: "Սեփականատեր · մասնագետ", manager: "Մենեջեր · մասնագետ", specialist: "Մասնագետ",
        loadingTitle: "Բեռնում ենք բիզնեսի էջը", loadingText: "Խնդրում ենք մի փոքր սպասել։", notFoundTitle: "Բիզնեսը չի գտնվել", notFoundText: "Հնարավոր է էջը ջնջվել է կամ հղումը սխալ է։", home: "Վերադառնալ գլխավոր էջ", bookNow: "Ամրագրել հիմա", defaultDescription: "Պրոֆեսիոնալ սպասարկում, հարմար ժամերի ընտրություն և արագ օնլայն ամրագրում Vizit-ի միջոցով։", whatsapp: "Բարև, ուզում եմ ամրագրում կատարել",
        workingHours: "Աշխատանքային ժամեր", team: "Թիմ", staffUnit: "մասնագետ", services: "Ծառայություններ", servicesUnit: "ակտիվ ծառայություն", booking: "Ամրագրում", online: "Հասանելի է օնլայն", quick: "Արագ գործողություններ", quickTitle: "Ամրագրեք հիմա", quickText: "Ընտրեք ծառայությունը, մասնագետին և հարմար ժամը մի քանի քայլով։", openBooking: "Անցնել ամրագրման էջ", allBusinesses: "Բոլոր բիզնեսները", locations: "Հասցեներ", mainLocation: "Գլխավոր հասցե", branch: "Մասնաճյուղ", onlineVia: "Օնլայն ամրագրում Vizit հարթակում",
        publicServices: "Հանրային հասանելի ծառայությունները", noServices: "Այս պահին հանրային ծառայություններ դեռ ցուցադրված չեն։", minutes: "րոպե", book: "Ամրագրել", specialists: "Մասնագետներ", teamTitle: "Թիմը", noStaff: "Այս պահին թիմի հանրային ցուցադրում չկա։", onlineBooking: "Օնլայն ամրագրում", publicProfile: "Հանրային էջ", bioFallback: "Մասնագետի մասին մանրամասները հասանելի են ամրագրման ընթացքում։", available: "Հասանելի է օնլայն ամրագրման համար", bookSpecialist: "Ամրագրել այս մասնագետի մոտ",
        why: "Ինչու ընտրել այս բիզնեսը", whyItems: ["Օնլայն ամրագրում առանց զանգերի", "Ծառայությունների և մասնագետների հարմար ընտրություն", "Ազատ ժամերի արագ ստուգում", "Պրոֆեսիոնալ ներկայացում Vizit-ում"], ready: "Պատրա՞ստ եք ամրագրել", chooseTime: "Ընտրեք հարմար ժամը", readyText: "Բացեք ամրագրման էջը և ավարտեք ամրագրումը մի քանի պարզ քայլով։", start: "Սկսել ամրագրումը", viewServices: "Դիտել ծառայությունները",
    },
    ru: {
        dental: "Стоматологическая клиника", beauty: "Салон красоты", unavailableHours: "Время доступно на странице записи", askPrice: "Уточнить цену", owner: "Владелец · специалист", manager: "Менеджер · специалист", specialist: "Специалист",
        loadingTitle: "Загружаем страницу бизнеса", loadingText: "Пожалуйста, подождите немного.", notFoundTitle: "Бизнес не найден", notFoundText: "Возможно, страница удалена или ссылка указана неверно.", home: "Вернуться на главную", bookNow: "Записаться", defaultDescription: "Профессиональный сервис, удобный выбор времени и быстрая онлайн-запись через Vizit.", whatsapp: "Здравствуйте, хочу записаться в",
        workingHours: "Рабочие часы", team: "Команда", staffUnit: "специалистов", services: "Услуги", servicesUnit: "активных услуг", booking: "Запись", online: "Доступна онлайн", quick: "Быстрые действия", quickTitle: "Запишитесь сейчас", quickText: "Выберите услугу, специалиста и удобное время за несколько шагов.", openBooking: "Открыть страницу записи", allBusinesses: "Все бизнесы", locations: "Адреса", mainLocation: "Основной адрес", branch: "Филиал", onlineVia: "Онлайн-запись на платформе Vizit",
        publicServices: "Услуги, доступные для записи", noServices: "Публичные услуги пока не добавлены.", minutes: "мин", book: "Записаться", specialists: "Специалисты", teamTitle: "Команда", noStaff: "Команда пока не показывается публично.", onlineBooking: "Онлайн-запись", publicProfile: "Публичный профиль", bioFallback: "Подробнее о специалисте можно узнать во время записи.", available: "Доступен для онлайн-записи", bookSpecialist: "Записаться к специалисту",
        why: "Почему стоит выбрать этот бизнес", whyItems: ["Онлайн-запись без звонков", "Удобный выбор услуг и специалистов", "Быстрая проверка свободного времени", "Профессиональная страница в Vizit"], ready: "Готовы записаться?", chooseTime: "Выберите удобное время", readyText: "Откройте страницу записи и завершите бронирование за несколько простых шагов.", start: "Начать запись", viewServices: "Посмотреть услуги",
    },
    en: {
        dental: "Dental clinic", beauty: "Beauty salon", unavailableHours: "Times are available on the booking page", askPrice: "Ask for price", owner: "Owner · specialist", manager: "Manager · specialist", specialist: "Specialist",
        loadingTitle: "Loading the business page", loadingText: "Please wait a moment.", notFoundTitle: "Business not found", notFoundText: "The page may have been removed or the link may be incorrect.", home: "Return home", bookNow: "Book now", defaultDescription: "Professional service, convenient time selection and fast online booking through Vizit.", whatsapp: "Hello, I would like to book at",
        workingHours: "Working hours", team: "Team", staffUnit: "specialists", services: "Services", servicesUnit: "active services", booking: "Booking", online: "Available online", quick: "Quick actions", quickTitle: "Book now", quickText: "Choose a service, specialist and convenient time in a few steps.", openBooking: "Open booking page", allBusinesses: "All businesses", locations: "Locations", mainLocation: "Main location", branch: "Branch", onlineVia: "Online booking through Vizit",
        publicServices: "Services available to book", noServices: "No public services are listed yet.", minutes: "min", book: "Book", specialists: "Specialists", teamTitle: "The team", noStaff: "The team is not currently shown publicly.", onlineBooking: "Online booking", publicProfile: "Public profile", bioFallback: "More information about this specialist is available while booking.", available: "Available for online booking", bookSpecialist: "Book this specialist",
        why: "Why choose this business", whyItems: ["Online booking without phone calls", "Convenient service and specialist selection", "Fast availability checks", "A professional profile on Vizit"], ready: "Ready to book?", chooseTime: "Choose a convenient time", readyText: "Open the booking page and complete your booking in a few simple steps.", start: "Start booking", viewServices: "View services",
    },
} as const;

const EMPTY_SERVICES: PublicService[] = [];
const EMPTY_STAFF: PublicStaff[] = [];

function businessTypeLabel(type: "beauty" | "dental" | undefined, locale: Locale) {
    return type === "dental" ? copy[locale].dental : copy[locale].beauty;
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
        enabled: !!slug,
    });

    const staffQ = useQuery({
        queryKey: ["public-business-profile-staff", slug],
        queryFn: () => fetchPublicStaff(slug),
        enabled: !!slug,
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
        description: business.short_description || text.defaultDescription,
        url: `https://vizit.am/businesses/${business.slug}`,
        image: business.cover_url || business.logo_url || undefined,
        telephone: business.phone || undefined,
        address: business.address ? { "@type": "PostalAddress", streetAddress: business.address } : undefined,
        potentialAction: { "@type": "ReserveAction", target: `https://vizit.am/book/${business.slug}` },
    } : null, [business, text.defaultDescription]);

    if (businessQ.isLoading) {
        return (
            <div className="vizit-public-detail-page min-h-screen bg-[linear-gradient(180deg,#faf8fc_0%,#ffffff_20%,#f5f0fa_100%)] transition-colors dark:bg-[linear-gradient(180deg,#090712_0%,#151020_45%,#090712_100%)] dark:text-white">
                <Seo title={`${text.loadingTitle} | Vizit`} description={text.loadingText} />
                <PublicBusinessHeader secondaryHref="/" secondaryLabel="Vizit" />
                <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                    <div className="h-72 animate-pulse rounded-[34px] border border-slate-200 bg-white/80" />
                    <div className="mt-8 grid gap-6 2xl:grid-cols-[1fr_340px]">
                        <div className="space-y-6">
                            <div className="h-48 animate-pulse rounded-[30px] border border-slate-200 bg-white/80" />
                            <div className="h-72 animate-pulse rounded-[30px] border border-slate-200 bg-white/80" />
                        </div>
                        <div className="h-80 animate-pulse rounded-[30px] border border-slate-200 bg-white/80" />
                    </div>
                </main>
                <PublicBusinessFooter compact />
            </div>
        );
    }

    if (businessQ.isError || !business) {
        return (
            <div className="vizit-public-detail-page min-h-screen bg-[linear-gradient(180deg,#faf8fc_0%,#ffffff_20%,#f5f0fa_100%)] transition-colors dark:bg-[linear-gradient(180deg,#090712_0%,#151020_45%,#090712_100%)] dark:text-white">
                <PublicBusinessHeader secondaryHref="/" secondaryLabel="Vizit" />
                <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                    <div className="rounded-[32px] border border-rose-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-500">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <h1 className="mt-5 text-2xl font-semibold text-slate-900">
                            {text.notFoundTitle}
                        </h1>
                        <p className="mt-3 text-slate-500">
                            {text.notFoundText}
                        </p>
                        <Link
                            to="/"
                            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
                        >
                            {text.home}
                        </Link>
                    </div>
                </main>
                <PublicBusinessFooter compact />
            </div>
        );
    }

    return (
        <div className="vizit-public-detail-page min-h-screen bg-[linear-gradient(180deg,#faf8fc_0%,#ffffff_22%,#f5f0fa_100%)] text-slate-900 transition-colors dark:bg-[linear-gradient(180deg,#090712_0%,#151020_48%,#090712_100%)] dark:text-white">
            <Seo
                title={`${business.name} | Vizit`}
                description={business.short_description || text.defaultDescription}
                image={business.cover_url || business.logo_url}
                canonical={`/businesses/${business.slug}`}
                jsonLd={seoJsonLd}
            />
            <PublicBusinessHeader business={business} primaryHref={`/book/${business.slug}?source=website`} primaryLabel={text.bookNow} secondaryHref="/" secondaryLabel="Vizit" />

            <main className="pb-16 pt-8 sm:pt-10">
                <section className="px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="relative overflow-hidden rounded-[38px] border border-white/70 bg-white/85 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                        >
                            <div className="vizit-business-profile-backdrop absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,193,169,0.30),transparent_29%),radial-gradient(circle_at_bottom_left,rgba(244,220,190,0.36),transparent_29%),linear-gradient(135deg,#fffaf5_0%,#fbf3eb_58%,#fffdf9_100%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(139,76,125,0.16),transparent_31%),linear-gradient(135deg,#221d22_0%,#1c181c_58%,#171417_100%)]" />

                            <div className="vizit-business-profile-hero relative grid gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)] lg:gap-6">
                                <div className="vizit-business-profile-cover relative min-h-[230px] overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(145deg,#e9cfc3,#f7e9dd_52%,#d8c0d0)] shadow-[0_18px_52px_rgba(72,35,49,0.13)] sm:min-h-[300px] lg:min-h-full">
                                    {business.cover_url ? (
                                        <img src={business.cover_url} alt={business.name} className="absolute inset-0 h-full w-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,.45),transparent_30%),radial-gradient(circle_at_12%_100%,rgba(109,42,99,.20),transparent_34%),linear-gradient(145deg,#e8c8ba,#f7e9de_58%,#d7becf)]">
                                            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-[32px] border border-white/60 bg-white/35 text-[#4a2146] shadow-[0_24px_70px_rgba(72,35,49,.16)] backdrop-blur-xl">
                                                {business.logo_url ? <img src={business.logo_url} alt={business.name} className="h-full w-full object-cover" /> : <Building2 className="h-11 w-11" />}
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2b0d35]/70 via-transparent to-white/10" />
                                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/88 px-3 py-2 text-xs font-bold text-[#4a2146] shadow-sm backdrop-blur-xl">
                                        {business.business_type === "dental" ? <Stethoscope className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                        {businessTypeLabel(business.business_type, locale)}
                                    </div>
                                    <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/25 bg-[#2b0d35]/72 px-4 py-3 text-white backdrop-blur-xl">
                                        <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 shrink-0 text-[#edc77f]" /><span className="truncate">{business.address || text.onlineVia}</span></span>
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#edc77f]" aria-hidden="true" />
                                    </div>
                                </div>

                                <div className="vizit-business-profile-summary min-w-0 px-2 py-3 sm:px-4 sm:py-5 lg:px-3 lg:py-8">
                                    <div className="flex items-start gap-4">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[22px] border border-white/70 bg-white/90 shadow-md">
                                            {business.logo_url ? (
                                                <img src={business.logo_url} alt={business.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="grid h-full w-full place-items-center"><Building2 className="h-7 w-7 text-slate-700" /></div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h1 className="break-words text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                                                {business.name}
                                            </h1>
                                            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                                                {business.short_description || text.defaultDescription}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-7 flex flex-wrap items-center gap-2.5">
                                        <Link
                                            to={`/book/${business.slug}?source=website`}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5b214f] to-[#7b2f68] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(91,33,79,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(91,33,79,0.28)] sm:w-auto"
                                        >
                                            <CalendarDays className="h-4 w-4" /> {text.bookNow}<ArrowRight className="h-4 w-4" />
                                        </Link>
                                        {business.show_services !== false ? (
                                            <a href="#services" className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200/90 bg-white/80 px-5 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 sm:w-auto">
                                                {text.viewServices}
                                            </a>
                                        ) : null}
                                        {instagramUrl ? (
                                            <a aria-label="Instagram" href={instagramUrl} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200/90 bg-white/80 text-pink-500 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-white/5">
                                                <Instagram className="h-5 w-5" />
                                            </a>
                                        ) : null}
                                        {facebookUrl ? (
                                            <a aria-label="Facebook" href={facebookUrl} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200/90 bg-white/80 text-sky-600 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-white/5">
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                        ) : null}
                                        {whatsappUrl ? (
                                            <a aria-label="WhatsApp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200/90 bg-white/80 text-emerald-600 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-white/5">
                                                <MessageCircleMore className="h-5 w-5" />
                                            </a>
                                        ) : null}
                                        {messengerUrl ? (
                                            <a aria-label="Messenger" href={messengerUrl} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200/90 bg-white/80 text-violet-600 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-white/5">
                                                <MessageCircleMore className="h-5 w-5" />
                                            </a>
                                        ) : null}
                                    </div>

                                    <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
                                        <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <Clock3 className="h-4 w-4 text-violet-500" />
                                                {text.workingHours}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatWorkHours(business.work_start, business.work_end, locale)}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <Users className="h-4 w-4 text-violet-500" />
                                                {text.team}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                {staff.length} {text.staffUnit}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <Sparkles className="h-4 w-4 text-violet-500" />
                                                {text.services}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                {services.length} {text.servicesUnit}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <CalendarDays className="h-4 w-4 text-violet-500" />
                                                {text.booking}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-emerald-600">
                                                {text.online}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="vizit-business-profile-contact relative grid gap-3 rounded-[26px] border border-white/70 bg-white/65 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
                                    {business.address ? (
                                        <div className="flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                            <span>{business.address}</span>
                                        </div>
                                    ) : null}
                                    {business.phone ? (
                                        <a href={`tel:${business.phone}`} className="flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm text-slate-600 transition hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                                            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                            <span>{business.phone}</span>
                                        </a>
                                    ) : null}
                                    <div className="flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                        <span>{text.onlineVia}</span>
                                    </div>

                                    {Array.isArray(business.locations) && business.locations.length > 1 ? (
                                        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
                                            {business.locations.map((location) => (
                                                <div key={location.id} className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                                                    <div className="font-semibold text-slate-900 dark:text-white">{location.name || (location.is_primary ? text.mainLocation : text.branch)}</div>
                                                    <div className="mt-1 leading-6">{location.address}</div>
                                                    {location.phone ? <a href={`tel:${location.phone}`} className="mt-1 inline-block text-xs hover:text-slate-900 dark:hover:text-white">{location.phone}</a> : null}
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
                    <div className="mx-auto max-w-7xl space-y-6">
                        <div className="space-y-6">
                            {business.show_services !== false && (
                            <motion.section
                                id="services"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.05 }}
                                className="scroll-mt-24 rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-7"
                            >
                                <div>
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
                                            <Sparkles className="h-4 w-4" />
                                            {text.services}
                                        </div>
                                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                            {text.publicServices}
                                        </h2>
                                    </div>
                                </div>

                                {!topServices.length ? (
                                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                                        {text.noServices}
                                    </div>
                                ) : (
                                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {topServices.map((service) => (
                                            <div
                                                key={service.id}
                                                className="vizit-profile-service-card rounded-[24px] border border-slate-100 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:border-violet-100 hover:bg-violet-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:p-5"
                                            >
                                                {service.image_url && <div className="vizit-profile-service-image mb-4 h-32 overflow-hidden rounded-2xl"><img src={service.image_url} alt={service.name} className="h-full w-full object-cover" /></div>}
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                            {service.name}
                                                        </h3>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                                                {service.duration_minutes} {text.minutes}
                                                            </span>
                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
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
                                className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-7"
                            >
                                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
                                    <Users className="h-4 w-4" />
                                    {text.specialists}
                                </div>

                                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                    {text.teamTitle}
                                </h2>

                                {!topStaff.length ? (
                                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                                        {text.noStaff}
                                    </div>
                                ) : (
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {topStaff.map((person) => (
                                            <div
                                                key={person.id}
                                                className="rounded-[26px] border border-slate-100 bg-slate-50/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-100 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm">
                                                            {person.avatar_url ? <img src={person.avatar_url} alt={person.name} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center"><Users className="h-5 w-5 text-slate-500" /></div>}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                                {person.name}
                                                            </div>
                                                            <div className="text-sm text-slate-500">
                                                                {publicRoleLabel(person.role, locale)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={person.is_bookable ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700" : "rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500"}>
                                                        {person.is_bookable ? text.onlineBooking : text.publicProfile}
                                                    </div>
                                                </div>

                                                {person.bio ? <div className="mt-4 text-sm leading-6 text-slate-500">{person.bio}</div> : <div className="mt-4 text-sm leading-6 text-slate-500">{text.bioFallback}</div>}

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">{publicRoleLabel(person.role, locale)}</span>
                                                    {person.is_bookable ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{text.available}</span> : null}
                                                </div>

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
                            className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,.92),rgba(249,238,244,.86))] p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))] sm:p-7"
                        >
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b2f68] dark:text-[#e8b8d8]">Vizit</div>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{text.why}</h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {text.whyItems.map((item) => (
                                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-4 text-sm font-medium leading-6 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
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
