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
        <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-50 to-white px-6">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center"
            >
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white grid place-items-center shadow-lg shadow-violet-500/25">
                    <CalendarDays className="h-7 w-7" />
                </div>

                <div className="mt-2 text-lg font-semibold text-slate-950 tracking-tight">Vizit</div>

                <div className="mt-5 flex items-center justify-center gap-2">
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="h-2 w-2 rounded-full bg-violet-500"
                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                            />
                        ))}
                    </div>
                    <div className="text-left ml-1">
                        <div className="text-sm font-medium text-slate-700">{title}</div>
                        {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
