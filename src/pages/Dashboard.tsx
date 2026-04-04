import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    CalendarDays,
    Users,
    Scissors,
    TrendingUp,
    ArrowRight,
    Clock3,
    Sparkles,
    ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";

import { page, card, cardTransition } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { fetchBookings } from "../lib/calendarApi";
import { fetchServices } from "../lib/servicesApi";
import { fetchStaff } from "../lib/staffApi";

function StatCard({
                      title,
                      value,
                      subtitle,
                      icon,
                  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
}) {
    return (
        <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
            <Card className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-sm font-medium text-slate-500">{title}</div>
                        <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
                        <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
                    </div>

                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
                        {icon}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

export default function Dashboard() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const from = `${yyyy}-${mm}-${dd}`;
    const to = `${yyyy}-${mm}-${dd}`;

    const bookingsQ = useQuery({
        queryKey: ["dashboard-bookings-today", from, to],
        queryFn: () => fetchBookings(from, to),
    });

    const servicesQ = useQuery({
        queryKey: ["dashboard-services"],
        queryFn: fetchServices,
    });

    const staffQ = useQuery({
        queryKey: ["dashboard-staff"],
        queryFn: fetchStaff,
    });

    const loading = bookingsQ.isLoading || servicesQ.isLoading || staffQ.isLoading;

    const bookings = bookingsQ.data ?? [];
    const services = servicesQ.data ?? [];
    const staff = staffQ.data ?? [];

    const todayCount = bookings.length;
    const confirmedCount = bookings.filter((b: any) => b.status === "confirmed").length;
    const pendingCount = bookings.filter((b: any) => b.status === "pending").length;

    return (
        <motion.div {...page} className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,#1e1b4b_0%,#581c87_50%,#7c2d12_100%)] p-6 text-white shadow-[0_25px_90px_rgba(76,29,149,0.18)] sm:p-8"
            >
                <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
                            <Sparkles className="h-4 w-4" />
                            SmartBook dashboard
                        </div>

                        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Բարի վերադարձ
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                            Այստեղ կարող ես արագ տեսնել քո այսօրվա booking activity-ը, թիմը,
                            ծառայությունները և անցնել հիմնական գործողություններին։
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row 2xl:flex-col">
                        <Link
                            to="/app/calendar"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                            Բացել օրացույցը
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        <Link
                            to="/app/settings"
                            className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                        >
                            Կարգավորումներ
                        </Link>
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <div className="grid gap-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-36 animate-pulse rounded-[28px] border border-slate-200 bg-white/80"
                            />
                        ))}
                    </div>

                    <div className="grid gap-6 2xl:grid-cols-2">
                        <div className="h-[320px] animate-pulse rounded-[30px] border border-slate-200 bg-white/80" />
                        <div className="h-[320px] animate-pulse rounded-[30px] border border-slate-200 bg-white/80" />
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                        <StatCard
                            title="Այսօրվա ամրագրումներ"
                            value={todayCount}
                            subtitle="Ամրագրումների ընդհանուր քանակ"
                            icon={<CalendarDays className="h-5 w-5" />}
                        />

                        <StatCard
                            title="Հաստատված"
                            value={confirmedCount}
                            subtitle="Այսօրվա confirmed booking-ներ"
                            icon={<TrendingUp className="h-5 w-5" />}
                        />

                        <StatCard
                            title="Սպասման մեջ"
                            value={pendingCount}
                            subtitle="Pending ամրագրումներ"
                            icon={<Clock3 className="h-5 w-5" />}
                        />

                        <StatCard
                            title="Աշխատակիցներ"
                            value={staff.length}
                            subtitle="Թիմի ակտիվ անդամներ"
                            icon={<Users className="h-5 w-5" />}
                        />
                    </div>

                    <div className="grid gap-6 2xl:grid-cols-2">
                        <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
                            <Card className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-lg font-semibold text-slate-950">Արագ գործողություններ</div>
                                        <div className="mt-1 text-sm text-slate-500">
                                            Ամենահաճախ օգտագործվող բաժինները
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    {[
                                        { to: "/app/calendar", label: "Օրացույց", icon: CalendarDays },
                                        { to: "/app/services", label: "Ծառայություններ", icon: Scissors },
                                        { to: "/app/staff", label: "Աշխատակիցներ", icon: Users },
                                        { to: "/app/tasks", label: "Թասքեր", icon: ClipboardList },
                                        { to: "/app/settings", label: "Կարգավորումներ", icon: Sparkles },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.to}
                                                to={item.to}
                                                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-violet-200 hover:bg-violet-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="text-sm font-medium text-slate-800">{item.label}</div>
                                                </div>

                                                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-violet-600" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
                            <Card className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-lg font-semibold text-slate-950">Ընդհանուր պատկեր</div>
                                        <div className="mt-1 text-sm text-slate-500">
                                            Քո բիզնեսի հիմնական ցուցանիշները
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                                        <span className="text-sm text-slate-500">Ծառայություններ</span>
                                        <span className="text-base font-semibold text-slate-900">{services.length}</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                                        <span className="text-sm text-slate-500">Աշխատակիցներ</span>
                                        <span className="text-base font-semibold text-slate-900">{staff.length}</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                                        <span className="text-sm text-slate-500">Այսօրվա booking-ներ</span>
                                        <span className="text-base font-semibold text-slate-900">{todayCount}</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </motion.div>
    );
}