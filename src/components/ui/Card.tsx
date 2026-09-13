import { cn } from "@/lib/cn.ts";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bb-surface vizit-surface rounded-[22px]",
        className,
      )}
      {...props}
    />
  );
}
