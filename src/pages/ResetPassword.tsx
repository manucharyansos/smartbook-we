import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Save } from "lucide-react";

import AuthShell from "../components/AuthShell";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { fadeUp, hoverLift, staggerContainer } from "../lib/motion";

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const emailFromQuery = sp.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!token && !!email && password.length >= 8 && password === password_confirmation, [token, email, password, password_confirmation]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const r = await api.post("/auth/reset-password", { token, email, password, password_confirmation });
      setMsg(r.data?.message || "Գաղտնաբառը փոխվեց։ Կարող ես մուտք գործել։");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Չհաջողվեց փոխել գաղտնաբառը։");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Վերականգնել գաղտնաբառը"
      subtitle="Սահմանիր նոր գաղտնաբառ և վերադարձիր քո հաշիվ"
      sideTitle="Անվտանգ մուտք՝ նոր գաղտնաբառով"
      sideText="Եթե հղումը բացվել է email-ից, պարզապես լրացրու ձևը և պահպանիր փոփոխությունը։"
      footer={<div className="text-center text-sm text-slate-500">Արդեն ավարտե՞լ ես <Link to="/login" className="font-medium text-violet-700 hover:text-violet-600">գնալ մուտքին</Link></div>}
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        {!token ? <motion.div variants={fadeUp} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Token-ը բացակայում է կամ հղումը սխալ է։</motion.div> : null}
        {msg ? <motion.div variants={fadeUp} className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">{msg}</motion.div> : null}

        <motion.div variants={fadeUp}>
          <label className="mb-2 block text-sm font-medium text-slate-700">Էլ. փոստ</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
          </div>
        </motion.div>

        {[
          { label: "Նոր գաղտնաբառ", value: password, set: setPassword, show: showPassword, toggle: () => setShowPassword((s) => !s) },
          { label: "Կրկնել գաղտնաբառը", value: password_confirmation, set: setPasswordConfirmation, show: showConfirmPassword, toggle: () => setShowConfirmPassword((s) => !s) },
        ].map((item, i) => (
          <motion.div variants={fadeUp} key={i}>
            <label className="mb-2 block text-sm font-medium text-slate-700">{item.label}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={item.value} onChange={(e) => item.set(e.target.value)} type={item.show ? "text" : "password"} required className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
              <button type="button" onClick={item.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">{item.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </motion.div>
        ))}

        <motion.button variants={fadeUp} type="submit" disabled={loading || !canSubmit} {...hoverLift} className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition", (loading || !canSubmit) && "cursor-not-allowed opacity-70")}>
          <Save className="h-4 w-4" />{loading ? "Պահպանում ենք..." : "Պահպանել"}
        </motion.button>
      </motion.form>
    </AuthShell>
  );
}
