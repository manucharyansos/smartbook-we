import type {ReactNode} from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { fadeDown, fadeUp, pageTransition, scaleIn, staggerContainer, hoverLift } from "../lib/motion";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import VizitLogo from "./VizitLogo";

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
                                      badge,
                                      sideTitle,
                                      sideText,
                                      children,
                                  footer,
                                  }: AuthShellProps) {
    const { locale } = useLanguage();
    const text = {
        hy: { home: "Գլխավոր", homeAria: "Վերադառնալ գլխավոր էջ", defaultBadge: "Vizit-ի անվտանգ մուտք", tagline: "Ամրագրման միջավայր", features: ["Հանրային ամրագրում և օրացույց", "Թիմի ու ծառայությունների կառավարում", "Մաքուր ու պրոֆեսիոնալ միջավայր"] },
        ru: { home: "Главная", homeAria: "Вернуться на главную", defaultBadge: "Безопасный вход в Vizit", tagline: "Платформа онлайн-записи", features: ["Публичная запись и календарь", "Управление командой и услугами", "Понятное профессиональное пространство"] },
        en: { home: "Home", homeAria: "Return home", defaultBadge: "Secure Vizit access", tagline: "Online booking platform", features: ["Public booking and calendar", "Staff and service management", "A clean professional workspace"] },
    }[locale];
    const resolvedBadge = badge ?? text.defaultBadge;

    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="show"
            className="vizit-auth-shell relative min-h-screen overflow-x-clip"
        >
            <div className="vizit-auth-backdrop absolute inset-0" aria-hidden="true" />
            <div className="vizit-auth-glow vizit-auth-glow-left absolute -top-20 left-[-80px] h-72 w-72 rounded-full blur-3xl" aria-hidden="true" />
            <div className="vizit-auth-glow vizit-auth-glow-right absolute bottom-[-80px] right-[-60px] h-80 w-80 rounded-full blur-3xl" aria-hidden="true" />

            <motion.div
                variants={fadeDown}
                className="vizit-auth-back-link absolute left-2.5 top-2.5 z-20 inline-flex items-center gap-2 rounded-xl border px-2 py-1.5 text-xs shadow-sm backdrop-blur transition sm:left-6 sm:top-6 sm:px-4 sm:py-2 sm:text-sm"
            >
                <Link to="/" className="inline-flex items-center gap-2" aria-label={text.homeAria}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{text.home}</span>
                </Link>
            </motion.div>

            <motion.div variants={fadeDown} className="vizit-auth-language-control absolute right-2.5 top-2.5 z-[100] flex items-center gap-1 overflow-visible rounded-xl border p-1 shadow-sm backdrop-blur sm:right-6 sm:top-6">
                <LanguageToggle compact />
                <ThemeToggle
                    compact
                    className="h-10 w-10 shadow-none sm:h-11 sm:w-11"
                />
            </motion.div>

            <div className="vizit-auth-layout relative z-10 mx-auto grid min-h-screen max-w-[1320px] items-start gap-6 px-3 pb-8 pt-20 sm:gap-8 sm:px-6 sm:pb-12 sm:pt-24 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-10 lg:px-8 2xl:items-center">
                <motion.div
                    variants={staggerContainer(0.08, 0.05)}
                    className="vizit-auth-aside hidden min-w-0 lg:block"
                >
                    <motion.div variants={fadeUp} className="vizit-auth-badge inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
                        <ShieldCheck className="h-4 w-4" />
                        {resolvedBadge}
                    </motion.div>

                    <motion.div variants={fadeUp} className="mt-8 max-w-xl">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <VizitLogo markClassName="!h-14 !w-14" textClassName="!text-2xl !text-white" />
                            <div>
                                <div className="text-sm text-[#a9c2d6]">
                                    {text.tagline}
                                </div>
                            </div>
                        </Link>

                        <h1 className="vizit-auth-side-title mt-8 text-5xl font-semibold leading-tight tracking-tight">
                            {sideTitle}
                        </h1>
                        <p className="vizit-auth-side-copy mt-5 text-lg leading-8">
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
                                className="vizit-auth-feature flex items-start gap-3 rounded-2xl border p-5 shadow-sm backdrop-blur"
                            >
                                <div className="vizit-auth-feature-icon mt-0.5 grid h-10 w-10 place-items-center rounded-xl">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div className="text-sm leading-7">{item}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div variants={scaleIn} className="relative mx-auto w-full max-w-[780px] min-w-0 lg:mx-0 lg:justify-self-end">
                    <div className="vizit-auth-card rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:p-7 xl:p-9">
                            <div className="vizit-auth-card-content">
                                <motion.div variants={fadeUp} className="text-center">
                                    <Link to="/" className="inline-flex max-w-full items-center gap-3 lg:hidden">
                                        <VizitLogo markClassName="!h-12 !w-12" textClassName="!text-lg" />
                                        <div className="text-left">
                                            <div className="vizit-auth-card-tagline text-xs">{text.tagline}</div>
                                        </div>
                                    </Link>

                                    <h2 className="vizit-auth-card-title mt-5 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                                        {title}
                                    </h2>
                                    <p className="vizit-auth-card-subtitle mt-3 text-sm leading-6 sm:leading-7">
                                        {subtitle}
                                    </p>
                                </motion.div>

                                <motion.div variants={fadeUp} className="mt-8">
                                    {children}
                                </motion.div>

                                {footer ? (
                                    <motion.div variants={fadeUp} className="vizit-auth-footer mt-8">
                                        {footer}
                                    </motion.div>
                                ) : null}
                            </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
