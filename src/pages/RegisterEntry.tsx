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
      badge="SmartBook account setup"
      sideTitle="Սկսենք"
      sideText="Ընտրիր՝ business թե client։"
      footer={
        <div className="text-center text-sm text-slate-500">
          Արդեն ունե՞ս հաշիվ {" "}
          <Link to="/login" className="font-medium text-violet-700 hover:text-violet-600">Մուտք գործել</Link>
        </div>
      }
    >
      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={scaleIn} className="rounded-[26px] border border-violet-100 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">Բիզնես հաշիվ</div>
              <div className="text-sm text-slate-500">Սրահ, clinic, spa, wellness և այլ ծառայողական բիզնեսներ</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/business/register?entry=trial" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium text-white">
              Սկսել գրանցումը
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
              Տեսնել պլանները
            </Link>
          </div>
        </motion.div>

        <motion.div variants={scaleIn} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">Հաճախորդի հաշիվ</div>
              <div className="text-sm text-slate-500">Քո bookings-ը մեկ cabinet-ում</div>
            </div>
          </div>
          <div className="mt-5">
            <Link to="/client/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
              Client գրանցում
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
}
