import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, UserPlus } from "lucide-react";

import AuthShell from "../components/AuthShell";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { api } from "../lib/api";
import { getErrorMessage, getValidationMessages } from "../lib/http";
import { cn } from "../lib/cn";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useAuth } from "../store/auth";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: { title: "Ստեղծել հաճախորդի հաշիվ", subtitle: "Պահեք ամրագրումների պատմությունն ու առաջիկա այցերը մեկ տեղում։", badge: "Vizit հաճախորդի հաշիվ", sideTitle: "Պարզ գրանցում, հետո՝ արագ ամրագրում", sideText: "Հաճախորդի հաշիվը հարմար է հեռախոսից օգտագործելու և այցերը կառավարելու համար։", hasAccount: "Արդեն հաճախորդի հաշիվ ունե՞ք", login: "մուտք գործել", business: "Բիզնես ե՞ք", businessRegister: "անցնել բիզնեսի գրանցմանը", contactRequired: "Նշեք email կամ հեռախոսահամար։", passwordShort: "Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։", passwordMismatch: "Գաղտնաբառերը չեն համընկնում։", error: "Գրանցումը չհաջողվեց։", name: "Անուն", namePlaceholder: "Օրինակ՝ Անուշ", email: "Էլ. փոստ", phone: "Հեռախոս", password: "Գաղտնաբառ", passwordPlaceholder: "Առնվազն 8 նիշ", confirmPassword: "Կրկնել գաղտնաբառը", hide: "Թաքցնել գաղտնաբառը", show: "Ցույց տալ գաղտնաբառը", hideConfirm: "Թաքցնել կրկնված գաղտնաբառը", showConfirm: "Ցույց տալ կրկնված գաղտնաբառը", loading: "Ստեղծվում է հաշիվը…", submit: "Ստեղծել հաշիվ", note: "Հաշիվը կարող է կապվել նույն email-ով կամ հեռախոսով նախկինում կատարված ամրագրումների հետ։" },
  ru: { title: "Создать аккаунт клиента", subtitle: "Храните историю записей и предстоящие визиты в одном месте.", badge: "Аккаунт клиента Vizit", sideTitle: "Простая регистрация, затем быстрая запись", sideText: "Аккаунтом клиента удобно пользоваться с телефона и управлять визитами.", hasAccount: "Уже есть аккаунт клиента?", login: "войти", business: "Вы представляете бизнес?", businessRegister: "перейти к регистрации бизнеса", contactRequired: "Укажите email или номер телефона.", passwordShort: "Пароль должен содержать не менее 8 символов.", passwordMismatch: "Пароли не совпадают.", error: "Не удалось зарегистрироваться.", name: "Имя", namePlaceholder: "Например, Анна", email: "Электронная почта", phone: "Телефон", password: "Пароль", passwordPlaceholder: "Не менее 8 символов", confirmPassword: "Повторите пароль", hide: "Скрыть пароль", show: "Показать пароль", hideConfirm: "Скрыть повторный пароль", showConfirm: "Показать повторный пароль", loading: "Создаём аккаунт…", submit: "Создать аккаунт", note: "Аккаунт может быть связан с предыдущими записями, сделанными с тем же email или телефоном." },
  en: { title: "Create a client account", subtitle: "Keep booking history and upcoming visits in one place.", badge: "Vizit client account", sideTitle: "Simple registration, then fast booking", sideText: "The client account is easy to use on mobile and helps you manage visits.", hasAccount: "Already have a client account?", login: "sign in", business: "Are you a business?", businessRegister: "go to business registration", contactRequired: "Enter an email address or phone number.", passwordShort: "Password must be at least 8 characters.", passwordMismatch: "Passwords do not match.", error: "Registration failed.", name: "Name", namePlaceholder: "For example, Anna", email: "Email", phone: "Phone", password: "Password", passwordPlaceholder: "At least 8 characters", confirmPassword: "Confirm password", hide: "Hide password", show: "Show password", hideConfirm: "Hide confirmation password", showConfirm: "Show confirmation password", loading: "Creating account…", submit: "Create account", note: "Your account may be linked to earlier bookings made with the same email address or phone number." },
} as const;

export default function ClientRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth } = useAuth();
  const { locale } = useLanguage();
  const text = copy[locale];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() && !phone.trim()) {
      setError(text.contactRequired);
      return;
    }
    if (password.length < 8) {
      setError(text.passwordShort);
      return;
    }
    if (password !== passwordConfirmation) {
      setError(text.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/client/auth/register", {
        name,
        email: email.trim() || null,
        phone: phone.trim() || null,
        password,
        password_confirmation: passwordConfirmation,
      });
      setAuth(res.data.token, res.data.user);
      queryClient.clear();
      navigate("/client/cabinet", { replace: true });
    } catch (error: unknown) {
      setError(getValidationMessages(error)[0] ?? getErrorMessage(error, text.error));
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
      footer={<div className="space-y-2 text-center text-sm text-slate-500"><div>{text.hasAccount} <Link to="/client/login" className="font-medium text-violet-700 hover:text-violet-600">{text.login}</Link></div><div>{text.business} <Link to="/business/register?entry=trial" className="font-medium text-violet-700 hover:text-violet-600">{text.businessRegister}</Link></div></div>}
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        {error ? <motion.div variants={fadeUp} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</motion.div> : null}

        <motion.div variants={fadeUp}>
          <label htmlFor="client-register-name" className="mb-2 block text-sm font-medium text-slate-700">{text.name}</label>
          <input id="client-register-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder={text.namePlaceholder} required />
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div variants={fadeUp}>
            <label htmlFor="client-register-email" className="mb-2 block text-sm font-medium text-slate-700">{text.email}</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="client-register-email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder="name@email.com" />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="client-register-phone" className="mb-2 block text-sm font-medium text-slate-700">{text.phone}</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="client-register-phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder="+374..." />
            </div>
          </motion.div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div variants={fadeUp}>
            <label htmlFor="client-register-password" className="mb-2 block text-sm font-medium text-slate-700">{text.password}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="client-register-password" name="password" autoComplete="new-password" minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder={text.passwordPlaceholder} required />
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? text.hide : text.show} aria-pressed={showPassword} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="client-register-password-confirmation" className="mb-2 block text-sm font-medium text-slate-700">{text.confirmPassword}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="client-register-password-confirmation" name="password_confirmation" autoComplete="new-password" minLength={8} type={showConfirm ? "text" : "password"} value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder={text.confirmPassword} required />
              <button type="button" onClick={() => setShowConfirm((s) => !s)} aria-label={showConfirm ? text.hideConfirm : text.showConfirm} aria-pressed={showConfirm} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </motion.div>
        </div>

        <motion.button variants={fadeUp} type="submit" disabled={loading} className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800", loading && "cursor-not-allowed opacity-70")}>
          <UserPlus className="h-4 w-4" />
          {loading ? text.loading : text.submit}
        </motion.button>

        <SocialAuthButtons mode="register" audience="client" />

        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <div>{text.note}</div>
          </div>
        </motion.div>
      </motion.form>
    </AuthShell>
  );
}
