import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";

import AuthShell from "../components/AuthShell";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useAuth } from "../store/auth";

export default function Login() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { setAuth } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { email, password });
            const { token, user } = res.data;

            setAuth(token, user);
            queryClient.clear();

            navigate(user.needs_onboarding ? "/app/onboarding" : "/app/dashboard", {
                replace: true,
            });
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                err?.response?.data?.errors?.email?.[0] ??
                "Մուտքը չհաջողվեց։ Ստուգիր տվյալները և փորձիր նորից։"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            title="Մուտք գործել"
            subtitle="Մուտք գործիր քո SmartBook հաշիվ"
            sideTitle="Կառավարիր բիզնեսդ մեկ պարզ միջավայրում"
            sideText="Մուտք գործիր workspace ու շարունակիր աշխատել օրացույցի, թիմի և ամրագրումների հետ։"
            footer={
                <div className="text-center text-sm text-slate-500">
                    Չունե՞ս հաշիվ{" "}
                    <Link to="/register" className="font-medium text-violet-700 hover:text-violet-600">
                        Գրանցվել
                    </Link>
                </div>
            }
        >
            <motion.form
                variants={staggerContainer(0.08)}
                initial="hidden"
                animate="show"
                onSubmit={submit}
                className="space-y-5"
            >
                {error ? (
                    <motion.div
                        variants={fadeUp}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    >
                        {error}
                    </motion.div>
                ) : null}

                <motion.div variants={fadeUp}>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Էլ. փոստ</label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="owner@mail.com"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                    <div className="mb-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label className="block text-sm font-medium text-slate-700">Գաղտնաբառ</label>
                        <Link
                            to="/forgot-password"
                            className="text-xs font-medium text-slate-500 transition hover:text-violet-700"
                        >
                            Մոռացե՞լ եք գաղտնաբառը
                        </Link>
                    </div>

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
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700"
                        >
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

                <SocialAuthButtons mode="login" audience="business" />

            </motion.form>
        </AuthShell>
    );
}