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
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
    hy: {
        badge: "Vizit-ի մասին", heroLead: "Մենք կառուցում ենք", heroHighlight: "ամրագրման հարթակ", heroTail: "ծառայություն մատուցող բիզնեսների համար",
        intro: "Vizit-ը ստեղծված է, որպեսզի սրահները, կլինիկաները և այլ ծառայողական բիզնեսները ընդունեն օնլայն ամրագրումներ, ունենան պրոֆեսիոնալ թվային ներկայություն և ապահովեն հարմար հաճախորդային փորձ։",
        start: "Սկսել անվճար", pricing: "Տեսնել գները",
        audiences: [
            { title: "Գեղեցկության սրահներ", text: "Բրենդային հանրային էջ, ծառայություններ և թիմի կառավարում մեկ վայրում։" },
            { title: "Կլինիկաներ", text: "Պացիենտների պարզ ամրագրման հոսք և կազմակերպված ժամանակացույց։" },
            { title: "Պրոֆեսիոնալ փորձ", text: "Խելացի օրացույց, մաքուր հանրային էջ և վստահելի առաջին տպավորություն։" },
        ],
        missionBadge: "Մեր առաքելությունը", missionTitle: "Օգնել ծառայողական բիզնեսներին գործել ավելի պրոֆեսիոնալ", missionText: "Մեր նպատակը պարզ է՝ ստեղծել հարթակ, որտեղ բիզնեսն ունի գեղեցիկ հանրային ներկայություն, իսկ հաճախորդը՝ արագ ու վստահելի ամրագրման ճանապարհ։",
        features: [
            { title: "Խելացի ամրագրում", text: "Արագ ամրագրման հոսք և ծառայության ու մասնագետի հարմար ընտրություն։" },
            { title: "Թիմի կառավարում", text: "Աշխատակիցների դերեր, հասանելիություն և կազմակերպված ժամանակացույց։" },
            { title: "Հանրային ներկայություն", text: "Յուրաքանչյուր բիզնեսի համար պրոֆեսիոնալ հանրային ներկայացում։" },
            { title: "Բարձրակարգ փորձ", text: "Մաքուր տեսք և UX, որը վստահություն է ստեղծում առաջին այցից։" },
        ],
    },
    ru: {
        badge: "О Vizit", heroLead: "Мы создаём", heroHighlight: "платформу онлайн-записи", heroTail: "для сервисного бизнеса",
        intro: "Vizit помогает салонам, клиникам и другим сервисным компаниям принимать онлайн-записи, создавать профессиональное цифровое присутствие и улучшать клиентский опыт.",
        start: "Начать бесплатно", pricing: "Посмотреть тарифы",
        audiences: [
            { title: "Салоны красоты", text: "Публичная страница бренда, услуги и управление командой в одном месте." },
            { title: "Клиники", text: "Удобная запись пациентов и организованное управление расписанием." },
            { title: "Профессиональный опыт", text: "Умный календарь, понятная публичная страница и сильное первое впечатление." },
        ],
        missionBadge: "Наша миссия", missionTitle: "Помогать сервисному бизнесу работать профессиональнее", missionText: "Мы создаём платформу, где бизнес получает профессиональное присутствие, а клиент — быстрый и надёжный путь к записи.",
        features: [
            { title: "Умная запись", text: "Быстрый процесс записи и удобный выбор услуги и специалиста." },
            { title: "Управление командой", text: "Роли сотрудников, доступность и организованное расписание." },
            { title: "Публичное присутствие", text: "Профессиональная публичная страница для каждого бизнеса." },
            { title: "Качественный опыт", text: "Чистый интерфейс и UX, который вызывает доверие с первого визита." },
        ],
    },
    en: {
        badge: "About Vizit", heroLead: "We are building a", heroHighlight: "booking platform", heroTail: "for service businesses",
        intro: "Vizit helps salons, clinics and other service businesses accept online bookings, build a professional digital presence and deliver a better customer experience.",
        start: "Start free", pricing: "View pricing",
        audiences: [
            { title: "Beauty salons", text: "A branded public page, services and team management in one place." },
            { title: "Clinics", text: "A simple patient booking flow and organized schedule management." },
            { title: "Professional experience", text: "A smart calendar, clear public page and strong first impression." },
        ],
        missionBadge: "Our mission", missionTitle: "Help service businesses operate more professionally", missionText: "We are creating a platform where businesses have a strong public presence and customers have a fast, reliable path to booking.",
        features: [
            { title: "Smart booking", text: "A fast booking flow with convenient service and provider selection." },
            { title: "Team management", text: "Staff roles, availability and an organized schedule." },
            { title: "Public presence", text: "A professional public profile for every business." },
            { title: "Premium experience", text: "A clean interface and UX that builds trust from the first visit." },
        ],
    },
};

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
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:p-6"
        >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white">
                {icon}
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{text}</p>
        </motion.div>
    );
}

export default function About() {
    const { locale } = useLanguage();
    const text = copy[locale];
    const audienceIcons = [<Building2 className="h-5 w-5" />, <Stethoscope className="h-5 w-5" />, <CalendarDays className="h-5 w-5" />];
    const featureIcons = [<CalendarDays className="h-5 w-5" />, <Users className="h-5 w-5" />, <Building2 className="h-5 w-5" />, <Sparkles className="h-5 w-5" />];
    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="show"
            className="vizit-public-page min-h-screen overflow-x-clip bg-slate-50 text-slate-950 transition-colors dark:bg-[#050816] dark:text-white"
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
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-200 dark:shadow-black/20"
                                >
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                    {text.badge}
                                </motion.div>

                                <motion.h1
                                    variants={fadeUp}
                                    className="mt-6 text-[2rem] font-semibold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-6xl"
                                >
                                    {text.heroLead} <span className="text-violet-600">{text.heroHighlight}</span> {text.heroTail}
                                </motion.h1>

                                <motion.p
                                    variants={fadeUp}
                                    className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg"
                                >
                                    {text.intro}
                                </motion.p>

                                <motion.div
                                    variants={fadeUp}
                                    className="mt-8 flex flex-col gap-3 sm:flex-row"
                                >
                                    <Link
                                        to="/register"
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-medium text-white transition hover:bg-violet-700"
                                    >
                                        {text.start}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <Link
                                        to="/pricing"
                                        className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/[0.12]"
                                    >
                                        {text.pricing}
                                    </Link>
                                </motion.div>
                            </div>

                            <motion.div variants={scaleIn}>
                                <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:p-6">
                                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.05] sm:p-5">
                                        <div className="grid gap-4">
                                            {text.audiences.map((item, index) => (
                                                <div
                                                    key={item.title}
                                                    className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.07]"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-400/15 dark:text-violet-200">
                                                            {audienceIcons[index]}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
                                                            <div className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</div>
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
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-200 dark:shadow-black/20">
                                <ShieldCheck className="h-4 w-4 text-violet-600" />
                                {text.missionBadge}
                            </div>

                            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                                {text.missionTitle}
                            </h2>

                            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                                {text.missionText}
                            </p>
                        </motion.div>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2 2xl:grid-cols-4">
                            {text.features.map((feature, index) => (
                                <FeatureCard key={feature.title} icon={featureIcons[index]} title={feature.title} text={feature.text} />
                            ))}
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </motion.div>
    );
}
