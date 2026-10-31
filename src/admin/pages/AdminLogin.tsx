import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CalendarDays, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

import { adminService } from '../services/adminApi';
import { fadeUp, pageTransition, scaleIn } from '../../lib/motion';
import { cn } from '../../lib/cn';
import { getErrorMessage, getHttpStatus, getValidationMessages, type HttpError } from '../../lib/http';

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
        navigate(admin.role === 'super_admin' ? '/admin/dashboard' : '/admin/businesses', { replace: true });
      } else {
        setError('Սերվերի պատասխանը սպասված կառուցվածք չունի');
      }
    } catch (err: unknown) {
      if (getHttpStatus(err) === 422) {
        const fieldErrors = (err as HttpError).response?.data?.errors ?? {};
        const errors = Object.fromEntries(
          Object.entries(fieldErrors).map(([field, messages]) => [field, messages ?? []]),
        );
        setValidationErrors(errors);
        setError(getValidationMessages(err)[0] || 'Վավերացման սխալ');
      } else {
        setError(getErrorMessage(err, 'Մուտքի սխալ։ Փորձեք կրկին։'));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (invalid: boolean) => cn(
    'h-12 w-full rounded-2xl border bg-[var(--vz-surface)] pl-11 text-sm text-[var(--vz-text)] outline-none transition placeholder:text-[var(--vz-muted)] focus:border-[var(--vz-primary)] focus:ring-4 focus:ring-[var(--vz-accent-soft)]',
    invalid ? 'border-[var(--vz-danger)]' : 'border-[var(--vz-line)]',
  );

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="relative min-h-screen overflow-hidden bg-[var(--vz-page)] text-[var(--vz-text)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--vz-accent-soft),transparent_40%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)] lg:items-center">
          <div className="hidden lg:block">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-2 text-sm text-[var(--vz-brand-text)]">
              <ShieldCheck className="h-4 w-4" />
              Vizit-ի ադմին համակարգ
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8">
              <div className="inline-flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--vz-primary)] text-[var(--vz-on-primary)] shadow-sm">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-semibold tracking-tight">Vizit</div>
                  <div className="text-sm text-[var(--vz-text-secondary)]">Կառավարման միջավայր</div>
                </div>
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Բիզնեսները, պլանները, վճարումները և վերլուծությունը՝ մեկ տեղում։</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--vz-text-secondary)]">Vizit-ի եկամուտ, բաժանորդագրություններ, կայքի այցելություններ և բիզնեսների կառավարում։</p>
            </motion.div>
          </div>

          <motion.div variants={scaleIn} className="mx-auto w-full max-w-xl">
            <div className="rounded-[30px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-[var(--vz-shadow)] sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-3xl font-semibold tracking-tight">Ադմինի մուտք</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--vz-text-secondary)]">Մուտք գործեք Vizit-ի կառավարման միջավայր։</p>
                </div>
                <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line)] px-3 py-2 text-sm text-[var(--vz-text-secondary)] transition hover:bg-[var(--vz-surface-2)]">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Կայք</span>
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {error ? (
                  <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] px-4 py-3 text-sm text-[var(--vz-danger)]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <div>
                  <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-[var(--vz-text-secondary)]">Էլ. փոստ</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--vz-muted)]" />
                    <input id="admin-email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
                      className={cn(inputClass(!!validationErrors.email), 'pr-4')} placeholder="admin@vizit.am" required />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-[var(--vz-text-secondary)]">Գաղտնաբառ</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--vz-muted)]" />
                    <input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className={cn(inputClass(!!validationErrors.password), 'pr-12')} placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը'} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vz-muted)] transition hover:text-[var(--vz-text)]">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className={cn('inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--vz-primary)] px-5 text-sm font-medium text-[var(--vz-on-primary)] shadow-sm transition hover:bg-[var(--vz-primary-hover)]', loading && 'cursor-not-allowed opacity-70')}>
                  {loading ? 'Մուտք է կատարվում...' : 'Մուտք'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
