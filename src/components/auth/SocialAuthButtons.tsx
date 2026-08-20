import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { api } from "../../lib/api";
import { API_BASE_URL } from "../../lib/apiBase";
import { cn } from "../../lib/cn";
import { getDeviceFingerprint } from "../../lib/fingerprint";
import { fadeUp } from "../../lib/motion";
import { storePendingSocialBusinessProfile } from "../../lib/socialAuth";
import { useLanguage } from "../../contexts/LanguageContext";

type Provider = "google" | "facebook";
type Audience = "business" | "client";
type BusinessType = "beauty" | "dental";

type SocialAuthButtonsProps = {
  mode?: "login" | "register";
  audience?: Audience;
  businessType?: BusinessType;
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;
  planCode?: string;
  className?: string;
};

const providerMeta: Record<
  Provider,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
  }
> = {
  google: {
    label: "Google",
    bg: "bg-white",
    border: "border-slate-200",
    text: "text-slate-800",
  },
  facebook: {
    label: "Facebook",
    bg: "bg-[#1877F2]",
    border: "border-[#1877F2]",
    text: "text-white",
  },
};

function ProviderIcon({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.7h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.7 3.1-4.3 3.1-7.3Z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.5L15.5 17c-.9.6-2 1-3.5 1a5.9 5.9 0 0 1-5.5-4.1H3.2v2.6A10.1 10.1 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.5 13.9A6 6 0 0 1 6.2 12c0-.7.1-1.3.3-1.9V7.5H3.2A10 10 0 0 0 2 12c0 1.6.4 3.1 1.2 4.5l3.3-2.6Z" />
        <path fill="#EA4335" d="M12 6c1.6 0 3 .5 4.1 1.6L19 4.7A9.7 9.7 0 0 0 12 2a10.1 10.1 0 0 0-8.8 5.5l3.3 2.6A5.9 5.9 0 0 1 12 6Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M14.5 8.5V6.8c0-.8.5-1 1-1h2.6V2.1L14.5 2C11 2 10.2 4.6 10.2 6.3v2.2H8v4.1h2.2V22h4.3v-9.4h3.2l.5-4.1h-3.7Z" />
    </svg>
  );
}

function isEnvEnabled(value: string | undefined, fallback = false) {
  if (value == null) return fallback;
  return String(value).toLowerCase() === "true";
}

function getBuildEnabledProviders(): Provider[] {
  const googleEnabled = isEnvEnabled(import.meta.env.VITE_SOCIAL_AUTH_GOOGLE_ENABLED, true);
  const facebookEnabled = isEnvEnabled(import.meta.env.VITE_SOCIAL_AUTH_FACEBOOK_ENABLED, true);

  return [
    googleEnabled ? "google" : null,
    facebookEnabled ? "facebook" : null,
  ].filter(Boolean) as Provider[];
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
  businessType?: BusinessType,
  planCode?: string,
) {
  const callbackUrl = window.location.origin + "/auth/social/callback";
  const params = new URLSearchParams({
    mode,
    audience,
    callback_url: callbackUrl,
  });

  if (audience === "business" && businessType) {
    params.set("business_type", businessType);
  }

  if (audience === "business" && mode === "register" && planCode) {
    params.set("plan_code", planCode);
  }

  const fingerprint = getDeviceFingerprintSafe();
  if (fingerprint) {
    params.set("device_fingerprint", fingerprint);
  }

  return API_BASE_URL + "/auth/social/" + provider + "/redirect?" + params.toString();
}

