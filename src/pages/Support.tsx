import { motion } from "framer-motion";
import { Headset, LifeBuoy, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";

import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";
import { fadeUp, pageTransition, scaleIn, staggerContainer, hoverLift } from "../lib/motion";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY, whatsappLink } from "../lib/support";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: { badge: "Աջակցության կենտրոն", title: "Օգնություն և աջակցություն", intro: "Եթե ունեք տեխնիկական խնդիր, միացման հարց կամ արագ խորհրդատվության կարիք, կապվեք Vizit-ի թիմի հետ։", team: "Աջակցության թիմ", teamIntro: "Գրեք ձեզ հարմար տարբերակով", email: "Էլ. փոստ", emailHint: "Պատասխանը սովորաբար նույն օրը", whatsappHint: "Արագ հարցերի համար", phone: "Հեռախոս", phoneHint: "Աշխատանքային ժամերին", whatsappMessage: "Բարև, աջակցության կարիք ունեմ Vizit-ի վերաբերյալ։", help: "Ինչում կարող ենք օգնել", items: ["Առաջին կարգավորումներ և մեկնարկ", "Հանրային ամրագրման էջի միացում և տեսքի կարգավորում", "Վճարումներ, բաժանորդագրություն և հասանելիություններ", "Մասնագետներ, ծառայություններ, օրացույց և ամրագրման հոսք"], tip: "Ավելի արագ լուծման համար նշեք ձեր բիզնեսի անունը, կցեք խնդրի սքրինշոթը և գրեք՝ որ քայլից հետո է այն առաջացել։" },
  ru: { badge: "Центр поддержки", title: "Помощь и поддержка", intro: "Если у вас техническая проблема, вопрос о подключении или нужна быстрая консультация, свяжитесь с командой Vizit.", team: "Команда поддержки", teamIntro: "Выберите удобный способ связи", email: "Эл. почта", emailHint: "Обычно отвечаем в тот же день", whatsappHint: "Для быстрых вопросов", phone: "Телефон", phoneHint: "В рабочее время", whatsappMessage: "Здравствуйте! Мне нужна помощь по Vizit.", help: "С чем мы помогаем", items: ["Первичная настройка и запуск", "Подключение и оформление публичной страницы записи", "Оплата, подписка и доступ к функциям", "Сотрудники, услуги, календарь и процесс записи"], tip: "Чтобы ускорить решение, укажите название бизнеса, приложите снимок экрана и опишите, после какого шага возникла проблема." },
  en: { badge: "Support center", title: "Help and support", intro: "If you have a technical issue, onboarding question or need quick advice, contact the Vizit team.", team: "Support team", teamIntro: "Choose the channel that works for you", email: "Email", emailHint: "We usually reply the same day", whatsappHint: "For quick questions", phone: "Phone", phoneHint: "During business hours", whatsappMessage: "Hello! I need help with Vizit.", help: "What we can help with", items: ["Initial setup and launch", "Public booking page setup and appearance", "Payments, subscriptions and feature access", "Staff, services, calendar and booking flows"], tip: "For a faster answer, include your business name, a screenshot and the step after which the issue appeared." },
};

export default function Support() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const channels = [
    { icon: <Mail className="h-5 w-5" />, label: text.email, value: SUPPORT_EMAIL, hint: text.emailHint, href: `mailto:${SUPPORT_EMAIL}`, external: false },
    { icon: <MessageCircle className="h-5 w-5" />, label: "WhatsApp", value: SUPPORT_PHONE_DISPLAY, hint: text.whatsappHint, href: whatsappLink(SUPPORT_PHONE, text.whatsappMessage), external: true },
    { icon: <Phone className="h-5 w-5" />, label: text.phone, value: SUPPORT_PHONE_DISPLAY, hint: text.phoneHint, href: `tel:${SUPPORT_PHONE}`, external: false },
  ];
  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="vizit-public-page min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_22%,#faf7ff_100%)] text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.16),transparent_30%),linear-gradient(180deg,#050816_0%,#07101f_45%,#050816_100%)] dark:text-white">
      <LandingNavbar />
      <main className="pt-32 sm:pt-36 lg:pt-40">
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer(0.08, 0.05)} initial="hidden" animate="show" className="mx-auto max-w-7xl">
            <motion.div variants={fadeUp} className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200 dark:shadow-black/20">
                <ShieldCheck className="h-4 w-4" /> {text.badge}
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:mt-6 sm:text-5xl lg:text-6xl">{text.title}</h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{text.intro}</p>
            </motion.div>

            <div className="mt-12 grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
              <motion.div variants={scaleIn} className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
                    <Headset className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{text.team}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{text.teamIntro}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {channels.map((item) => (
                    <motion.a key={item.label} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined} variants={fadeUp} {...hoverLift} className="block rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 transition hover:border-violet-200 hover:bg-violet-50/60 dark:border-white/10 dark:bg-white/[0.055] dark:hover:border-violet-300/30 dark:hover:bg-violet-400/10">
                      <div className="flex items-start gap-4">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-700 shadow-sm dark:bg-violet-400/15 dark:text-violet-200">{item.icon}</div>
                        <div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</div>
                          <div className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{item.value}</div>
                          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.hint}</div>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={scaleIn} className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-900 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                  <LifeBuoy className="h-4 w-4" /> {text.help}
                </div>
                <div className="mt-6 space-y-4 text-sm leading-7 text-white/75">
                  {text.items.map((item) => <p key={item}>• {item}</p>)}
                </div>
                <div className="mt-8 rounded-[24px] border border-white/10 bg-white/10 p-5 text-sm text-white/80">
                  {text.tip}
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
