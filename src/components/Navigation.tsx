import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Sparkles, Award, CalendarDays } from "lucide-react";

interface NavigationProps {
    isScrolled: boolean;
    selectedType?: 'beauty' | 'dental' | null;
}

const Navigation: React.FC<NavigationProps> = ({ isScrolled, selectedType }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Գլխավոր', path: '/' },
        { name: 'Գներ', path: '/pricing' },
        { name: 'Կապ', path: '/contact' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const getBusinessType = () => {
        const params = new URLSearchParams(location.search);
        return params.get('type') || selectedType || 'beauty';
    };

    const businessType = getBusinessType();

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white/90 backdrop-blur-lg shadow-sm py-2'
                        : 'bg-transparent py-4'
                }`}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md sm:h-10 sm:w-10 sm:rounded-[14px]">
                                <CalendarDays size={18} />
                            </div>
                            <span className="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-violet-700 transition-colors sm:text-xl">
                                Vizit
                            </span>
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-1 md:flex">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                                        isActive(item.path)
                                            ? 'text-violet-700 font-medium'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                    }`}
                                >
                                    {item.name}
                                    {isActive(item.path) && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute inset-0 rounded-full bg-violet-50 -z-10"
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop auth buttons */}
                        <div className="hidden items-center gap-2 md:flex">
                            <Link
                                to={`/login?type=${businessType}`}
                                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Մուտք
                            </Link>
                            <Link
                                to={`/register?type=${businessType}`}
                                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700"
                            >
                                Գրանցում
                            </Link>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 md:hidden"
                            aria-label="Բացել մենյուն"
                        >
                            <Menu size={20} className="text-slate-700" />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile full-screen menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="fixed right-0 top-0 z-50 flex h-full w-[min(85vw,320px)] flex-col bg-white shadow-2xl md:hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
                                        <CalendarDays size={15} />
                                    </div>
                                    <span className="font-semibold text-slate-900">Vizit</span>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 transition hover:bg-slate-50"
                                >
                                    <X size={18} className="text-slate-600" />
                                </button>
                            </div>

                            {/* Business type badge */}
                            <div className="border-b border-slate-100 px-5 py-3">
                                <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                                    {businessType === 'beauty'
                                        ? <><Sparkles size={13} /> Գեղեցկության սրահ</>
                                        : <><Award size={13} /> Ատամնաբուժական կլինիկա</>
                                    }
                                </div>
                            </div>

                            {/* Nav links */}
                            <nav className="flex-1 space-y-0.5 overflow-y-auto p-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center rounded-2xl px-4 py-3.5 text-base font-medium transition-all ${
                                            isActive(item.path)
                                                ? 'bg-violet-600 text-white'
                                                : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>

                            {/* Auth buttons */}
                            <div className="space-y-2 border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                                <Link
                                    to={`/login?type=${businessType}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex w-full items-center justify-center rounded-2xl border border-slate-200 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Մուտք
                                </Link>
                                <Link
                                    to={`/register?type=${businessType}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex w-full items-center justify-center rounded-2xl bg-violet-600 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700"
                                >
                                    Գրանցում
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;
