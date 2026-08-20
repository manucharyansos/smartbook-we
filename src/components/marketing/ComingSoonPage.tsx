import { motion } from "framer-motion";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import MarketingPageShell from "./MarketingPageShell";
import { fadeUp, hoverLift, scaleIn } from "../../lib/motion";
import { useLanguage } from "../../contexts/LanguageContext";

type ComingSoonPageProps = {
  badge: string;
  title: string;
  description: string;
  bullets: string[];
};

export default function ComingSoonPage({
  badge,
  title,
  description,
  bullets,
}: ComingSoonPageProps) {
  const { locale } = useLanguage();
  const text = {
    hy: { preparing: "Բաժինը պատրաստվում է", moreTitle: "Մինչ այդ՝ բացահայտիր Vizit-ի հնարավորությունները", moreText: "Հանրային ամրագրումը, օրացույցը, թիմի կառավարումն ու բիզնեսի հիմնական գործիքներն արդեն հասանելի են։ Նոր նյութերը կհրապարակվեն պատրաստ լինելուն պես։", start: "Սկսել անվճար", contact: "Կապվել թիմի հետ" },
    ru: { preparing: "Раздел готовится", moreTitle: "А пока изучите возможности Vizit", moreText: "Онлайн-запись, календарь, управление командой и основные бизнес-инструменты уже доступны. Новые материалы появятся после подготовки.", start: "Начать бесплатно", contact: "Связаться с командой" },
    en: { preparing: "This section is being prepared", moreTitle: "Meanwhile, explore Vizit's features", moreText: "Public booking, the calendar, team management and core business tools are already available. New materials will be published when ready.", start: "Start for free", contact: "Contact the team" },
  }[locale];

  return (
    <MarketingPageShell
      badge={
        <>
          <Sparkles className="h-4 w-4" />
          {badge}
        </>
      }
      title={title}
      description={description}
      maxWidthClassName="max-w-5xl"
    >
      <div className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          variants={scaleIn}
          className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:p-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-200">
            <Clock3 className="h-4 w-4" />
            {text.preparing}
          </div>

          <div className="mt-6 space-y-4">
            {bullets.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                {...hoverLift}
                className="rounded-[24px] border border-slate-200 bg-slate-50/85 p-5 text-sm leading-7 text-slate-700 dark:border-white/10 dark:bg-white/[0.055] dark:text-slate-300"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={scaleIn}
          className="rounded-[32px] border border-slate-200 bg-[linear-gradient(145deg,#0f172a_0%,#4c1d95_55%,#7c2d12_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-8"
        >
          <h2 className="text-2xl font-semibold tracking-tight">{text.moreTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-white/75">
            {text.moreText}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {text.start}
              <ArrowRight className="h-4 w-4" />
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
