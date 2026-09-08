import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

export function FullScreenLoader({
    title = "Բեռնում է…",
    subtitle,
}: {
    title?: string;
    subtitle?: string;
}) {
    return (
        <div className="grid min-h-screen place-items-center bg-[#f5f8fb] px-6 dark:bg-[#071624]">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm rounded-2xl border border-[#d8e3ec] bg-white p-8 text-center shadow-[0_18px_48px_rgba(7,22,36,0.09)] dark:border-[#173b57] dark:bg-[#0b2133]"
            >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-[#2578c8] to-[#378add] text-white shadow-[0_12px_28px_rgba(55,138,221,0.24)]">
                    <CalendarDays className="h-7 w-7" />
                </div>

                <div className="mt-2 text-lg font-semibold tracking-tight text-[#071624] dark:text-white">Vizit</div>

                <div className="mt-5 flex items-center justify-center gap-2">
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="h-2 w-2 rounded-full bg-[#378add]"
                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                            />
                        ))}
                    </div>
                    <div className="text-left ml-1">
                        <div className="text-sm font-medium text-slate-700 dark:text-[#d9eaf7]">{title}</div>
                        {subtitle && <div className="mt-0.5 text-xs text-slate-500 dark:text-[#a7bed1]">{subtitle}</div>}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
