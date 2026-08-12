import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, CalendarDays, LogOut, Menu, Scissors, Users,
  LayoutDashboard, Settings, ChevronRight, Sparkles, X,
  PanelLeftClose, PanelLeftOpen, Award, Gift, Star, Landmark,
  ClipboardList, Contact, type LucideProps,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useAuth } from "../store/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFeatures, hasFeature } from "../lib/featuresApi";
import ThemeToggle from "../components/ThemeToggle";

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

const mobileBottomPaths = ["/app/dashboard", "/app/calendar", "/app/clients", "/app/services", "/app/settings"];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, clear } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    try { return localStorage.getItem("bb_app_sidebar_collapsed") === "1"; }
    catch { return false; }
  });

  const featuresQ = useQuery({ queryKey: ["features"], queryFn: fetchFeatures, staleTime: 60_000, retry: 1 });
  const features = featuresQ.data;

  const navItems = useMemo(() => {
    let items = [...baseNavItems];
    items = items.filter((i) => !i.feature || hasFeature(features, i.feature));
    if (user?.role === "staff") {
      const allowed = new Set(["/app/dashboard", "/app/calendar", "/app/tasks"]);
      items = items.filter((i) => allowed.has(i.to));
    }
    const insertBeforeSettings = (item: NavItem) => {
      const idx = items.findIndex((x) => x.to === "/app/settings");
      if (idx >= 0) items.splice(idx, 0, item); else items.push(item);
    };
    if (hasFeature(features, "gift_cards")) insertBeforeSettings({ to: "/app/gift-cards", label: "Նվերի քարտեր", icon: Gift, color: "from-violet-600 to-fuchsia-600", feature: "gift_cards" });
    if (hasFeature(features, "loyalty")) insertBeforeSettings({ to: "/app/loyalty", label: "Լոյալություն", icon: Star, color: "from-orange-500 to-amber-500", feature: "loyalty" });
    return items;
  }, [features, user?.role]);

  const bottomNavItems = useMemo(() => navItems.filter((i) => mobileBottomPaths.includes(i.to)), [navItems]);

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("bb_app_sidebar_collapsed", isDesktopCollapsed ? "1" : "0"); } catch { /* storage can be disabled */ }
  }, [isDesktopCollapsed]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
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
      case "owner": return "Սրահի սեփականատեր";
      case "manager": return "Կառավարիչ";
      case "staff": return "Աշխատակից";
      case "super_admin": return "Սուպեր ադմին";
      default: return user?.role ?? "";
    }
  };

  const businessTypeUi = useMemo(() => {
    const t = String(user?.business_type ?? "");
    if (t === "dental") return { label: "Կլինիկա", icon: Award };
    if (t === "beauty") return { label: "Սրահ", icon: Sparkles };
    return null;
  }, [user?.business_type]);
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
                aria-label={isDesktopCollapsed ? "Բացել" : "Փոքրացնել"}
              >
                {isDesktopCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
              {/* Mobile hamburger */}
              <motion.button whileTap={{ scale: 0.95 }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white xl:hidden"
                onClick={() => setIsMobileMenuOpen(true)} aria-label="Բացել մենյուն"
              >
                <Menu size={20} className="text-slate-700" />
              </motion.button>
              {/* Logo */}
              <motion.div whileHover={{ scale: 1.01 }}
                className="flex cursor-pointer items-center gap-2 sm:gap-3"
                onClick={() => navigate("/app/dashboard")}
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-[0_10px_25px_rgba(79,70,229,0.25)] sm:h-11 sm:w-11 sm:rounded-2xl">
                  <CalendarDays size={18} />
                </div>
                <div className="hidden min-[360px]:block">
                  <div className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Vizit</div>
                  <div className="hidden text-xs text-slate-500 sm:block">{user?.business_name || "Workspace"}</div>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {businessTypeUi && (
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 md:flex">
                  <BusinessTypeIcon size={14} className="text-violet-600" />
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
                        ? `Փորձ · ${Math.round(features.subscription.days_left)} օր`
                        : features.plan_code ? `${features.plan_code}` : features.subscription.status}
                    </div>
                  </div>
                )}
              </div>
              <ThemeToggle
                compact
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <motion.button whileTap={{ scale: 0.96 }}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 sm:px-4"
                onClick={handleLogout}
              >
                <LogOut size={16} /><span className="hidden sm:inline">Ելք</span>
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
                  {isDesktopCollapsed ? "ՄԵՆ" : "ՆԱՎԻԳԱՑԻԱ"}
                </div>
                <nav className="space-y-1.5">
                  {navItems.map((item) => (
                    <NavLink key={item.to} to={item.to}
                      className={({ isActive }) => cn(
                        "group relative flex items-center overflow-hidden rounded-2xl text-sm font-medium transition-all duration-300",
                        isDesktopCollapsed ? "justify-center px-2 py-3.5" : "gap-3 px-3.5 py-3",
                        isActive ? "text-white" : "text-slate-700 hover:text-slate-950"
                      )}
                      title={isDesktopCollapsed ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <span className={cn("absolute inset-0 rounded-2xl bg-gradient-to-r shadow-sm", item.color)} />}
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
                <div className="rounded-[24px] border border-slate-200/80 bg-white/96 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-100 to-fuchsia-100">
                      <Sparkles size={16} className="text-violet-700" />
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-semibold text-slate-900">Հուշում</div>
                      <div className="text-xs leading-relaxed text-slate-500">Սկսեք օրացույցից, հետո խորացրեք վերլուծությունն ու վճարումները։</div>
                    </div>
                  </div>
                </div>
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
                  className="fixed left-0 top-0 z-50 flex h-full w-[min(85vw,290px)] flex-col border-r border-slate-200 bg-white shadow-2xl xl:hidden"
                >
                  {/* Drawer header */}
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
                        <CalendarDays size={15} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">Vizit</div>
                        <div className="max-w-[140px] truncate text-[10px] text-slate-400">{user?.business_name}</div>
                      </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-50"
                    >
                      <X size={16} className="text-slate-600" />
                    </button>
                  </div>
                  {/* Subscription badge */}
                  {features?.subscription?.status && (
                    <div className="border-b border-slate-100 px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{getRoleDisplay()}</span>
                        <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                          {features.subscription.status === "trialing" && typeof features.subscription.days_left === "number"
                            ? `${Math.round(features.subscription.days_left)} օր մնաց`
                            : features.subscription.status}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Nav links */}
                  <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                    {navItems.map((item) => (
                      <NavLink key={item.to} to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                          isActive ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                        )}
                      >
                        <item.icon size={17} />{item.label}
                      </NavLink>
                    ))}
                  </nav>
                  {/* Logout */}
                  <div className="border-t border-slate-200 p-3">
                    <button onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <LogOut size={16} />Ելք
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
          >
            {featuresQ.isLoading ? (
              <div className="grid min-h-[50vh] place-items-center text-sm text-slate-500">Բեռնում է...</div>
            ) : (
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            )}
          </motion.main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-1 pb-[env(safe-area-inset-bottom,8px)] pt-1">
          {bottomNavItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium transition-all",
                isActive ? "text-violet-700" : "text-slate-400"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn("grid h-8 w-8 place-items-center rounded-xl transition-all", isActive && "bg-violet-100")}>
                    <item.icon size={20} className={isActive ? "text-violet-700" : "text-slate-400"} />
                  </div>
                  <span className="max-w-[52px] truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button onClick={() => setIsMobileMenuOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium text-slate-400 transition active:text-slate-700"
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl">
              <Menu size={20} />
            </div>
            <span>Ավելին</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
