import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/cn";

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export default function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "vizit-theme-toggle inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-sm font-semibold text-white shadow-sm backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white/[0.10] active:translate-y-0",
        compact ? "h-11 w-11" : "gap-2 px-4 py-2.5",
        className,
      )}
      aria-label={isDark ? "Միացնել light mode" : "Միացնել dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {compact ? null : <span>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}
