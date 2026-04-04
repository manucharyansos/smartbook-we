import { motion, AnimatePresence } from "framer-motion";

export function Toast({
                          open,
                          text,
                          type = "success",
                      }: {
    open: boolean;
    text: string;
    type?: "success" | "error";
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
                >
                    <div
                        className={[
                            "rounded-2xl border px-4 py-3 shadow-lg backdrop-blur bg-white/90 text-sm",
                            type === "success" ? "border-green-200 text-green-700" : "border-red-200 text-red-700",
                        ].join(" ")}
                    >
                        {text}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}