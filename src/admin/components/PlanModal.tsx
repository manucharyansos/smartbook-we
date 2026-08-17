import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Sparkles, Award, Save } from "lucide-react";
import { scaleIn, fadeUp, staggerContainer, hoverLift } from "@/lib/motion.ts";
import { cn } from "@/lib/cn.ts";

type BusinessType = "beauty" | "dental" | null;
type SmsReminders = number | "unlimited";

interface Plan {
    id?: number;
    name: string;
    code: string;
    business_type: BusinessType;
    description: string | null;
    monthly_price?: number | null;
    yearly_price?: number | null;
    price?: number | null;
    price_beauty?: number | null;
    price_dental?: number | null;
    currency: string;
    seats?: number | null;
    staff_limit?: number | null;
    duration_days: number;
    locations: number | null;
    features: {
        staff_limit: number;
        sms_reminders: SmsReminders;
        api_access: boolean;
        priority_support: boolean;
        dedicated_manager: boolean;
        custom_pricing: boolean;
        partner_terms: boolean;
        [k: string]: any;
    };
    is_active?: boolean;
    is_visible?: boolean;
    sort_order?: number;
}

interface PlanModalProps {
    open: boolean;
    plan: any | null;
    onClose: () => void;
    onSave: (plan: any) => void;
    saving?: boolean;
    error?: string | null;
}

const emptyForm: Plan = {
    name: "",
    code: "",
    business_type: null as BusinessType,
    description: "",
    monthly_price: 0,
    yearly_price: 0,
    currency: "AMD",
    seats: 1,
    duration_days: 30,
    locations: 1,
    features: {
        staff_limit: 1,
        services_limit: 10,
        sms_reminders: "unlimited" as SmsReminders,
        api_access: false,
        priority_support: false,
        dedicated_manager: false,
        custom_pricing: false,
        partner_terms: false,
    },
    is_active: true,
    is_visible: true,
    sort_order: 0,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <div className="mb-3 text-sm font-semibold text-slate-700">{children}</div>;
}

