import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle,
    Check,
    Eye,
    EyeOff,
    Lock,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    Stethoscope,
    Store,
    User,
    UserPlus,
} from "lucide-react";

import AuthShell from "../components/AuthShell";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { getDeviceFingerprint } from "../lib/fingerprint";
import { fadeUp, scaleIn, staggerContainer } from "../lib/motion";
import { useAuth } from "../store/auth";

type BusinessType = "beauty" | "dental";

export default function Register() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { setAuth } = useAuth();
    const [searchParams] = useSearchParams();

    const initialType = (searchParams.get("type") as BusinessType) || "beauty";

    const [business_type, setBusinessType] = useState<BusinessType>(initialType);
    const [business_name, setBusinessName] = useState("");
    const [business_phone, setBusinessPhone] = useState("");
    const [business_address, setBusinessAddress] = useState("");

    const [owner_name, setOwnerName] = useState("");
    const [owner_email, setOwnerEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirmation, setPasswordConfirmation] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [passwordStrength, setPasswordStrength] = useState<
        "weak" | "medium" | "strong" | null
    >(null);

    useEffect(() => {
        if (!password) {
            setPasswordStrength(null);
            return;
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        if (score <= 2) setPasswordStrength("weak");
        else if (score <= 4) setPasswordStrength("medium");
        else setPasswordStrength("strong");
    }, [password]);

    const businessMeta = useMemo(
        () => ({
            beauty: {
                label: "Գեղեցկության սրահ",
                short: "Գեղեցկություն",
                icon: Sparkles,
            },
            dental: {
                label: "Ատամնաբուժական կլինիկա",
                short: "Կլինիկա",
                icon: Stethoscope,
            },
        }),
        []
    );

    const CurrentIcon = businessMeta[business_type].icon;

    function validateStepOne() {
        if (!business_name.trim()) {
            setError("Նշիր բիզնեսի անունը։");
            return false;
        }

        if (!business_phone.trim()) {
            setError("Հեռախոսահամարը պարտադիր է։");
            return false;
        }

        setError(null);
        setErrorCode(null);
        return true;
    }

    function nextStep() {
        if (!validateStepOne()) return;
        setCurrentStep(2);
    }

    function prevStep() {
        setCurrentStep(1);
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!owner_name.trim()) {
            setError("Նշիր պատասխանատուի անունը։");
            return;
        }

        if (!owner_email.trim()) {
            setError("Նշիր էլ. փոստը։");
            return;
        }

        if (password.length < 8) {
            setError("Գաղտնաբառը պետք է պարունակի առնվազն 8 նիշ։");
            return;
        }

        if (password !== password_confirmation) {
            setError("Գաղտնաբառերը չեն համընկնում։");
            return;
        }

        setLoading(true);
        setErrorCode(null);

        try {
            const fp = getDeviceFingerprint();

            const res = await api.post(
                "/auth/register",
                {
                    business_name,
                    business_phone,
                    business_address: business_address || null,
                    business_type,
                    name: owner_name,
                    email: owner_email,
                    password,
                    password_confirmation,
                },
                {
                    headers: { "X-Device-Fingerprint": fp },
                }
            );

            setAuth(res.data.token, res.data.user);
            queryClient.clear();

            navigate("/app/onboarding", {
                replace: true,
            });
        } catch (err: any) {
            const apiError = err?.response?.data;
            const firstFieldError = apiError?.errors ? Object.values(apiError.errors)[0] : null;
            const friendly = Array.isArray(firstFieldError) ? firstFieldError[0] : null;
            const code = typeof apiError?.code === "string" ? apiError.code : null;

            setErrorCode(code);
            setError(friendly ?? apiError?.message ?? "Գրանցումը չհաջողվեց։");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            title="Գրանցվել"
            subtitle="Ստեղծիր քո SmartBook business հաշիվ"
            sideTitle="Սկսիր SmartBook-ը քո բիզնեսի համար"
            sideText="Գրանցվիր, հետո անցիր onboarding և պատրաստիր workspace-ը աշխատանքի համար։"
            footer={
                <div className="text-center text-sm text-slate-500">
                    Արդեն ունե՞ս հաշիվ{" "}
                    <Link to="/login" className="font-medium text-violet-700 hover:text-violet-600">
                        Մուտք գործել
                    </Link>
                </div>
            }
        >
            <motion.form
                onSubmit={submit}
                variants={staggerContainer(0.08)}
                initial="hidden"
                animate="show"
                className="space-y-5 sm:space-y-6"
            >
                {error ? (
                    <motion.div
                        variants={fadeUp}
                        className={cn(
                            "rounded-2xl border px-4 py-4 text-sm",
                            errorCode === "trial_already_used"
                                ? "border-amber-200 bg-amber-50 text-amber-900"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <div>{error}</div>

                                {errorCode === "trial_already_used" ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Link
                                            to="/business/login"
                                            className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                                        >
                                            Մուտք բիզնես հաշվով
                                        </Link>

                                        <Link
                                            to="/forgot-password"
                                            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                                        >
                                            Վերականգնել գաղտնաբառը
                                        </Link>

                                        <Link
                                            to="/support"
                                            className="inline-flex items-center rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900"
                                        >
                                            Կապ աջակցման թիմի հետ
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                ) : null}

                {!searchParams.get("type") ? (
                    <motion.div variants={fadeUp}>
                        <label className="mb-3 block text-sm font-medium text-slate-700">
                            Ընտրիր բիզնեսի տեսակը
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {(["beauty", "dental"] as BusinessType[]).map((type) => {
                                const Icon = businessMeta[type].icon;
                                const active = business_type === type;

                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setBusinessType(type)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-[22px] border p-4 text-left transition",
                                            active
                                                ? "border-violet-300 bg-violet-50 shadow-sm"
                                                : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/60"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "grid h-11 w-11 place-items-center rounded-2xl",
                                                active ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-semibold text-slate-900">
                                                {businessMeta[type].short}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {businessMeta[type].label}
                                            </div>
                                        </div>

                                        {active ? <Check className="h-4 w-4 text-violet-600" /> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : null}

                <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 sm:gap-3">
                    {[1, 2].map((step, index) => (
                        <div key={step} className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition",
                                    currentStep >= step
                                        ? "bg-violet-600 text-white shadow-md"
                                        : "bg-slate-100 text-slate-400"
                                )}
                            >
                                {step}
                            </div>

                            {index === 0 ? (
                                <div
                                    className={cn(
                                        "h-[2px] w-10 rounded-full transition sm:w-14",
                                        currentStep >= 2 ? "bg-violet-500" : "bg-slate-200"
                                    )}
                                />
                            ) : null}
                        </div>
                    ))}
                </motion.div>

                <AnimatePresence mode="wait">
                    {currentStep === 1 ? (
                        <motion.div
                            key="step-1"
                            variants={scaleIn}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="space-y-5"
                        >
                            <motion.div
                                variants={fadeUp}
                                className="rounded-[24px] border border-violet-100 bg-violet-50/60 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                                        <CurrentIcon className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">
                                            {businessMeta[business_type].label}
                                        </div>
                                        <div className="mt-1 text-xs leading-6 text-slate-500">
                                            Սկսենք քո բիզնեսի հիմնական տվյալներից։
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Բիզնեսի անուն
                                </label>

                                <div className="relative">
                                    <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={business_name}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder={
                                            business_type === "beauty" ? "Իմ սրահը" : "Իմ կլինիկան"
                                        }
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Հեռախոս
                                </label>

                                <div className="relative">
                                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={business_phone}
                                        onChange={(e) => setBusinessPhone(e.target.value)}
                                        placeholder="+374 77 123456"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Հասցե
                                </label>

                                <div className="relative">
                                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={business_address}
                                        onChange={(e) => setBusinessAddress(e.target.value)}
                                        placeholder="Երևան, Հայաստան"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                    />
                                </div>
                            </motion.div>

                            <motion.button
                                variants={fadeUp}
                                type="button"
                                onClick={nextStep}
                                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-700"
                            >
                                Շարունակել
                            </motion.button>

                            <SocialAuthButtons mode="register" audience="business" />


                        </motion.div>
                    ) : (
                        <motion.div
                            key="step-2"
                            variants={scaleIn}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="space-y-5"
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                            <motion.div variants={fadeUp}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Պատասխանատուի անուն
                                </label>

                                <div className="relative">
                                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={owner_name}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        placeholder="Անուն Ազգանուն"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Էլ. փոստ
                                </label>

                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={owner_email}
                                        onChange={(e) => setOwnerEmail(e.target.value)}
                                        placeholder="owner@example.com"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                </div>
                            </motion.div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                            <motion.div variants={fadeUp}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Գաղտնաբառ
                                </label>

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

                                {passwordStrength ? (
                                    <div className="mt-3">
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map((index) => (
                                                <div
                                                    key={index}
                                                    className={cn(
                                                        "h-2 flex-1 rounded-full transition",
                                                        passwordStrength === "weak" && index === 1 && "bg-rose-400",
                                                        passwordStrength === "medium" && index <= 2 && "bg-amber-400",
                                                        passwordStrength === "strong" && index <= 3 && "bg-emerald-500",
                                                        !(
                                                            (passwordStrength === "weak" && index === 1) ||
                                                            (passwordStrength === "medium" && index <= 2) ||
                                                            (passwordStrength === "strong" && index <= 3)
                                                        ) && "bg-slate-200"
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        <div className="mt-2 text-xs text-slate-500">
                                            Ուժգնություն՝{" "}
                                            <span className="font-medium">
                        {passwordStrength === "weak"
                            ? "թույլ"
                            : passwordStrength === "medium"
                                ? "միջին"
                                : "ուժեղ"}
                      </span>
                                        </div>
                                    </div>
                                ) : null}
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Կրկնել գաղտնաբառը
                                </label>

                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={password_confirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((s) => !s)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                            </div>

                            <SocialAuthButtons mode="register" audience="business" />

                            <motion.div
                                variants={fadeUp}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500"
                            >
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                                    <div>Google կամ Facebook մուտքը կարող ես միացնել նաև հետո։</div>
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
                                >
                                    Վերադառնալ
                                </button>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    className={cn(
                                        "inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-700",
                                        loading && "cursor-not-allowed opacity-70"
                                    )}
                                >
                                    <UserPlus className="h-4 w-4" />
                                    {loading ? "Ստեղծվում է..." : "Ստեղծել հաշիվ"}
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.form>
        </AuthShell>
    );
}