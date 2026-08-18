import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

export default function StickyCTA() {
    const { locale } = useLanguage();
    const text = { hy: { login: "Մուտք", start: "Սկսել" }, ru: { login: "Войти", start: "Начать" }, en: { login: "Sign in", start: "Start" } }[locale];
    return (
        <div className="fixed bottom-4 left-0 right-0 z-50 md:hidden px-4">
            <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                className="mx-auto max-w-xl rounded-3xl border bg-white/85 backdrop-blur-xl shadow-lg p-3"
            >
                <div className="flex items-center gap-2">
                    <Link
                        to="/login"
                        className="flex-1 text-center rounded-2xl border bg-white py-3 text-sm font-medium hover:bg-gray-50 transition"
                    >
                        {text.login}
                    </Link>
                    <Link
                        to="/register"
                        className="flex-1 text-center rounded-2xl bg-black text-white py-3 text-sm font-semibold hover:opacity-95 transition"
                    >
                        {text.start}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
