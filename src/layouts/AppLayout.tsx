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
  color: string; feature?: string;
};

const baseNavItems: NavItem[] = [
  { to: "/app/dashboard", label: "Վահանակ", icon: LayoutDashboard, color: "from-indigo-600 to-violet-600" },
  { to: "/app/calendar", label: "Օրացույց", icon: CalendarDays, color: "from-violet-600 to-fuchsia-600" },
  { to: "/app/services", label: "Ծառայություններ", icon: Scissors, color: "from-orange-500 to-amber-500" },
  { to: "/app/staff", label: "Աշխատակիցներ", icon: Users, color: "from-cyan-600 to-blue-600" },
  { to: "/app/clients", label: "Հաճախորդներ", icon: Contact, color: "from-emerald-600 to-teal-600" },
  { to: "/app/tasks", label: "Ամրագրումների վահանակ", icon: ClipboardList, color: "from-amber-500 to-orange-600", feature: "tasks" },
  { to: "/app/analytics", label: "Վերլուծություն", icon: BarChart3, color: "from-fuchsia-600 to-violet-600", feature: "analytics" },
  { to: "/app/billing", label: "Պլան", icon: Landmark, color: "from-indigo-600 to-violet-600" },
  { to: "/app/settings", label: "Կարգավորումներ", icon: Settings, color: "from-slate-700 to-slate-900" },
];

const mobileBottomPaths = ["/app/dashboard", "/app/calendar", "/app/services", "/app/clients"];