export default function SocialAuthButtons({
  mode = "login",
  className,
  audience = "client",
  businessType,
  businessName = "",
  businessPhone = "",
  businessAddress = "",
  planCode,
}: SocialAuthButtonsProps) {
  const { locale } = useLanguage();
  const globallyEnabled = isEnvEnabled(import.meta.env.VITE_SOCIAL_AUTH_ENABLED, false);
  const buildEnabledProviders = getBuildEnabledProviders();
  const providersQuery = useQuery({
    queryKey: ["social-auth-providers"],
    queryFn: async () => {
      const response = await api.get<{ providers?: Provider[] }>("/auth/social/providers");
      return response.data.providers ?? [];
    },
    enabled: globallyEnabled && buildEnabledProviders.length > 0,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const enabledProviders = buildEnabledProviders.filter((provider) =>
    providersQuery.data?.includes(provider),
  );

  if (!globallyEnabled || !enabledProviders.length) {
    return null;
  }

  const text = {
    hy: {
      register: "Գրանցվել",
      login: "Մուտք գործել",
      or: "կամ",
      suffix: "-ով",
      note: "Կբացվի ընտրված ծառայության անվտանգ մուտքի էջը։ Vizit-ը չի ստանում ձեր Google/Facebook գաղտնաբառը։",
      profileRequired: "Սոցիալական գրանցման համար նախ լրացրեք բիզնեսի անունը, հեռախոսը և հասցեն։",
    },
    ru: {
      register: "Зарегистрироваться",
      login: "Войти",
      or: "или",
      suffix: "",
      note: "Откроется защищённая страница выбранного сервиса. Vizit не получает ваш пароль Google/Facebook.",
      profileRequired: "Для регистрации сначала заполните название, телефон и адрес бизнеса.",
    },
    en: {
      register: "Register",
      login: "Sign in",
      or: "or",
      suffix: "",
      note: "You will be redirected to the provider's secure sign-in page. Vizit never receives your Google/Facebook password.",
      profileRequired: "Enter the business name, phone number and address before social registration.",
    },
  }[locale];
  const actionText = mode === "register" ? text.register : text.login;
  const needsBusinessProfile = mode === "register" && audience === "business";
  const hasBusinessProfile =
    businessName.trim().length >= 2 &&
    businessPhone.trim().length >= 5 &&
    businessAddress.trim().length >= 2;

  function startSocialAuth(provider: Provider) {
    if (needsBusinessProfile && !hasBusinessProfile) return;

    if (needsBusinessProfile) {
      storePendingSocialBusinessProfile({
        business_name: businessName.trim(),
        business_phone: businessPhone.trim(),
        business_address: businessAddress.trim(),
        provider,
      });
    }

    window.location.assign(getRedirectUrl(provider, mode, audience, businessType, planCode));
  }

  return (
    <motion.div variants={fadeUp} className={cn("space-y-4", className)}>
      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
        <div className="relative mx-auto w-fit rounded-full bg-white px-3 text-xs font-medium text-slate-400">
          {text.or}
        </div>
      </div>

      <div className={cn("grid gap-3", enabledProviders.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
        {enabledProviders.map((provider) => {
          const item = providerMeta[provider];
          const disabled = needsBusinessProfile && !hasBusinessProfile;

          return (
            <button
              key={provider}
              type="button"
              onClick={() => startSocialAuth(provider)}
              disabled={disabled}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-3 rounded-2xl border px-4 text-sm font-medium transition",
                item.bg,
                item.border,
                item.text,
                provider === "google" && "hover:border-violet-200 hover:bg-violet-50/40",
                provider === "facebook" && "hover:opacity-95",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full",
                  provider === "google"
                    ? "bg-white"
                    : "bg-white/20 text-white",
                )}
              >
                <ProviderIcon provider={provider} />
              </span>
              {actionText}{" "}
              {locale === "hy"
                ? item.label + text.suffix
                : (locale === "ru" ? "через " : "with ") + item.label}
            </button>
          );
        })}
      </div>

      <div className={cn(
        "rounded-2xl border px-4 py-3 text-xs leading-6",
        needsBusinessProfile && !hasBusinessProfile
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-slate-200 bg-slate-50 text-slate-500",
      )}>
        {needsBusinessProfile && !hasBusinessProfile ? text.profileRequired : text.note}
      </div>
    </motion.div>
  );
}
