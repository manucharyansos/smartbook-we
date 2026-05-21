import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, UserPlus } from "lucide-react";

import AuthShell from "../components/AuthShell";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useAuth } from "../store/auth";

export default function ClientRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth } = useAuth();

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
      setError("Նշիր email կամ հեռախոսահամար։");
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
    } catch (err: any) {
      const fieldErrors = err?.response?.data?.errors;
      const firstField = fieldErrors ? Object.values(fieldErrors)[0] : null;
      setError((Array.isArray(firstField) ? firstField[0] : null) ?? err?.response?.data?.message ?? "Գրանցումը չհաջողվեց։");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Ստեղծել հաճախորդի հաշիվ"
      subtitle="Ստեղծիր account և պահիր քո booking history-ն, upcoming այցերն ու salon կապերը մեկ տեղում։"
      badge="Vizit հաճախորդի հաշիվ"
      sideTitle="Պարզ registration, հետո՝ արագ booking experience"
      sideText="Client flow-ը պետք է լինի թեթև, պարզ և հարմար mobile-ից օգտագործելու համար։"
      footer={<div className="text-center text-sm text-slate-500">Բիզնես ե՞ս <Link to="/business/register?entry=trial" className="font-medium text-violet-700 hover:text-violet-600">անցնել business signup</Link></div>}
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        {error ? <motion.div variants={fadeUp} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</motion.div> : null}

        <motion.div variants={fadeUp}>
          <label className="mb-2 block text-sm font-medium text-slate-700">Անուն</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder="Օրինակ՝ Անուշ" required />
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div variants={fadeUp}>
            <label className="mb-2 block text-sm font-medium text-slate-700">Էլ. փոստ</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder="name@email.com" />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label className="mb-2 block text-sm font-medium text-slate-700">Հեռախոս</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder="+374..." />
            </div>
          </motion.div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div variants={fadeUp}>
            <label className="mb-2 block text-sm font-medium text-slate-700">Գաղտնաբառ</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder="Առնվազն 8 նիշ" required />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label className="mb-2 block text-sm font-medium text-slate-700">Կրկնել գաղտնաբառը</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type={showConfirm ? "text" : "password"} value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" placeholder="Կրկնել գաղտնաբառը" required />
              <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </motion.div>
        </div>

        <motion.button variants={fadeUp} type="submit" disabled={loading} className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800", loading && "cursor-not-allowed opacity-70")}>
          <UserPlus className="h-4 w-4" />
          {loading ? "Ստեղծում ենք cabinet-ը..." : "Ստեղծել հաշիվ"}
        </motion.button>

        <SocialAuthButtons mode="register" audience="client" />

        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <div>Cabinet-ը կարող է կապվել նույն email/phone-ով արված նախորդ booking-ների հետ, եթե դրանք համակարգում արդեն կան։</div>
          </div>
        </motion.div>
      </motion.form>
    </AuthShell>
  );
}
