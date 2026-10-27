import { isRentalBusiness } from "../lib/rentalApi";
import { rentalCopy } from "../i18n/rentals";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, CalendarDays, LogOut, Menu, Scissors, Users,
  LayoutDashboard, Settings, ChevronRight, Sparkles, X,
  PanelLeftClose, PanelLeftOpen, Award, Gift, Star, Landmark,
  ClipboardList, Contact, Megaphone, type LucideProps,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useAuth } from "../store/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFeatures, hasFeature } from "../lib/featuresApi";
import ThemeToggle from "../components/ThemeToggle";
import LanguageToggle from "../components/LanguageToggle";
import VizitLogo from "../components/VizitLogo";
import { useLanguage } from "../contexts/LanguageContext";
import { TelegramConnectionCard } from "../components/TelegramConnectionCard";

type NavItem = {
  to: string; label: string;
  icon: React.ComponentType<LucideProps>;
  feature?: string;
};

const baseNavItems: NavItem[] = [
  { to: "/app/dashboard", label: "Վահանակ", icon: LayoutDashboard },
  { to: "/app/calendar", label: "Օրացույց", icon: CalendarDays },
  { to: "/app/services", label: "Ծառայություններ", icon: Scissors },
  { to: "/app/staff", label: "Աշխատակիցներ", icon: Users },
  { to: "/app/clients", label: "Հաճախորդներ", icon: Contact },
  { to: "/app/tasks", label: "Ամրագրումների վահանակ", icon: ClipboardList, feature: "tasks" },
  { to: "/app/analytics", label: "Վերլուծություն", icon: BarChart3, feature: "analytics" },
  { to: "/app/billing", label: "Պլան", icon: Landmark },
  { to: "/app/settings", label: "Կարգավորումներ", icon: Settings },
];

const mobileBottomPaths = ["/app/dashboard", "/app/calendar", "/app/services", "/app/clients"];

// Shared token classes for the workspace chrome (work in light and dark themes).
const iconButton =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)] transition hover:bg-[var(--vz-surface-2)] hover:text-[var(--vz-text)]";
const chromeToggle =
  "border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)] hover:bg-[var(--vz-surface-2)] hover:text-[var(--vz-text)]";
const navLinkBase = "flex items-center rounded-xl text-sm font-medium transition-colors";
const navLinkIdle = "text-[var(--vz-text-secondary)] hover:bg-[var(--vz-surface-2)] hover:text-[var(--vz-text)]";
const navLinkActive = "bg-[var(--vz-accent-soft)] font-semibold text-[var(--vz-accent-text)]";

