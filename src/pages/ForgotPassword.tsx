import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

import AuthShell from "../components/AuthShell";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { fadeUp, hoverLift, staggerContainer } from "../lib/motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const r = await api.post("/auth/forgot-password", { email });
      setMsg(r.data?.message || "Եթե email-ը ճիշտ է, վերականգնման հղումը ուղարկվեց։");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Չհաջողվեց ուղարկել։ Փորձիր նորից։");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Մոռացե՞լ ես գաղտնաբառը"
      subtitle="Մուտքագրիր էլ. փոստը, և մենք կուղարկենք վերականգնման հղումը"
      sideTitle="Անվտանգ վերականգնում"
      sideText="Vizit-ը պահպանում է վերականգնման հոսքը պարզ, արագ և հասկանալի՝ առանց ավելորդ քայլերի։"
      footer={<div className="text-center text-sm text-slate-500">Հիշեցի՞ր <Link to="/login" className="font-medium text-violet-700 hover:text-violet-600">վերադառնալ մուտքին</Link></div>}
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        {msg ? <motion.div variants={fadeUp} className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">{msg}</motion.div> : null}
        <motion.div variants={fadeUp}>
          <label className="mb-2 block text-sm font-medium text-slate-700">Էլ. փոստ</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="example@mail.com" className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
          </div>
        </motion.div>
        <motion.button variants={fadeUp} type="submit" disabled={loading} {...hoverLift} className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition", loading && "cursor-not-allowed opacity-70")}>
          <Send className="h-4 w-4" />{loading ? "Ուղարկում ենք..." : "Ուղարկել հղումը"}
        </motion.button>
      </motion.form>
    </AuthShell>
  );
}
