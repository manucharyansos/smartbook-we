import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, Mail, UserRound } from "lucide-react";

import AuthShell from "../components/AuthShell";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/http";
import { cn } from "../lib/cn";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useAuth } from "../store/auth";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: { title: "Հաճախորդի մուտք", subtitle: "Մուտք գործեք և տեսեք առաջիկա ու անցած այցերը մեկ վայրում։", badge: "Vizit հաճախորդի հաշիվ", sideTitle: "Ձեր ամրագրումները՝ մեկ պարզ հաշվում", sideText: "Արագ և անվտանգ մուտք՝ այցերը դիտելու, կրկնելու կամ չեղարկելու համար։", noAccount: "Դեռ հաշիվ չունե՞ք", create: "ստեղծել հաճախորդի հաշիվ", businessQuestion: "Բիզնեսի մուտք է պե՞տք", businessLogin: "անցնել բիզնեսի մուտքին", identity: "Email կամ հեռախոս", identityPlaceholder: "name@email.com կամ +374...", password: "Գաղտնաբառ", hide: "Թաքցնել գաղտնաբառը", show: "Ցույց տալ գաղտնաբառը", loading: "Մուտք է կատարվում…", submit: "Բացել հաճախորդի հաշիվը", note: "Եթե նույն email-ով կամ հեռախոսով նախկինում ամրագրում եք կատարել, համակարգը կփորձի այդ այցերը կապել ձեր հաշվին։", error: "Մուտքը չհաջողվեց։" },
  ru: { title: "Вход для клиента", subtitle: "Войдите, чтобы видеть предстоящие и прошедшие визиты в одном месте.", badge: "Аккаунт клиента Vizit", sideTitle: "Ваши записи в одном понятном аккаунте", sideText: "Быстрый и безопасный доступ для просмотра, повтора или отмены визитов.", noAccount: "Ещё нет аккаунта?", create: "создать аккаунт клиента", businessQuestion: "Нужен вход для бизнеса?", businessLogin: "перейти ко входу для бизнеса", identity: "Email или телефон", identityPlaceholder: "name@email.com или +374...", password: "Пароль", hide: "Скрыть пароль", show: "Показать пароль", loading: "Вход…", submit: "Открыть аккаунт клиента", note: "Если вы раньше записывались с тем же email или телефоном, система попытается связать эти визиты с вашим аккаунтом.", error: "Не удалось войти." },
  en: { title: "Client sign in", subtitle: "Sign in to see upcoming and past visits in one place.", badge: "Vizit client account", sideTitle: "Your bookings in one clear account", sideText: "Fast, secure access to view, repeat or cancel visits.", noAccount: "Don't have an account?", create: "create a client account", businessQuestion: "Need business access?", businessLogin: "go to business sign in", identity: "Email or phone", identityPlaceholder: "name@email.com or +374...", password: "Password", hide: "Hide password", show: "Show password", loading: "Signing in…", submit: "Open client account", note: "If you previously booked with the same email or phone number, the system will try to connect those visits to your account.", error: "Sign-in failed." },
} as const;

export default function ClientLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth } = useAuth();
  const { locale } = useLanguage();
  const text = copy[locale];

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/client/auth/login", { identity, password });
      setAuth(res.data.token, res.data.user);
      queryClient.clear();
      navigate("/client/cabinet", { replace: true });
    } catch (error: unknown) {
      setError(getErrorMessage(error, text.error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={text.title}
      subtitle={text.subtitle}
      badge={text.badge}
      sideTitle={text.sideTitle}
      sideText={text.sideText}
      footer={<div className="space-y-2 text-center text-sm text-slate-500"><div>{text.noAccount} <Link to="/client/register" className="font-medium text-violet-700 hover:text-violet-600">{text.create}</Link></div><div>{text.businessQuestion} <Link to="/business/login" className="font-medium text-violet-700 hover:text-violet-600">{text.businessLogin}</Link></div></div>}
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        {error ? <motion.div variants={fadeUp} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</motion.div> : null}

        <motion.div variants={fadeUp}>
          <label htmlFor="client-login-identity" className="mb-2 block text-sm font-medium text-slate-700">{text.identity}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="client-login-identity"
              name="identity"
              autoComplete="username"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder={text.identityPlaceholder}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              required
            />
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <label htmlFor="client-login-password" className="mb-2 block text-sm font-medium text-slate-700">{text.password}</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="client-login-password"
              name="password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              required
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? text.hide : text.show} aria-pressed={showPassword} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>

        <motion.button variants={fadeUp} type="submit" disabled={loading} className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800", loading && "cursor-not-allowed opacity-70")}>
          <LogIn className="h-4 w-4" />
          {loading ? text.loading : text.submit}
        </motion.button>

        <SocialAuthButtons mode="login" audience="client" />

        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
          <div className="flex items-start gap-2">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <div>{text.note}</div>
          </div>
        </motion.div>
      </motion.form>
    </AuthShell>
  );
}
