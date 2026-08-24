import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);
    const { locale } = useLanguage();
    const label = { hy: "Վերև բարձրանալ", ru: "Наверх", en: "Back to top" }[locale];

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: 10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="vizit-scroll-top-button fixed bottom-24 right-4 z-40 grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-[#c58b35] text-white shadow-[0_14px_34px_rgba(133,85,30,0.30)] transition hover:bg-[#ad7428] active:scale-95 dark:border-[#efd59f]/25 dark:bg-[#6d2a63] dark:hover:bg-[#7e376f] xl:bottom-8 xl:right-8"
                    aria-label={label}
                    title={label}
                >
                    <ChevronUp className="h-5 w-5" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
