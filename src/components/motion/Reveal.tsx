import { motion, type Variants } from "framer-motion";
import React from "react";

type RevealProps = {
    children: React.ReactNode;
    className?: string;
    delay?: number;
};

const variants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.94,
        y: 22,
        filter: "blur(8px)",
    },
    show: (delay = 0) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            delay,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as any,
        },
    }),
};

export default function Reveal({ children, className, delay = 0 }: RevealProps) {
    return (
        <motion.div
            className={className}
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.18 }}
            custom={delay}
        >
            {children}
        </motion.div>
    );
}