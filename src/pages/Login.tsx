import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";

import AuthShell from "../components/AuthShell";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/http";
import { cn } from "../lib/cn";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useAuth } from "../store/auth";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
    hy: { title: "Մուտք գործել", subtitle: "Մուտք գործեք ձեր Vizit հաշիվ", sideTitle: "Կառավարեք բիզնեսը մեկ պարզ միջավայրում", sideText: "Շարունակեք աշխատել օրացույցի, թիմի և ամրագրումների հետ մեկ անվտանգ workspace-ում։", noAccount: "Չունե՞ք հաշիվ", register: "Գրանցվել", email: "Էլ. փոստ", password: "Գաղտնաբառ", forgot: "Մոռացե՞լ եք գաղտնաբառը", hide: "Թաքցնել գաղտնաբառը", show: "Ցույց տալ գաղտնաբառը", loading: "Մուտք է կատարվում…", submit: "Մուտք գործել", error: "Մուտքը չհաջողվեց։ Ստուգեք տվյալները և փորձեք նորից։" },
    ru: { title: "Войти", subtitle: "Войдите в свой аккаунт Vizit", sideTitle: "Управляйте бизнесом в одном понятном пространстве", sideText: "Продолжайте работу с календарём, командой и записями в безопасном рабочем пространстве.", noAccount: "Нет аккаунта?", register: "Зарегистрироваться", email: "Электронная почта", password: "Пароль", forgot: "Забыли пароль?", hide: "Скрыть пароль", show: "Показать пароль", loading: "Вход…", submit: "Войти", error: "Не удалось войти. Проверьте данные и попробуйте снова." },
    en: { title: "Sign in", subtitle: "Sign in to your Vizit account", sideTitle: "Manage your business in one clear workspace", sideText: "Continue working with your calendar, team and bookings in one secure workspace.", noAccount: "Don't have an account?", register: "Register", email: "Email", password: "Password", forgot: "Forgot your password?", hide: "Hide password", show: "Show password", loading: "Signing in…", submit: "Sign in", error: "Sign-in failed. Check your details and try again." },
} as const;

export default function Login() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { setAuth } = useAuth();
    const { locale } = useLanguage();
    const text = copy[locale];

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
        } catch (error: unknown) {
            setError(getErrorMessage(error, text.error));
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
            footer={
                <div className="text-center text-sm text-slate-500">
                    {text.noAccount}{" "}
                    <Link to="/register" className="font-medium text-violet-700 hover:text-violet-600">
                        {text.register}
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
                    <label htmlFor="business-login-email" className="mb-2 block text-sm font-medium text-slate-700">{text.email}</label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="business-login-email"
                            name="email"
                            autoComplete="username"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="owner@mail.com"
                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base sm:h-12 sm:text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                    <div className="mb-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label htmlFor="business-login-password" className="block text-sm font-medium text-slate-700">{text.password}</label>
                        <Link
                            to="/forgot-password"
                            className="text-xs font-medium text-slate-500 transition hover:text-violet-700"
                        >
                            {text.forgot}
                        </Link>
                    </div>

                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="business-login-password"
                            name="password"
                            autoComplete="current-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-base sm:h-12 sm:text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? text.hide : text.show}
                            aria-pressed={showPassword}
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
                    {loading ? text.loading : text.submit}
                </motion.button>

                <SocialAuthButtons mode="login" audience="business" />

            </motion.form>
        </AuthShell>
    );
}
