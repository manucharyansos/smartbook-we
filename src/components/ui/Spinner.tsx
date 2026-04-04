import { cn } from "../../lib/cn";

export function Spinner({
    size = 18,
    className,
}: {
    /**
     * The size of the spinner.  Accepts a number of pixels or one of the
     * predefined labels "sm", "md" or "lg".  Using a union here allows
     * components across the codebase to pass semantic size strings (e.g.
     * "sm") instead of raw numbers.
     */
    size?: number | "sm" | "md" | "lg";
    className?: string;
}) {
    const px = size === "sm" ? 14 : size === "md" ? 18 : size === "lg" ? 24 : size;
    return (
        <span
            className={cn(
                "inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-800",
                className
            )}
            style={{ width: px, height: px }}
            aria-label="loading"
        />
    );
}