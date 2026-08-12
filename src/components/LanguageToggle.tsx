import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { cn } from "../lib/cn";

const options: Array<{ value: Locale; label: string; flag: string }> = [
  { value: "hy", label: "Հայ", flag: "🇦🇲" },
  { value: "ru", label: "Рус", flag: "🇷🇺" },
  { value: "en", label: "Eng", flag: "🇬🇧" },
];

export default function LanguageToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === locale) ?? options[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", compact ? "inline-flex" : "w-full", className)}>
      {compact ? (
        <>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Փոխել լեզուն" aria-expanded={open} className="inline-flex h-10 min-w-[70px] items-center justify-center gap-2 rounded-full px-3 text-sm font-bold sm:h-11">
            <span className="text-xl leading-none" aria-hidden="true">{selected.flag}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
          </button>
          {open ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[70] grid min-w-[154px] gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-slate-950">
              {options.map((option) => (
                <button key={option.value} type="button" onClick={() => { setLocale(option.value); setOpen(false); }} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-white", option.value === locale ? "bg-violet-100 dark:bg-violet-500/20" : "hover:bg-slate-100 dark:hover:bg-white/10")}>
                  <span className="text-xl leading-none" aria-hidden="true">{option.flag}</span>{option.label}
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="grid w-full grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white/70 p-2 dark:border-white/10 dark:bg-white/[0.04]">
          {options.map((option) => (
            <button key={option.value} type="button" onClick={() => setLocale(option.value)} aria-label={option.label} className={cn("grid h-12 min-w-0 place-items-center rounded-xl border text-2xl leading-none transition", option.value === locale ? "border-violet-400 bg-violet-100 shadow-sm dark:border-violet-400/60 dark:bg-violet-500/20" : "border-transparent hover:bg-slate-100 dark:hover:bg-white/10")}>
              <span aria-hidden="true">{option.flag}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
