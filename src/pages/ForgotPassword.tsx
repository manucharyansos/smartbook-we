import { useState } from "react";
import { Link } from "react-router-dom";
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
  const { locale } = useLanguage();
  const text = copy[locale];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const r = await api.post("/auth/forgot-password", { email });
      setMsg(r.data?.message || text.success);
    } catch (error: unknown) {
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
      footer={<div className="text-center text-sm text-slate-500">{text.remembered} <Link to="/login" className="font-medium text-violet-700 hover:text-violet-600">{text.back}</Link></div>}
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        {msg ? <motion.div variants={fadeUp} className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">{msg}</motion.div> : null}
        <motion.div variants={fadeUp}>
          <label htmlFor="forgot-password-email" className="mb-2 block text-sm font-medium text-slate-700">{text.email}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="forgot-password-email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="example@mail.com" className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
          </div>
        </motion.div>
        <motion.button variants={fadeUp} type="submit" disabled={loading} {...hoverLift} className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition", loading && "cursor-not-allowed opacity-70")}>
          <Send className="h-4 w-4" />{loading ? text.sending : text.send}
        </motion.button>
      </motion.form>
    </AuthShell>
  );
}
