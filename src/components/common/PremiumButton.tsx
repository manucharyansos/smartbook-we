import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface PremiumButtonProps {
    to?: string;
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline";
    className?: string;
    icon?: LucideIcon;
    onClick?: () => void;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
                                                                to,
                                                                children,
                                                                variant = "primary",
                                                                className = "",
                                                                icon: Icon = ArrowRight,
                                                                onClick
                                                            }) => {
    const navigate = useNavigate();

    const baseClasses = "relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm tracking-widest uppercase overflow-hidden transition-all duration-700 group cursor-pointer";

    const variants = {
        primary: "bg-[var(--vz-cover)] text-white hover:bg-[#8F6B58]",
        secondary: "bg-[var(--vz-surface)] text-[var(--vz-text)] hover:bg-[#C5A28A] hover:text-white",
        outline: "border border-[var(--vz-line-strong)] text-[var(--vz-muted)] hover:border-[var(--vz-line-strong)]"
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
                {Icon && <Icon size={18} className="group-hover:translate-x-1 transition-transform" />}
            </span>
            <motion.div
                className="bg-[var(--vz-primary)] absolute inset-0"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.5 }}
            />
        </motion.button>
    );
};
