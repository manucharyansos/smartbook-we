import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Award, ArrowRight } from "lucide-react";
import type {BusinessType} from "@/types/landing.types.ts";
import { fadeInUp, staggerContainer } from "@/utils/animations.ts";
import BusinessTypeCard from "@/components/landing/business/BusinessTypeCard";

interface BusinessTypeSelectorProps {
    selectedType: BusinessType;
    onSelect: (type: BusinessType) => void;
}

const BusinessTypeSelector: React.FC<BusinessTypeSelectorProps> = ({ selectedType, onSelect }) => {
    // We map the previously named beauty and dental lists to the appropriate
    // business type here.
    const beautyFeatures = [
        'Բազմակի ծառայությունների միաժամանակյա ամրագրում',
        'Լոյալության քարտեր և բոնուսային համակարգ',
        'Նվերի վկայագրերի վաճառք',
        'Ինտեգրում սոցիալական ցանցերի հետ',
        'Հաճախորդների բազա և պատմություն',
    ];

    const dentalFeatures = [
        'Աթոռների/սենյակների կառավարում',
        'Պացիենտի էլեկտրոնային քարտ',
        'Բուժման պլանների կազմում',
        'Բժշկական նշումներ և ֆայլեր',
        'Հիշեցումներ SMS-ով և email-ով',
    ];

    // @ts-ignore
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-16 max-w-4xl mx-auto"
        >
            <div className="text-center mb-8">
                <motion.div
                    variants={fadeInUp}
                    className="text-sm text-[#8F6B58] font-light tracking-wide uppercase"
                >
                    Ընտրեք Ձեր բիզնեսի տեսակը
                </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <BusinessTypeCard
                    type="beauty"
                    title="Գեղեցկության սրահ"
                    description="Գեղեցկության սրահներ, սպա, բարբեր շոփ"
                    icon={Sparkles}
                    features={beautyFeatures}
                    price="7,000 ֏-ից"
                    isSelected={selectedType === 'beauty'}
                    onSelect={() => onSelect('beauty')}
                />

                <BusinessTypeCard
                    type="dental"
                    title="Ատամնաբուժական կլինիկա"
                    description="Ստոմատոլոգիական կլինիկաներ"
                    icon={Award}
                    features={dentalFeatures}
                    price="9,000 ֏-ից"
                    isSelected={selectedType === 'dental'}
                    onSelect={() => onSelect('dental')}
                />
            </div>

            <AnimatePresence>
                {selectedType && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-12"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <a
                                    href={`/register?type=${selectedType}`}
                                    className="inline-flex items-center gap-3 px-12 py-5 rounded-full
                                             bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                             text-white text-sm tracking-widest uppercase
                                             transition-all duration-500
                                             hover:shadow-xl hover:shadow-[#C5A28A]/30 hover:scale-105"
                                >
                                    <span>Սկսել անվճար փորձաշրջանը</span>
                                    <ArrowRight size={18} />
                                </a>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#8F6B58]"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                                    14 օր անվճար
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                                    Առանց քարտի
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                                    Չեղարկեք ցանկացած պահի
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BusinessTypeSelector;