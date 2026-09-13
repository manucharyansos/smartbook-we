import { cn } from "@/lib/cn.ts";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({ className, variant = "primary", size = "md", loading = false, children, ...props }: Props) {
  const base =
    "vizit-button inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]";
  const variants = {
    primary: "vizit-button--primary",
    secondary: "vizit-button--secondary",
    ghost: "vizit-button--ghost",
    danger: "vizit-button--danger",
  };
  const sizes = {
    sm: "min-h-11 px-3 py-2 text-sm",
    md: "min-h-12 px-4 py-2.5 text-sm",
    lg: "min-h-[52px] px-5 py-3 text-sm",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} aria-busy={loading || undefined} disabled={loading || props.disabled}>
      {children}
    </button>
  );
}
