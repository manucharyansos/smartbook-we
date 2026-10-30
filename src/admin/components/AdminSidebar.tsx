import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CalendarDays, ChevronLeft, ChevronRight, CreditCard, FileText, Globe2, LayoutDashboard, Package, Shield, Users, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  expanded: boolean;
  mobileOpen: boolean;
  onToggleExpanded: () => void;
  onCloseMobile: () => void;
}

export default function AdminSidebar({ expanded, mobileOpen, onToggleExpanded, onCloseMobile }: Props) {
  let admin: { role?: string } = {};
  try {
    admin = JSON.parse(localStorage.getItem('admin') || '{}');
  } catch {
    admin = {};
  }
  const isSuperAdmin = admin.role === 'super_admin';
  // The mobile drawer always opens full width; only the desktop rail collapses.
  const wide = expanded || mobileOpen;

  const menuItems = [
    ...(isSuperAdmin ? [{ path: '/admin/dashboard', icon: LayoutDashboard, label: 'Վահանակ' }, { path: '/admin/site-analytics', icon: Globe2, label: 'Այցելություններ' }] : []),
    { path: '/admin/businesses', icon: Building2, label: 'Բիզնեսներ' },
    { path: '/admin/users', icon: Users, label: 'Օգտատերեր' },
    ...(isSuperAdmin || admin.role === 'finance' ? [{ path: '/admin/payments', icon: CreditCard, label: 'Վճարումներ' }] : []),
    ...(isSuperAdmin
      ? [
          { path: '/admin/plans', icon: Package, label: 'Փաթեթներ' },
          { path: '/admin/admins', icon: Shield, label: 'Ադմիններ' },
          { path: '/admin/logs', icon: FileText, label: 'Մատյան' },
        ]
      : []),
  ];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition lg:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
      />

      <motion.aside
        initial={false}
        animate={{ width: wide ? 280 : 96 }}
        transition={{ duration: 0.24 }}
        className={cn(
          'vizit-superadmin-sidebar fixed left-0 top-0 z-50 h-full border-r transition-transform lg:z-40',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          {wide ? (
            <div className="flex h-20 items-center justify-between gap-2 border-b border-white/10 px-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--vz-primary)] text-[var(--vz-on-primary)] shadow-lg">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold tracking-tight">Vizit</div>
                  <div className="truncate text-xs text-white/45">Ադմինի վահանակ</div>
                </div>
              </div>

              <button
                onClick={onToggleExpanded}
                className="hidden h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-white/80 transition hover:bg-white/15 lg:grid"
                title="Փոքրացնել"
                aria-label="Փոքրացնել"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={onCloseMobile}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-white/80 transition hover:bg-white/15 lg:hidden"
                title="Փակել"
                aria-label="Փակել"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            // Collapsed: the logo and the expand button stack in one column so they never overlap.
            <div className="flex flex-col items-center gap-2 border-b border-white/10 py-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--vz-primary)] text-[var(--vz-on-primary)] shadow-lg">
                <CalendarDays className="h-5 w-5" />
              </div>
              <button
                onClick={onToggleExpanded}
                className="grid h-8 w-11 place-items-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/15"
                title="Բացել"
                aria-label="Բացել"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {wide ? (
            <div className="border-b border-white/10 px-4 py-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/35">Role</div>
                <div className="mt-2 text-sm font-medium text-white/85">{admin.role === 'super_admin' ? 'Super Admin' : 'Admin team'}</div>
              </div>
            </div>
          ) : null}

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  title={wide ? undefined : item.label}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-2xl px-4 py-3 transition',
                      isActive ? 'bg-white/[0.12] text-white shadow-inner' : 'text-white/65 hover:bg-white/[0.08] hover:text-white',
                      !wide && 'justify-center px-0',
                    )
                  }
                >
                  <item.icon size={20} className="shrink-0" />
                  {wide ? <span className="text-sm font-medium">{item.label}</span> : null}
                </NavLink>
              ))}
            </div>
          </nav>

          {wide ? (
            <div className="border-t border-white/10 p-4">
              <div className="rounded-2xl bg-white/[0.06] p-4 text-xs text-white/55">
                Central control for plans, businesses, billing and audit trails.
              </div>
            </div>
          ) : null}
        </div>
      </motion.aside>
    </>
  );
}
