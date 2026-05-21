import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CalendarDays, ChevronLeft, ChevronRight, FileText, LayoutDashboard, Package, Shield, Users, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  expanded: boolean;
  mobileOpen: boolean;
  onToggleExpanded: () => void;
  onCloseMobile: () => void;
}

export default function AdminSidebar({ expanded, mobileOpen, onToggleExpanded, onCloseMobile }: Props) {
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const isSuperAdmin = admin.role === 'super_admin';

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Վահանակ' },
    { path: '/admin/businesses', icon: Building2, label: 'Բիզնեսներ' },
    { path: '/admin/users', icon: Users, label: 'Օգտատերեր' },
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
        animate={{ width: expanded ? 280 : 96 }}
        transition={{ duration: 0.24 }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full border-r border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#111827_40%,#1e1b4b_100%)] text-white shadow-2xl transition-transform lg:z-40',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
            <div className="min-w-0">
              {expanded ? (
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold tracking-tight">Vizit</div>
                    <div className="truncate text-xs text-white/45">Admin workspace</div>
                  </div>
                </div>
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25">
                  <CalendarDays className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleExpanded}
                className="hidden h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white/80 transition hover:bg-white/15 lg:grid"
                title={expanded ? 'Փոքրացնել' : 'Բացել'}
              >
                {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
              <button
                onClick={onCloseMobile}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white/80 transition hover:bg-white/15 lg:hidden"
                title="Փակել"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="border-b border-white/10 px-4 py-4">
            <div className={cn('rounded-2xl border border-white/10 bg-white/5 px-3 py-3', !expanded && 'px-2')}>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/35">Role</div>
              {expanded ? (
                <div className="mt-2 text-sm font-medium text-white/85">{admin.role === 'super_admin' ? 'Super Admin' : 'Admin team'}</div>
              ) : null}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-2xl px-4 py-3 transition',
                      isActive ? 'bg-white/12 text-white shadow-inner' : 'text-white/65 hover:bg-white/8 hover:text-white',
                      !expanded && 'justify-center px-0',
                    )
                  }
                >
                  <item.icon size={20} className="shrink-0" />
                  {expanded ? <span className="text-sm font-medium">{item.label}</span> : null}
                </NavLink>
              ))}
            </div>
          </nav>

          {expanded ? (
            <div className="border-t border-white/10 p-4">
              <div className="rounded-2xl bg-white/6 p-4 text-xs text-white/55">
                Central control for plans, businesses, billing and audit trails.
              </div>
            </div>
          ) : null}
        </div>
      </motion.aside>
    </>
  );
}
