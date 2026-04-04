import { motion } from "framer-motion";
import { Spinner } from "./Spinner";

export function FullScreenLoader({
                                     title = "Բեռնում է…",
                                     subtitle,
                                 }: {
    title?: string;
    subtitle?: string;
}) {
    return (
        <div className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-white px-6">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as any }}
                className="w-full max-w-sm rounded-3xl border bg-white p-8 shadow-sm text-center"
            >
                <div className="mx-auto h-12 w-12 rounded-2xl bg-black text-white grid place-items-center font-semibold">
                    B
                </div>

                <div className="mt-4 flex items-center justify-center gap-3">
                    <Spinner size="md" />
                    <div className="text-left">
                        <div className="font-semibold text-gray-900">{title}</div>
                        {subtitle && <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}