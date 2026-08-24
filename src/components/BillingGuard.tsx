
import { useQuery } from "@tanstack/react-query";
import { CreditCard, LogOut } from "lucide-react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import { fetchFeatures } from "../lib/featuresApi";
import { useAuth } from "../store/auth";
import { Button } from "./ui/Button";

export function BillingGuard() {
  const { user, clear } = useAuth();
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
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-slate-50 to-white px-6">
      <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(124,58,237,0.12)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-violet-100 text-violet-700">
          <CreditCard className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-950">Բաժանորդագրությունն ակտիվ չէ</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Աշխատանքային տարածքը վերականգնելու համար դիմիր բիզնեսի սեփականատիրոջը։ Վճարումը և պլանի ընտրությունը հասանելի են միայն սեփականատիրոջ հաշվից։
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            clear();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut className="h-4 w-4" /> Դուրս գալ
        </Button>
      </div>
    </div>
  );
}
