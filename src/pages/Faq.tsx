import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import MarketingPageShell from "../components/marketing/MarketingPageShell";
import { fadeUp, hoverLift, scaleIn } from "../lib/motion";

const items = [
  {
    q: "SmartBook-ը ում համար է նախատեսված?",
    a: "Հարթակը հիմնականում կառուցված է գեղեցկության սրահների, կոսմետոլոգիական ծառայությունների, ատամնաբուժական կլինիկաների և appointment-based այլ բիզնեսների համար։",
  },
  {
    q: "Կարո՞ղ եմ ունենալ public booking էջ իմ բիզնեսի համար?",
    a: "Այո․ յուրաքանչյուր բիզնես կարող է ունենալ առանձին public էջ՝ ծառայություններով, հասցեով, թիմով և օնլայն booking հոսքով։",
  },
  {
    q: "Աշխատակիցների համար տարբեր role-եր կա՞ն?",
    a: "Այո․ owner, manager և staff role-երով հասանելիությունները տարբերակված են, որպեսզի թիմի կառավարումն ավելի անվտանգ լինի։",
  },
  {
    q: "Gift cards և loyalty հնարավորությունները բոլոր plan-երում կա՞ն?",
    a: "Ոչ միշտ․ որոշ feature-ներ plan-gated են և կախված են քո ակտիվ բաժանորդագրությունից։",
  },
];

export default function Faq() {
  return (
    <MarketingPageShell
      badge={
        <>
          <ShieldCheck className="h-4 w-4" /> ՀՏՀ
        </>
      }
      title="Հաճախ տրվող հարցեր"
      description="Ամենատարածված հարցերը SmartBook-ի setup-ի, public booking flow-ի և role/feature հնարավորությունների մասին։"
      maxWidthClassName="max-w-5xl"
    >
      <div className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.q}
              variants={fadeUp}
              {...hoverLift}
              className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-sm backdrop-blur"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{item.q}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={scaleIn}
          className="rounded-[32px] border border-slate-200 bg-[linear-gradient(145deg,#0f172a_0%,#4c1d95_58%,#7c2d12_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/85">
            <MessageCircle className="h-4 w-4" />
            Չգտա՞ր պատասխանը
          </div>
          <h2 className="mt-6 text-2xl font-semibold">Կապվիր թիմի հետ</h2>
          <p className="mt-4 text-sm leading-7 text-white/75">
            Եթե ունես կոնկրետ setup-ի խնդիր, public booking customization կամ վճարումների
            հարց, support/contact էջերից ավելի արագ կկարողանաս ստանալ ուղղորդում։
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/support"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Աջակցության կենտրոն
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Կապ մեզ հետ
            </Link>
          </div>
        </motion.div>
      </div>
    </MarketingPageShell>
  );
}
