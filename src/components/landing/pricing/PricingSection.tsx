import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { BusinessType } from "@/types/landing.types";
import PricingCard from "./PricingCard";
import { PremiumBadge } from "@/components/common/PremiumBadge";
import { staggerContainer } from "@/utils/animations";
import { publicPlansApi } from "@/lib/planApi";

interface PricingSectionProps {
    selectedType: BusinessType;
}

const businessTypeLabels: Record<
    Exclude<BusinessType, null>,
    { name: string; shortName: string }
> = {
    beauty: { name: "Գեղեցկության սրահ", shortName: "Սրահ" },
    dental: { name: "Դենտալ կլինիկա", shortName: "Կլինիկա" },
};

export default function PricingSection({ selectedType }: PricingSectionProps) {
    const q = useQuery({
        queryKey: ["public-plans", selectedType],
        enabled: !!selectedType,
        queryFn: async () => {
            const r = await publicPlansApi.list((selectedType ?? "beauty") as "beauty" | "dental");
            return (r.data?.data ?? []) as never[];
        },
    });

    if (q.isLoading) {
        return (
            <section className="py-24 px-4 sm:px-6 bg-[#FDFAF7]">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A28A] mx-auto mb-4" />
                    <p className="text-[#8F6B58] font-light">Բեռնում է փաթեթները...</p>
                </div>
            </section>
        );
    }

    if (q.isError) {
        return (
            <section className="py-24 px-4 sm:px-6 bg-[#FDFAF7]">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-red-600">
                        Չհաջողվեց բեռնել փաթեթները ({(q.error as Error).message})
                    </p>
                </div>
            </section>
        );
    }

    const plans = q.data ?? [];

    return (
        <section id="pricing" className="py-24 px-4 sm:px-6 bg-[#FDFAF7]">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <PremiumBadge className="mb-6">Գնային փաթեթներ</PremiumBadge>

                    <h2 className="text-4xl md:text-5xl font-light text-[#2C2C2C] mb-6">
                        Ընտրեք Ձեր <span className="text-[#8F6B58]">փաթեթը</span>
                    </h2>

                    <p className="text-lg text-[#8F6B58] font-light">
                        {selectedType
                            ? `${businessTypeLabels[selectedType].name} -ի համար նախատեսված գներ`
                            : "Ընտրեք Ձեր բիզնեսի տեսակը գները տեսնելու համար"}
                    </p>
                </motion.div>

                {!selectedType ? (
                    <div className="text-center py-12">
                        <p className="text-[#8F6B58] font-light">
                            Ընտրեք Ձեր բիզնեսի տեսակը գները տեսնելու համար
                        </p>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#8F6B58] font-light">Փաթեթներ չեն գտնվել</p>
                    </div>
                ) : (
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
                    >
                        {plans.map((plan: any) => (
                            <PricingCard
                                key={plan.id ?? plan.code ?? JSON.stringify(plan)}
                                plan={plan}
                                selectedType={selectedType}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}