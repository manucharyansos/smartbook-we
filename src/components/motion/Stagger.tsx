import { motion, type Variants } from "framer-motion";
import React from "react";

const container: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.06,
        },
    },
};

export default function Stagger({
                                    children,
                                    className,
                                    once = true,
                                    amount = 0.2,
                                }: {
    children: React.ReactNode;
    className?: string;
    once?: boolean;
    amount?: number;
}) {
    return (
        <motion.div
            className={className}
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once, amount }}
        >
            {children}
        </motion.div>
    );
}