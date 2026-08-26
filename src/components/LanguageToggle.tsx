import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { cn } from "../lib/cn";

const options: Array<{ value: Locale; label: string; short: string }> = [
  { value: "hy", label: "Հայերեն", short: "HY" },
  { value: "ru", label: "Русский", short: "RU" },
  { value: "en", label: "English", short: "EN" },
];

function FlagIcon({ locale }: { locale: Locale }) {
  return (
    <span className="vizit-language-flag inline-flex h-[16px] w-[24px] shrink-0 overflow-hidden rounded-[4px] border border-black/10 shadow-sm" aria-hidden="true">
      <svg viewBox="0 0 24 16" className="block h-full w-full" focusable="false">
        {locale === "hy" ? (
          <>
            <rect width="24" height="5.34" fill="#d90012" />
            <rect y="5.33" width="24" height="5.34" fill="#0033a0" />
            <rect y="10.66" width="24" height="5.34" fill="#f2a800" />
          </>
        ) : locale === "ru" ? (
          <>
            <rect width="24" height="5.34" fill="#fff" />
            <rect y="5.33" width="24" height="5.34" fill="#1c3578" />
            <rect y="10.66" width="24" height="5.34" fill="#e4181c" />
          </>
        ) : (
          <>
            <rect width="24" height="16" fill="#21468b" />
            <path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="4" />
            <path d="M0 0 24 16M24 0 0 16" stroke="#cf142b" strokeWidth="1.8" />
            <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
            <path d="M12 0v16M0 8h24" stroke="#cf142b" strokeWidth="2.8" />
          </>
        )}
      </svg>
    </span>
  );
}

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
          <button type="button" onClick={() => setOpen((value) => !value)} aria-label={{ hy: "Փոխել լեզուն", ru: "Изменить язык", en: "Change language" }[locale]} aria-expanded={open} className="vizit-language-button inline-flex h-10 min-w-[74px] items-center justify-center gap-2 rounded-full px-3 text-sm font-bold sm:h-11">
            <FlagIcon locale={selected.value} />
            <span className="vizit-language-code text-xs font-extrabold tracking-[0.08em]" aria-hidden="true">{selected.short}</span>
            <ChevronDown className={cn("vizit-language-chevron h-3.5 w-3.5 transition", open && "rotate-180")} />
          </button>
          {open ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[70] grid min-w-[154px] gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-slate-950">
              {options.map((option) => (
                <button key={option.value} type="button" onClick={() => { setLocale(option.value); setOpen(false); }} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-white", option.value === locale ? "bg-[#f8eee4] text-[#5b2156] dark:bg-white/10 dark:text-[#f0cf8d]" : "hover:bg-slate-100 dark:hover:bg-white/10")}>
                  <FlagIcon locale={option.value} />
                  <span className="min-w-7 text-xs font-extrabold tracking-[0.08em] text-[#a66f28] dark:text-[#f0cf8d]" aria-hidden="true">{option.short}</span>
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="grid w-full grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white/70 p-2 dark:border-white/10 dark:bg-white/[0.04]">
          {options.map((option) => (
            <button key={option.value} type="button" onClick={() => setLocale(option.value)} aria-label={option.label} className={cn("flex h-14 min-w-0 items-center justify-center gap-2 rounded-xl border leading-none transition", option.value === locale ? "border-[#d39a43]/60 bg-[#f8eee4] text-[#5b2156] shadow-sm dark:border-[#e5bd74]/40 dark:bg-white/10 dark:text-white" : "border-transparent hover:bg-slate-100 dark:hover:bg-white/10")}>
              <FlagIcon locale={option.value} />
              <span className="text-xs font-extrabold tracking-[0.08em]" aria-hidden="true">{option.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
