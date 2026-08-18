import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { fetchMe } from "../lib/authApi";
import { FullScreenLoader } from "./ui/FullScreenLoader";
import { getErrorMessage, getHttpStatus } from "../lib/http";

export function ProtectedRoute() {
    const { token, user, setUser, clear, bootstrapped, bootstrapFromStorage } =
        useAuth();
    const loc = useLocation();

    const [meFailure, setMeFailure] = useState<{ token: string; message: string } | null>(null);
    const meError = token && meFailure?.token === token ? meFailure.message : null;

    // 1) hydrate storage once
    useEffect(() => {
        if (!bootstrapped) bootstrapFromStorage();
    }, [bootstrapped, bootstrapFromStorage]);

    // 2) if token exists but no user -> fetch /me
    useEffect(() => {
        let cancelled = false;

        if (!token) return;
        if (user) return;

        fetchMe()
            .then((me) => {
                if (cancelled) return;
                setUser(me);
            })
            .catch((error: unknown) => {
                if (cancelled) return;

                const status = getHttpStatus(error);

                // ✅ ONLY logout on 401 (unauthorized)
                if (status === 401) {
                    clear();
                    return;
                }

                // ✅ for 403/500/network: keep token, show error
                const fallback = status ? `Սխալ (${status})՝ չհաջողվեց բեռնել սեսիան` : "Չհաջողվեց կապվել սերվերին";
                setMeFailure({ token, message: getErrorMessage(error, fallback) });
            });

        return () => {
            cancelled = true;
        };
    }, [token, user, setUser, clear]);

    // 0) while bootstrapping storage
    if (!bootstrapped) {
        return <FullScreenLoader title="Ստուգում ենք սեսիան…" subtitle="Մի պահ սպասիր" />;
    }

    // 3) no token -> login
    if (!token) return <Navigate to="/login" replace state={{ from: loc }} />;

    // Keep client sessions in the client area instead of rendering business routes
    // with the wrong token audience.
    if (user && (user.audience === "client" || user.role === "client")) {
        return <Navigate to="/client/cabinet" replace />;
    }

    // 4) token exists but user still loading
    if (token && !user && !meError) {
        return <FullScreenLoader title="Մուտք ենք գործում…" subtitle="Բեռնում ենք քո տվյալները" />;
    }


    if (user?.role === "client" || user?.audience === "client") {
        return <Navigate to="/client/cabinet" replace />;
    }

    // 5) token exists but /me failed (not 401) -> show friendly screen
    if (token && !user && meError) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full rounded-2xl border border-[#E8D5C4]/30 bg-white/80 backdrop-blur-sm p-6">
                    <div className="text-lg font-light text-[#2C2C2C]">Չհաջողվեց բացել հաշիվը</div>
                    <div className="mt-2 text-sm text-[#8F6B58] font-light">{meError}</div>

                    <div className="mt-5 flex gap-3">
                        <button
                            className="flex-1 rounded-xl border border-[#E8D5C4]/30 bg-white px-4 py-2 text-sm font-light text-[#8F6B58] hover:border-[#C5A28A]/50"
                            onClick={() => window.location.reload()}
                        >
                            Կրկնել
                        </button>
                        <button
                            className="flex-1 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72] px-4 py-2 text-sm font-light text-white"
                            onClick={() => clear()}
                        >
                            Դուրս գալ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <Outlet />;
}
