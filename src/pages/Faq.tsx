import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import MarketingPageShell from "../components/marketing/MarketingPageShell";
import { fadeUp, hoverLift, scaleIn } from "../lib/motion";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: {
    badge: "ՀՏՀ", title: "Հաճախ տրվող հարցեր", description: "Vizit-ի կարգավորումների, հանրային ամրագրման և հասանելիությունների մասին ամենատարածված հարցերը։",
    missing: "Չգտա՞ք պատասխանը", contactTitle: "Կապվեք թիմի հետ", contactText: "Եթե ունեք կարգավորման, հանրային ամրագրման կամ վճարումների կոնկրետ հարց, կապվեք աջակցության թիմի հետ։", support: "Աջակցության կենտրոն", contact: "Կապ մեզ հետ",
    items: [
      { q: "Vizit-ը ո՞ւմ համար է նախատեսված", a: "Հարթակը նախատեսված է գեղեցկության սրահների, կլինիկաների, մասնավոր մասնագետների և ամրագրումով աշխատող այլ բիզնեսների համար։" },
      { q: "Կարո՞ղ եմ ունենալ իմ բիզնեսի ամրագրման էջը", a: "Այո։ Յուրաքանչյուր բիզնես կարող է ունենալ առանձին էջ՝ ծառայություններով, հասցեներով, թիմով և օնլայն ամրագրմամբ։" },
      { q: "Թիմի անդամների համար տարբեր դերեր կա՞ն", a: "Այո։ Սեփականատիրոջ, մենեջերի և աշխատակցի հասանելիությունները տարբեր են՝ թիմի անվտանգ կառավարման համար։" },
      { q: "Նվերի քարտերն ու loyalty-ն հասանելի՞ են բոլոր պլաններում", a: "Որոշ հնարավորություններ կախված են ակտիվ պլանից։ Յուրաքանչյուր պլանի սահմանները նշված են գնային էջում։" },
    ],
  },
  ru: {
    badge: "FAQ", title: "Частые вопросы", description: "Ответы на популярные вопросы о настройке Vizit, публичной записи и доступных возможностях.",
    missing: "Не нашли ответ?", contactTitle: "Свяжитесь с командой", contactText: "Если у вас есть конкретный вопрос о настройке, онлайн-записи или оплате, обратитесь в поддержку.", support: "Центр поддержки", contact: "Связаться с нами",
    items: [
      { q: "Для кого предназначен Vizit?", a: "Платформа создана для салонов красоты, клиник, частных специалистов и других компаний, работающих по записи." },
      { q: "Можно ли создать отдельную страницу записи?", a: "Да. У каждого бизнеса может быть публичная страница с услугами, адресами, командой и онлайн-записью." },
      { q: "Есть ли разные роли для сотрудников?", a: "Да. Права владельца, менеджера и сотрудника различаются для безопасного управления командой." },
      { q: "Подарочные карты и программа лояльности входят во все тарифы?", a: "Некоторые возможности зависят от активного тарифа. Ограничения каждого тарифа указаны на странице цен." },
    ],
  },
  en: {
    badge: "FAQ", title: "Frequently asked questions", description: "Answers to common questions about Vizit setup, public booking and available features.",
    missing: "Still have a question?", contactTitle: "Talk to our team", contactText: "For specific setup, public booking or payment questions, contact the support team.", support: "Support center", contact: "Contact us",
    items: [
      { q: "Who is Vizit for?", a: "Vizit is built for beauty salons, clinics, independent professionals and other appointment-based businesses." },
      { q: "Can my business have its own booking page?", a: "Yes. Each business can have a public page with services, locations, staff and online booking." },
      { q: "Are there different staff roles?", a: "Yes. Owner, manager and staff permissions are separated to keep team management secure." },
      { q: "Are gift cards and loyalty included in every plan?", a: "Some features depend on the active plan. Each plan's limits are shown on the pricing page." },
    ],
  },
};

export default function Faq() {
  const { locale } = useLanguage();
  const text = copy[locale];
  return (
    <MarketingPageShell
      badge={
        <>
          <ShieldCheck className="h-4 w-4" /> {text.badge}
        </>
      }
      title={text.title}
      description={text.description}
      maxWidthClassName="max-w-5xl"
    >
      <div className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {text.items.map((item) => (
            <motion.div
              key={item.q}
              variants={fadeUp}
              {...hoverLift}
              className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{item.q}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.a}</p>
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
            {text.missing}
          </div>
          <h2 className="mt-6 text-2xl font-semibold">{text.contactTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-white/75">
            {text.contactText}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/support"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {text.support}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
            >
              {text.contact}
            </Link>
          </div>
        </motion.div>
      </div>
    </MarketingPageShell>
  );
}
