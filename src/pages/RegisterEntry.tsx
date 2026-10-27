import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { scaleIn, staggerContainer } from "../lib/motion";

export default function RegisterEntry() {
  return (
    <AuthShell
      title="Ստեղծել հաշիվ"
      subtitle="Ընտրիր հաշվի տեսակը։"
      badge="Vizit account setup"
      sideTitle="Սկսենք"
      sideText="Ընտրիր՝ business թե client։"
      footer={
        <div className="text-center text-sm text-[var(--vz-muted)]">
          Արդեն ունե՞ս հաշիվ {" "}
          <Link to="/login" className="font-medium text-[var(--vz-accent-text)] hover:text-[var(--vz-accent-text)]">Մուտք գործել</Link>
        </div>
      }
    >
      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={scaleIn} className="bg-[var(--vz-accent-soft)] rounded-[26px] border border-[var(--vz-line-strong)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--vz-primary)] text-[var(--vz-on-primary)]">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-[var(--vz-text)]">Բիզնես հաշիվ</div>
              <div className="text-sm text-[var(--vz-muted)]">Սրահ, clinic, spa, wellness և այլ ծառայողական բիզնեսներ</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/business/register?entry=trial" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--vz-primary)] px-4 py-3 text-sm font-medium text-[var(--vz-on-primary)]">
              Սկսել գրանցումը
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-3 text-sm font-medium text-[var(--vz-text-secondary)]">
              Տեսնել պլանները
            </Link>
          </div>
        </motion.div>

        <motion.div variants={scaleIn} className="rounded-[26px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--vz-primary)] text-[var(--vz-on-primary)]">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-[var(--vz-text)]">Հաճախորդի հաշիվ</div>
              <div className="text-sm text-[var(--vz-muted)]">Քո bookings-ը մեկ cabinet-ում</div>
            </div>
          </div>
          <div className="mt-5">
            <Link to="/client/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--vz-primary)] px-4 py-3 text-sm font-medium text-[var(--vz-on-primary)]">
              Client գրանցում
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
}
