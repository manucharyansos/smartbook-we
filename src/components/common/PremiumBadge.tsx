// src/components/common/PremiumBadge.tsx
import React from "react";
import { motion } from "framer-motion";

interface PremiumBadgeProps {
    children: React.ReactNode;
    className?: string;
    icon?: any;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ children, className = "", icon: Icon }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`relative inline-flex items-center px-5 py-2.5 overflow-hidden rounded-full 
                       bg-gradient-to-r from-[#C5A28A]/10 to-[#B88E72]/10 
                       border border-[#C5A28A]/30 text-[#8F6B58] text-xs font-medium 
                       backdrop-blur-sm ${className}`}
        >
            <span className="relative z-10 flex items-center gap-2">
                <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]"
                />
                {Icon && <Icon size={14} className="text-[#C5A28A]" />}
                {children}
            </span>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
            />
        </motion.div>
    );
};