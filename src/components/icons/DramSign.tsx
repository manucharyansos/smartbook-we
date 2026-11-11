import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

export const DramSign = forwardRef<SVGSVGElement, LucideProps>(function DramSign(
  { size = 24, color = "currentColor", strokeWidth: _strokeWidth, absoluteStrokeWidth: _absoluteStrokeWidth, ...props }, ref,
) {
  void _strokeWidth;
  void _absoluteStrokeWidth;
  return <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" {...props}>
    <text x="12" y="19" textAnchor="middle" fontFamily="Noto Sans Armenian, sans-serif" fontSize="23">֏</text>
  </svg>;
});
