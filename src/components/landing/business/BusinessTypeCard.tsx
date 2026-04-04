// src/components/landing/business/BusinessTypeCard.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface BusinessTypeCardProps {
    type: 'beauty' | 'dental';
    title: string;
    description: string;
    icon: any;
    features: string[];
    price?: string;
    isSelected: boolean;
    onSelect: () => void;
}

const BusinessTypeCard: React.FC<BusinessTypeCardProps> = ({
                                                               title,
                                                               description,
                                                               icon: Icon,
                                                               features,
                                                               price,
                                                               isSelected,
                                                               onSelect
                                                           }) => {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`
                relative cursor-pointer rounded-3xl border-2 p-6 sm:p-8
                transition-all duration-500 overflow-hidden
                ${isSelected
                ? 'border-[#C5A28A] bg-white shadow-2xl shadow-[#C5A28A]/20'
                : 'border-[#E8D5C4]/30 bg-white/70 hover:border-[#C5A28A]/50 hover:bg-white'
            }
            `}
        >
            {/* Background gradient */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#C5A28A]/5 to-[#B88E72]/5"
                animate={{ opacity: isSelected ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            />

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48">
                <div className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-[#C5A28A]/20 rounded-tr-3xl" />
            </div>
            <div className="absolute bottom-0 left-0 w-48 h-48">
                <div className="absolute bottom-0 left-0 w-full h-full border-b-2 border-l-2 border-[#C5A28A]/20 rounded-bl-3xl" />
            </div>

            <div className="relative">
                <div className="flex items-start justify-between mb-8">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.7 }}
                        className={`
                            h-20 w-20 rounded-2xl flex items-center justify-center
                            ${isSelected
                            ? 'bg-gradient-to-r from-[#C5A28A] to-[#B88E72] shadow-lg shadow-[#C5A28A]/30'
                            : 'bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20'
                        }
                        `}
                    >
                        <Icon size={36} className={isSelected ? 'text-white' : 'text-[#C5A28A]'} />
                    </motion.div>

                    <AnimatePresence>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                         flex items-center justify-center text-white"
                            >
                                <Check size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <h3 className="text-2xl font-light text-[#2C2C2C] mb-3 sm:text-3xl">{title}</h3>
                <p className="text-[#8F6B58] font-light mb-4 text-lg">{description}</p>
                {price && (
                    <p className="text-[#C5A28A] font-light mb-6 text-sm">
                        Սկսած <span className="text-2xl">{price}</span>/ամիս
                    </p>
                )}

                <div className="space-y-4">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 text-[#2C2C2C]"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]" />
                            <span className="text-sm">{feature}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default BusinessTypeCard;