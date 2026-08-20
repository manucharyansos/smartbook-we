import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Save } from "lucide-react";

import AuthShell from "../components/AuthShell";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/http";
import { cn } from "../lib/cn";
import { fadeUp, hoverLift, staggerContainer } from "../lib/motion";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: { title: "Վերականգնել գաղտնաբառը", subtitle: "Սահմանեք նոր գաղտնաբառ և վերադարձեք ձեր հաշիվ։", sideTitle: "Անվտանգ մուտք՝ նոր գաղտնաբառով", sideText: "Լրացրեք ձևը և պահպանեք նոր գաղտնաբառը։", done: "Արդեն ավարտե՞լ եք", login: "գնալ մուտքին", tokenMissing: "Վերականգնման token-ը բացակայում է կամ հղումը սխալ է։", success: "Գաղտնաբառը փոխվեց։ Այժմ կարող եք մուտք գործել։", error: "Չհաջողվեց փոխել գաղտնաբառը։", email: "Էլ. փոստ", password: "Նոր գաղտնաբառ", confirm: "Կրկնել գաղտնաբառը", show: "Ցույց տալ գաղտնաբառը", hide: "Թաքցնել գաղտնաբառը", saving: "Պահպանվում է…", save: "Պահպանել" },
  ru: { title: "Восстановить пароль", subtitle: "Задайте новый пароль и вернитесь в аккаунт.", sideTitle: "Безопасный вход с новым паролем", sideText: "Заполните форму и сохраните новый пароль.", done: "Уже закончили?", login: "перейти ко входу", tokenMissing: "Токен восстановления отсутствует или ссылка неверна.", success: "Пароль изменён. Теперь можно войти.", error: "Не удалось изменить пароль.", email: "Электронная почта", password: "Новый пароль", confirm: "Повторите пароль", show: "Показать пароль", hide: "Скрыть пароль", saving: "Сохранение…", save: "Сохранить" },
  en: { title: "Reset password", subtitle: "Set a new password and return to your account.", sideTitle: "Secure access with a new password", sideText: "Complete the form and save your new password.", done: "Already finished?", login: "go to sign in", tokenMissing: "The recovery token is missing or the link is invalid.", success: "Your password has been changed. You can now sign in.", error: "Could not change the password.", email: "Email", password: "New password", confirm: "Confirm password", show: "Show password", hide: "Hide password", saving: "Saving…", save: "Save" },
} as const;

export default function ResetPassword() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const emailFromQuery = sp.get("email") || "";
  const isClient = sp.get("audience") === "client";

  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const canSubmit = useMemo(() => !!token && !!email && password.length >= 8 && password === password_confirmation, [token, email, password, password_confirmation]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setIsError(false);
    try {
      await api.post(isClient ? "/client/auth/reset-password" : "/auth/reset-password", { token, email, password, password_confirmation });
      setPassword("");
      setPasswordConfirmation("");
      setMsg(text.success);
    } catch (error: unknown) {
      setIsError(true);
      setMsg(getErrorMessage(error, text.error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={text.title}
      subtitle={text.subtitle}
      sideTitle={text.sideTitle}
      sideText={text.sideText}
      footer={<div className="text-center text-sm text-slate-500">{text.done} <Link to={isClient ? "/client/login" : "/login"} className="font-medium text-violet-700 hover:text-violet-600">{text.login}</Link></div>}
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        {!token ? <motion.div variants={fadeUp} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{text.tokenMissing}</motion.div> : null}
        {msg ? <motion.div variants={fadeUp} className={cn("rounded-2xl border px-4 py-3 text-sm", isError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-violet-200 bg-violet-50 text-violet-700")}>{msg}</motion.div> : null}

        <motion.div variants={fadeUp}>
          <label htmlFor="reset-password-email" className="mb-2 block text-sm font-medium text-slate-700">{text.email}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="reset-password-email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
          </div>
        </motion.div>

        {[
          { id: "reset-password-new", name: "password", label: text.password, value: password, set: setPassword, show: showPassword, toggle: () => setShowPassword((s) => !s) },
          { id: "reset-password-confirmation", name: "password_confirmation", label: text.confirm, value: password_confirmation, set: setPasswordConfirmation, show: showConfirmPassword, toggle: () => setShowConfirmPassword((s) => !s) },
        ].map((item) => (
          <motion.div variants={fadeUp} key={item.id}>
            <label htmlFor={item.id} className="mb-2 block text-sm font-medium text-slate-700">{item.label}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id={item.id} name={item.name} autoComplete="new-password" minLength={8} value={item.value} onChange={(e) => item.set(e.target.value)} type={item.show ? "text" : "password"} required className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
              <button type="button" onClick={item.toggle} aria-label={item.show ? text.hide : text.show} aria-pressed={item.show} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">{item.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </motion.div>
        ))}

        <motion.button variants={fadeUp} type="submit" disabled={loading || !canSubmit} {...hoverLift} className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition", (loading || !canSubmit) && "cursor-not-allowed opacity-70")}>
          <Save className="h-4 w-4" />{loading ? text.saving : text.save}
        </motion.button>
      </motion.form>
    </AuthShell>
  );
}
