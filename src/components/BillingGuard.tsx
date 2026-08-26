
import { useQuery } from "@tanstack/react-query";
import { CreditCard, LogOut } from "lucide-react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import { fetchFeatures } from "../lib/featuresApi";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../store/auth";
import { Button } from "./ui/Button";

const copy = {
  hy: {
    title: "Բաժանորդագրությունն ակտիվ չէ",
    body: "Աշխատանքային տարածքը վերականգնելու համար դիմեք բիզնեսի սեփականատիրոջը։ Վճարումը և պլանի ընտրությունը հասանելի են միայն սեփականատիրոջ հաշվից։",
    logout: "Դուրս գալ",
  },
  ru: {
    title: "Подписка не активна",
    body: "Чтобы восстановить рабочее пространство, обратитесь к владельцу бизнеса. Оплата и выбор тарифа доступны только из аккаунта владельца.",
    logout: "Выйти",
  },
  en: {
    title: "Subscription is inactive",
    body: "Contact the business owner to restore the workspace. Billing and plan selection are available only from the owner account.",
    logout: "Log out",
  },
} as const;

export function BillingGuard() {
  const { user, clear } = useAuth();
  const { locale } = useLanguage();
  const text = copy[locale];
  const loc = useLocation();
  const navigate = useNavigate();
  const featuresQ = useQuery({
    queryKey: ["features"],
    queryFn: fetchFeatures,
    staleTime: 60_000,
    retry: 1,
  });

  // The feature endpoint can be noticeably slower than the rest of the workspace.
  // Keep an authenticated workspace usable while the request is pending and only
  // show the billing state after the API has explicitly confirmed it.
  if (featuresQ.isLoading || featuresQ.isError || featuresQ.data?.is_billable !== false) {
    return <Outlet />;
  }

  const isBillingPage = loc.pathname.startsWith("/app/billing");

  if (user?.role === "owner") {
    if (isBillingPage) return <Outlet />;

    return <Navigate to="/app/billing" replace state={{ from: loc.pathname }} />;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,rgba(232,194,174,0.34),transparent_28rem),#f7efe7] px-6 dark:bg-[radial-gradient(circle_at_top_right,rgba(109,42,99,0.30),transparent_28rem),#120b14]">
      <div className="w-full max-w-lg rounded-[32px] border border-[#d39a43]/20 bg-[#fffdf9] p-8 text-center shadow-[0_24px_80px_rgba(70,34,49,0.12)] dark:border-[#e7bc6b]/15 dark:bg-[#2f182e]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#f8eee4] text-[#6d2a63] dark:bg-white/10 dark:text-[#efcb87]">
          <CreditCard className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-[#321c37] dark:text-[#fff8f2]">{text.title}</h1>
        <p className="mt-3 text-sm leading-7 text-[#746777] dark:text-[#cbbdca]">
          {text.body}
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            clear();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut className="h-4 w-4" /> {text.logout}
        </Button>
      </div>
    </div>
  );
}
