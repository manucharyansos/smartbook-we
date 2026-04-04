import { cn } from "@/lib/cn.ts";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bb-surface rounded-[28px]",
        className,
      )}
      {...props}
    />
  );
}
