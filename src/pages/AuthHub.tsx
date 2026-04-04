import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, CalendarHeart, Handshake, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { fadeUp, hoverLift, scaleIn, staggerContainer } from "../lib/motion";

type Props = {
  mode: "login" | "register";
};

export default function AuthHub({ mode }: Props) {
  const isRegister = mode === "register";

  return (
    <AuthShell
      title={isRegister ? "Ինչպե՞ս ես ուզում միանալ SmartBook-ին" : "Ո՞րպես ով ես մուտք գործում"}
      subtitle={
        isRegister
          ? "Բիզնեսի և հաճախորդի ճանապարհները բաժանված են, որ onboarding-ը ու cabinet-ը լինեն ավելի պարզ ու պրեմիում։"
          : "Ընտրիր ճիշտ ճանապարհը՝ բիզնես կառավարելու կամ քո անձնական ամրագրումները տեսնելու համար։"
      }
      badge="SmartBook access"
      sideTitle="Մեկ product, բայց երկու հստակ ճանապարհ"
      sideText="Բիզնեսը ստանում է trial, pricing և onboarding flow, իսկ հաճախորդը՝ արագ register/login և իր cabinet-ը։"
      footer={
        <div className="text-center text-sm text-slate-500">
          {isRegister ? "Արդեն ունե՞ս հաշիվ" : "Առաջին անգամ ե՞ս այստեղ"}{" "}
          <Link to={isRegister ? "/login" : "/register"} className="font-medium text-violet-700 hover:text-violet-600">
            {isRegister ? "Մուտքի ընտրություն" : "Գրանցման ընտրություն"}
          </Link>
        </div>
      }
    >
      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-2">
          <motion.div variants={scaleIn} {...hoverLift} className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">Բիզնես</div>
                <div className="text-sm text-slate-500">Սրահ, clinic, spa, massage, wellness</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
              <div>• 14 օր անվճար փորձարկում կամ պլանի ընտրություն</div>
              <div>• Calendar, թիմ, public booking, analytics</div>
              <div>• Owner/manager անսահմանափակ, plan-ը՝ միայն staff count-ով</div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link to={isRegister ? "/business/register?entry=trial" : "/business/login"} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium text-white">
                {isRegister ? "Start trial" : "Business login"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={isRegister ? "/pricing" : "/business/register?entry=plan"} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                {isRegister ? "Choose plan" : "Ստեղծել business հաշիվ"}
              </Link>
            </div>

            {isRegister ? (
              <Link to="/business/register?entry=partner" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-600">
                <Handshake className="h-4 w-4" /> Become partner
              </Link>
            ) : null}
          </motion.div>

          <motion.div variants={scaleIn} {...hoverLift} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">Հաճախորդ</div>
                <div className="text-sm text-slate-500">Քո booking history-ն ու upcoming այցերը մեկ տեղում</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
              <div>• Արագ email/phone register</div>
              <div>• Upcoming և past bookings cabinet-ում</div>
              <div>• Social sign-in-ը պատրաստ է integration-ready վիճակում</div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link to={isRegister ? "/client/register" : "/client/login"} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                {isRegister ? "Client register" : "Client login"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={isRegister ? "/client/login" : "/client/register"} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                {isRegister ? "Already have an account" : "Ստեղծել հաճախորդի հաշիվ"}
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
              <CalendarHeart className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Ինչու՞ է սա կարևոր</div>
              <div className="mt-1">
                Երբ business և client հոսքերը հստակ բաժանված են, մարդիկ արագ հասկանում են իրենց ճանապարհը, conversion-ը բարձրանում է,
                իսկ product-ը զգացվում է ավելի պրոֆեսիոնալ։
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
}
