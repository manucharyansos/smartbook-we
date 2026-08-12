import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { getDeviceFingerprint } from "../../lib/fingerprint";
import { fadeUp } from "../../lib/motion";
import { API_BASE_URL } from "../../lib/apiBase";

type Provider = "google" | "facebook";
type Audience = "business" | "client";
type BusinessType = "beauty" | "dental";

type SocialAuthButtonsProps = {
    mode?: "login" | "register";
    audience?: Audience;
    businessType?: BusinessType;
    className?: string;
};

const providerMeta: Record<
    Provider,
    {
        label: string;
        short: string;
        bg: string;
        border: string;
        text: string;
    }
> = {
    google: {
        label: "Google",
        short: "G",
        bg: "bg-white",
        border: "border-slate-200",
        text: "text-slate-800",
    },
    facebook: {
        label: "Facebook",
        short: "f",
        bg: "bg-[#1877F2]",
        border: "border-[#1877F2]",
        text: "text-white",
    },
};

function isEnvEnabled(value: string | undefined, fallback = false) {
    if (value == null) return fallback;
    return String(value).toLowerCase() === "true";
}

function getEnabledProviders(): Provider[] {
    const globallyEnabled = isEnvEnabled(import.meta.env.VITE_SOCIAL_AUTH_ENABLED, false);
    if (!globallyEnabled) return [];

    const googleEnabled = isEnvEnabled(import.meta.env.VITE_SOCIAL_AUTH_GOOGLE_ENABLED, true);
    const facebookEnabled = isEnvEnabled(import.meta.env.VITE_SOCIAL_AUTH_FACEBOOK_ENABLED, false);

    return ([
        googleEnabled ? "google" : null,
        facebookEnabled ? "facebook" : null,
    ].filter(Boolean) as Provider[]);
}

function getDeviceFingerprintSafe() {
    try {
        return getDeviceFingerprint();
    } catch {
        return "";
    }
}

function getRedirectUrl(
    provider: Provider,
    mode: "login" | "register",
    audience: Audience,
    businessType?: BusinessType
) {
    const apiBase = API_BASE_URL;
    const frontendBase = window.location.origin;
    const callbackUrl = `${frontendBase}/auth/social/callback`;

    const params = new URLSearchParams({
        mode,
        audience,
        callback_url: callbackUrl,
    });

    if (audience === "business" && businessType) {
        params.set("business_type", businessType);
    }

    const fingerprint = getDeviceFingerprintSafe();
    if (fingerprint) {
        params.set("device_fingerprint", fingerprint);
    }

    return `${apiBase}/auth/social/${provider}/redirect?${params.toString()}`;
}

export default function SocialAuthButtons({
    mode = "login",
    className,
    audience = "client",
    businessType,
}: SocialAuthButtonsProps) {
    const enabledProviders = getEnabledProviders();

    if (!enabledProviders.length) {
        return null;
    }

    const actionText = mode === "register" ? "Շարունակել" : "Մուտք գործել";

    function startSocialAuth(provider: Provider) {
        window.location.assign(getRedirectUrl(provider, mode, audience, businessType));
    }

    return (
        <motion.div variants={fadeUp} className={cn("space-y-4", className)}>
            <div className="relative">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
                <div className="relative mx-auto w-fit rounded-full bg-white px-3 text-xs font-medium text-slate-400">
                    կամ
                </div>
            </div>

            <div className={cn("grid gap-3", enabledProviders.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                {enabledProviders.map((provider) => {
                    const item = providerMeta[provider];

                    return (
                        <button
                            key={provider}
                            type="button"
                            onClick={() => startSocialAuth(provider)}
                            className={cn(
                                "inline-flex h-12 items-center justify-center gap-3 rounded-2xl border px-4 text-sm font-medium transition",
                                item.bg,
                                item.border,
                                item.text,
                                provider === "google" && "hover:border-violet-200 hover:bg-violet-50/40",
                                provider === "facebook" && "hover:opacity-95"
                            )}
                        >
                            <span
                                className={cn(
                                    "grid h-7 w-7 place-items-center rounded-full text-sm font-bold",
                                    provider === "google"
                                        ? "bg-slate-100 text-slate-700"
                                        : "bg-white/20 text-white"
                                )}
                            >
                                {item.short}
                            </span>
                            {actionText} {item.label}-ով
                        </button>
                    );
                })}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
                Social login-ը հիմա աշխատում է միայն այն provider-ների համար, որոնք environment-ով միացված են և backend credential-ներ ունեն։
            </div>
        </motion.div>
    );
}
