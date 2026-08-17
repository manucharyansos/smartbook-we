// src/components/landing/pricing/PricingCard.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import type {BusinessType} from "@/types/landing.types";
import { fadeInScale } from "@/utils/animations";
import { PremiumButton } from "@/components/common/PremiumButton";
import { formatPlanPrice, isCustomPlan, localizePlanName, monthlyPlanPrice } from "@/lib/planPresentation";
import type { PublicPlan } from "@/lib/planApi";

interface PricingCardProps {
    plan: PublicPlan;
    selectedType: BusinessType;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, selectedType }) => {
    const [, setIsHovered] = useState(false);
    const custom = isCustomPlan(plan);

    // Format features from backend
    const features: string[] = plan.features ? [
        Number(plan.features.staff_limit ?? 0) > 0 ? (custom ? "16+ ակտիվ մասնագետ" : `Մինչև ${Number(plan.features.staff_limit)} աշխատակից`) : null,
        plan.features.sms_reminders ? `SMS հիշեցումներ (${plan.features.sms_reminders === 'unlimited' ? 'անսահմանափակ' : `${String(plan.features.sms_reminders)}/ամիս`})` : null,
        plan.features.api_access === true ? 'API հասանելիություն' : null,
        plan.features.priority_support === true ? 'Առաջնահերթ աջակցություն' : null,
        plan.features.dedicated_manager === true ? 'Անհատական մենեջեր' : null,
    ].filter((feature): feature is string => Boolean(feature)) : [];

    return (
        <motion.div
            variants={fadeInScale}
            whileHover={{ scale: plan.code === 'business' ? 1.05 : 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`
                relative rounded-3xl p-6 pt-8 transition-all duration-700 h-full flex flex-col sm:p-8 sm:pt-10
                ${plan.code === 'business'
                ? 'bg-gradient-to-b from-white to-[#F9F5F0] shadow-2xl shadow-[#C5A28A]/20 border-2 border-[#C5A28A]/30'
                : 'bg-white/50 backdrop-blur-sm border border-[#E8D5C4]/20 hover:border-[#C5A28A]/30'
            }
            `}
        >
            {plan.code === 'business' && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
                >
                    <span className="bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                   text-white text-xs px-6 py-2 rounded-full shadow-lg">
                        Ամենատարածված
                    </span>
                </motion.div>
            )}

            <div className="relative flex-grow">
                <h3 className={`text-2xl font-light mb-2 ${plan.code === 'business' ? 'text-[#8F6B58]' : 'text-[#2C2C2C]'}`}>
                    {localizePlanName(plan)}
                </h3>
                <p className="text-[#8F6B58] text-sm font-light mb-6">{plan.description || ''}</p>

                <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-light text-[#2C2C2C]">
                        {formatPlanPrice(monthlyPlanPrice(plan), plan.currency ?? "AMD")}
                    </span>
                    {!custom ? <span className="text-[#8F6B58] text-sm font-light">/{plan.period || 'ամիս'}</span> : null}
                </div>

                <ul className="space-y-4 mb-8">
                    {features.map((feature, i) => (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 text-[#2C2C2C] text-sm font-light"
                        >
                            <Check size={18} className="text-[#C5A28A] flex-shrink-0" />
                            <span>{feature}</span>
                        </motion.li>
                    ))}
                </ul>
            </div>

            <PremiumButton
                to={custom ? "/contact?subject=custom-plan" : `/register?type=${selectedType || 'beauty'}`}
                variant={plan.code === 'business' ? "primary" : "outline"}
                className="w-full justify-center mt-auto"
                icon={ArrowRight}
            >
                {custom ? "Ստանալ առաջարկ" : "Սկսել անվճար"}
            </PremiumButton>
        </motion.div>
    );
};

export default PricingCard;
