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
    Star,
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
} from "../lib/publicApi";
import { whatsappLink } from "../lib/support";

function businessTypeLabel(type?: "beauty" | "dental") {
    return type === "dental" ? "Ատամնաբուժական կլինիկա" : "Գեղեցկության սրահ";
}

function businessTypeIcon(type?: "beauty" | "dental") {
    return type === "dental" ? Stethoscope : Sparkles;
}

function formatWorkHours(start?: string | null, end?: string | null) {
    if (!start || !end) return "Ժամերը հասանելի են ամրագրման էջում";
    return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

function formatPrice(price: number | null | undefined, currency?: string) {
    if (price == null) return "Գինը ճշտել";
    return `${price} ${currency || ""}`.trim();
}

function publicRoleLabel(role?: string | null) {
    if (role === "owner") return "Սեփականատեր · մասնագետ";
    if (role === "manager") return "Մենեջեր · մասնագետ";
    return "Մասնագետ";
}

export default function PublicBusinessProfile() {
    const { slug = "" } = useParams();

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
    const services = servicesQ.data ?? [];
    const staff = staffQ.data ?? [];

    const topServices = useMemo(() => services.slice(0, 6), [services]);
    const topStaff = useMemo(() => staff.slice(0, 6), [staff]);

    const TypeIcon = businessTypeIcon(business?.business_type);

    if (businessQ.isLoading) {
        return (
            <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_20%,#faf7ff_100%)]">
                <PublicBusinessHeader secondaryHref="/" secondaryLabel="SmartBook" />
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
                <PublicBusinessFooter />
            </div>
        );
    }

    if (businessQ.isError || !business) {
        return (
            <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_20%,#faf7ff_100%)]">
                <PublicBusinessHeader secondaryHref="/" secondaryLabel="SmartBook" />
                <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                    <div className="rounded-[32px] border border-rose-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-500">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <h1 className="mt-5 text-2xl font-semibold text-slate-900">
                            Բիզնեսը չի գտնվել
                        </h1>
                        <p className="mt-3 text-slate-500">
                            Հնարավոր է էջը ջնջվել է կամ հղումը սխալ է։
                        </p>
                        <Link
                            to="/"
                            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
                        >
                            Վերադառնալ գլխավոր էջ
                        </Link>
                    </div>
                </main>
                <PublicBusinessFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_22%,#faf7ff_100%)] text-slate-900">
            <PublicBusinessHeader business={business} primaryHref={`/book/${business.slug}?source=website`} primaryLabel="Ամրագրել հիմա" secondaryHref="/" secondaryLabel="SmartBook" />

            <main className="pb-16 pt-8 sm:pt-10">
                <section className="px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="relative overflow-hidden rounded-[38px] border border-white/70 bg-white/85 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                        >
                            {business.cover_url && <img src={business.cover_url} alt={business.name} className="absolute inset-0 h-full w-full object-cover opacity-20" />}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.18),transparent_25%),linear-gradient(135deg,#fff7ed_0%,#faf5ff_55%,#ffffff_100%)]" />

                            <div className="relative grid gap-8 p-6 sm:p-8 2xl:grid-cols-[1fr_340px] lg:p-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                                        {/* eslint-disable-next-line react-hooks/static-components */}
                                        <TypeIcon className="h-4 w-4" />
                                        {businessTypeLabel(business.business_type)}
                                    </div>

                                    <div className="mt-6 flex items-start gap-4">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[22px] border border-white/70 bg-white/90 shadow-md">
                                            {business.logo_url ? (
                                                <img src={business.logo_url} alt={business.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="grid h-full w-full place-items-center"><Building2 className="h-7 w-7 text-slate-700" /></div>
                                            )}
                                        </div>

                                        <div>
                                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                                {business.name}
                                            </h1>
                                            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                                                {(business as any).short_description ||
                                                    "Պրոֆեսիոնալ սպասարկում, հարմար ժամերի ընտրություն և արագ օնլայն ամրագրում SmartBook-ի միջոցով։"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <Link
                                            to={`/book/${business.slug}?source=website`}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
                                        >
                                            <CalendarDays className="h-4 w-4" /> Ամրագրել հիմա
                                        </Link>
                                        {business.instagram_url ? (
                                            <a href={business.instagram_url} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto">
                                                <Instagram className="h-4 w-4 text-pink-500" /> Instagram
                                            </a>
                                        ) : null}
                                        {business.facebook_url ? (
                                            <a href={business.facebook_url} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto">
                                                <Facebook className="h-4 w-4 text-sky-600" /> Facebook
                                            </a>
                                        ) : null}
                                        {business.whatsapp_url || business.whatsapp_phone ? (
                                            <a href={business.whatsapp_url || whatsappLink(business.whatsapp_phone || "", `Բարև, ուզում եմ ամրագրում կատարել ${business.name}-ում`)} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto">
                                                <MessageCircleMore className="h-4 w-4 text-emerald-600" /> WhatsApp
                                            </a>
                                        ) : null}
                                        {business.messenger_url ? (
                                            <a href={business.messenger_url} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto">
                                                <MessageCircleMore className="h-4 w-4 text-violet-600" /> Messenger
                                            </a>
                                        ) : null}
                                    </div>

                                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4">
                                        <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Clock3 className="h-4 w-4 text-violet-500" />
                                                Աշխատանքային ժամեր
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-slate-900">
                                                {formatWorkHours(business.work_start, business.work_end)}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Users className="h-4 w-4 text-violet-500" />
                                                Թիմ
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-slate-900">
                                                {staff.length} մասնագետ
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Sparkles className="h-4 w-4 text-violet-500" />
                                                Ծառայություններ
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-slate-900">
                                                {services.length} ակտիվ ծառայություն
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <CalendarDays className="h-4 w-4 text-violet-500" />
                                                Booking
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-emerald-600">
                                                Հասանելի է օնլայն
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative 2xl:sticky 2xl:top-24">
                                    <div className="rounded-[30px] border border-white/70 bg-white/88 p-5 shadow-xl">
                                        <div className="text-sm text-slate-500">Quick actions</div>
                                        <div className="mt-2 text-2xl font-semibold text-slate-900">
                                            Ամրագրիր հիմա
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">
                                            Ընտրիր ծառայությունը, մասնագետին և հարմար ժամը մի քանի քայլով։
                                        </p>

                                        <div className="mt-6 space-y-3">
                                            <Link
                                                to={`/book/${business.slug}`}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20"
                                            >
                                                Անցնել ամրագրման էջ
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>

                                            <Link
                                                to="/"
                                                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                            >
                                                Բոլոր բիզնեսները
                                            </Link>
                                        </div>

                                        <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                            {business.address && (
                                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                                    <MapPin className="mt-0.5 h-4 w-4 text-orange-500" />
                                                    <span>{business.address}</span>
                                                </div>
                                            )}

                                            {Array.isArray(business.locations) && business.locations.length > 1 ? (
                                                <div className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Հասցեներ</div>
                                                    <div className="mt-2 space-y-2">
                                                        {business.locations.map((location) => (
                                                            <div key={location.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                                                <div className="font-medium text-slate-900">{location.name || (location.is_primary ? 'Գլխավոր հասցե' : 'Մասնաճյուղ')}</div>
                                                                <div className="mt-1 leading-6">{location.address}</div>
                                                                {location.phone ? <div className="mt-1 text-xs text-slate-500">{location.phone}</div> : null}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}

                                            {business.phone && (
                                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                                    <Phone className="mt-0.5 h-4 w-4 text-orange-500" />
                                                    <span>{business.phone}</span>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                                                <span>Օնլայն ամրագրում SmartBook հարթակում</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="mt-8 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-6 2xl:grid-cols-[1fr_340px]">
                        <div className="space-y-6">
                            {business.show_services !== false && (
                            <motion.section
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.05 }}
                                className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
                                            <Sparkles className="h-4 w-4" />
                                            Ծառայություններ
                                        </div>
                                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                                            Հանրային հասանելի ծառայությունները
                                        </h2>
                                    </div>

                                    <Link
                                        to={`/book/${business.slug}`}
                                        className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
                                    >
                                        Ամրագրել
                                    </Link>
                                </div>

                                {!topServices.length ? (
                                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                                        Այս պահին հանրային ծառայություններ դեռ ցուցադրված չեն։
                                    </div>
                                ) : (
                                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                                        {topServices.map((service) => (
                                            <div
                                                key={service.id}
                                                className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 transition hover:border-violet-100 hover:bg-violet-50/40"
                                            >
                                                {service.image_url && <div className="mb-4 h-40 overflow-hidden rounded-2xl"><img src={service.image_url} alt={service.name} className="h-full w-full object-cover" /></div>}
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-slate-900">
                                                            {service.name}
                                                        </h3>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                                                {service.duration_minutes} րոպե
                                                            </span>
                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                                                {formatPrice(service.price, service.currency)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-violet-600 shadow-sm">
                                                        #{service.id}
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
                                className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-sm"
                            >
                                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
                                    <Users className="h-4 w-4" />
                                    Մասնագետներ
                                </div>

                                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                                    Թիմը
                                </h2>

                                {!topStaff.length ? (
                                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                                        Այս պահին թիմի հանրային ցուցադրում չկա։
                                    </div>
                                ) : (
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                                        {topStaff.map((person) => (
                                            <div
                                                key={person.id}
                                                className="rounded-[26px] border border-slate-100 bg-slate-50/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-100 hover:bg-white"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm">
                                                            {person.avatar_url ? <img src={person.avatar_url} alt={person.name} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center"><Users className="h-5 w-5 text-slate-500" /></div>}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900">
                                                                {person.name}
                                                            </div>
                                                            <div className="text-sm text-slate-500">
                                                                {publicRoleLabel(person.role)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={person.is_bookable ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700" : "rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500"}>
                                                        {person.is_bookable ? "Online booking" : "Public profile"}
                                                    </div>
                                                </div>

                                                {person.bio ? <div className="mt-4 text-sm leading-6 text-slate-500">{person.bio}</div> : <div className="mt-4 text-sm leading-6 text-slate-500">Մասնագետի մասին մանրամասները հասանելի են ամրագրման ընթացքում։</div>}

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">{publicRoleLabel(person.role)}</span>
                                                    {person.is_bookable ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Ազատ է օնլայն ամրագրման համար</span> : null}
                                                </div>

                                                {person.is_bookable ? (
                                                    <Link
                                                        to={`/book/${business.slug}?staff_id=${person.id}&source=website`}
                                                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                                                    >
                                                        Ամրագրել {person.name.split(" ")[0]}-ի մոտ
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.section>
                            )}
                        </div>

                        <aside className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.1 }}
                                className="rounded-[30px] border border-white/70 bg-white/88 p-5 shadow-sm"
                            >
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    Ինչու ընտրել այս բիզնեսը
                                </div>

                                <div className="mt-4 space-y-3">
                                    {[
                                        "Օնլայն ամրագրում առանց զանգերի",
                                        "Ծառայությունների և մասնագետների հարմար ընտրություն",
                                        "Ժամերի արագ ստուգում booking էջում",
                                        "Պրոֆեսիոնալ ներկայացում SmartBook-ում",
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                                        >
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                            <span className="text-sm text-slate-600">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.12 }}
                                className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,#1e1b4b_0%,#581c87_50%,#7c2d12_100%)] p-6 text-white shadow-lg"
                            >
                                <div className="text-sm text-white/75">Ready to book?</div>
                                <div className="mt-2 text-2xl font-semibold">
                                    Ընտրիր քո հարմար ժամը
                                </div>
                                <p className="mt-3 text-sm leading-7 text-white/80">
                                    Անցիր booking էջ և ավարտիր ամրագրումը մի քանի պարզ քայլով։
                                </p>

                                <Link
                                    to={`/book/${business.slug}`}
                                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                                >
                                    Սկսել ամրագրումը
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                        </aside>
                    </div>
                </section>
            </main>

            <PublicBusinessFooter business={business} />
        </div>
    );
}