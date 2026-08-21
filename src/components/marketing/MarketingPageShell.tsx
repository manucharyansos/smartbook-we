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
      className="vizit-public-page min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_12%_0%,rgba(91,47,168,0.10),transparent_28rem),linear-gradient(180deg,#faf8fc_0%,#ffffff_28%,#faf8fc_100%)] text-[#241736] transition-colors dark:bg-[radial-gradient(circle_at_top,rgba(169,128,243,0.16),transparent_32%),linear-gradient(180deg,#090712_0%,#151020_48%,#090712_100%)] dark:text-white"
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
                  <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#1e9e92]/25 bg-[#1e9e92]/[0.08] px-4 py-2 text-xs font-semibold text-[#167d74] shadow-sm dark:border-[#58d0c4]/25 dark:bg-[#58d0c4]/10 dark:text-[#8be3da] dark:shadow-black/20 sm:text-sm">
                    {badge}
                  </div>
                ) : null}

                <h1 className="vizit-display mt-4 text-3xl text-[#241736] dark:text-white sm:mt-6 sm:text-5xl lg:text-6xl">
                  {title}
                </h1>

                {description ? (
                  <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6b6178] dark:text-[#b7adc5] sm:text-lg sm:leading-8">
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