export function PlanModal({
                              open,
                              plan,
                              onClose,
                              onSave,
                              saving,
                              error,
                          }: PlanModalProps) {
    const [formData, setFormData] = useState<Plan>({ ...emptyForm });

    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name || "",
                code: plan.code || "",
                business_type: plan.business_type ?? null,
                description: plan.description || "",
                monthly_price: plan.monthly_price ?? plan.price ?? plan.price_beauty ?? 0,
                yearly_price: plan.yearly_price ?? ((plan.monthly_price ?? plan.price ?? plan.price_beauty ?? 0) * 10),
                price: plan.price ?? plan.monthly_price ?? plan.price_beauty ?? 0,
                price_beauty: plan.price_beauty ?? plan.monthly_price ?? plan.price ?? 0,
                price_dental: plan.price_dental ?? plan.monthly_price ?? plan.price ?? 0,
                currency: plan.currency || "AMD",
                seats: plan.staff_limit ?? plan.seats ?? plan.features?.staff_limit ?? 1,
                duration_days: plan.duration_days || 30,
                locations: plan.locations ?? 1,
                features: {
                    ...(plan.features ?? {}),
                    staff_limit: plan.staff_limit ?? plan.features?.staff_limit ?? plan.seats ?? 1,
                    services_limit: plan.services_limit ?? plan.features?.services_limit ?? 10,
                    sms_reminders: plan.features?.sms_reminders ?? "unlimited",
                    api_access: !!plan.features?.api_access,
                    priority_support: !!plan.features?.priority_support,
                    dedicated_manager: !!plan.features?.dedicated_manager,
                    custom_pricing: !!plan.features?.custom_pricing || plan.code === "custom",
                    partner_terms: !!plan.features?.partner_terms || plan.code === "custom",
                },
                is_active: plan.is_active ?? true,
                is_visible: plan.is_visible ?? true,
                sort_order: plan.sort_order ?? 0,
            });
        } else {
            setFormData({ ...emptyForm });
        }
    }, [plan, open]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const target = e.target;
        const { name, value } = target;
        const type = target instanceof HTMLInputElement ? target.type : undefined;

        if (name.includes(".")) {
            const [parent, child] = name.split(".");

            if (parent === "features") {
                setFormData((prev) => {
                    let nextValue: any;

                    if (type === "checkbox" && target instanceof HTMLInputElement) {
                        nextValue = target.checked;
                    } else if (child === "sms_reminders") {
                        nextValue = value === "unlimited" ? "unlimited" : parseInt(value) || 0;
                    } else if (type === "number") {
                        nextValue = parseInt(value) || 0;
                    } else {
                        nextValue = value;
                    }

                    return {
                        ...prev,
                        features: {
                            ...prev.features,
                            [child]: nextValue,
                        },
                    };
                });
            }
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox" && target instanceof HTMLInputElement
                    ? target.checked
                    : type === "number"
                        ? parseInt(value) || 0
                        : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSave({
            ...formData,
            price: formData.monthly_price,
            monthly_price: Number(formData.monthly_price ?? 0),
            yearly_price: Number(formData.yearly_price ?? 0) || Number(formData.monthly_price ?? 0) * 10,
            staff_limit: formData.features.staff_limit,
            services_limit: formData.features.services_limit,
            seats: formData.features.staff_limit,
            features: { ...formData.features, staff_limit: formData.features.staff_limit, services_limit: formData.features.services_limit },
        });
    };

    return (
        <AnimatePresence>
            {open && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <div className="flex min-h-full items-center justify-center">
                        <motion.div
                            variants={scaleIn}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-4xl rounded-[32px] border border-white/20 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                                        {plan ? "Խմբագրել փաթեթ" : "Նոր փաթեթ"}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Սահմանիր plan-ի գինը, սահմանները և հասանելի հնարավորությունները
                                    </p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:bg-violet-50"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <motion.form
                                variants={staggerContainer(0.06, 0.02)}
                                initial="hidden"
                                animate="show"
                                onSubmit={handleSubmit}
                                className="space-y-6 px-6 py-6 sm:px-8 sm:py-8"
                            >
                                {error ? (
                                    <motion.div
                                        variants={fadeUp}
                                        className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                                    >
                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                ) : null}

                                <motion.div variants={fadeUp} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                                    <SectionTitle>Բիզնեսի տեսակ</SectionTitle>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {[
                                            { key: null, label: "Երկուսի համար", icon: null },
                                            { key: "beauty", label: "Beauty", icon: <Sparkles size={16} className="text-violet-600" /> },
                                            { key: "dental", label: "Clinic", icon: <Award size={16} className="text-sky-600" /> },
                                        ].map((item) => {
                                            const active = formData.business_type === item.key;
                                            return (
                                                <button
                                                    key={String(item.key)}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData((p) => ({
                                                            ...p,
                                                            business_type: item.key as BusinessType,
                                                        }))
                                                    }
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                                                        active
                                                            ? "border-violet-300 bg-violet-50 text-violet-700"
                                                            : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                                                    )}
                                                >
                                                    {item.icon}
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Անվանում *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Կոդ *</label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Նկարագրություն</label>
                                        <textarea
                                            name="description"
                                            value={formData.description ?? ""}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                                    <SectionTitle>Գնային տվյալներ</SectionTitle>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Ամսական գին</label>
                                            <input
                                                type="number"
                                                name="monthly_price"
                                                value={formData.monthly_price ?? 0}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Տարեկան գին</label>
                                            <input
                                                type="number"
                                                name="yearly_price"
                                                value={formData.yearly_price ?? 0}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Արժույթ</label>
                                            <select
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            >
                                                <option value="AMD">AMD</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Հերթականություն</label>
                                            <input
                                                type="number"
                                                name="sort_order"
                                                value={formData.sort_order ?? 0}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                                    <SectionTitle>Փաթեթի մանրամասներ</SectionTitle>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Աշխատակիցների քանակ</label>
                                            <input
                                                type="number"
                                                name="features.staff_limit"
                                                value={formData.features.staff_limit}
                                                onChange={handleChange}
                                                min="1"
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Ծառայությունների քանակ</label>
                                            <input
                                                type="number"
                                                name="features.services_limit"
                                                value={Number(formData.features.services_limit ?? 0)}
                                                onChange={handleChange}
                                                min="1"
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">SMS հիշեցումներ</label>
                                            <select
                                                name="features.sms_reminders"
                                                value={String(formData.features.sms_reminders)}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            >
                                                <option value="50">50</option>
                                                <option value="200">200</option>
                                                <option value="500">500</option>
                                                <option value="1000">1000</option>
                                                <option value="unlimited">Անսահմանափակ</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Տևողություն (օր)</label>
                                            <input
                                                type="number"
                                                name="duration_days"
                                                value={formData.duration_days}
                                                onChange={handleChange}
                                                min="1"
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Հասցեների քանակ</label>
                                            <input
                                                type="number"
                                                name="locations"
                                                value={formData.locations ?? 1}
                                                onChange={handleChange}
                                                min="1"
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">Սա ընդհանուր հասցեների limit-ն է, ներառյալ գլխավոր հասցեն։</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                                    <SectionTitle>Առանձնահատկություններ</SectionTitle>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {[
                                            { name: "features.priority_support", label: "Առաջնահերթ աջակցություն" },
                                            { name: "features.custom_pricing", label: "Անհատական գնագոյացում" },
                                            { name: "features.partner_terms", label: "Գործընկերային պայմաններ" },
                                            { name: "is_active", label: "Ակտիվ" },
                                            { name: "is_visible", label: "Ցուցադրել" },
                                        ].map((item) => {
                                            const checked =
                                                item.name.startsWith("features.")
                                                    ? Boolean(formData.features[item.name.split(".")[1] as keyof typeof formData.features])
                                                    : Boolean((formData as any)[item.name]);

                                            return (
                                                <label
                                                    key={item.name}
                                                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name={item.name}
                                                        checked={checked}
                                                        onChange={handleChange}
                                                        className="h-4 w-4 rounded border-slate-300 text-violet-600"
                                                    />
                                                    <span>{item.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={fadeUp}
                                    className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end"
                                >
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Չեղարկել
                                    </button>

                                    <motion.button
                                        type="submit"
                                        disabled={saving}
                                        {...hoverLift}
                                        className={cn(
                                            "inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-medium text-white shadow-lg shadow-violet-500/20",
                                            saving && "cursor-not-allowed opacity-70"
                                        )}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                <span>Պահպանում...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Պահպանել</span>
                                            </>
                                        )}
                                    </motion.button>
                                </motion.div>
                            </motion.form>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
