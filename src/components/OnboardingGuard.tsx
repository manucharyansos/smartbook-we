// src/components/OnboardingGuard.tsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";
import { FullScreenLoader } from "./ui/FullScreenLoader";

export function OnboardingGuard() {
    const { user, token, bootstrapped } = useAuth();
    const loc = useLocation();

    if (!bootstrapped) {
        return <FullScreenLoader title="Բեռնում է…" subtitle="Մի պահ սպասիր" />;
    }

    if (!token) return <Navigate to="/login" replace />;

    if (!user) {
        return <FullScreenLoader title="Բեռնում է…" subtitle="Ստուգում ենք կարգավիճակը" />;
    }

    const isOnboarding = user.needs_onboarding;

    if (isOnboarding && loc.pathname !== "/app/onboarding") {
        return <Navigate to="/app/onboarding" replace />;
    }

    if (!isOnboarding && loc.pathname === "/app/onboarding") {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <Outlet />;
}