import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/cn";
import { useLanguage } from "../contexts/LanguageContext";

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export default function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { locale } = useLanguage();
  const isDark = resolvedTheme === "dark";
  const labels = {
    hy: { light: "Միացնել բաց տեսքը", dark: "Միացնել մուգ տեսքը", lightName: "Բաց", darkName: "Մուգ" },
    ru: { light: "Включить светлую тему", dark: "Включить тёмную тему", lightName: "Светлая", darkName: "Тёмная" },
    en: { light: "Switch to light theme", dark: "Switch to dark theme", lightName: "Light", darkName: "Dark" },
  }[locale];
  const actionLabel = isDark ? labels.light : labels.dark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "vizit-theme-toggle inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-sm font-semibold text-white shadow-sm backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white/[0.10] active:translate-y-0",
        compact ? "h-11 w-11" : "gap-2 px-4 py-2.5",
        className,
      )}
      aria-label={actionLabel}
      title={actionLabel}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {compact ? null : <span>{isDark ? labels.lightName : labels.darkName}</span>}
    </button>
  );
}
