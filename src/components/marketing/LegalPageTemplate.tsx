import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import MarketingPageShell from "./MarketingPageShell";
import { fadeUp, scaleIn } from "../../lib/motion";

type ԻրավականSection = {
  title: string;
  content: ReactNode;
};

type ԻրավականPageTemplateProps = {
  title: string;
  description: string;
  updatedAt?: string;
  sections: ԻրավականSection[];
};

export default function ԻրավականPageTemplate({
  title,
  description,
  updatedAt,
  sections,
}: ԻրավականPageTemplateProps) {
  return (
    <MarketingPageShell
      badge={
        <>
          <ShieldCheck className="h-4 w-4" />
          Իրավական
        </>
      }
      title={title}
      description={description}
      maxWidthClassName="max-w-4xl"
    >
      <motion.div
        variants={scaleIn}
        className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8"
      >
        {updatedAt ? <div className="text-sm text-slate-500">Վերջին թարմացում՝ {updatedAt}</div> : null}

        <div className="mt-6 space-y-5">
          {sections.map((section) => (
            <motion.section key={section.title} variants={fadeUp} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">{section.content}</div>
            </motion.section>
          ))}
        </div>
      </motion.div>
    </MarketingPageShell>
  );
}
