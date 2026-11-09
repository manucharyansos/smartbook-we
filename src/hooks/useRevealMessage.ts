import { useEffect, useRef } from "react";

/**
 * Brings a form's status message into view and moves focus to it when it is
 * shown. On a phone the submit button sits far below the message, so without
 * this a validation or server error is rendered off-screen and the button
 * looks broken.
 *
 * `trigger` re-runs the reveal for a repeated identical message, for example
 * when the same field is still missing on the second tap.
 */
export function useRevealMessage<T extends HTMLElement>(
    message: string | null | undefined,
    trigger?: unknown,
    block: ScrollLogicalPosition = "center",
) {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        if (!message) return;
        const element = ref.current;
        if (!element) return;

        const reduceMotion = typeof window !== "undefined"
            && typeof window.matchMedia === "function"
            && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block });
        element.focus({ preventScroll: true });
    }, [message, trigger, block]);

    return ref;
}
