import { Languages } from "lucide-react";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { cn } from "../lib/cn";

const options: Array<{ value: Locale; label: string }> = [
  { value: "hy", label: "HY" },
  { value: "ru", label: "RU" },
  { value: "en", label: "EN" },
];

export default function LanguageToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { locale, setLocale } = useLanguage();

  return (
    <label className={cn("inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-bold text-white shadow-sm backdrop-blur-2xl transition hover:bg-white/[0.10]", className)}>
      <Languages className="h-4 w-4" />
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label="Փոխել լեզուն"
        className={cn("cursor-pointer appearance-none bg-transparent font-bold uppercase outline-none", compact ? "w-10" : "w-12")}
      >
        {options.map((option) => <option key={option.value} value={option.value} className="bg-white text-slate-950 dark:bg-slate-950 dark:text-white">{option.label}</option>)}
      </select>
    </label>
  );
}
