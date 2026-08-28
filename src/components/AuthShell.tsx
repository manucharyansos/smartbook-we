import type {ReactNode} from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, ShieldCheck, Sparkles } from "lucide-react";
import { fadeDown, fadeUp, pageTransition, scaleIn, staggerContainer, hoverLift } from "../lib/motion";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

type AuthShellProps = {
    title: string;
    subtitle: string;
    badge?: string;
    sideTitle: string;
    sideText: string;
    children: ReactNode;
    footer?: ReactNode;
};

export default function AuthShell({
                                      title,
                                      subtitle,
                                      badge = "Vizit access",
                                      sideTitle,
                                      sideText,
                                      children,
                                  footer,
                                  }: AuthShellProps) {
    const { locale } = useLanguage();
    const text = {
        hy: { home: "Գլխավոր", homeAria: "Վերադառնալ գլխավոր էջ", tagline: "Ամրագրման միջավայր", features: ["Հանրային ամրագրում և օրացույց", "Թիմի ու ծառայությունների կառավարում", "Մաքուր ու պրոֆեսիոնալ միջավայր"] },
        ru: { home: "Главная", homeAria: "Вернуться на главную", tagline: "Платформа онлайн-записи", features: ["Публичная запись и календарь", "Управление командой и услугами", "Понятное профессиональное пространство"] },
        en: { home: "Home", homeAria: "Return home", tagline: "Online booking platform", features: ["Public booking and calendar", "Staff and service management", "A clean professional workspace"] },
    }[locale];

    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="show"
            className="vizit-auth-shell relative min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_18%,#faf7ff_100%)]"
        >
            <div className="vizit-auth-decoration absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.10),transparent_26%)]" />
            <div className="vizit-auth-decoration absolute -top-20 left-[-80px] h-72 w-72 rounded-full bg-orange-200/20 blur-3xl" />
            <div className="vizit-auth-decoration absolute bottom-[-80px] right-[-60px] h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />

            <motion.div
                variants={fadeDown}
                className="absolute left-2.5 top-2.5 z-20 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-2 py-1.5 text-xs text-slate-700 shadow-sm backdrop-blur transition hover:border-violet-200 hover:bg-white sm:left-6 sm:top-6 sm:px-4 sm:py-2 sm:text-sm"
            >
                <Link to="/" className="inline-flex items-center gap-2" aria-label={text.homeAria}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{text.home}</span>
                </Link>
            </motion.div>

            <motion.div variants={fadeDown} className="vizit-auth-language-control absolute right-2.5 top-2.5 z-[100] overflow-visible rounded-full border border-white/70 bg-white/95 text-slate-700 shadow-sm backdrop-blur sm:right-6 sm:top-6">
                <LanguageToggle compact />
            </motion.div>

            <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-start gap-6 px-3 pb-8 pt-20 sm:gap-8 sm:px-6 sm:pb-12 sm:pt-24 lg:px-8 2xl:grid-cols-[0.95fr_1.05fr] 2xl:items-center">
                <motion.div
                    variants={staggerContainer(0.08, 0.05)}
                    className="hidden 2xl:block"
                >
                    <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm backdrop-blur">
                        <ShieldCheck className="h-4 w-4" />
                        {badge}
                    </motion.div>

                    <motion.div variants={fadeUp} className="mt-8 max-w-xl">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
                                <CalendarDays className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-semibold tracking-tight text-slate-950">
                                    Vizit
                                </div>
                                <div className="text-sm text-slate-500">
                                    {text.tagline}
                                </div>
                            </div>
                        </Link>

                        <h1 className="mt-8 text-5xl font-semibold leading-tight tracking-tight text-slate-950">
                            {sideTitle}
                        </h1>
                        <p className="mt-5 text-lg leading-8 text-slate-600">
                            {sideText}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer(0.08, 0.15)}
                        className="mt-10 grid gap-4"
                    >
                        {text.features.map((item) => (
                            <motion.div
                                key={item}
                                variants={scaleIn}
                                {...hoverLift}
                                className="flex items-start gap-3 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur"
                            >
                                <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div className="text-sm leading-7 text-slate-600">{item}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div variants={scaleIn} className="relative">
                    <div className="rounded-[28px] border border-white/70 bg-white/86 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[34px] sm:p-5 xl:p-6 2xl:min-h-[740px]">
                        <div className="rounded-[20px] bg-[linear-gradient(135deg,#fff7ed_0%,#faf5ff_55%,#ffffff_100%)] p-1.5 sm:rounded-[28px] sm:p-4 xl:p-6">
                            <div className="rounded-[18px] border border-white/70 bg-white/90 p-4 shadow-sm sm:rounded-[26px] sm:p-6 xl:p-8">
                                <motion.div variants={fadeUp} className="text-center">
                                    <Link to="/" className="inline-flex items-center gap-3 xl:hidden max-w-full">
                                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
                                            <CalendarDays className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-semibold text-slate-950">Vizit</div>
                                            <div className="text-xs text-slate-500">{text.tagline}</div>
                                        </div>
                                    </Link>

                                    <h2 className="mt-5 break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                        {title}
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-500 sm:leading-7">
                                        {subtitle}
                                    </p>
                                </motion.div>

                                <motion.div variants={fadeUp} className="mt-8">
                                    {children}
                                </motion.div>

                                {footer ? (
                                    <motion.div variants={fadeUp} className="mt-8">
                                        {footer}
                                    </motion.div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
