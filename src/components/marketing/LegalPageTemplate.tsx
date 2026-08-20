import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import MarketingPageShell from "./MarketingPageShell";
import { fadeUp, scaleIn } from "../../lib/motion";
import { useLanguage } from "../../contexts/LanguageContext";

type LegalSection = {
  title: string;
  content: ReactNode;
};

type LegalPageTemplateProps = {
  title: string;
  description: string;
  updatedAt?: string;
  sections: LegalSection[];
};

export default function LegalPageTemplate({
  title,
  description,
  updatedAt,
  sections,
}: LegalPageTemplateProps) {
  const { locale } = useLanguage();
  const labels = {
    hy: { legal: "Իրավական", updated: "Վերջին թարմացում" },
    ru: { legal: "Правовая информация", updated: "Последнее обновление" },
    en: { legal: "Legal", updated: "Last updated" },
  }[locale];
  return (
    <MarketingPageShell
      badge={
        <>
          <ShieldCheck className="h-4 w-4" />
          {labels.legal}
        </>
      }
      title={title}
      description={description}
      maxWidthClassName="max-w-4xl"
    >
      <motion.div
        variants={scaleIn}
        className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:p-8"
      >
        {updatedAt ? <div className="text-sm text-slate-500 dark:text-slate-400">{labels.updated}: {updatedAt}</div> : null}

        <div className="mt-6 space-y-5">
          {sections.map((section) => (
            <motion.section key={section.title} variants={fadeUp} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.055] sm:p-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{section.content}</div>
            </motion.section>
          ))}
        </div>
      </motion.div>
    </MarketingPageShell>
  );
}
