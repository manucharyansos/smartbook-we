import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { fetchClientMe } from "../lib/clientAuthApi";
import { FullScreenLoader } from "./ui/FullScreenLoader";
import { getErrorMessage, getHttpStatus } from "../lib/http";

export function ClientProtectedRoute() {
  const { token, user, setUser, clear, bootstrapped, bootstrapFromStorage } = useAuth();
  const loc = useLocation();
  const [meFailure, setMeFailure] = useState<{ token: string; message: string } | null>(null);
  const meError = token && meFailure?.token === token ? meFailure.message : null;

  useEffect(() => {
    if (!bootstrapped) bootstrapFromStorage();
  }, [bootstrapped, bootstrapFromStorage]);

  useEffect(() => {
    let cancelled = false;

    if (!token) return;
    if (user) return;

    fetchClientMe()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const status = getHttpStatus(error);
        if (status === 401 || status === 403) {
          clear();
          return;
        }
        setMeFailure({ token, message: getErrorMessage(error, "Չհաջողվեց բացել հաճախորդի հաշիվը։") });
      });

    return () => {
      cancelled = true;
    };
  }, [token, user, setUser, clear]);

  if (!bootstrapped) {
    return <FullScreenLoader title="Ստուգում ենք սեսիան…" subtitle="Մի պահ սպասիր" />;
  }

  if (!token) return <Navigate to="/client/login" replace state={{ from: loc }} />;

  // A business session must stay in the business workspace. This also handles
  // legacy persisted business users that predate the explicit audience field.
  if (user && user.audience !== "client" && user.role !== "client") {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (token && !user && !meError) {
    return <FullScreenLoader title="Բացում ենք cabinet-ը…" subtitle="Բեռնում ենք քո ամրագրումները" />;
  }

  if (token && !user && meError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-slate-900">Չհաջողվեց բացել cabinet-ը</div>
          <div className="mt-2 text-sm text-slate-500">{meError}</div>
          <div className="mt-5 flex gap-3">
            <button
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              onClick={() => window.location.reload()}
            >
              Կրկնել
            </button>
            <button
              className="flex-1 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"
              onClick={() => clear()}
            >
              Դուրս գալ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== "client") {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
