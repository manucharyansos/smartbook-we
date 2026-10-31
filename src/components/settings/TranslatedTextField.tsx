import { useId, useState } from "react";
import { useLanguage, type Locale } from "@/contexts/LanguageContext";
import type { TextTranslations, TranslatableField } from "@/lib/localizedText";

import { cn } from "@/lib/cn";

type Tab = "main" | Locale;

const tabCopy: Record<Locale, { main: string; hint: string; filled: string }> = {
  hy: {
    main: "Հիմնական",
    hint: "Այցելուն տեսնում է իր լեզվով տարբերակը։ Եթե այն դատարկ է, ցույց է տրվում հիմնական տեքստը։",
    filled: "լրացված է",
  },
  ru: {
    main: "Основной",
    hint: "Посетитель видит версию на своём языке. Если она пустая, показывается основной текст.",
    filled: "заполнено",
  },
  en: {
    main: "Main",
    hint: "Visitors see the version in their language. If it is empty, the main text is shown.",
    filled: "filled",
  },
};

const languageNames: Record<Locale, string> = { hy: "Հայերեն", ru: "Русский", en: "English" };
const LOCALES: Locale[] = ["hy", "ru", "en"];

/**
 * A profile text with its main value plus optional owner-written versions per site language.
 */
export function TranslatedTextField({
  field,
  label,
  value,
  translations,
  onChange,
  onTranslationChange,
  maxLength,
  multiline = true,
  rows = 4,
  className,
  inputClassName,
}: {
  field: TranslatableField;
  label: React.ReactNode;
  value: string;
  translations: TextTranslations | null | undefined;
  onChange: (value: string) => void;
  onTranslationChange: (locale: Locale, value: string) => void;
  maxLength: number;
  multiline?: boolean;
  rows?: number;
  className?: string;
  inputClassName?: string;
}) {
  const { locale } = useLanguage();
  const copy = tabCopy[locale];
  const [tab, setTab] = useState<Tab>("main");
  const inputId = useId();

  const current = tab === "main" ? value : translations?.[field]?.[tab] ?? "";
  const update = (next: string) => (tab === "main" ? onChange(next) : onTranslationChange(tab, next));
  const isFilled = (t: Tab) => (t === "main" ? value.trim() !== "" : (translations?.[field]?.[t] ?? "").trim() !== "");

  const fieldClass = inputClassName
    ?? "w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--vz-primary)] focus:ring-4 focus:ring-[var(--vz-focus)]";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--vz-text)]">{label}</label>
        <div className="inline-flex flex-wrap rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-0.5" role="tablist">
          {(["main", ...LOCALES] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              title={isFilled(t) ? copy.filled : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition",
                tab === t ? "bg-[var(--vz-primary)] text-[var(--vz-on-primary)]" : "text-[var(--vz-text-secondary)] hover:text-[var(--vz-text)]",
              )}
            >
              {t === "main" ? copy.main : languageNames[t]}
              {t !== "main" && isFilled(t) ? <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", tab === t ? "bg-[var(--vz-on-primary)]" : "bg-[var(--vz-success)]")} /> : null}
            </button>
          ))}
        </div>
      </div>

      {multiline ? (
        <textarea id={inputId} value={current} maxLength={maxLength} rows={rows} onChange={(e) => update(e.target.value)} lang={tab === "main" ? undefined : tab} className={fieldClass} />
      ) : (
        <input id={inputId} value={current} maxLength={maxLength} onChange={(e) => update(e.target.value)} lang={tab === "main" ? undefined : tab} className={fieldClass} />
      )}
      {tab !== "main" ? <p className="text-xs leading-5 text-[var(--vz-muted)]">{copy.hint}</p> : null}
    </div>
  );
}

