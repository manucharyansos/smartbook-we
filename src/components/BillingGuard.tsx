
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";

export function BillingGuard() {
  const { user } = useAuth();
  const loc = useLocation();

  // allow onboarding/settings even if paused
  const allowedWhenPaused = ["/app/settings", "/app/onboarding"];
  const path = loc.pathname;

  const billingStatus = String((user as any)?.billing_status ?? "active"); // from backend
  const isBlocked = billingStatus === "paused" || billingStatus === "canceled";

  if (isBlocked && !allowedWhenPaused.some((p) => path.startsWith(p))) {
    return <Navigate to="/app/settings" replace state={{ from: path }} />;
  }

  return <Outlet />;
}