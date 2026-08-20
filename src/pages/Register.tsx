import { useEffect, useState } from "react";
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
import { LocationMapPicker } from "../components/settings/LocationMapPicker";
import { api } from "../lib/api";
import { getApiErrorCode, getErrorMessage, getValidationMessages } from "../lib/http";
import { cn } from "../lib/cn";
import { getDeviceFingerprint } from "../lib/fingerprint";
import { fadeUp, scaleIn, staggerContainer } from "../lib/motion";
import { useAuth } from "../store/auth";
import { useLanguage } from "../contexts/LanguageContext";

type BusinessType = "beauty" | "dental";

const copy = {
    hy: { title: "Գրանցվել", subtitle: "Ստեղծեք ձեր Vizit բիզնես հաշիվը", sideTitle: "Սկսեք Vizit-ը ձեր բիզնեսի համար", sideText: "Գրանցվեք, լրացրեք սկզբնական կարգավորումները և պատրաստեք աշխատանքային միջավայրը։", hasAccount: "Արդեն ունե՞ք հաշիվ", login: "Մուտք գործել", beautyLabel: "Գեղեցկության սրահ", beautyShort: "Գեղեցկություն", dentalLabel: "Ատամնաբուժական կլինիկա", dentalShort: "Կլինիկա", businessNameRequired: "Նշեք բիզնեսի անունը։", phoneRequired: "Հեռախոսահամարը պարտադիր է։", addressRequired: "Հասցեն պարտադիր է։", ownerRequired: "Նշեք պատասխանատուի անունը։", emailRequired: "Նշեք էլ. փոստը։", passwordShort: "Գաղտնաբառը պետք է պարունակի առնվազն 8 նիշ։", passwordMismatch: "Գաղտնաբառերը չեն համընկնում։", registerError: "Գրանցումը չհաջողվեց։", businessLogin: "Մուտք բիզնես հաշվով", resetPassword: "Վերականգնել գաղտնաբառը", contactSupport: "Կապվել աջակցման թիմի հետ", chooseType: "Ընտրեք բիզնեսի տեսակը", basics: "Սկսենք բիզնեսի հիմնական տվյալներից։", businessName: "Բիզնեսի անուն", salonPlaceholder: "Իմ սրահը", clinicPlaceholder: "Իմ կլինիկան", phone: "Հեռախոս", address: "Հասցե", addressPlaceholder: "Երևան, Հայաստան", continue: "Շարունակել", ownerName: "Պատասխանատուի անուն", ownerPlaceholder: "Անուն Ազգանուն", email: "Էլ. փոստ", password: "Գաղտնաբառ", confirmPassword: "Կրկնել գաղտնաբառը", strength: "Ուժգնություն", weak: "թույլ", medium: "միջին", strong: "ուժեղ", show: "Ցույց տալ գաղտնաբառը", hide: "Թաքցնել գաղտնաբառը", socialNote: "Google կամ Facebook մուտքը կարող եք միացնել նաև ավելի ուշ։", back: "Վերադառնալ", creating: "Ստեղծվում է…", create: "Ստեղծել հաշիվ" },
    ru: { title: "Регистрация", subtitle: "Создайте бизнес-аккаунт Vizit", sideTitle: "Запустите Vizit для своего бизнеса", sideText: "Зарегистрируйтесь, завершите начальную настройку и подготовьте рабочее пространство.", hasAccount: "Уже есть аккаунт?", login: "Войти", beautyLabel: "Салон красоты", beautyShort: "Красота", dentalLabel: "Стоматологическая клиника", dentalShort: "Клиника", businessNameRequired: "Укажите название бизнеса.", phoneRequired: "Номер телефона обязателен.", addressRequired: "Адрес обязателен.", ownerRequired: "Укажите имя ответственного лица.", emailRequired: "Укажите электронную почту.", passwordShort: "Пароль должен содержать не менее 8 символов.", passwordMismatch: "Пароли не совпадают.", registerError: "Не удалось зарегистрироваться.", businessLogin: "Войти в бизнес-аккаунт", resetPassword: "Восстановить пароль", contactSupport: "Связаться с поддержкой", chooseType: "Выберите тип бизнеса", basics: "Начнём с основной информации о бизнесе.", businessName: "Название бизнеса", salonPlaceholder: "Мой салон", clinicPlaceholder: "Моя клиника", phone: "Телефон", address: "Адрес", addressPlaceholder: "Ереван, Армения", continue: "Продолжить", ownerName: "Имя ответственного лица", ownerPlaceholder: "Имя Фамилия", email: "Электронная почта", password: "Пароль", confirmPassword: "Повторите пароль", strength: "Надёжность", weak: "слабый", medium: "средний", strong: "надёжный", show: "Показать пароль", hide: "Скрыть пароль", socialNote: "Вход через Google или Facebook можно подключить позже.", back: "Назад", creating: "Создание…", create: "Создать аккаунт" },
    en: { title: "Register", subtitle: "Create your Vizit business account", sideTitle: "Start using Vizit for your business", sideText: "Register, complete the initial setup and prepare your workspace.", hasAccount: "Already have an account?", login: "Sign in", beautyLabel: "Beauty salon", beautyShort: "Beauty", dentalLabel: "Dental clinic", dentalShort: "Clinic", businessNameRequired: "Enter the business name.", phoneRequired: "Phone number is required.", addressRequired: "Address is required.", ownerRequired: "Enter the account owner's name.", emailRequired: "Enter an email address.", passwordShort: "Password must be at least 8 characters.", passwordMismatch: "Passwords do not match.", registerError: "Registration failed.", businessLogin: "Sign in to a business account", resetPassword: "Reset password", contactSupport: "Contact support", chooseType: "Choose the business type", basics: "Let's start with the essential business details.", businessName: "Business name", salonPlaceholder: "My salon", clinicPlaceholder: "My clinic", phone: "Phone", address: "Address", addressPlaceholder: "Yerevan, Armenia", continue: "Continue", ownerName: "Account owner name", ownerPlaceholder: "First and last name", email: "Email", password: "Password", confirmPassword: "Confirm password", strength: "Strength", weak: "weak", medium: "medium", strong: "strong", show: "Show password", hide: "Hide password", socialNote: "You can connect Google or Facebook sign-in later.", back: "Back", creating: "Creating…", create: "Create account" },
} as const;

