import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, LoaderCircle, MailCheck } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/http";
import { fadeUp } from "../lib/motion";
import { useAuth } from "../store/auth";

export default function ClientVerifyEmail() {
  const { id, hash } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const started = useRef(false);
  const invalidLink = !id || !/^\d+$/.test(id) || !hash || !/^[a-f0-9]{40}$/i.test(hash);
  const [error, setError] = useState<string | null>(
    invalidLink ? "Email-ի հաստատման հղումը անվավեր է։" : null,
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (invalidLink) return;

    api.get(`/client/auth/email/verify/${encodeURIComponent(id)}/${encodeURIComponent(hash)}${location.search}`)
      .then(async (response) => {
        if (response.data?.user) setUser(response.data.user);
        await queryClient.invalidateQueries({ queryKey: ["client-cabinet"] });
        navigate("/client/cabinet?email_verified=1", { replace: true });
      })
      .catch((verificationError: unknown) => {
        setError(getErrorMessage(verificationError, "Հղումը անվավեր է, ժամկետանց է կամ պատկանում է այլ հաշվին։"));
      });
  }, [hash, id, invalidLink, location.search, navigate, queryClient, setUser]);

  return (
    <AuthShell
      audience="client"
      title="Email-ի հաստատում"
      subtitle="Ստուգում ենք հաստատման հղումը և հաճախորդի հաշիվը։"
      badge="Vizit հաճախորդի հաշիվ"
      sideTitle="Ամրագրումների անվտանգ պատմություն"
      sideText="Նախկին այցերը կապվում են միայն նույն հաստատված email հասցեին և միայն տվյալ հաշվի մուտքից հետո։"
    >
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-5">
        {error ? (
          <div role="alert" className="rounded-2xl border border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] p-5 text-[var(--vz-danger)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="font-semibold">Չհաջողվեց հաստատել email-ը</div>
                <p className="mt-1 text-sm leading-6">{error}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/client/cabinet" className="rounded-2xl bg-[var(--vz-primary)] px-4 py-2.5 text-sm font-medium text-[var(--vz-on-primary)]">Բացել հաշիվը</Link>
              <Link to="/client/login" className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-2.5 text-sm font-medium text-[var(--vz-text-secondary)]">Կրկին մուտք գործել</Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] p-5 text-violet-950">
            <div className="flex items-start gap-3">
              <div className="relative mt-0.5">
                <MailCheck className="h-6 w-6 text-[var(--vz-accent-text)]" />
                <LoaderCircle className="absolute -right-2 -top-2 h-3.5 w-3.5 animate-spin text-[var(--vz-accent-text)]" />
              </div>
              <div>
                <div className="font-semibold">Հաստատում ենք email հասցեն…</div>
                <p className="mt-1 text-sm leading-6 text-[var(--vz-accent-text)]">Մի փակիր էջը․ ավարտից հետո ինքնաշխատ կբացվի քո ամրագրումների էջը։</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AuthShell>
  );
}
