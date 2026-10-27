import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, LoaderCircle, ShieldCheck } from "lucide-react";

import AuthShell from "../components/AuthShell";
import { api } from "../lib/api";
import { fadeUp, staggerContainer } from "../lib/motion";
import {
    clearPendingSocialBusinessProfile,
    getPendingSocialBusinessProfile,
} from "../lib/socialAuth";
import { useAuth, type User } from "../store/auth";
import { useLanguage } from "../contexts/LanguageContext";

function getErrorMessage(error: unknown, fallback: string): string {
    if (!error || typeof error !== "object") return fallback;

    const response = "response" in error ? error.response : null;
    if (!response || typeof response !== "object" || !("data" in response)) return fallback;

    const data = response.data;
    if (!data || typeof data !== "object") return fallback;

    if ("message" in data && typeof data.message === "string" && data.message.trim()) {
        return data.message;
    }

    if ("errors" in data && data.errors && typeof data.errors === "object") {
        for (const fieldErrors of Object.values(data.errors)) {
            if (Array.isArray(fieldErrors) && typeof fieldErrors[0] === "string") {
                return fieldErrors[0];
            }
        }
    }

    return fallback;
}

export default function SocialAuthCallback() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { setAuth } = useAuth();
    const { locale } = useLanguage();
    const audience = params.get("audience") === "business" ? "business" : "client";

    const text = {
        hy: {
            title: "Սոցիալական մուտք",
            subtitle: "Ստուգում ենք սոցիալական մուտքի տվյալները",
            sideTitle: "Մուտք գործիր ավելի արագ",
            sideText: "Google կամ Facebook մուտքը թույլ է տալիս արագ ու անվտանգ բացել քո հաշիվը։",
            failed: "Սոցիալական մուտքը չհաջողվեց։ Փորձիր նորից։",
            waiting: "Սպասիր մի պահ…",
            loading: "Ավարտում ենք մուտքը և բեռնում ենք քո հաշիվը։",
            secure: "Մուտքի տվյալները փոխանցվում և ստուգվում են անվտանգ կապով։",
        },
        ru: {
            title: "Вход через соцсеть",
            subtitle: "Проверяем данные для входа",
            sideTitle: "Войдите быстрее",
            sideText: "Google или Facebook помогут быстро и безопасно открыть ваш аккаунт.",
            failed: "Не удалось войти через соцсеть. Попробуйте ещё раз.",
            waiting: "Подождите немного…",
            loading: "Завершаем вход и загружаем ваш аккаунт.",
            secure: "Данные входа передаются и проверяются по защищённому соединению.",
        },
        en: {
            title: "Social sign-in",
            subtitle: "Verifying your sign-in details",
            sideTitle: "Sign in faster",
            sideText: "Google or Facebook lets you open your account quickly and securely.",
            failed: "Social sign-in failed. Please try again.",
            waiting: "One moment…",
            loading: "Finishing sign-in and loading your account.",
            secure: "Your sign-in details are transmitted and verified over a secure connection.",
        },
    }[locale];

    const [error, setError] = useState<string | null>(null);
    const exchangeStarted = useRef(false);

    useEffect(() => {
        if (exchangeStarted.current) return;
        exchangeStarted.current = true;

        async function boot() {
            const exchangeCode = params.get("code");
            const message = params.get("message");
            const provider = params.get("provider");
            const mode = params.get("mode");

            if (!exchangeCode) {
                setError(message || text.failed);
                return;
            }

            try {
                const pendingBusinessProfile =
                    audience === "business" && mode === "register"
                        ? getPendingSocialBusinessProfile()
                        : null;
                const exchangePayload =
                    pendingBusinessProfile && pendingBusinessProfile.provider === provider
                        ? {
                            code: exchangeCode,
                            business_name: pendingBusinessProfile.business_name,
                            business_phone: pendingBusinessProfile.business_phone,
                            business_address: pendingBusinessProfile.business_address,
                            latitude: pendingBusinessProfile.latitude,
                            longitude: pendingBusinessProfile.longitude,
                            business_category_id: pendingBusinessProfile.business_category_id,
                            business_category_slug: pendingBusinessProfile.business_category_slug,
                            custom_category_name: pendingBusinessProfile.custom_category_name,
                        }
                        : { code: exchangeCode };

                const exchange = await api.post<{ token?: string; user?: User }>(
                    "/auth/social/exchange",
                    exchangePayload,
                );
                const token = exchange.data?.token ?? null;
                let user = exchange.data?.user ?? null;

                if (!token) {
                    throw new Error("Missing social auth token");
                }

                if (!user) {
                    const res = await api.get<{ user: User }>(audience === "client" ? "/client/auth/me" : "/auth/me", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    user = res.data.user;
                }

                setAuth(token, user);
                if (audience === "business" && mode === "register") {
                    clearPendingSocialBusinessProfile();
                }

                navigate(
                    audience === "client"
                        ? "/client/cabinet"
                        : user?.needs_onboarding
                            ? "/app/onboarding"
                            : "/app/dashboard",
                    { replace: true }
                );
            } catch (error: unknown) {
                setError(getErrorMessage(error, text.failed));
            }
        }

        boot();
    }, [audience, navigate, params, setAuth, text.failed]);

    return (
        <AuthShell
            audience={audience}
            title={text.title}
            subtitle={text.subtitle}
            sideTitle={text.sideTitle}
            sideText={text.sideText}
            footer={null}
        >
            <motion.div
                variants={staggerContainer(0.08)}
                initial="hidden"
                animate="show"
                className="space-y-4"
            >
                {error ? (
                    <motion.div
                        variants={fadeUp}
                        className="rounded-2xl border border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] px-4 py-4 text-sm text-[var(--vz-danger)]"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>{error}</div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={fadeUp}
                        className="rounded-2xl border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-4 py-5 text-sm text-[var(--vz-text-secondary)]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--vz-surface)] text-[var(--vz-accent-text)] shadow-sm">
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--vz-text)]">{text.waiting}</div>
                                <div className="mt-1 text-[var(--vz-muted)]">
                                    {text.loading}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div variants={fadeUp} className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-4 text-sm text-[var(--vz-text-secondary)]">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--vz-accent-text)]" />
                        <div>{text.secure}</div>
                    </div>
                </motion.div>
            </motion.div>
        </AuthShell>
    );
}
