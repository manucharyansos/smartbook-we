import { motion } from "framer-motion";
import {
    CalendarDays,
    Sparkles,
    ShieldCheck,
    Users,
    Building2,
    Stethoscope,
    ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";
import { fadeUp, pageTransition, scaleIn, staggerContainer } from "../lib/motion";

function FeatureCard({
                         icon,
                         title,
                         text,
                     }: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <motion.div
            variants={scaleIn}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white">
                {icon}
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
        </motion.div>
    );
}

export default function About() {
    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="show"
            className="min-h-screen overflow-x-clip bg-slate-50"
        >
            <LandingNavbar />

            <main className="pt-32 sm:pt-36 lg:pt-40">
                <section className="px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
                    <div className="mx-auto max-w-7xl">
                        <motion.div
                            variants={staggerContainer(0.08, 0.05)}
                            initial="hidden"
                            animate="show"
                            className="grid items-center gap-8 2xl:grid-cols-[1.05fr_0.95fr]"
                        >
                            <div>
                                <motion.div
                                    variants={fadeUp}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                                >
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                    Vizit-ի մասին
                                </motion.div>

                                <motion.h1
                                    variants={fadeUp}
                                    className="mt-6 text-[2rem] font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-6xl"
                                >
                                    Մենք կառուցում ենք{" "}
                                    <span className="text-violet-600">ամրագրման հարթակ</span>{" "}
                                    ծառայողական բիզնեսների համար
                                </motion.h1>

                                <motion.p
                                    variants={fadeUp}
                                    className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
                                >
                                    Vizit-ը ստեղծված է, որպեսզի գեղեցկության սրահներն ու
                                    ատամնաբուժական կլինիկաները ոչ միայն ընդունեն online bookings,
                                    այլև ունենան պրոֆեսիոնալ թվային ներկայություն և ավելի հարմար
                                    հաճախորդային փորձ։
                                </motion.p>

                                <motion.div
                                    variants={fadeUp}
                                    className="mt-8 flex flex-col gap-3 sm:flex-row"
                                >
                                    <Link
                                        to="/register"
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-medium text-white transition hover:bg-violet-700"
                                    >
                                        Սկսել անվճար
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <Link
                                        to="/pricing"
                                        className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Տեսնել գները
                                    </Link>
                                </motion.div>
                            </div>

                            <motion.div variants={scaleIn}>
                                <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-6">
                                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                        <div className="grid gap-4">
                                            {[
                                                {
                                                    icon: <Building2 className="h-5 w-5" />,
                                                    title: "Գեղեցկության սրահներ",
                                                    text: "Մեկ վայրում բրենդային public էջ, ծառայություններ և staff management",
                                                },
                                                {
                                                    icon: <Stethoscope className="h-5 w-5" />,
                                                    title: "Կլինիկաներ",
                                                    text: "Պացիենտային booking flow և ավելի organized schedule management",
                                                },
                                                {
                                                    icon: <CalendarDays className="h-5 w-5" />,
                                                    title: "Պրեմիում փորձ",
                                                    text: "Խելացի օրացույցներ, մաքուր հանրային փորձ և ուժեղ առաջին տպավորություն",
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.title}
                                                    className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900">{item.title}</div>
                                                            <div className="mt-1 text-sm leading-6 text-slate-600">{item.text}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                    <motion.div
                        variants={staggerContainer(0.08, 0.05)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.15 }}
                        className="mx-auto max-w-7xl"
                    >
                        <motion.div variants={fadeUp} className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                                <ShieldCheck className="h-4 w-4 text-violet-600" />
                                Մեր առաքելությունը
                            </div>

                            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                Օգնել ծառայողական բիզնեսներին գործել ավելի պրոֆեսիոնալ
                            </h2>

                            <p className="mt-4 text-base leading-8 text-slate-600">
                                Մեր նպատակը պարզ է՝ ստեղծել հարթակ, որտեղ բիզնեսը կարող է ունենալ
                                գեղեցիկ public ներկայություն, իսկ հաճախորդը՝ պարզ, արագ ու վստահելի
                                booking journey։
                            </p>
                        </motion.div>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2 2xl:grid-cols-4">
                            <FeatureCard
                                icon={<CalendarDays className="h-5 w-5" />}
                                title="Խելացի ամրագրում"
                                text="Արագ booking flow, ծառայությունների և մասնագետների հարմար ընտրություն։"
                            />
                            <FeatureCard
                                icon={<Users className="h-5 w-5" />}
                                title="Թիմի կառավարում"
                                text="Աշխատակիցների կառուցվածք, հասանելիություն և կազմակերպված schedule։"
                            />
                            <FeatureCard
                                icon={<Building2 className="h-5 w-5" />}
                                title="Հանրային ներկայություն"
                                text="Յուրաքանչյուր բիզնեսի համար ավելի պրոֆեսիոնալ հանրային ներկայացում։"
                            />
                            <FeatureCard
                                icon={<Sparkles className="h-5 w-5" />}
                                title="Պրեմիում զգացողություն"
                                text="Արտաքին տեսք, շարժում և UX, որը հարթակին տալիս է թանկ ու modern զգացողություն։"
                            />
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </motion.div>
    );
}