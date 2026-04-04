// pages/NotFound.tsx
// Only import hooks; the React namespace itself is not needed with the new JSX transform
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Navigation from "../components/Navigation";

export default function NotFound() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFAF7]">
            <Navigation isScrolled={isScrolled} />

            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-2xl"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" as const }}
                        className="text-9xl font-light text-[#C5A28A] mb-8"
                    >
                        404
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-light text-[#2C2C2C] mb-6">
                        Էջը չի գտնվել
                    </h1>

                    <p className="text-xl text-[#8F6B58] font-light mb-12">
                        Ներեցեք, բայց Ձեր փնտրած էջը գոյություն չունի կամ տեղափոխվել է
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r
                       from-[#C5A28A] to-[#B88E72] text-white rounded-full
                       hover:shadow-xl transition-all"
                        >
                            <Home size={18} />
                            Գլխավոր էջ
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 px-8 py-4 border border-[#C5A28A]/30
                       text-[#8F6B58] rounded-full hover:border-[#C5A28A] transition-all"
                        >
                            <ArrowLeft size={18} />
                            Վերադառնալ
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}