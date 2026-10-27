import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

import AuthShell from "../components/AuthShell";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/http";
import { cn } from "../lib/cn";
import { fadeUp, hoverLift, staggerContainer } from "../lib/motion";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: { title: "Մոռացե՞լ եք գաղտնաբառը", subtitle: "Մուտքագրեք էլ. փոստը, և մենք կուղարկենք վերականգնման հղումը։", sideTitle: "Անվտանգ վերականգնում", sideText: "Վերականգնեք հաշվի հասանելիությունը պարզ ու անվտանգ քայլերով։", remembered: "Հիշեցի՞ք", back: "վերադառնալ մուտքին", email: "Էլ. փոստ", sending: "Ուղարկվում է…", send: "Ուղարկել հղումը", success: "Եթե email-ը ճիշտ է, վերականգնման հղումն ուղարկվեց։", error: "Չհաջողվեց ուղարկել։ Փորձեք նորից։" },
  ru: { title: "Забыли пароль?", subtitle: "Введите электронную почту, и мы отправим ссылку для восстановления.", sideTitle: "Безопасное восстановление", sideText: "Верните доступ к аккаунту в несколько простых и безопасных шагов.", remembered: "Вспомнили пароль?", back: "вернуться ко входу", email: "Электронная почта", sending: "Отправка…", send: "Отправить ссылку", success: "Если email указан верно, ссылка для восстановления отправлена.", error: "Не удалось отправить. Попробуйте снова." },
  en: { title: "Forgot your password?", subtitle: "Enter your email and we will send you a recovery link.", sideTitle: "Secure recovery", sideText: "Restore access to your account in a few clear, secure steps.", remembered: "Remembered it?", back: "return to sign in", email: "Email", sending: "Sending…", send: "Send recovery link", success: "If the email is correct, a recovery link has been sent.", error: "Could not send the link. Try again." },
} as const;

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const isClient = searchParams.get("audience") === "client";
  const { locale } = useLanguage();
  const text = copy[locale];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setIsError(false);
    try {
      await api.post(isClient ? "/client/auth/forgot-password" : "/auth/forgot-password", { email });
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
      audience={isClient ? "client" : "business"}
      title={text.title}
      subtitle={text.subtitle}
      sideTitle={text.sideTitle}
      sideText={text.sideText}
      footer={<div className="text-center text-sm text-[var(--vz-muted)]">{text.remembered} <Link to={isClient ? "/client/login" : "/login"} className="font-medium text-[var(--vz-accent-text)] hover:text-[var(--vz-accent-text)]">{text.back}</Link></div>}
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        {msg ? <motion.div variants={fadeUp} className={cn("rounded-2xl border px-4 py-3 text-sm", isError ? "border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] text-[var(--vz-danger)]" : "border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] text-[var(--vz-accent-text)]")}>{msg}</motion.div> : null}
        <motion.div variants={fadeUp}>
          <label htmlFor="forgot-password-email" className="mb-2 block text-sm font-medium text-[var(--vz-text-secondary)]">{text.email}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--vz-muted)]" />
            <input id="forgot-password-email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="example@mail.com" className="h-12 w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] pl-11 pr-4 text-sm text-[var(--vz-text)] outline-none transition focus:border-[var(--vz-primary)] focus:ring-4 focus:ring-[var(--vz-focus)]" />
          </div>
        </motion.div>
        <motion.button variants={fadeUp} type="submit" disabled={loading} {...hoverLift} className={cn("bg-[var(--vz-primary)] inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-medium text-[var(--vz-on-primary)] shadow-lg transition", loading && "cursor-not-allowed opacity-70")}>
          <Send className="h-4 w-4" />{loading ? text.sending : text.send}
        </motion.button>
      </motion.form>
    </AuthShell>
  );
}
