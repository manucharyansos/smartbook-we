import type { Transition, Variants } from "framer-motion";

export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easeSoft: Transition["ease"] = [0.22, 1, 0.36, 1];

export const pageTransition: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: easeOutExpo,
            when: "beforeChildren",
            staggerChildren: 0.06,
        },
    },
};

export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: stagger,
            delayChildren,
        },
    },
});

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: easeOutExpo },
    },
};

export const fadeDown: Variants = {
    hidden: { opacity: 0, y: -18 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: easeSoft },
    },
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { duration: 0.35, ease: easeSoft },
    },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 14 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.5, ease: easeOutExpo },
    },
};

export const cardReveal: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.985 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.45, ease: easeSoft },
    },
};

export const card: Variants = {
    initial: { opacity: 0, y: 18, scale: 0.985 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
    },
};

export const cardTransition: Transition = {
    duration: 0.42,
    ease: easeSoft,
};

export const hoverLift = {
    whileHover: { y: -4, scale: 1.01, transition: { duration: 0.2 } },
    whileTap: { scale: 0.985, transition: { duration: 0.12 } },
};

export const hoverScale = {
    whileHover: { scale: 1.03, transition: { duration: 0.2 } },
    whileTap: { scale: 0.97, transition: { duration: 0.12 } },
};

export const revealOnViewProps = {
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: { once: true, amount: 0.18 },
};

export const page = {
    variants: pageTransition,
    initial: "hidden" as const,
    animate: "show" as const,
};
