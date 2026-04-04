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
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
          >
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(124,58,237,0.12)]">
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

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                  {cancelText}
                </Button>

                <Button onClick={onConfirm} loading={loading} className={danger ? "!bg-rose-600 hover:!bg-rose-700" : ""}>
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