const workspaceCopy = {
  hy: {
    growth: "Աճ",
    nav: { "/app/dashboard": "Վահանակ", "/app/calendar": "Օրացույց", "/app/services": "Ծառայություններ", "/app/staff": "Աշխատակիցներ", "/app/clients": "Հաճախորդներ", "/app/tasks": "Ամրագրումների վահանակ", "/app/analytics": "Վերլուծություն", "/app/billing": "Պլան", "/app/settings": "Կարգավորումներ" },
    medicalNav: { "/app/services": "Բժշկական ծառայություններ", "/app/staff": "Բժիշկներ և թիմ", "/app/clients": "Պացիենտներ", "/app/tasks": "Այցերի վահանակ" },
    giftCards: "Նվերի քարտեր", loyalty: "Լոյալություն", more: "Ավելին", logout: "Ելք", navigation: "Նավիգացիա", menu: "Մենյու", openMenu: "Բացել մենյուն", closeMenu: "Փակել մենյուն", loading: "Բեռնվում է…", workspace: "Աշխատանքային միջավայր", owner: "Սեփականատեր", manager: "Կառավարիչ", staff: "Աշխատակից", superAdmin: "Սուպեր ադմին", healthcare: "Առողջապահություն", services: "Ծառայություններ", trial: "Փորձաշրջան", daysLeft: "օր մնաց", expand: "Բացել կողային վահանակը", collapse: "Փոքրացնել կողային վահանակը", hintTitle: "Արագ սկիզբ", hintText: "Ավելացրեք ծառայությունները, բժիշկներին և նրանց աշխատաժամերը, ապա ընդունեք առաջին այցը։",
  },
  ru: {
    growth: "Рост",
    nav: { "/app/dashboard": "Панель", "/app/calendar": "Календарь", "/app/services": "Услуги", "/app/staff": "Сотрудники", "/app/clients": "Клиенты", "/app/tasks": "Панель записей", "/app/analytics": "Аналитика", "/app/billing": "Тариф", "/app/settings": "Настройки" },
    medicalNav: { "/app/services": "Медицинские услуги", "/app/staff": "Врачи и команда", "/app/clients": "Пациенты", "/app/tasks": "Панель визитов" },
    giftCards: "Подарочные карты", loyalty: "Лояльность", more: "Ещё", logout: "Выйти", navigation: "Навигация", menu: "Меню", openMenu: "Открыть меню", closeMenu: "Закрыть меню", loading: "Загрузка…", workspace: "Рабочее пространство", owner: "Владелец", manager: "Менеджер", staff: "Сотрудник", superAdmin: "Суперадмин", healthcare: "Здравоохранение", services: "Услуги", trial: "Пробный период", daysLeft: "дн. осталось", expand: "Развернуть боковую панель", collapse: "Свернуть боковую панель", hintTitle: "Быстрый старт", hintText: "Добавьте услуги, врачей и их расписание, затем примите первый визит.",
  },
  en: {
    growth: "Growth",
    nav: { "/app/dashboard": "Dashboard", "/app/calendar": "Calendar", "/app/services": "Services", "/app/staff": "Staff", "/app/clients": "Clients", "/app/tasks": "Booking board", "/app/analytics": "Analytics", "/app/billing": "Plan", "/app/settings": "Settings" },
    medicalNav: { "/app/services": "Medical services", "/app/staff": "Doctors & team", "/app/clients": "Patients", "/app/tasks": "Visit board" },
    giftCards: "Gift cards", loyalty: "Loyalty", more: "More", logout: "Log out", navigation: "Navigation", menu: "Menu", openMenu: "Open menu", closeMenu: "Close menu", loading: "Loading…", workspace: "Workspace", owner: "Owner", manager: "Manager", staff: "Staff", superAdmin: "Super admin", healthcare: "Healthcare", services: "Services", trial: "Trial", daysLeft: "days left", expand: "Expand sidebar", collapse: "Collapse sidebar", hintTitle: "Quick start", hintText: "Add services, doctors and their schedules, then accept the first visit.",
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
  const isHealthcare = ["healthcare", "dental", "clinic", "medical", "doctor", "health"].includes(businessValue);

  const navItems = useMemo(() => {
    let items: NavItem[] = baseNavItems.map((item) => {
      const healthcareLabel = isHealthcare
        ? (text.medicalNav as Partial<Record<string, string>>)[item.to]
        : undefined;
      return { ...item, label: healthcareLabel ?? text.nav[item.to as keyof typeof text.nav] ?? item.label };
    });
    items = items.filter((i) => !i.feature || hasFeature(features, i.feature));
    if (user?.role === "staff") {
      const allowed = new Set(["/app/dashboard", "/app/calendar", "/app/tasks"]);
      items = items.filter((i) => allowed.has(i.to));
    }
    const insertBeforeSettings = (item: NavItem) => {
      const idx = items.findIndex((x) => x.to === "/app/settings");
      if (idx >= 0) items.splice(idx, 0, item); else items.push(item);
    };
    if (hasFeature(features, "gift_cards")) insertBeforeSettings({ to: "/app/gift-cards", label: text.giftCards, icon: Gift, color: "from-violet-600 to-fuchsia-600", feature: "gift_cards" });
    if (hasFeature(features, "loyalty")) insertBeforeSettings({ to: "/app/loyalty", label: text.loyalty, icon: Star, color: "from-orange-500 to-amber-500", feature: "loyalty" });
    if (hasFeature(features, "waitlist")) insertBeforeSettings({ to: "/app/growth", label: text.growth, icon: Megaphone, color: "from-emerald-600 to-teal-600", feature: "waitlist" });
    return items;
  }, [features, isHealthcare, text, user?.role]);

  const bottomNavItems = useMemo(() => navItems.filter((i) => mobileBottomPaths.includes(i.to)), [navItems]);

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
    () => isHealthcare ? { label: text.healthcare, icon: Award } : { label: text.services, icon: Sparkles },
    [isHealthcare, text.healthcare, text.services]
  );
  const BusinessTypeIcon = businessTypeUi?.icon ?? Sparkles;

  return (
    <div className="vizit-admin-shell min-h-screen w-full bg-[#f4f6fb] dark:bg-[#080b12]">
      {/* HEADER */}
      <motion.header
        initial={{ y: -90 }} animate={{ y: 0 }}
        className={cn(
          "vizit-admin-header sticky top-0 z-30 transition-all duration-300",
          isScrolled ? "border-b border-slate-200/80 bg-white/92 shadow-sm backdrop-blur-xl"
            : "border-b border-slate-200/70 bg-white/84 backdrop-blur-xl"
        )}
      >
        <div className="mx-auto max-w-[1540px] px-3 sm:px-6">
          <div className="flex h-14 items-center justify-between sm:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop sidebar collapse */}
              <button type="button" onClick={() => setIsDesktopCollapsed((v) => !v)}
                className="hidden items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 xl:inline-flex"
                aria-label={isDesktopCollapsed ? text.expand : text.collapse}
              >
                {isDesktopCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
              {/* Mobile hamburger */}
              <motion.button whileTap={{ scale: 0.95 }}
                className="vizit-admin-mobile-menu-trigger inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white xl:hidden"
                onClick={() => setIsMobileMenuOpen(true)} aria-label={text.openMenu}
              >
                <Menu size={20} className="text-slate-700" />
              </motion.button>
              {/* Logo */}
              <motion.div whileHover={{ scale: 1.01 }}
                className="vizit-workspace-brand flex cursor-pointer items-center gap-2 sm:gap-3"
                onClick={() => navigate("/app/dashboard")}
              >
                <VizitLogo markClassName="!h-9 !w-9 sm:!h-10 sm:!w-10" textClassName="!text-[17px] sm:!text-[20px]" />
                <div className="hidden min-[360px]:block">
                  <div className="hidden max-w-[150px] truncate text-[11px] text-slate-500 sm:block">{user?.business_name || text.workspace}</div>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {businessTypeUi && (
                <div className="vizit-workspace-badge hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 md:flex">
                  <BusinessTypeIcon size={14} />
                  <span className="text-xs text-slate-600">{businessTypeUi.label}</span>
                </div>
              )}
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold text-slate-950">{user?.name || "—"}</div>
                <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                  <Sparkles size={12} className="text-violet-600" />{getRoleDisplay()}
                </div>
                {features?.subscription?.status && (
                  <div className="mt-1 flex justify-end">
                    <div className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                      {features.subscription.status === "trialing" && typeof features.subscription.days_left === "number"
                        ? `${text.trial} · ${Math.round(features.subscription.days_left)} ${text.daysLeft}`
                        : features.plan_code ? `${features.plan_code}` : features.subscription.status}
                    </div>
                  </div>
                )}
              </div>
              <ThemeToggle
                compact
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <LanguageToggle
                compact
                className="vizit-workspace-language rounded-full border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <motion.button whileTap={{ scale: 0.96 }}
                className="hidden h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 sm:inline-flex sm:px-4"
                onClick={handleLogout}
              >
                <LogOut size={16} /><span className="hidden sm:inline">{text.logout}</span>
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
            <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} className="sticky top-28 space-y-4">
              <div className={cn("rounded-[24px] border border-slate-200/80 bg-white/95 p-3 shadow-[0_14px_38px_rgba(15,23,42,0.07)] backdrop-blur", isDesktopCollapsed && "px-2")}>
                <div className={cn("mb-3 px-2 text-xs font-semibold tracking-[0.18em] text-slate-400", isDesktopCollapsed && "text-center text-[10px]")}>
                  {isDesktopCollapsed ? text.menu.slice(0, 3).toUpperCase() : text.navigation.toUpperCase()}
                </div>
                <nav className="space-y-1.5">
                  {navItems.map((item) => (
                    <NavLink key={item.to} to={item.to}
                      className={({ isActive }) => cn(
                        "vizit-admin-nav-link group relative flex items-center overflow-hidden rounded-2xl text-sm font-medium transition-all duration-300",
                        isDesktopCollapsed ? "justify-center px-2 py-3.5" : "gap-3 px-3.5 py-3",
                        isActive ? "is-active text-white" : "text-slate-700 hover:text-slate-950"
                      )}
                      title={isDesktopCollapsed ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <span className={cn("vizit-admin-nav-active-bg absolute inset-0 rounded-2xl bg-gradient-to-r shadow-sm", item.color)} />}
                          <span className="relative z-10">
                            <item.icon size={18} className={cn("transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-violet-600")} />
                          </span>
                          {!isDesktopCollapsed && <span className="relative z-10 flex-1">{item.label}</span>}
                          {isActive && !isDesktopCollapsed && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10">
                              <ChevronRight size={16} className="text-white" />
                            </motion.div>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
              {!isDesktopCollapsed && (
                <>
                  <TelegramConnectionCard variant="sidebar" />
                  <div className="rounded-[24px] border border-slate-200/80 bg-white/96 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-100 to-fuchsia-100">
                        <Sparkles size={16} className="text-violet-700" />
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-semibold text-slate-900">{text.hintTitle}</div>
                        <div className="text-xs leading-relaxed text-slate-500">{text.hintText}</div>
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
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { type: "spring", damping: 28, stiffness: 220 } }}
                  exit={{ x: -300, opacity: 0, transition: { duration: 0.2 } }}
                  className="vizit-admin-drawer fixed left-0 top-0 z-50 flex h-full w-[min(88vw,320px)] flex-col border-r border-slate-200 bg-white shadow-2xl xl:hidden"
                >
                  {/* Drawer header */}
                  <div className="vizit-admin-drawer-header flex items-center justify-between border-b border-slate-200 px-4 py-4">
                    <div className="min-w-0">
                      <VizitLogo markClassName="!h-8 !w-8" textClassName="!text-[17px]" />
                      <div className="mt-1.5 max-w-[200px] truncate pl-1 text-[11px] font-medium text-slate-500">{user?.business_name || text.workspace}</div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-50"
                      aria-label={text.closeMenu}
                    >
                      <X size={16} className="text-slate-600" />
                    </button>
                  </div>
                  {/* Subscription badge */}
                  {features?.subscription?.status && (
                    <div className="vizit-admin-drawer-meta border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{getRoleDisplay()}</span>
                        <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                          {features.subscription.status === "trialing" && typeof features.subscription.days_left === "number"
                            ? `${Math.round(features.subscription.days_left)} ${text.daysLeft}`
                            : features.subscription.status}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Nav links */}
                  <nav className="vizit-admin-drawer-nav flex-1 space-y-1 overflow-y-auto p-3">
                    <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{text.navigation}</div>
                    {navItems.map((item) => (
                      <NavLink key={item.to} to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                          "vizit-admin-drawer-link flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                          isActive ? "is-active text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                        )}
                      >
                        <span className="vizit-admin-drawer-icon grid h-8 w-8 shrink-0 place-items-center rounded-xl"><item.icon size={17} /></span>
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 opacity-40" />
                      </NavLink>
                    ))}
                    <div className="px-1 pb-2 pt-3">
                      <TelegramConnectionCard variant="drawer" />
                    </div>
                  </nav>
                  {/* Logout */}
                  <div className="vizit-admin-drawer-footer border-t border-slate-200 p-3">
                    <div className="mb-3 grid gap-2">
                      <LanguageToggle />
                      <ThemeToggle className="min-h-12 border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                    </div>
                    <button onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <LogOut size={16} />{text.logout}
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
      <nav className="vizit-admin-bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-1 pb-[env(safe-area-inset-bottom,8px)] pt-1">
          {bottomNavItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => cn(
                "vizit-admin-bottom-link flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium transition-all",
                isActive ? "is-active" : "text-slate-400"
              )}
            >
              <div className="vizit-admin-bottom-icon grid h-8 w-8 place-items-center rounded-xl transition-all">
                <item.icon size={20} />
              </div>
              <span className="max-w-[68px] truncate">{item.label}</span>
            </NavLink>
          ))}
          <button onClick={() => setIsMobileMenuOpen(true)}
            className="vizit-admin-bottom-more flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium text-slate-400 transition active:text-slate-700"
            aria-label={text.openMenu}
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl">
              <Menu size={20} />
            </div>
            <span>{text.more}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
