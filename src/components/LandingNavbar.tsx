import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { ArrowRight, CalendarDays, Menu, X } from "lucide-react";
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
            "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
            isActive
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        );

    return (
        <>
            <motion.header animate={{ y: isHeaderVisible ? 0 : -96 }} transition={{ duration: 0.22, ease: "easeOut" }} className="fixed inset-x-0 top-0 z-50">
                <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
                    <motion.div
                        initial={{ y: -14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.35 }}
                        className={cn(
                            "rounded-[22px] border transition-all duration-300 sm:rounded-[24px]",
                            isScrolled
                                ? "border-slate-200 bg-white/92 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/88 dark:shadow-black/30"
                                : "border-slate-200/70 bg-white/94 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/94"
                        )}
                    >
                        <div className="flex h-[54px] items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-5">
                            <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[16px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/20 sm:h-11 sm:w-11 sm:rounded-2xl">
                                    <CalendarDays className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                                </div>

                                <div className="min-w-0">
                                    <div className="truncate text-[15px] font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[17px]">
                                        Vizit
                                    </div>
                                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
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

                            <div className="hidden items-center gap-3 md:flex">
                                <LanguageToggle className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10" compact />
                                <ThemeToggle className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10" compact />
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10"
                                >
                                    {t("nav.login")}
                                </Link>

                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
                                >
                                    {t("nav.start")}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMobileOpen((prev) => !prev)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-[18px] border border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-600/20 transition hover:border-violet-700 hover:bg-violet-700 focus-visible:outline-violet-500 dark:border-violet-400 dark:bg-violet-500 dark:text-white dark:hover:border-violet-300 dark:hover:bg-violet-400 md:hidden sm:h-11 sm:w-11 sm:rounded-2xl"
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
                            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] md:hidden"
                        />

                        <motion.div
                            id="landing-mobile-menu"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                            className="fixed inset-x-0 top-[4.2rem] z-50 mx-3 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-4 pb-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-slate-950 md:hidden sm:mx-4 sm:top-[4.5rem]"
                        >
                            <div className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            cn(
                                                "rounded-2xl px-4 py-3 text-sm font-medium transition",
                                                isActive
                                                    ? "bg-violet-600 text-white"
                                                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                                            )
                                        }
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>

                            <div className="mt-4 grid gap-3">
                                <LanguageToggle className="text-slate-700 dark:text-white" />
                                <ThemeToggle className="justify-center border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white" />
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
                                >
                                    {t("nav.login")}
                                </Link>

                                <Link
                                    to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-medium text-white"
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
