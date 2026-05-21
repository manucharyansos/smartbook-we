import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Menu, ShieldCheck, Sparkles, User } from 'lucide-react';

import AdminSidebar from './AdminSidebar';
import { pageTransition } from '../../lib/motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const titleMap: Record<string, string> = {
  '/admin/dashboard': 'Վահանակ',
  '/admin/businesses': 'Բիզնեսներ',
  '/admin/users': 'Օգտատերեր',
  '/admin/plans': 'Փաթեթներ',
  '/admin/admins': 'Ադմիններ',
  '/admin/logs': 'Մատյան',
};

export default function AdminLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarExpanded(true);
      setMobileSidebarOpen(false);
    }
  }, []);

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, [location.pathname]);

  const pageTitle = titleMap[location.pathname] || 'Admin workspace';

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileSidebarOpen((s) => !s);
      return;
    }
    setSidebarExpanded((s) => !s);
  };

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_25%,#faf5ff_100%)]">
      <AdminSidebar
        expanded={sidebarExpanded}
        mobileOpen={mobileSidebarOpen}
        onToggleExpanded={() => setSidebarExpanded((s) => !s)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={cn('transition-all duration-300 lg:ml-[96px]', sidebarExpanded && 'lg:ml-[280px]')}>
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={handleMenuClick}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
              >
                <Menu size={18} />
              </button>

              <div className="min-w-0">
                <div className="truncate text-2xl font-semibold tracking-tight text-slate-950">{pageTitle}</div>
                <div className="mt-1 inline-flex max-w-full items-center gap-2 truncate text-xs text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                  Vizit admin workspace
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold text-slate-900">{admin.name || 'Admin'}</div>
                <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-violet-500" />
                  {admin.role || 'administrator'}
                </div>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20">
                <User size={18} />
              </div>

              <Button variant="secondary" size="sm" onClick={handleLogout} className="px-3">
                <LogOut size={16} />
                <span className="hidden sm:inline">Ելք</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </motion.div>
  );
}