const workspaceCopy = {
  hy: {
    growth: "Աճ",
    nav: { "/app/dashboard": "Վահանակ", "/app/calendar": "Օրացույց", "/app/services": "Ծառայություններ", "/app/staff": "Աշխատակիցներ", "/app/clients": "Հաճախորդներ", "/app/tasks": "Ամրագրումների վահանակ", "/app/analytics": "Վերլուծություն", "/app/billing": "Պլան", "/app/settings": "Կարգավորումներ" },
    medicalNav: { "/app/services": "Բժշկական ծառայություններ", "/app/staff": "Բժիշկներ և թիմ", "/app/clients": "Պացիենտներ", "/app/tasks": "Այցերի վահանակ" },
    giftCards: "Նվերի քարտեր", loyalty: "Լոյալություն", more: "Ավելին", logout: "Ելք", navigation: "Նավիգացիա", menu: "Մենյու", openMenu: "Բացել մենյուն", closeMenu: "Փակել մենյուն", loading: "Բեռնվում է…", workspace: "Աշխատանքային միջավայր", owner: "Սեփականատեր", manager: "Կառավարիչ", staff: "Աշխատակից", superAdmin: "Սուպեր ադմին", healthcare: "Առողջապահություն", services: "Ծառայություններ", trial: "Փորձաշրջան", daysLeft: "օր մնաց", expand: "Բացել կողային վահանակը", collapse: "Փոքրացնել կողային վահանակը", hintTitle: "Արագ սկիզբ", hintText: "Ավելացրեք ծառայությունները, բժիշկներին և նրանց աշխատաժամերը, ապա ընդունեք առաջին այցը։", hintTextServices: "Ավելացրեք ծառայությունները, աշխատակիցներին և նրանց աշխատաժամերը, ապա ընդունեք առաջին ամրագրումը։",
  },
  ru: {
    growth: "Рост",
    nav: { "/app/dashboard": "Панель", "/app/calendar": "Календарь", "/app/services": "Услуги", "/app/staff": "Сотрудники", "/app/clients": "Клиенты", "/app/tasks": "Панель записей", "/app/analytics": "Аналитика", "/app/billing": "Тариф", "/app/settings": "Настройки" },
    medicalNav: { "/app/services": "Медицинские услуги", "/app/staff": "Врачи и команда", "/app/clients": "Пациенты", "/app/tasks": "Панель визитов" },
    giftCards: "Подарочные карты", loyalty: "Лояльность", more: "Ещё", logout: "Выйти", navigation: "Навигация", menu: "Меню", openMenu: "Открыть меню", closeMenu: "Закрыть меню", loading: "Загрузка…", workspace: "Рабочее пространство", owner: "Владелец", manager: "Менеджер", staff: "Сотрудник", superAdmin: "Суперадмин", healthcare: "Здравоохранение", services: "Услуги", trial: "Пробный период", daysLeft: "дн. осталось", expand: "Развернуть боковую панель", collapse: "Свернуть боковую панель", hintTitle: "Быстрый старт", hintText: "Добавьте услуги, врачей и их расписание, затем примите первый визит.", hintTextServices: "Добавьте услуги, сотрудников и их расписание, затем примите первую запись.",
  },
  en: {
    growth: "Growth",
    nav: { "/app/dashboard": "Dashboard", "/app/calendar": "Calendar", "/app/services": "Services", "/app/staff": "Staff", "/app/clients": "Clients", "/app/tasks": "Booking board", "/app/analytics": "Analytics", "/app/billing": "Plan", "/app/settings": "Settings" },
    medicalNav: { "/app/services": "Medical services", "/app/staff": "Doctors & team", "/app/clients": "Patients", "/app/tasks": "Visit board" },
    giftCards: "Gift cards", loyalty: "Loyalty", more: "More", logout: "Log out", navigation: "Navigation", menu: "Menu", openMenu: "Open menu", closeMenu: "Close menu", loading: "Loading…", workspace: "Workspace", owner: "Owner", manager: "Manager", staff: "Staff", superAdmin: "Super admin", healthcare: "Healthcare", services: "Services", trial: "Trial", daysLeft: "days left", expand: "Expand sidebar", collapse: "Collapse sidebar", hintTitle: "Quick start", hintText: "Add services, doctors and their schedules, then accept the first visit.", hintTextServices: "Add services, staff and their schedules, then accept the first booking.",
  },
} as const;

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, clear } = useAuth();
  const { locale } = useLanguage();
  const text = workspaceCopy[locale];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    try { return localStorage.getItem("bb_app_sidebar_collapsed") === "1"; }
    catch { return false; }
  });

  const featuresQ = useQuery({ queryKey: ["features"], queryFn: fetchFeatures, staleTime: 60_000, retry: 1 });
  const features = featuresQ.data;
  const businessValue = String(user?.vertical ?? user?.business_type ?? "").toLowerCase();
  const isRental = isRentalBusiness(user);
  const rentalText = rentalCopy[locale];
  const isHealthcare = ["healthcare", "dental", "clinic", "medical", "doctor", "health"].includes(businessValue);

  const navItems = useMemo(() => {
    let items: NavItem[] = baseNavItems.map((item) => {
      const healthcareLabel = isHealthcare
        ? (text.medicalNav as Partial<Record<string, string>>)[item.to]
        : undefined;
      return { ...item, label: healthcareLabel ?? text.nav[item.to as keyof typeof text.nav] ?? item.label };
    });
    if (isRental) {
      items = items.filter((item) => !["/app/services", "/app/staff", "/app/tasks"].includes(item.to));
      const labels: Record<string, string> = { "/app/dashboard": rentalText.dashboard, "/app/calendar": rentalText.calendar, "/app/analytics": rentalText.analytics, "/app/settings": rentalText.settings };
      items = items.map((item) => ({ ...item, label: labels[item.to] || item.label }));
    }
    items = items.filter((i) => !i.feature || hasFeature(features, i.feature));
    if (user?.role === "staff") {
      const allowed = new Set(["/app/dashboard", "/app/calendar", "/app/tasks"]);
      items = items.filter((i) => allowed.has(i.to));
    }
    const insertBeforeSettings = (item: NavItem) => {
      const idx = items.findIndex((x) => x.to === "/app/settings");
      if (idx >= 0) items.splice(idx, 0, item); else items.push(item);
    };
    if (hasFeature(features, "gift_cards")) insertBeforeSettings({ to: "/app/gift-cards", label: text.giftCards, icon: Gift, feature: "gift_cards" });
    if (hasFeature(features, "loyalty")) insertBeforeSettings({ to: "/app/loyalty", label: text.loyalty, icon: Star, feature: "loyalty" });
    if (hasFeature(features, "waitlist")) insertBeforeSettings({ to: "/app/growth", label: text.growth, icon: Megaphone, feature: "waitlist" });
    return items;
  }, [features, isHealthcare, isRental, rentalText, text, user?.role]);

  const bottomNavItems = useMemo(() => navItems.filter((i) => (mobileBottomPaths.includes(i.to) || (isRental && i.to === "/app/analytics"))), [navItems, isRental]);

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("bb_app_sidebar_collapsed", isDesktopCollapsed ? "1" : "0"); } catch { /* storage can be disabled */ }
  }, [isDesktopCollapsed]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const preloadBusinessPages = () => {
      void Promise.allSettled([
        import("../pages/Dashboard"),
        import("../pages/Calendar"),
        import("../pages/Services"),
        import("../pages/Staff"),
        import("../pages/Clients"),
        import("../pages/Tasks"),
        import("../pages/Analytics"),
        import("../pages/GiftCards"),
        import("../pages/Loyalty"),
        import("../pages/Growth"),
        import("../pages/BusinessSettings"),
        import("../pages/Billing"),
      ]);
    };

    const timerId = globalThis.setTimeout(preloadBusinessPages, 250);
    return () => globalThis.clearTimeout(timerId);
  }, []);

  function handleLogout() {
    clear();
    try { localStorage.removeItem("bb_auth"); } catch { /* storage can be disabled */ }
    queryClient.clear();
    window.location.replace("/login");
  }

  const getRoleDisplay = () => {
    switch (user?.role) {
      case "owner": return text.owner;
      case "manager": return text.manager;
      case "staff": return text.staff;
      case "super_admin": return text.superAdmin;
      default: return user?.role ?? "";
    }
  };

  const businessTypeUi = useMemo(
    () => isRental ? { label: rentalText.title, icon: Landmark } : isHealthcare ? { label: text.healthcare, icon: Award } : { label: text.services, icon: Sparkles },
    [isRental, rentalText.title, isHealthcare, text.healthcare, text.services]
  );
  const BusinessTypeIcon = businessTypeUi?.icon ?? Sparkles;
  const hintText = isRental ? rentalText.subscriptionHelp : isHealthcare ? text.hintText : text.hintTextServices;

  const subscription = features?.subscription;
  const subscriptionLabel = subscription?.status
    ? subscription.status === "trialing" && typeof subscription.days_left === "number"
      ? `${text.trial} · ${Math.round(subscription.days_left)} ${text.daysLeft}`
      : features?.plan_code ? `${features.plan_code}` : subscription.status
    : null;
  const isTrial = subscription?.status === "trialing";
  const subscriptionPill = cn(
    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
    isTrial ? "bg-[var(--vz-highlight-soft)] text-[var(--vz-highlight-text)]" : "bg-[var(--vz-accent-soft)] text-[var(--vz-accent-text)]",
  );

  return (
    <div className="vizit-admin-shell min-h-screen w-full bg-[var(--vz-page)] text-[var(--vz-text)]">
      {/* HEADER */}
      <motion.header
        initial={{ y: -90 }} animate={{ y: 0 }}
        className={cn(
          "vizit-admin-header sticky top-0 z-30 border-b border-[var(--vz-line)] bg-[var(--vz-surface)] transition-shadow duration-300",
          isScrolled && "shadow-[var(--vz-shadow-sm)]",
        )}
      >
        <div className="mx-auto max-w-[1540px] px-3 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-3 sm:h-[72px]">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {/* Desktop sidebar collapse */}
              <button type="button" onClick={() => setIsDesktopCollapsed((v) => !v)}
                className={cn(iconButton, "hidden xl:inline-flex")}
                aria-label={isDesktopCollapsed ? text.expand : text.collapse}
              >
                {isDesktopCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
              {/* Mobile hamburger */}
              <motion.button type="button" whileTap={{ scale: 0.95 }}
                className={cn(iconButton, "xl:hidden")}
                onClick={() => setIsMobileMenuOpen(true)} aria-label={text.openMenu}
              >
                <Menu size={20} />
              </motion.button>
              {/* Logo */}
              <button type="button"
                className="flex min-w-0 items-center gap-2 sm:gap-3"
                onClick={() => navigate("/app/dashboard")}
              >
                <VizitLogo markClassName="!h-9 !w-9 sm:!h-10 sm:!w-10" textClassName="!text-[17px] sm:!text-[20px]" />
                <span className="hidden max-w-[160px] truncate text-left text-xs text-[var(--vz-muted)] sm:block">{user?.business_name || text.workspace}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {businessTypeUi && (
                <div className="hidden items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 py-1.5 text-xs text-[var(--vz-text-secondary)] md:flex">
                  <BusinessTypeIcon size={14} className="text-[var(--vz-accent-text)]" aria-hidden="true" />
                  <span>{businessTypeUi.label}</span>
                </div>
              )}
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold text-[var(--vz-text)]">{user?.name || "—"}</div>
                <div className="mt-0.5 flex items-center justify-end gap-2">
                  <span className="text-xs text-[var(--vz-muted)]">{getRoleDisplay()}</span>
                  {subscriptionLabel ? <span className={subscriptionPill}>{subscriptionLabel}</span> : null}
                </div>
              </div>
              <ThemeToggle compact className={chromeToggle} />
              <LanguageToggle compact className={cn("vizit-workspace-language rounded-full", chromeToggle)} />
              <motion.button type="button" whileTap={{ scale: 0.96 }}
                className="hidden h-10 items-center gap-2 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 text-sm font-medium text-[var(--vz-text-secondary)] transition hover:bg-[var(--vz-surface-2)] hover:text-[var(--vz-text)] sm:inline-flex sm:px-4"
                onClick={handleLogout}
              >
                <LogOut size={16} aria-hidden="true" /><span className="hidden sm:inline">{text.logout}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* BODY */}
      <div className="mx-auto w-full max-w-[1540px] px-3 pb-24 pt-3 sm:px-6 sm:pb-8 sm:pt-5 xl:py-6">
        <div className={cn("grid gap-4 transition-all duration-300 xl:gap-5", isDesktopCollapsed ? "xl:grid-cols-[76px_1fr]" : "xl:grid-cols-[248px_1fr]")}>

          {/* DESKTOP SIDEBAR */}
          <aside className="vizit-admin-sidebar hidden xl:block">
            <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24 space-y-4">
              <div className={cn("rounded-[22px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-3 shadow-[var(--vz-shadow-sm)]", isDesktopCollapsed && "px-2")}>
                <div className={cn("mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vz-muted)]", isDesktopCollapsed && "text-center text-[10px]")}>
                  {isDesktopCollapsed ? text.menu.slice(0, 3) : text.navigation}
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink key={item.to} to={item.to}
                      className={({ isActive }) => cn(
                        "vizit-workspace-nav-link min-h-11",
                        navLinkBase,
                        isDesktopCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5",
                        isActive ? navLinkActive : navLinkIdle,
                      )}
                      title={isDesktopCollapsed ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon size={18} aria-hidden="true" />
                          {!isDesktopCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                          {isActive && !isDesktopCollapsed && <ChevronRight size={16} aria-hidden="true" />}
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
              {!isDesktopCollapsed && (
                <>
                  <TelegramConnectionCard variant="sidebar" />
                  <div className="rounded-[22px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-4 shadow-[var(--vz-shadow-sm)]">
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--vz-highlight-soft)] text-[var(--vz-highlight-text)]">
                        <Sparkles size={16} aria-hidden="true" />
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-semibold text-[var(--vz-text)]">{text.hintTitle}</div>
                        <div className="text-xs leading-relaxed text-[var(--vz-muted)]">{hintText}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </aside>

          {/* MOBILE DRAWER */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/45 xl:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { type: "spring", damping: 28, stiffness: 220 } }}
                  exit={{ x: -300, opacity: 0, transition: { duration: 0.2 } }}
                  className="vizit-workspace-drawer fixed left-0 top-0 z-50 flex h-full w-[min(88vw,320px)] flex-col border-r border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text)] shadow-2xl xl:hidden"
                  role="dialog" aria-modal="true" aria-label={text.menu}
                >
                  {/* Drawer header */}
                  <div className="flex items-center justify-between border-b border-[var(--vz-line)] px-4 py-4">
                    <div className="min-w-0">
                      <VizitLogo markClassName="!h-8 !w-8" textClassName="!text-[17px]" />
                      <div className="mt-1.5 max-w-[200px] truncate pl-1 text-xs text-[var(--vz-muted)]">{user?.business_name || text.workspace}</div>
                    </div>
                    <button type="button" onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(iconButton, "h-9 w-9")}
                      aria-label={text.closeMenu}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {/* Role and subscription */}
                  <div className="flex items-center justify-between border-b border-[var(--vz-divider)] px-4 py-3">
                    <span className="text-xs text-[var(--vz-muted)]">{user?.name ? `${user.name} · ` : ""}{getRoleDisplay()}</span>
                    {subscriptionLabel ? <span className={subscriptionPill}>{subscriptionLabel}</span> : null}
                  </div>
                  {/* Nav links */}
                  <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vz-muted)]">{text.navigation}</div>
                    {navItems.map((item) => (
                      <NavLink key={item.to} to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => cn("min-h-12 gap-3 px-3 py-2", navLinkBase, isActive ? navLinkActive : navLinkIdle)}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"><item.icon size={18} aria-hidden="true" /></span>
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                      </NavLink>
                    ))}
                    <div className="px-1 pb-2 pt-3">
                      <TelegramConnectionCard variant="drawer" />
                    </div>
                  </nav>
                  {/* Footer */}
                  <div className="border-t border-[var(--vz-line)] p-3">
                    <div className="mb-3 grid gap-2">
                      <LanguageToggle />
                      <ThemeToggle className={cn("min-h-12", chromeToggle)} />
                    </div>
                    <button type="button" onClick={handleLogout}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] text-sm font-medium text-[var(--vz-text-secondary)] transition hover:bg-[var(--vz-surface-2)] hover:text-[var(--vz-text)]"
                    >
                      <LogOut size={16} aria-hidden="true" />{text.logout}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* MAIN */}
          <motion.main
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="vizit-admin-content min-w-0"
            aria-busy={featuresQ.isFetching}
          >
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </motion.main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="vizit-workspace-bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-[var(--vz-line)] bg-[var(--vz-surface)] shadow-[0_-8px_24px_rgb(var(--vz-shadow-rgb)/0.08)] xl:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-1 pb-[env(safe-area-inset-bottom,8px)] pt-1">
          {bottomNavItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => cn(
                "group flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors",
                isActive ? "text-[var(--vz-accent-text)]" : "text-[var(--vz-muted)] hover:text-[var(--vz-text)]",
              )}
            >
              {({ isActive }) => (
                <>
                  <span className={cn("grid h-8 w-10 place-items-center rounded-xl transition-colors", isActive && "bg-[var(--vz-accent-soft)]")}>
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <span className="max-w-[72px] truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button type="button" onClick={() => setIsMobileMenuOpen(true)}
            className="flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium text-[var(--vz-muted)] transition-colors hover:text-[var(--vz-text)]"
            aria-label={text.openMenu}
          >
            <span className="grid h-8 w-10 place-items-center rounded-xl">
              <Menu size={20} aria-hidden="true" />
            </span>
            <span>{text.more}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
