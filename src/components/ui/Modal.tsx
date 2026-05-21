import { type JSX, type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

type ModalSize = "md" | "lg" | "xl" | "2xl" | "screen";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  description?: string;
  footer?: JSX.Element;
  size?: ModalSize;
  bodyClassName?: string;
  panelClassName?: string;
};

const sizeMap: Record<ModalSize, string> = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
  screen: "max-w-[min(1400px,96vw)]",
};

export function Modal({
  open,
  title,
  onClose,
  children,
  description,
  footer,
  size = "md",
  bodyClassName,
  panelClassName,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" aria-modal="true" role="dialog">
          <motion.div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as any }}
            className={cn(
              "relative flex w-full flex-col overflow-hidden overflow-x-hidden bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]",
              "max-h-[94dvh] rounded-t-[28px] sm:max-h-[92vh] sm:rounded-[32px] sm:border sm:border-white/70",
              sizeMap[size],
              panelClassName,
            )}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Drag handle for mobile */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>

            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
              <div className="min-w-0">
                <div className="text-base font-semibold text-slate-950 sm:text-lg">{title ?? ""}</div>
                {description ? <div className="mt-0.5 text-xs leading-5 text-slate-500 sm:mt-1 sm:text-sm">{description}</div> : null}
              </div>
              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:h-10 sm:w-10 sm:rounded-2xl"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className={cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 sm:px-6 sm:py-4", bodyClassName)}>{children}</div>

            {footer ? <div className="border-t border-slate-200/80 bg-white/95 px-4 py-3 sm:px-6 sm:py-4">{footer}</div> : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
