import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

type ActionOption = {
  key: string;
  title: string;
  description?: string;
  danger?: boolean;
};

type ActionModalProps = {
  open: boolean;
  title: string;
  description?: string;
  options: ActionOption[];
  onChoose: (key: string) => void;
  onClose: () => void;
};

export function ActionModal({ open, title, description, options, onChoose, onClose }: ActionModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
          >
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(124,58,237,0.12)]">
              <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
              {description && <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>}

              <div className="mt-6 space-y-3">
                {options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onChoose(option.key)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                      option.danger
                        ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50"
                        : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30"
                    }`}
                  >
                    <div>
                      <div className={`font-semibold ${option.danger ? "text-rose-700" : "text-slate-950"}`}>{option.title}</div>
                      {option.description && <div className="mt-1 text-sm text-slate-500">{option.description}</div>}
                    </div>
                    <ArrowRight size={18} className={option.danger ? "text-rose-500" : "text-violet-600"} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
