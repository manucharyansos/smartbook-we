import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, Mail, UserRound } from "lucide-react";

import AuthShell from "../components/AuthShell";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useAuth } from "../store/auth";

export default function ClientLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth } = useAuth();

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
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.response?.data?.errors?.identity?.[0] ?? "Մուտքը չհաջողվեց։");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Client login"
      subtitle="Մուտք գործիր և տես upcoming ու past այցերդ մեկ վայրում։"
      badge="SmartBook client cabinet"
      sideTitle="Քո ամրագրումները՝ մեկ պարզ cabinet-ում"
      sideText="Հաճախորդի համար արագ մուտքը պետք է լինի պարզ, վստահելի և առանց ավելորդ business դաշտերի։"
      footer={<div className="text-center text-sm text-slate-500">Բիզնեսի մուտք պե՞տք է <Link to="/business/login" className="font-medium text-violet-700 hover:text-violet-600">անցնել business login</Link></div>}
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        {error ? <motion.div variants={fadeUp} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</motion.div> : null}

        <motion.div variants={fadeUp}>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email կամ հեռախոս</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="name@email.com կամ +374..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              required
            />
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <label className="mb-2 block text-sm font-medium text-slate-700">Գաղտնաբառ</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              required
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>

        <motion.button variants={fadeUp} type="submit" disabled={loading} className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800", loading && "cursor-not-allowed opacity-70")}>
          <LogIn className="h-4 w-4" />
          {loading ? "Մուտք է կատարվում..." : "Բացել cabinet-ը"}
        </motion.button>

        <SocialAuthButtons mode="login" audience="client" />

        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
          <div className="flex items-start gap-2">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <div>Եթե նույն email/phone-ով նախկինում booking ես արել, cabinet-ը կփորձի կապել այդ այցերը քո նոր հաշվին։</div>
          </div>
        </motion.div>
      </motion.form>
    </AuthShell>
  );
}
