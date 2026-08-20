import { motion } from "framer-motion";
import type { ReactNode } from "react";

import LandingNavbar from "../LandingNavbar";
import Footer from "../Footer";
import { fadeUp, pageTransition, staggerContainer } from "../../lib/motion";

type MarketingPageShellProps = {
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
};

export default function MarketingPageShell({
  badge,
  title,
  description,
  children,
  maxWidthClassName = "max-w-7xl",
}: MarketingPageShellProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="show"
      className="vizit-public-page min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_22%,#faf7ff_100%)] text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.16),transparent_30%),linear-gradient(180deg,#050816_0%,#07101f_45%,#050816_100%)] dark:text-white"
    >
      <LandingNavbar />

      <main className="pt-32 sm:pt-36 lg:pt-40">
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            animate="show"
            className={`mx-auto ${maxWidthClassName}`}
          >
            {(badge || title || description) && (
              <motion.div variants={fadeUp} className="mb-9 text-center sm:mb-12">
                {badge ? (
                  <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-medium text-violet-700 shadow-sm dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200 dark:shadow-black/20 sm:text-sm">
                    {badge}
                  </div>
                ) : null}

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:mt-6 sm:text-5xl lg:text-6xl">
                  {title}
                </h1>

                {description ? (
                  <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                    {description}
                  </p>
                ) : null}
              </motion.div>
            )}

            {children}
          </motion.div>
        </section>
      </main>

      <Footer />
    </motion.div>
  );
}
