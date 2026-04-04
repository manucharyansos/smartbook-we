import React from "react";
import { cn } from "../../lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(function Input({ className, ...props }, ref) {
  return <input ref={ref} {...props} className={cn("bb-input", className)} />;
});
