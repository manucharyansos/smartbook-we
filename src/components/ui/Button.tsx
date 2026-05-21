import { cn } from "@/lib/cn.ts";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({ className, variant = "primary", size = "md", loading = false, children, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.97]";
  const variants = {
    primary:
      "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.22)] hover:shadow-[0_16px_30px_rgba(124,58,237,0.28)] hover:brightness-105",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
    ghost: "text-slate-700 hover:bg-slate-100",
    danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  };
  const sizes = {
    sm: "h-10 min-h-[40px] px-3 text-sm",
    md: "h-11 min-h-[44px] px-4 text-sm",
    lg: "h-12 min-h-[48px] px-5 text-sm",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={loading || props.disabled} {...props}>
      {children}
    </button>
  );
}