const locationCopy = {
    hy: {
        title: "Բիզնեսի տեղը քարտեզում",
        help: "Քաշեք քարտեզը և նշիչը դրեք բիզնեսի մուտքի վրա։ Առանց ճիշտ կետի բիզնեսը քարտեզում չի երևա։",
        required: "Քարտեզի վրա նշեք բիզնեսի ճիշտ տեղը։",
        labels: {
            dragHint: "Քաշեք քարտեզը և նշիչը դրեք մուտքի վրա",
            zoomIn: "Մեծացնել քարտեզը",
            zoomOut: "Փոքրացնել քարտեզը",
            unavailable: "Սարքը չի տրամադրում ընթացիկ տեղադրությունը։",
            permissionError: "Չհաջողվեց ստանալ ընթացիկ տեղադրությունը։ Թույլատրեք տեղադրության հասանելիությունը և կրկին փորձեք։",
            emptyCoordinates: "Քարտեզի կետը դեռ հաստատված չէ։",
            locating: "Որոշվում է…",
            useCurrentLocation: "Իմ տեղադրությունը",
            clear: "Մաքրել",
        },
    },
    ru: {
        title: "Расположение бизнеса на карте",
        help: "Перетащите карту и установите маркер у входа. Без точной отметки бизнес не появится на карте.",
        required: "Укажите точное расположение бизнеса на карте.",
        labels: {
            dragHint: "Перетащите карту и установите маркер у входа",
            zoomIn: "Увеличить карту",
            zoomOut: "Уменьшить карту",
            unavailable: "Устройство не предоставляет текущее местоположение.",
            permissionError: "Не удалось определить местоположение. Разрешите доступ к геолокации и попробуйте снова.",
            emptyCoordinates: "Точка на карте ещё не подтверждена.",
            locating: "Определяем…",
            useCurrentLocation: "Моё местоположение",
            clear: "Очистить",
        },
    },
    en: {
        title: "Business location on the map",
        help: "Drag the map and place the marker at the entrance. The business will not appear on the map without a precise pin.",
        required: "Mark the exact business location on the map.",
        labels: {
            dragHint: "Drag the map and place the marker at the entrance",
            zoomIn: "Zoom in",
            zoomOut: "Zoom out",
            unavailable: "This device cannot provide its current location.",
            permissionError: "We could not get your location. Allow location access and try again.",
            emptyCoordinates: "The map location has not been confirmed yet.",
            locating: "Locating…",
            useCurrentLocation: "My location",
            clear: "Clear",
        },
    },
} as const;

