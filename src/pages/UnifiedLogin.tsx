import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, Mail, Phone } from "lucide-react";

import AuthShell from "../components/AuthShell";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useAuth, type User } from "../store/auth";

function getErrorMessage(err: any) {
  return (
    err?.response?.data?.message ??
    err?.response?.data?.errors?.email?.[0] ??
    err?.response?.data?.errors?.identity?.[0] ??
    "Մուտքը չհաջողվեց։ Ստուգիր տվյալները և փորձիր նորից։"
  );
}

function shouldFallbackToClient(identity: string, err: any) {
  if (!identity.includes("@")) return false;
  const status = err?.response?.status;
  const message = String(err?.response?.data?.message ?? "").toLowerCase();
  const emailError = String(err?.response?.data?.errors?.email?.[0] ?? "").toLowerCase();
  return status === 422 || message.includes("invalid credentials") || emailError.includes("invalid");
}

export default function UnifiedLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth } = useAuth();

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function finishLogin(token: string, user: User) {
    setAuth(token, user);
    queryClient.clear();

    if (user.audience === "client") {
      navigate("/client/cabinet", { replace: true });
      return;
    }

    navigate(user.needs_onboarding ? "/app/onboarding" : "/app/dashboard", { replace: true });
  }

  async function tryBusiness(email: string, pass: string) {
    const res = await api.post("/auth/login", { email, password: pass });
    finishLogin(res.data.token, res.data.user);
  }

  async function tryClient(id: string, pass: string) {
    const res = await api.post("/client/auth/login", { identity: id, password: pass });
    finishLogin(res.data.token, res.data.user);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const trimmed = identity.trim();

    try {
      if (trimmed.includes("@")) {
        try {
          await tryBusiness(trimmed, password);
          return;
        } catch (err: any) {
          if (!shouldFallbackToClient(trimmed, err)) {
            throw err;
          }
        }
      }

      await tryClient(trimmed, password);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Մուտք գործել"
      subtitle="Մուտք գործիր քո SmartBook հաշիվ։"
      badge="SmartBook access"
      sideTitle="Բարի վերադարձ"
      sideText="Business-ը կարող է մուտք գործել email-ով, client-ը՝ email կամ հեռախոսահամարով։"
      footer={
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <Link to="/forgot-password" className="font-medium text-slate-600 hover:text-violet-700">Մոռացե՞լ եք գաղտնաբառը</Link>
          <div>
            Չունե՞ս հաշիվ {" "}
            <Link to="/register" className="font-medium text-violet-700 hover:text-violet-600">Գրանցվել</Link>
          </div>
        </div>
      }
    >
      <motion.form variants={staggerContainer(0.08)} initial="hidden" animate="show" onSubmit={submit} className="space-y-5">
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <Link to="/business/login" className="rounded-xl px-3 py-2 text-center text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">Business</Link>
          <Link to="/client/login" className="rounded-xl px-3 py-2 text-center text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">Client</Link>
        </motion.div>

        {error ? (
          <motion.div variants={fadeUp} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </motion.div>
        ) : null}

        <motion.div variants={fadeUp}>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email կամ հեռախոս</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="owner@mail.com կամ +374..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              required
            />
            <Phone className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
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

        <motion.button
          variants={fadeUp}
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-700",
            loading && "cursor-not-allowed opacity-70"
          )}
        >
          <LogIn className="h-4 w-4" />
          {loading ? "Մուտք է կատարվում..." : "Մուտք գործել"}
        </motion.button>
      </motion.form>
    </AuthShell>
  );
}
