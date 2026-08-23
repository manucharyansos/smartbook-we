import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { ArrowRight, Heart, Menu, X } from "lucide-react";
import { cn } from "../lib/cn";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "../contexts/LanguageContext";

export default function LandingNavbar() {
    const { t } = useLanguage();
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navItems = [
        { to: "/", label: t("nav.home"), end: true },
        { to: "/pricing", label: t("nav.pricing") },
        { to: "/about", label: t("nav.about") },
        { to: "/contact", label: t("nav.contact") },
    ];

    useEffect(() => {
        const unsubscribe = scrollY.on("change", (latest) => {
            const previous = scrollY.getPrevious() ?? 0;
            setIsScrolled(latest > 12);
            setIsHeaderVisible(latest < 90 || latest < previous || mobileOpen);
        });
        return () => unsubscribe();
    }, [scrollY, mobileOpen]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const navClass = ({ isActive }: { isActive: boolean }) =>
        cn(
            "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            isActive
                ? "bg-[#f5e5cf] text-[#2b0d35]"
                : "text-slate-600 hover:bg-[#f8eee4] hover:text-[#2b0d35] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        );

    return (
        <>
            <motion.header animate={{ y: isHeaderVisible ? 0 : -96 }} transition={{ duration: 0.22, ease: "easeOut" }} className="fixed inset-x-0 top-0 z-50">
                <div className="mx-auto max-w-[1420px] px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
                    <motion.div
                        initial={{ y: -14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.35 }}
                        className={cn(
                            "rounded-[22px] border transition-all duration-300 sm:rounded-[24px]",
                            isScrolled
                                ? "border-[#d29a45]/25 bg-[#fffaf5]/92 shadow-[0_18px_50px_rgba(68,33,46,0.09)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1d1220]/90 dark:shadow-black/30"
                                : "border-[#d29a45]/20 bg-[#fffaf5]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#1d1220]/90"
                        )}
                    >
                        <div className="flex h-[54px] items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-5">
                            <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[15px] border border-[#d29a45]/35 bg-[#fff7ec] text-[#c88e37] shadow-[0_8px_24px_rgba(210,154,69,0.18)] sm:h-11 sm:w-11 sm:rounded-2xl dark:bg-white/10">
                                    <Heart className="h-[19px] w-[19px] sm:h-[22px] sm:w-[22px]" strokeWidth={2.4} />
                                </div>

                                <div className="min-w-0">
                                    <div className="truncate text-[18px] font-black tracking-[-0.035em] text-[#2b0d35] dark:text-white sm:text-[21px]">
                                        Vizit.am
                                    </div>
                                    <div className="hidden truncate text-[11px] font-medium text-[#8d7c84] sm:block">
                                        {t("nav.tagline")}
                                    </div>
                                </div>
                            </Link>

                            <nav className="hidden items-center gap-1 md:flex">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        className={navClass}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="hidden items-center gap-2 md:flex lg:gap-3">
                                <LanguageToggle className="border-[#d29a45]/20 bg-[#fffaf5] text-[#4b3a50] hover:bg-[#f8eee4] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10" compact />
                                <ThemeToggle className="border-[#d29a45]/20 bg-[#fffaf5] text-[#4b3a50] hover:bg-[#f8eee4] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10" compact />
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-full border border-[#d29a45]/40 bg-[#fffaf5] px-5 py-2.5 text-sm font-semibold text-[#3d2842] transition hover:bg-[#f8eee4] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10"
                                >
                                    {t("nav.login")}
                                </Link>

                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2b0d35] to-[#6d2a63] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(74,22,74,0.22)] transition hover:brightness-110"
                                >
                                    {t("nav.start")}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMobileOpen((prev) => !prev)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-[18px] border border-[#d29a45]/40 bg-gradient-to-br from-[#2b0d35] to-[#6d2a63] text-white shadow-[0_10px_24px_rgba(74,22,74,0.22)] transition hover:brightness-110 md:hidden sm:h-11 sm:w-11 sm:rounded-2xl"
                                aria-label={t("nav.openMenu")}
                                aria-expanded={mobileOpen}
                                aria-controls="landing-mobile-menu"
                            >
                                {mobileOpen ? <X className="h-[18px] w-[18px] sm:h-5 sm:w-5" /> : <Menu className="h-[18px] w-[18px] sm:h-5 sm:w-5" />}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.header>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-40 bg-[#1b1020]/35 backdrop-blur-[3px] md:hidden"
                        />

                        <motion.div
                            id="landing-mobile-menu"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                            className="fixed inset-x-0 top-[4.2rem] z-50 mx-3 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-[24px] border border-[#d29a45]/25 bg-[#fffaf5] p-4 pb-5 shadow-[0_24px_80px_rgba(68,33,46,0.16)] dark:border-white/10 dark:bg-[#1d1220] md:hidden sm:mx-4 sm:top-[4.5rem]"
                        >
                            <div className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            cn(
                                                "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                                                isActive
                                                    ? "bg-[#f5e5cf] text-[#2b0d35]"
                                                    : "text-[#5e5062] hover:bg-[#f8eee4] dark:text-slate-200 dark:hover:bg-white/10"
                                            )
                                        }
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>

                            <div className="mt-4 grid gap-3">
                                <LanguageToggle className="text-[#4b3a50] dark:text-white" />
                                <ThemeToggle className="justify-center border-[#d29a45]/20 bg-[#fffaf5] text-[#4b3a50] dark:border-white/10 dark:bg-white/[0.06] dark:text-white" />
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center justify-center rounded-2xl border border-[#d29a45]/25 bg-white px-5 py-3 text-sm font-semibold text-[#4b3a50] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
                                >
                                    {t("nav.login")}
                                </Link>

                                <Link
                                    to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2b0d35] to-[#6d2a63] px-5 py-3 text-sm font-semibold text-white"
                                >
                                    {t("nav.start")}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
