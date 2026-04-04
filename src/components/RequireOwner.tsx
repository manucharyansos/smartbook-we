import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

export function RequireOwner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role !== "owner") {
    return <Navigate to="/app/settings" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
