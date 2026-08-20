import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";

import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import Seo from "../components/Seo";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
    hy: {
        title: "Էջը չի գտնվել",
        description: "Ձեր փնտրած էջը գոյություն չունի կամ տեղափոխվել է։",
        home: "Գլխավոր էջ",
        contact: "Կապվել մեզ հետ",
    },
    ru: {
        title: "Страница не найдена",
        description: "Запрашиваемая страница не существует или была перемещена.",
        home: "На главную",
        contact: "Связаться с нами",
    },
    en: {
        title: "Page not found",
        description: "The page you requested does not exist or has moved.",
        home: "Go home",
        contact: "Contact us",
    },
};

export default function NotFound() {
    const { locale } = useLanguage();
    const text = copy[locale];

    return (
        <div className="vizit-public-page min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-[#050816] dark:text-white">
            <Seo title={`404 — ${text.title} | Vizit`} description={text.description} robots="noindex,nofollow" />
            <LandingNavbar />

            <main className="flex min-h-[75vh] items-center justify-center px-4 pb-16 pt-32 sm:pt-36">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl text-center">
                    <div className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-8xl font-black tracking-tight text-transparent sm:text-9xl">404</div>
                    <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{text.title}</h1>
                    <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">{text.description}</p>

                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700">
                            <Home className="h-4 w-4" /> {text.home}
                        </Link>
                        <Link to="/contact" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/[0.12]">
                            <ArrowLeft className="h-4 w-4" /> {text.contact}
                        </Link>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