export default function Register() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { setAuth } = useAuth();
    const { locale } = useLanguage();
    const text = copy[locale];
    const locationText = locationCopy[locale];
    const [searchParams] = useSearchParams();
    const requestedPlanCode = searchParams.get("plan")?.trim() || undefined;

    const initialType = (searchParams.get("type") as BusinessType) || "beauty";

    const [business_type, setBusinessType] = useState<BusinessType>(initialType);
    const [business_name, setBusinessName] = useState("");
    const [business_phone, setBusinessPhone] = useState("");
    const [business_address, setBusinessAddress] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

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

    const businessMeta = {
            beauty: {
                label: text.beautyLabel,
                short: text.beautyShort,
                icon: Sparkles,
            },
            dental: {
                label: text.dentalLabel,
                short: text.dentalShort,
                icon: Stethoscope,
            },
        };

    const CurrentIcon = businessMeta[business_type].icon;

    function validateStepOne() {
        if (!business_name.trim()) {
            setError(text.businessNameRequired);
            return false;
        }

        if (!business_phone.trim()) {
            setError(text.phoneRequired);
            return false;
        }

        if (!business_address.trim()) {
            setError(text.addressRequired);
            return false;
        }

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            setError(locationText.required);
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
            setError(text.ownerRequired);
            return;
        }

        if (!owner_email.trim()) {
            setError(text.emailRequired);
            return;
        }

        if (password.length < 8) {
            setError(text.passwordShort);
            return;
        }

        if (password !== password_confirmation) {
            setError(text.passwordMismatch);
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
                    latitude,
                    longitude,
                    business_type,
                    plan_code: requestedPlanCode,
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
        } catch (error: unknown) {
            setErrorCode(getApiErrorCode(error));
            setError(getValidationMessages(error)[0] ?? getErrorMessage(error, text.registerError));
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
                    {text.hasAccount}{" "}
                    <Link to="/login" className="font-medium text-violet-700 hover:text-violet-600">
                        {text.login}
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
                                            {text.businessLogin}
                                        </Link>

                                        <Link
                                            to="/forgot-password"
                                            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                                        >
                                            {text.resetPassword}
                                        </Link>

                                        <Link
                                            to="/support"
                                            className="inline-flex items-center rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900"
                                        >
                                            {text.contactSupport}
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                ) : null}

                {!searchParams.get("type") ? (
                    <motion.div variants={fadeUp}>
                        <div id="business-type-label" className="mb-3 block text-sm font-medium text-slate-700">
                            {text.chooseType}
                        </div>

                        <div role="radiogroup" aria-labelledby="business-type-label" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {(["beauty", "dental"] as BusinessType[]).map((type) => {
                                const Icon = businessMeta[type].icon;
                                const active = business_type === type;

                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setBusinessType(type)}
                                        role="radio"
                                        aria-checked={active}
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
                                            {text.basics}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label htmlFor="business-register-name" className="mb-2 block text-sm font-medium text-slate-700">
                                    {text.businessName}
                                </label>

                                <div className="relative">
                                    <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="business-register-name"
                                        name="business_name"
                                        autoComplete="organization"
                                        value={business_name}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder={
                                            business_type === "beauty" ? text.salonPlaceholder : text.clinicPlaceholder
                                        }
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base sm:h-12 sm:text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label htmlFor="business-register-phone" className="mb-2 block text-sm font-medium text-slate-700">
                                    {text.phone}
                                </label>

                                <div className="relative">
                                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="business-register-phone"
                                        name="business_phone"
                                        type="tel"
                                        autoComplete="tel"
                                        value={business_phone}
                                        onChange={(e) => setBusinessPhone(e.target.value)}
                                        placeholder="+374 77 123456"
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base sm:h-12 sm:text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label htmlFor="business-register-address" className="mb-2 block text-sm font-medium text-slate-700">
                                    {text.address}
                                </label>

                                <div className="relative">
                                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="business-register-address"
                                        name="business_address"
                                        autoComplete="street-address"
                                        value={business_address}
                                        onChange={(e) => setBusinessAddress(e.target.value)}
                                        placeholder={text.addressPlaceholder}
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base sm:h-12 sm:text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp} className="space-y-3">
                                <div>
                                    <div className="text-sm font-medium text-slate-700">{locationText.title}</div>
                                    <div className="mt-1 text-xs leading-5 text-slate-500">{locationText.help}</div>
                                </div>
                                <LocationMapPicker
                                    latitude={latitude}
                                    longitude={longitude}
                                    labels={locationText.labels}
                                    onChange={(coordinates) => {
                                        setLatitude(coordinates?.latitude ?? null);
                                        setLongitude(coordinates?.longitude ?? null);
                                        if (coordinates) {
                                            setError((current) => current === locationText.required ? null : current);
                                        }
                                    }}
                                />
                            </motion.div>

                            <motion.button
                                variants={fadeUp}
                                type="button"
                                onClick={nextStep}
                                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-700"
                            >
                                {text.continue}
                            </motion.button>

                            <SocialAuthButtons
                                mode="register"
                                audience="business"
                                businessType={business_type}
                                businessName={business_name}
                                businessPhone={business_phone}
                                businessAddress={business_address}
                                businessLatitude={latitude}
                                businessLongitude={longitude}
                                planCode={requestedPlanCode}
                            />


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
                                <label htmlFor="business-register-owner-name" className="mb-2 block text-sm font-medium text-slate-700">
                                    {text.ownerName}
                                </label>

                                <div className="relative">
                                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="business-register-owner-name"
                                        name="name"
                                        autoComplete="name"
                                        value={owner_name}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        placeholder={text.ownerPlaceholder}
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base sm:h-12 sm:text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label htmlFor="business-register-owner-email" className="mb-2 block text-sm font-medium text-slate-700">
                                    {text.email}
                                </label>

                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="business-register-owner-email"
                                        name="email"
                                        autoComplete="email"
                                        type="email"
                                        value={owner_email}
                                        onChange={(e) => setOwnerEmail(e.target.value)}
                                        placeholder="owner@example.com"
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base sm:h-12 sm:text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                </div>
                            </motion.div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                            <motion.div variants={fadeUp}>
                                <label htmlFor="business-register-password" className="mb-2 block text-sm font-medium text-slate-700">
                                    {text.password}
                                </label>

                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="business-register-password"
                                        name="password"
                                        autoComplete="new-password"
                                        minLength={8}
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
                                            {text.strength}:{" "}
                                            <span className="font-medium">
                        {passwordStrength === "weak"
                            ? text.weak
                            : passwordStrength === "medium"
                                ? text.medium
                                : text.strong}
                      </span>
                                        </div>
                                    </div>
                                ) : null}
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <label htmlFor="business-register-password-confirmation" className="mb-2 block text-sm font-medium text-slate-700">
                                    {text.confirmPassword}
                                </label>

                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="business-register-password-confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        minLength={8}
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={password_confirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-base sm:h-12 sm:text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((s) => !s)}
                                        aria-label={showConfirmPassword ? text.hide : text.show}
                                        aria-pressed={showConfirmPassword}
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

                            <motion.div
                                variants={fadeUp}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500"
                            >
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                                    <div>{text.socialNote}</div>
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
                                >
                                    {text.back}
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
                                    {loading ? text.creating : text.create}
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.form>
        </AuthShell>
    );
}
