import { motion } from "framer-motion";
import { Headset, LifeBuoy, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";

import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";
import { fadeUp, pageTransition, scaleIn, staggerContainer, hoverLift } from "../lib/motion";

const channels = [
  { icon: <Mail className="h-5 w-5" />, label: "Էլ. փոստ", value: "support@vizit.am", hint: "Պատասխանը սովորաբար նույն օրը" },
  { icon: <MessageCircle className="h-5 w-5" />, label: "WhatsApp", value: "+374 XX XXX XXX", hint: "Արագ հարցերի համար" },
  { icon: <Phone className="h-5 w-5" />, label: "Հեռախոս", value: "+374 XX XX XX XX", hint: "Աշխատանքային ժամերին" },
];

export default function Support() {
  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_22%,#faf7ff_100%)]">
      <LandingNavbar />
      <main className="pt-32 sm:pt-36 lg:pt-40">
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer(0.08, 0.05)} initial="hidden" animate="show" className="mx-auto max-w-7xl">
            <motion.div variants={fadeUp} className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
                <ShieldCheck className="h-4 w-4" /> Աջակցության կենտրոն
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:mt-6 sm:text-5xl lg:text-6xl">Օգնություն և աջակցություն</h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">Եթե ունես տեխնիկական խնդիր, միացման հարց կամ ուզում ես արագ խորհրդատվություն, այստեղից կարող ես կապվել Vizit-ի թիմի հետ։</p>
            </motion.div>

            <div className="mt-12 grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
              <motion.div variants={scaleIn} className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
                    <Headset className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Աջակցության թիմ</h2>
                    <p className="text-sm text-slate-500">Մեզ գրիր քեզ հարմար տարբերակով</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {channels.map((item) => (
                    <motion.div key={item.label} variants={fadeUp} {...hoverLift} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="flex items-start gap-4">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-700 shadow-sm">{item.icon}</div>
                        <div>
                          <div className="text-sm font-medium text-slate-500">{item.label}</div>
                          <div className="mt-1 text-base font-semibold text-slate-900">{item.value}</div>
                          <div className="mt-1 text-sm text-slate-500">{item.hint}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={scaleIn} className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-900 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                  <LifeBuoy className="h-4 w-4" /> Ինչում կարող ենք օգնել
                </div>
                <div className="mt-6 space-y-4 text-sm leading-7 text-white/75">
                  <p>• առաջին կարգավորումներ և մեկնարկի հարցեր</p>
                  <p>• հանրային ամրագրման էջի միացում և տեսքի կարգավորում</p>
                  <p>• վճարումների, բաժանորդագրության և հասանելիությունների հարցեր</p>
                  <p>• մասնագետների, ծառայությունների, օրացույցի և ամրագրման հոսքի սխալների ստուգում</p>
                </div>
                <div className="mt-8 rounded-[24px] border border-white/10 bg-white/10 p-5 text-sm text-white/80">
                  Ավելի արագ լուծման համար հաղորդագրության մեջ ավելացրու քո բիզնեսի անունը, խնդրի սքրինշոթը և ինչ քայլից հետո է այն առաջացել։
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </motion.div>
  );
}
