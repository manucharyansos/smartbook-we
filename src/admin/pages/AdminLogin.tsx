import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CalendarDays, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

import { adminService } from '../services/adminApi';
import { fadeUp, pageTransition, scaleIn } from '../../lib/motion';
import { cn } from '../../lib/cn';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});
    try {
      const res = await adminService.login(email, password);
      const payload = res.data;
      const token = payload?.data?.token ?? payload?.token;
      const admin = payload?.data?.admin ?? payload?.admin;
      if (token && admin) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin', JSON.stringify(admin));
        navigate('/admin/dashboard');
      } else {
        setError('Սերվերի պատասխանը սպասված կառուցվածք չունի');
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors ?? {};
        setValidationErrors(errors);
        const firstKey = Object.keys(errors)[0];
        setError(errors[firstKey]?.[0] || 'Վավերացման սխալ');
      } else {
        setError(err.response?.data?.message || 'Մուտքի սխալ։ Փորձեք կրկին։');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#0f172a_0%,#111827_40%,#1e1b4b_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.1),transparent_28%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 2xl:grid-cols-[1fr_0.92fr] 2xl:items-center">
          <div className="hidden text-white lg:block">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Vizit Admin Access
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8">
              <div className="inline-flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-semibold tracking-tight">Vizit</div>
                  <div className="text-sm text-white/55">Admin workspace</div>
                </div>
              </div>
              <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight tracking-tight">Կառավարիր բիզնեսները, պլանները և պլատֆորմի առողջությունը մեկ միջավայրից։</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/68">Արագ մուտք, մաքուր վերահսկում և analytics, որը օգնում է հասկանալ պլատֆորմի իրական վիճակը՝ առանց ծանր ու հին admin փորձի։</p>
            </motion.div>
          </div>

          <motion.div variants={scaleIn} className="mx-auto w-full max-w-xl">
            <div className="rounded-[34px] border border-white/10 bg-white/10 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5">
              <div className="rounded-[30px] border border-white/10 bg-slate-950/35 p-6 text-white sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-3xl font-semibold tracking-tight">Admin մուտք</div>
                    <p className="mt-2 text-sm leading-7 text-white/60">Մուտք գործիր Vizit admin workspace։</p>
                  </div>
                  <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/85 transition hover:bg-white/15">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Կայք</span>
                  </Link>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {error ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Էլ. փոստ</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(
                          'h-12 w-full rounded-2xl border bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-300/60 focus:ring-4 focus:ring-violet-500/15',
                          validationErrors.email ? 'border-rose-400/40' : 'border-white/10',
                        )}
                        placeholder="admin@vizit.am"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Գաղտնաբառ</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(
                          'h-12 w-full rounded-2xl border bg-white/5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-300/60 focus:ring-4 focus:ring-violet-500/15',
                          validationErrors.password ? 'border-rose-400/40' : 'border-white/10',
                        )}
                        placeholder="••••••••"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={cn('inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-medium text-white shadow-lg shadow-violet-500/20', loading && 'cursor-not-allowed opacity-70')}>
                    {loading ? 'Մուտք է կատարվում...' : 'Մուտք'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
