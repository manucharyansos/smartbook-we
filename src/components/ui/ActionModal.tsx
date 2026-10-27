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
            <div className="rounded-[28px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-6 shadow-[0_24px_80px_rgba(124,58,237,0.12)]">
              <h3 className="text-xl font-semibold text-[var(--vz-text)]">{title}</h3>
              {description && <p className="mt-2 text-sm leading-7 text-[var(--vz-text-secondary)]">{description}</p>}

              <div className="mt-6 space-y-3">
                {options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onChoose(option.key)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                      option.danger
                        ? "border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] hover:bg-[var(--vz-danger-soft)]"
                        : "border-[var(--vz-line)] bg-[var(--vz-surface)] hover:border-[var(--vz-primary)] hover:bg-[var(--vz-accent-soft)]"
                    }`}
                  >
                    <div>
                      <div className={`font-semibold ${option.danger ? "text-[var(--vz-danger)]" : "text-[var(--vz-text)]"}`}>{option.title}</div>
                      {option.description && <div className="mt-1 text-sm text-[var(--vz-muted)]">{option.description}</div>}
                    </div>
                    <ArrowRight size={18} className={option.danger ? "text-[var(--vz-danger)]" : "text-[var(--vz-accent-text)]"} />
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
