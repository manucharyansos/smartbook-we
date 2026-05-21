import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Հաստատել",
  cancelText = "Չեղարկել",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
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
            className="fixed inset-x-0 bottom-0 z-50 sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[min(92vw,520px)] sm:-translate-x-1/2 sm:-translate-y-1/2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>
            <div className="rounded-t-[28px] border border-slate-200 bg-white p-5 shadow-[0_-12px_40px_rgba(15,23,42,0.12)] sm:rounded-[28px] sm:p-6 sm:shadow-[0_24px_80px_rgba(124,58,237,0.12)]">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    danger ? "bg-rose-100 text-rose-600" : "bg-violet-100 text-violet-700"
                  }`}
                >
                  <AlertTriangle size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
                  {description && <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>}
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
                <Button variant="secondary" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
                  {cancelText}
                </Button>

                <Button onClick={onConfirm} loading={loading} className={`w-full sm:w-auto ${danger ? "!bg-rose-600 hover:!bg-rose-700" : ""}`}>
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
