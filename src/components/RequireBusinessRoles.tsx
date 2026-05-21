import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

type AllowedRole = "owner" | "manager" | "staff" | "super_admin";

export function RequireBusinessRoles({
  roles,
  fallback = "/app/dashboard",
  children,
}: {
  roles: AllowedRole[];
  fallback?: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.role || !roles.includes(user.role as AllowedRole)) {
    return <Navigate to={fallback} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
