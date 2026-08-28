import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

import { useLanguage } from "../contexts/LanguageContext";
import { cn } from "../lib/cn";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import VizitLogo from "./VizitLogo";

type LandingNavbarProps = {
  audience?: "consumer" | "business";
};

const businessNavCopy = {
  hy: { marketplace: "Հաճախորդների համար", solutions: "Ուղղություններ", features: "Հնարավորություններ", workflow: "Ինչպես է աշխատում" },
  ru: { marketplace: "Для клиентов", solutions: "Решения", features: "Возможности", workflow: "Как работает" },
  en: { marketplace: "For customers", solutions: "Solutions", features: "Features", workflow: "How it works" },
} as const;

export default function LandingNavbar({ audience = "consumer" }: LandingNavbarProps) {
  const { t, locale } = useLanguage();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const businessText = businessNavCopy[locale];
  const navItems = audience === "business"
    ? [
        { href: "/", label: businessText.marketplace, route: true },
        { href: "/business#solutions", label: businessText.solutions },
        { href: "/business#features", label: businessText.features },
        { href: "/business#workflow", label: businessText.workflow },
        { href: "/pricing", label: t("nav.pricing"), route: true },
      ]
    : [
        { href: "/#categories", label: t("nav.services") },
        { href: "/#businesses", label: t("nav.businesses") },
        { href: "/#map", label: t("nav.map") },
        { href: "/#how", label: t("nav.how") },
        { href: "/business", label: t("nav.forBusiness"), route: true },
        { href: "/pricing", label: t("nav.pricing"), route: true },
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

  return (
    <>
      <motion.header
        animate={{ y: isHeaderVisible ? 0 : -96 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="vizit-landing-header fixed inset-x-0 top-0 z-50"
      >
        <div className="mx-auto max-w-[1420px] px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
          <motion.div
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className={cn("vizit-header-shell", isScrolled && "is-scrolled")}
          >
            <div className="vizit-header-row">
              <Link to="/" className="vizit-header-brand min-w-0" aria-label="Vizit">
                <VizitLogo />
              </Link>

              <nav className="vizit-desktop-nav hidden items-center gap-1 md:flex" aria-label={t("footer.navigation")}>
                {navItems.map((item) => item.route ? (
                  <Link key={item.href} to={item.href} className="vizit-nav-link">{item.label}</Link>
                ) : (
                  <a key={item.href} href={item.href} className="vizit-nav-link">{item.label}</a>
                ))}
              </nav>

              <div className="vizit-header-actions hidden items-center gap-2 md:flex lg:gap-3">
                <LanguageToggle className="vizit-header-control" compact />
                <ThemeToggle className="vizit-header-control" compact />
                <Link to="/login" className="vizit-header-login">{t("nav.login")}</Link>
                <Link to="/register" className="vizit-primary-action">
                  {t("nav.start")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="vizit-mobile-header-actions flex items-center gap-1.5">
                <LanguageToggle className="vizit-mobile-header-language" compact />
                <button
                  type="button"
                  onClick={() => setMobileOpen((current) => !current)}
                  className="vizit-menu-button"
                  aria-label={t("nav.openMenu")}
                  aria-expanded={mobileOpen}
                  aria-controls="landing-mobile-menu"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen ? (
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
              className="vizit-mobile-menu fixed inset-x-0 top-[4.2rem] z-50 mx-3 max-h-[calc(100vh-5rem)] overflow-y-auto p-4 pb-5 md:hidden sm:mx-4 sm:top-[4.5rem]"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => item.route ? (
                  <Link key={item.href} to={item.href} className="vizit-mobile-nav-link" onClick={() => setMobileOpen(false)}>{item.label}</Link>
                ) : (
                  <a key={item.href} href={item.href} className="vizit-mobile-nav-link" onClick={() => setMobileOpen(false)}>{item.label}</a>
                ))}
              </div>

              <div className="mt-4 grid gap-3">
                <LanguageToggle className="vizit-mobile-language" />
                <ThemeToggle className="vizit-mobile-theme" />
                <Link to="/login" onClick={() => setMobileOpen(false)} className="vizit-mobile-login">{t("nav.login")}</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="vizit-primary-action min-h-12 rounded-2xl">
                  {t("nav.start")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
