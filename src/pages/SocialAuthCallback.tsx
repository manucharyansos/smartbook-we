import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, LoaderCircle, ShieldCheck } from "lucide-react";

import AuthShell from "../components/AuthShell";
import { api } from "../lib/api";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useAuth } from "../store/auth";

export default function SocialAuthCallback() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { setAuth } = useAuth();

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function boot() {
            const token = params.get("token");
            const message = params.get("message");
            const provider = params.get("provider");
            const audience = params.get("audience") === "business" ? "business" : "client";

            if (!token) {
                setError(message || "Սոցիալական մուտքը չհաջողվեց։");
                return;
            }

            try {
                const res = await api.get(audience === "client" ? "/client/auth/me" : "/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const user = res.data.user;
                setAuth(token, user);

                navigate(audience === "client" ? "/client/cabinet" : (user?.needs_onboarding ? "/app/onboarding" : "/app/dashboard"), {
                    replace: true,
                });
            } catch (e: any) {
                setError(
                    e?.response?.data?.message ??
                    `${provider ? `${provider}-ով ` : ""}մուտքը չհաջողվեց։`
                );
            }
        }

        boot();
    }, [navigate, params, setAuth]);

    return (
        <AuthShell
            title="Social sign in"
            subtitle="Ստուգում ենք սոցիալական մուտքի տվյալները"
            sideTitle="Մուտք գործիր ավելի արագ"
            sideText="Google կամ Facebook մուտքը թույլ է տալիս հաճախորդին ավելի արագ անցնել իր cabinet կամ booking flow։"
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
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>{error}</div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={fadeUp}
                        className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-5 text-sm text-slate-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                            </div>
                            <div>
                                <div className="font-medium text-slate-900">Սպասիր մի պահ…</div>
                                <div className="mt-1 text-slate-500">
                                    Ավարտում ենք social login-ը և բեռնում ենք քո հաշիվը։
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    variants={fadeUp}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600"
                >
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                        <div>
                            Social login-ը լավ է հատկապես client cabinet-ի համար, որովհետև հաճախորդը
                            ավելի արագ է անցնում booking-ից դեպի իր անձնական էջ։
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AuthShell>
    );
}