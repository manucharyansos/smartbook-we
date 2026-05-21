import { useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Phone,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    Stethoscope,
    Users,
} from "lucide-react";

import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";
import {
    fetchPublicBusinesses,
    type PublicDirectoryBusiness,
} from "../lib/publicApi";
import {
    publicPlansApi,
    type PublicPlan,
} from "../lib/planApi";

type BusinessFilter = "all" | "beauty" | "dental";
type BillingCycle = "monthly" | "yearly";

function cn(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

function businessTypeLabel(type: "beauty" | "dental") {
    return type === "beauty" ? "Գեղեցկության սրահ" : "Ատամնաբուժական կլինիկա";
}

function businessTypeIcon(type: "beauty" | "dental") {
    return type === "beauty" ? Sparkles : Stethoscope;
}

function formatWorkHours(start: string | null, end: string | null) {
    if (!start || !end) return "Ժամերը կհաստատվեն ամրագրման էջում";
    return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

function formatPlanPrice(price: number | null | undefined) {
    if (price == null) return "Անհատական";
    return `${price.toLocaleString("hy-AM")} ֏`;
}

function localizePlanLabel(name: string | null | undefined, code?: string | null) {
    const value = String(name || code || "").toLowerCase();
    if (value.includes("start")) return "Սկիզբ";
    if (value.includes("studio")) return "Ստուդիա";
    if (value.includes("business")) return "Բիզնես";
    if (value.includes("custom")) return "Անհատական";
    return name || code || "Պլան";
}

const revealUp: Variants = {
    hidden: { opacity: 0, y: 34, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const revealSoft: Variants = {
    hidden: { opacity: 0, y: 22, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.48,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const staggerWrap: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

function BusinessCard({
                          item,
                          index,
                      }: {
    item: PublicDirectoryBusiness;
    index: number;
}) {
    const TypeIcon = businessTypeIcon(item.business_type);

    return (
        <motion.article
            variants={revealSoft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.16 }}
            transition={{ delay: index * 0.04 }}
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
        >
            <div className="relative h-52 overflow-hidden bg-slate-100">
                {item.cover_url ? (
                    <img
                        src={item.cover_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8fafc_0%,#f5f3ff_58%,#ffffff_100%)]" />
                )}

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                        <TypeIcon className="h-4 w-4 text-violet-600" />
                        {businessTypeLabel(item.business_type)}
                    </div>

                    {item.is_featured && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
                            <Star className="h-3.5 w-3.5" />
                            Առաջարկվող
                        </div>
                    )}
                </div>

                <div className="absolute bottom-4 left-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/80 bg-white/90 shadow-sm">
                        {item.logo_url ? (
                            <img
                                src={item.logo_url}
                                alt={item.name}
                                className="h-10 w-10 rounded-xl object-cover"
                            />
                        ) : (
                            <Building2 className="h-6 w-6 text-slate-700" />
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5 sm:p-6">
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                    {item.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.short_description ||
                        "Օնլայն ամրագրում, հարմար ժամերի ընտրություն և պրոֆեսիոնալ սպասարկում։"}
                </p>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-violet-600" />
                        <span>{formatWorkHours(item.work_start, item.work_end)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-violet-600" />
                        <span>{item.staff_count} մասնագետ</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-600" />
                        <span>{item.services_count} ծառայություն</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-violet-600" />
                        <span className="truncate">{item.address || "Հասցեն շուտով"}</span>
                    </div>
                </div>

                {item.phone && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="h-4 w-4 text-violet-600" />
                        <span>{item.phone}</span>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                        to={`/book/${item.slug}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-700"
                    >
                        Ամրագրել հիմա
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                        to={`/businesses/${item.slug}`}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Տեսնել էջը
                    </Link>
                </div>
            </div>
        </motion.article>
    );
}

export default function Index() {
    const [filter, setFilter] = useState<BusinessFilter>("all");
    const [search, setSearch] = useState("");
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");

    const businessesQ = useQuery({
        queryKey: ["public-businesses", filter, search],
        queryFn: () =>
            fetchPublicBusinesses({
                type: filter,
                search: search.trim() || undefined,
                per_page: 24,
            }),
    });

    const plansQ = useQuery({
        queryKey: ["homepage-public-plans"],
        queryFn: async () => {
            const res = await publicPlansApi.list();
            return (res.data?.data ?? []) as PublicPlan[];
        },
        staleTime: 60_000,
    });

    const businesses = businessesQ.data ?? [];

    const homepagePlans = useMemo(
        () =>
            (plansQ.data ?? []).map((plan) => {
                const baseMonthly = plan.price ?? null;
                const yearlyPrice = plan.yearly_offer?.price ?? (baseMonthly != null ? baseMonthly * 10 : null);

                return {
                    ...plan,
                    displayPrice: billingCycle === "yearly" ? yearlyPrice : baseMonthly,
                    displayLabel:
                        billingCycle === "yearly" ? "տարեկան" : plan.period || "ամսական",
                    yearlyPrice,
                    fullYearAmount: baseMonthly != null ? baseMonthly * 12 : null,
                    perMonthEffective: yearlyPrice != null ? Math.round(yearlyPrice / 12) : null,
                    monthsFree: plan.yearly_offer?.months_free ?? 2,
                };
            }),
        [plansQ.data, billingCycle]
    );

    const featuredBusinesses = useMemo(
        () => businesses.filter((item) => item.is_featured),
        [businesses]
    );

    const visibleBusinesses = useMemo(() => {
        const featuredIds = new Set(featuredBusinesses.map((item) => item.id));
        const rest = businesses.filter((item) => !featuredIds.has(item.id));
        return [...featuredBusinesses, ...rest];
    }, [businesses, featuredBusinesses]);

    const stats = useMemo(() => {
        const beauty = businesses.filter((b) => b.business_type === "beauty").length;
        const dental = businesses.filter((b) => b.business_type === "dental").length;
        const services = businesses.reduce((acc, b) => acc + (b.services_count || 0), 0);

        return { beauty, dental, services };
    }, [businesses]);

    return (
        <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
            <LandingNavbar />

            <main>
                <section className="relative overflow-hidden px-4 pb-10 pt-16 sm:pb-14 sm:pt-24 sm:px-6 lg:px-8 lg:pb-20 lg:pt-40">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.07),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.04),transparent_24%)]" />

                    <motion.div
                        variants={staggerWrap}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.12 }}
                        className="mx-auto grid max-w-7xl items-center gap-6 sm:gap-10 xl:grid-cols-[1.02fr_0.98fr]"
                    >
                        <div>
                            <motion.div
                                variants={revealSoft}
                                className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                            >
                                <ShieldCheck className="h-4 w-4 text-violet-600" />
                                Օնլայն ամրագրում · տարեկան պլանով 2 ամիս նվեր
                            </motion.div>

                            <motion.h1
                                variants={revealUp}
                                className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:mt-6 sm:text-5xl lg:text-6xl"
                            >
                                Բացահայտիր լավագույն սրահներն ու կլինիկաները և
                                <span className="block text-slate-500">
                  ամրագրիր մի քանի պարզ քայլով
                </span>
                            </motion.h1>

                            <motion.p
                                variants={revealSoft}
                                className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
                            >
                                Vizit-ը միավորում է գեղեցկության սրահներն ու կլինիկաները մեկ հարթակում՝
                                արագ ամրագրումների, մաքուր ներկայացման և հարմար հաճախորդային փորձի համար։
                            </motion.p>

                            <motion.div
                                variants={revealSoft}
                                className="mt-8 flex flex-col gap-3 sm:flex-row"
                            >
                                <a
                                    href="#businesses"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-violet-700"
                                >
                                    Գտնել բիզնես
                                    <ArrowRight className="h-4 w-4" />
                                </a>

                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Ավելացնել իմ բիզնեսը
                                </Link>
                            </motion.div>

                            <motion.div
                                variants={staggerWrap}
                                className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3"
                            >
                                <motion.div
                                    variants={revealSoft}
                                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="text-2xl font-semibold text-slate-950">
                                        {businessesQ.isLoading ? "..." : businesses.length}
                                    </div>
                                    <div className="mt-1 text-sm text-slate-500">գրանցված բիզնես</div>
                                </motion.div>

                                <motion.div
                                    variants={revealSoft}
                                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="text-2xl font-semibold text-slate-950">
                                        {businessesQ.isLoading ? "..." : stats.services}
                                    </div>
                                    <div className="mt-1 text-sm text-slate-500">ակտիվ ծառայություն</div>
                                </motion.div>

                                <motion.div
                                    variants={revealSoft}
                                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="text-2xl font-semibold text-slate-950">24/7</div>
                                    <div className="mt-1 text-sm text-slate-500">օնլայն ամրագրումներ</div>
                                </motion.div>
                            </motion.div>
                        </div>

                        <motion.div variants={revealUp} className="relative">
                            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-6">
                                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-sm text-slate-500">Vizit հանրային էջ</div>
                                            <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                                                Մաքուր, արագ, վստահելի
                                            </div>
                                        </div>

                                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
                                            <CalendarDays className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <motion.div
                                        variants={staggerWrap}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.16 }}
                                        className="mt-6 grid gap-3"
                                    >
                                        <motion.div
                                            variants={revealSoft}
                                            className="rounded-2xl border border-slate-200 bg-white p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                                                    <Sparkles className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-950">Գեղեցկության սրահներ</div>
                                                    <div className="text-sm text-slate-500">
                                                        {stats.beauty || 0} բիզնես հասանելի է
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={revealSoft}
                                            className="rounded-2xl border border-slate-200 bg-white p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                                                    <Stethoscope className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-950">Կլինիկաներ</div>
                                                    <div className="text-sm text-slate-500">
                                                        {stats.dental || 0} կլինիկա հասանելի է
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={revealSoft}
                                            className="rounded-2xl border border-slate-200 bg-white p-4"
                                        >
                                            <div className="text-sm text-slate-500">Ամրագրման քայլերը</div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
                                                <span className="rounded-full bg-slate-100 px-3 py-1.5">Ընտրել բիզնեսը</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1.5">Ընտրել ծառայությունը</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1.5">Ամրագրել</span>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </div>

                            <motion.div
                                variants={revealSoft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                className="absolute -bottom-5 -left-5 hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] lg:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-950">Վստահելի օնլայն ամրագրում</div>
                                        <div className="text-xs text-slate-500">Բրենդային փորձ + արագ ամրագրում</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </section>

                <section id="businesses" className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <div className="mx-auto max-w-7xl">
                        <motion.div
                            variants={staggerWrap}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.12 }}
                            className="mb-8 flex flex-col gap-5"
                        >
                            <motion.div variants={revealSoft} className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                                    <Star className="h-4 w-4 text-violet-600" />
                                    Գրանցված և առաջարկվող բիզնեսներ
                                </div>

                                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    Ընտրիր քեզ հարմար բիզնեսը
                                </h2>

                                <p className="mt-3 text-base leading-7 text-slate-600">
                                    Ցույց ենք տալիս այն բիզնեսները, որոնք արդեն գրանցված են Vizit-ում
                                    և հասանելի են օնլայն ամրագրման համար։
                                </p>
                            </motion.div>

                            <motion.div
                                variants={revealSoft}
                                className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="grid gap-3 2xl:grid-cols-[1fr_auto]">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Փնտրիր անունով կամ հասցեով"
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        />
                                    </div>

                                    <div className="overflow-x-auto">
                                        <div className="inline-flex min-w-max rounded-2xl border border-slate-200 bg-slate-50 p-1">
                                            {[
                                                { key: "all", label: "Բոլորը" },
                                                { key: "beauty", label: "Գեղեցկություն" },
                                                { key: "dental", label: "Կլինիկա" },
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => setFilter(item.key as BusinessFilter)}
                                                    className={cn(
                                                        "rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
                                                        filter === item.key
                                                            ? "bg-violet-600 text-white"
                                                            : "text-slate-600 hover:bg-white"
                                                    )}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {businessesQ.isLoading && (
                            <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="h-[420px] animate-pulse rounded-[28px] border border-slate-200 bg-white"
                                    />
                                ))}
                            </div>
                        )}

                        {businessesQ.isError && (
                            <motion.div
                                variants={revealSoft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700"
                            >
                                Չհաջողվեց բեռնել բիզնեսների ցուցակը։ Ստուգիր API-ն և նորից փորձիր։
                            </motion.div>
                        )}

                        {!businessesQ.isLoading && !visibleBusinesses.length && (
                            <motion.div
                                variants={revealSoft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm"
                            >
                                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                                    <Building2 className="h-6 w-6" />
                                </div>

                                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                                    Այս պահին արդյունք չկա
                                </h3>

                                <p className="mt-2 text-slate-500">
                                    Փոխիր filter-ը կամ search-ը, կամ ավելացրու առաջին բիզնեսները համակարգ։
                                </p>
                            </motion.div>
                        )}

                        {!!visibleBusinesses.length && (
                            <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                                {visibleBusinesses.map((item, index) => (
                                    <BusinessCard key={item.id} item={item} index={index} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <motion.div
                        variants={staggerWrap}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.12 }}
                        className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] sm:p-8 lg:p-10"
                    >
                        <motion.div
                            variants={revealUp}
                            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
                        >
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                    Պլաններ բիզնեսների համար
                                </div>

                                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    Ամսական կամ տարեկան
                                </h2>

                                <p className="mt-3 text-base leading-7 text-slate-600">
                                    Բոլոր պլաններում հասանելի են հիմնական գործիքները, իսկ գինը կապված է միայն ակտիվ մասնագետների քանակին։ Տարեկան տարբերակում վճարում ես 10 ամիս, օգտվում՝ 12 ամիս։
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
                                    Գինը կախված է միայն ակտիվ մասնագետներից
                                </div>

                                <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle("monthly")}
                                        className={cn(
                                            "rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
                                            billingCycle === "monthly"
                                                ? "bg-white text-slate-950 shadow-sm"
                                                : "text-slate-600"
                                        )}
                                    >
                                        Ամսական
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle("yearly")}
                                        className={cn(
                                            "rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
                                            billingCycle === "yearly"
                                                ? "bg-violet-600 text-white"
                                                : "text-slate-600"
                                        )}
                                    >
                                        Տարեկան
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {plansQ.isLoading ? (
                            <div className="mt-8 grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="h-[360px] animate-pulse rounded-[28px] border border-slate-200 bg-slate-50"
                                    />
                                ))}
                            </div>
                        ) : plansQ.isError ? (
                            <motion.div
                                variants={revealSoft}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700"
                            >
                                Չհաջողվեց բեռնել պլանները։
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={staggerWrap}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.12 }}
                                className="mt-8 grid gap-5 xl:grid-cols-2 2xl:grid-cols-3"
                            >
                                {homepagePlans.map((plan, idx) => (
                                    <motion.article
                                        key={plan.id}
                                        variants={revealSoft}
                                        className={cn(
                                            "relative rounded-[28px] border p-6 pt-14 sm:pt-12",
                                            idx === 1
                                                ? "border-slate-950 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
                                                : "border-slate-200 bg-slate-50"
                                        )}
                                    >
                                        {(idx === 1 || billingCycle === "yearly") && (
                                            <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2">
                                                {billingCycle === "yearly" ? (
                                                    <div
                                                        className={cn(
                                                            "rounded-full px-3 py-1.5 text-xs font-semibold",
                                                            idx === 1
                                                                ? "bg-white/10 text-white"
                                                                : "border border-violet-200 bg-violet-50 text-violet-700"
                                                        )}
                                                    >
                                                        {plan.monthsFree} ամիս անվճար
                                                    </div>
                                                ) : <span />}

                                                {idx === 1 ? (
                                                    <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-950">
                                                        Սիրված
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}

                                        <div
                                            className={cn(
                                                "inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 pr-4 text-xs font-medium",
                                                idx === 1
                                                    ? "bg-white/10 text-white/90"
                                                    : "border border-slate-200 bg-white text-slate-700"
                                            )}
                                        >
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Պլան ըստ ակտիվ մասնագետների
                                        </div>

                                        <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                                            {localizePlanLabel(plan.name, plan.code)}
                                        </h3>

                                        <p
                                            className={cn(
                                                "mt-3 min-h-[56px] text-sm leading-7",
                                                idx === 1 ? "text-white/70" : "text-slate-600"
                                            )}
                                        >
                                            {plan.description ||
                                                "Օնլայն ամրագրում, թիմի կառավարում և բիզնեսի հիմնական գործիքներ։"}
                                        </p>

                                        <div className="mt-6">
                                            <div className="flex flex-wrap items-end gap-3">
                                                <div className="text-4xl font-semibold tracking-tight">
                                                    {formatPlanPrice(plan.displayPrice)}
                                                </div>

                                                {billingCycle === "yearly" && (
                                                    <div
                                                        className={cn(
                                                            "pb-1 text-sm line-through",
                                                            idx === 1 ? "text-white/50" : "text-slate-500"
                                                        )}
                                                    >
                                                        {formatPlanPrice(plan.fullYearAmount)}
                                                    </div>
                                                )}
                                            </div>

                                            <div
                                                className={cn(
                                                    "mt-1 text-sm",
                                                    idx === 1 ? "text-white/60" : "text-slate-500"
                                                )}
                                            >
                                                {plan.displayLabel}
                                            </div>

                                            {billingCycle === "yearly" && (
                                                <div
                                                    className={cn(
                                                        "mt-3 rounded-2xl p-3 text-sm",
                                                        idx === 1
                                                            ? "bg-white/10 text-white/90"
                                                            : "border border-slate-200 bg-white text-slate-700"
                                                    )}
                                                >
                                                    Արդյունավետ միջին արժեքը՝{" "}
                                                    <span className="font-semibold">
                            {formatPlanPrice(plan.perMonthEffective)}/ամիս
                          </span>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className={cn(
                                                "mt-6 grid gap-3 text-sm",
                                                idx === 1 ? "text-white/80" : "text-slate-600"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Մինչև {plan.staff_limit ?? "—"} ակտիվ մասնագետ
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4" />
                                                Սեփականատեր և մենեջեր՝ անսահմանափակ
                                            </div>

                                            {billingCycle === "yearly" && (
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4" />
                                                    Խնայում ես {formatPlanPrice((plan.fullYearAmount ?? 0) - (plan.yearlyPrice ?? 0))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 flex flex-col gap-3">
                                            <Link
                                                to="/register?intent=business"
                                                className={cn(
                                                    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition",
                                                    idx === 1
                                                        ? "bg-white text-slate-950 hover:bg-slate-100"
                                                        : "bg-violet-600 text-white hover:bg-violet-700"
                                                )}
                                            >
                                                Սկսել հիմա
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>

                                            <Link
                                                to="/pricing"
                                                className={cn(
                                                    "inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-medium transition",
                                                    idx === 1
                                                        ? "border-white/12 bg-white/5 text-white hover:bg-white/10"
                                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                )}
                                            >
                                                Տեսնել ամբողջ գնացուցակը
                                            </Link>
                                        </div>
                                    </motion.article>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </section>

                <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                    <motion.div
                        variants={staggerWrap}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.12 }}
                        className="mx-auto grid max-w-7xl gap-6 2xl:grid-cols-3"
                    >
                        {[
                            {
                                icon: Building2,
                                title: "Բացահայտիր բիզնեսներ",
                                text: "Գտիր գեղեցկության սրահներ և ատամնաբուժական կլինիկաներ մեկ հարթակում։",
                            },
                            {
                                icon: CalendarDays,
                                title: "Ամրագրիր արագ",
                                text: "Ընտրիր ծառայությունը, մասնագետին և ազատ ժամը՝ առանց զանգերի ու սպասման։",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Պրոֆեսիոնալ փորձ",
                                text: "Բիզնեսների համար՝ ավելի լավ ներկայացում, հաճախորդների համար՝ ավելի հարթ ամրագրման փորձ։",
                            },
                        ].map((item) => {
                            const Icon = item.icon;

                            return (
                                <motion.div
                                    key={item.title}
                                    variants={revealSoft}
                                    className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
                                >
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <h3 className="mt-5 text-xl font-semibold text-slate-950">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>

                <section className="px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-16">
                    <motion.div
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.12 }}
                        className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-10 lg:p-12"
                    >
                        <div className="grid gap-8 2xl:grid-cols-[1fr_auto] 2xl:items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                    Vizit բիզնեսների համար
                                </div>

                                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    Ուզո՞ւմ ես քո բիզնեսն էլ հայտնվի այս ցուցակում
                                </h2>

                                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                                    Գրանցիր քո սրահը կամ կլինիկան, ստացիր public booking էջ,
                                    թիմի կառավարում, օրացույց, ծառայություններ և ավելի ուժեղ օնլայն ներկայություն։
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                                >
                                    Սկսել անվճար
                                </Link>

                                <Link
                                    to="/pricing"
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Տեսնել գները
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
}