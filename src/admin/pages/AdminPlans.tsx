import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Package,
    Edit,
    Trash2,
    Plus,
    Eye,
    EyeOff,
    Crown,
    BadgePercent,
    Users,
    Clock,
    Settings,
    AlertCircle
} from 'lucide-react';
import { adminPlansApi } from '../services/adminPlansApi';
import { PlanModal, type Plan } from '../components/PlanModal';
import { cn } from '@/lib/cn';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/http';

interface ApiResponse {
    success: boolean;
    data: PersistedPlan[];
}

type PersistedPlan = Plan & { id: number };

export default function AdminPlans() {
    const [showHidden, setShowHidden] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PersistedPlan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'plans', showHidden],
        queryFn: async () => {
            const res = await adminPlansApi.list(showHidden);
            return res.data as ApiResponse | PersistedPlan[];
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: Plan) => adminPlansApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
            setIsModalOpen(false);
            setEditingPlan(null);
            setModalError(null);
        },
        onError: (error: unknown) => {
            setModalError(getErrorMessage(error, 'Սխալ փաթեթի ստեղծման ժամանակ'));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Plan }) => adminPlansApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
            setIsModalOpen(false);
            setEditingPlan(null);
            setModalError(null);
        },
        onError: (error: unknown) => {
            setModalError(getErrorMessage(error, 'Սխալ փաթեթի թարմացման ժամանակ'));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminPlansApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
        },
    });

    const plans: PersistedPlan[] = Array.isArray(data) ? data : (data?.data || []);

    const getPlanIcon = (code: string) => {
        switch (code) {
            case 'start':
            case 'starter':
                return <Package size={20} className="text-gray-600" />;
            case 'studio':
                return <BadgePercent size={20} className="text-purple-600" />;
            case 'scale':
            case 'business':
                return <Crown size={20} className="text-blue-600" />;
            case 'custom':
            case 'enterprise':
                return <Crown size={20} className="text-amber-600" />;
            default:
                return <Package size={20} className="text-gray-600" />;
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('hy-AM').format(price) + ' ' + currency;
    };

    const isCustomPlan = (plan: Plan) => plan.code === 'custom' || plan.features?.custom_pricing === true;

    const handleSavePlan = (planData: Plan) => {
        if (editingPlan) {
            updateMutation.mutate({ id: editingPlan.id, data: planData });
        } else {
            createMutation.mutate(planData);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                <div className="flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>Չհաջողվեց բեռնել փաթեթները</span>
                </div>
            </div>
        );
    }

    // ✅ Ստուգել, որ plans-ը array է
    if (!Array.isArray(plans)) {
        console.error('Plans is not an array:', plans);
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                <div className="flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>Սխալ տվյալների ձևաչափ</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHero
                eyebrow={<><Package className="h-4 w-4" /> Պլանների կառավարում</>}
                title="Բաժանորդագրության փաթեթներ"
                description="Ընդհանուր plan-երը կառավարիր այստեղ, իսկ business-specific անհատական առաջարկները տրվում են կոնկրետ բիզնեսի էջից։"
                actions={
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowHidden(!showHidden)}
                            className="gap-2"
                            title={showHidden ? 'Թաքցնել չցուցադրվող պլանները' : 'Ցույց տալ չցուցադրվող պլանները'}
                        >
                            {showHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                            {showHidden ? 'Թաքցնել չցուցադրվողները' : 'Ցույց տալ չցուցադրվողները'}
                        </Button>
                        <Button
                            onClick={() => {
                                setEditingPlan(null);
                                setIsModalOpen(true);
                                setModalError(null);
                            }}
                            className="gap-2"
                        >
                            <Plus size={18} />
                            <span>Նոր փաթեթ</span>
                        </Button>
                    </div>
                }
            />

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                {plans.map((plan: PersistedPlan, index: number) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            "bg-white rounded-xl shadow-sm border overflow-hidden",
                            !plan.is_visible && 'opacity-60',
                            !plan.is_active && 'border-red-200'
                        )}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        plan.code === 'start' || plan.code === 'starter' ? 'bg-gray-100' :
                                            plan.code === 'scale' || plan.code === 'business' ? 'bg-blue-100' :
                                                plan.code === 'studio' ? 'bg-purple-100' :
                                                    'bg-amber-100'
                                    )}>
                                        {getPlanIcon(plan.code)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{plan.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{plan.code}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {/* Business Type Badge */}
                                    {plan.business_type === 'beauty' && (
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Beauty</span>
                                    )}
                                    {plan.business_type === 'dental' && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Clinic</span>
                                    )}
                                    {!plan.business_type && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                            Բոլոր ուղղությունների համար
                                        </span>
                                    )}
                                    {!plan.is_visible && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                            Չցուցադրվող
                                        </span>
                                    )}
                                    {!plan.is_active && (
                                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                                            Ոչ ակտիվ
                                        </span>
                                    )}
                                </div>
                            </div>

                            {plan.description && (
                                <p className="text-sm text-gray-600 mt-3">{plan.description}</p>
                            )}

                            {/* Prices */}
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-violet-50 p-3">
                                    <div className="text-xs font-medium text-violet-600">Ամսական</div>
                                    <div className="mt-1 text-lg font-semibold text-violet-700">{isCustomPlan(plan) ? 'Անհատական' : formatPrice(plan.monthly_price ?? plan.price ?? plan.price_beauty ?? 0, plan.currency)}</div>
                                </div>
                                <div className="rounded-2xl bg-emerald-50 p-3">
                                    <div className="text-xs font-medium text-emerald-600">Տարեկան</div>
                                    <div className="mt-1 text-lg font-semibold text-emerald-700">{isCustomPlan(plan) ? 'Անհատական' : formatPrice(plan.yearly_price ?? ((plan.monthly_price ?? plan.price ?? plan.price_beauty ?? 0) * 10), plan.currency)}</div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users size={16} />
                                    <span>{isCustomPlan(plan) ? '16+ ակտիվ մասնագետ' : `Մինչև ${plan.staff_limit ?? plan.features?.staff_limit ?? plan.seats ?? "—"} ակտիվ մասնագետ`}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock size={16} />
                                    <span>{plan.duration_days} օր հաշվեշրջան</span>
                                </div>
                                {plan.locations && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Settings size={16} />
                                        <span>{plan.locations > 1 ? `Մինչև ${plan.locations} հասցե` : '1 հասցե'}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Settings size={16} />
                                    <span>{isCustomPlan(plan) ? 'Ծառայությունների սահմանափակում չկա' : `Մինչև ${plan.services_limit ?? plan.features?.services_limit ?? "—"} ծառայություն`}</span>
                                </div>
                            </div>

                            {/* Features preview */}
                            {plan.features && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Հատուկ պայմաններ</div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {plan.features.priority_support ? <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">Առաջնահերթ աջակցություն</span> : null}
                                        {plan.features.custom_pricing ? <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Անհատական գին</span> : null}
                                        {plan.features.partner_terms ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Գործընկերային պայմաններ</span> : null}
                                        {!plan.features.priority_support && !plan.features.custom_pricing && !plan.features.partner_terms ? <span className="text-gray-500">Ստանդարտ պայմաններ</span> : null}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-end gap-2">
                            <button
                                onClick={() => {
                                    setEditingPlan(plan);
                                    setIsModalOpen(true);
                                    setModalError(null);
                                }}
                                className="p-2 hover:bg-white rounded-lg transition"
                            >
                                <Edit size={16} className="text-gray-600" />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Ջնջե՞լ փաթեթը')) {
                                        deleteMutation.mutate(plan.id);
                                    }
                                }}
                                className="p-2 hover:bg-white rounded-lg transition"
                            >
                                <Trash2 size={16} className="text-red-600" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Plan Modal */}
            <PlanModal
                open={isModalOpen}
                plan={editingPlan}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPlan(null);
                    setModalError(null);
                }}
                onSave={handleSavePlan}
                saving={createMutation.isPending || updateMutation.isPending}
                error={modalError}
            />
        </div>
    );
}
