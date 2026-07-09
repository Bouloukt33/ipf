import { useState } from 'react';
import { Plus, Settings, Trash2, Check, Users, CreditCard } from 'lucide-react';
import { useAdminPlans } from '../hooks/useAdminMarketing';
import type { IPlan, IPlanFormData } from '../hooks/useAdminMarketing';
import { PlanModal } from '../components/admin/PlanModal';
import { Toast, useToast } from '../components/admin/Toast';
import { PageHero } from '../components/admin/PageHero';
import { enterAt } from '../lib/utils';

function parseFeatures(features: string[] | null | unknown): string[] {
    if (!features) return [];
    if (Array.isArray(features)) return features;

    try {
        return JSON.parse(features as string);
    } catch {
        return [];
    }
}

function formatPrice(price: number, currency: string, intervalMonths: number) {
    const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(price);

    return `${formatted} / ${intervalMonths === 1 ? 'mois' : `${intervalMonths} mois`}`;
}

export function AdminPlansPage() {
    const { plans, isLoading, createPlan, updatePlan, deletePlan } = useAdminPlans();
    const { toast, show, hide } = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<IPlan | null>(null);

    function openCreate() {
        setEditingPlan(null);
        setModalOpen(true);
    }

    function openEdit(plan: IPlan) {
        setEditingPlan(plan);
        setModalOpen(true);
    }

    async function handleSave(data: IPlanFormData) {
        try {
            if (editingPlan) {
                await updatePlan(editingPlan.id, data);
                show('Plan mis a jour avec succes', 'success');
            } else {
                await createPlan(data);
                show('Plan cree avec succes', 'success');
            }
        } catch (error) {
            show(error instanceof Error ? error.message : 'Une erreur est survenue', 'error');
        }
    }

    async function handleDelete(plan: IPlan) {
        if (!window.confirm(`Supprimer le plan "${plan.name}" ?`)) return;

        try {
            await deletePlan(plan.id);
            show('Plan supprime', 'success');
        } catch (error) {
            show(error instanceof Error ? error.message : 'Impossible de supprimer ce plan', 'error');
        }
    }

    return (
        <div className="flex-1 p-8 bg-cream min-h-screen">
            <PageHero
                eyebrow="Offres"
                title="Plans tarifaires"
                subtitle="Configuration des offres et tarifs"
                actions={
                    <button
                        onClick={openCreate}
                        className="h-[48px] px-6 rounded-2xl border-none bg-gradient-primary text-white font-black text-[14px]
                          flex items-center gap-2 cursor-pointer shadow-primary transition-transform
                          motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.97]"
                    >
                        <Plus size={18} aria-hidden /> Nouveau plan
                    </button>
                }
            />

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <Plus size={32} color="#F59E0B" />
                    </div>
                    <h2 className="text-[20px] font-black text-[#172E42] mb-2">Aucun plan configure</h2>
                    <p className="text-[14px] font-semibold text-[#5a7a99] mb-8 max-w-xs">
                        Creez votre premier plan tarifaire pour commencer a gerer les abonnements.
                    </p>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 h-11 px-6 rounded-[14px] border-none font-extrabold text-[14px] text-white cursor-pointer shadow-lg transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #D27A2D, #F59E0B)' }}
                    >
                        <Plus size={16} />
                        Creer un plan
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plans.map((plan, index) => {
                        const features = parseFeatures(plan.features);

                        return (
                            <div
                                key={plan.id}
                                className="bg-white rounded-[32px] shadow-soft border border-ink-100 overflow-hidden flex flex-col
                                  transition-transform duration-200 motion-safe:hover:-translate-y-1 motion-safe:animate-fade-in-up"
                                style={enterAt(120 + index * 90)}
                            >
                                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#172E42] text-white flex items-center justify-center">
                                            <CreditCard size={24} />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => openEdit(plan)}
                                                className="p-2 text-[#5a7a99] hover:bg-white rounded-xl transition-all"
                                                aria-label={`Modifier ${plan.name}`}
                                            >
                                                <Settings size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan)}
                                                className="p-2 text-[#EF4444] hover:bg-red-50 rounded-xl transition-all"
                                                aria-label={`Supprimer ${plan.name}`}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-[20px] font-black text-[#172E42] mb-1">{plan.name}</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-[32px] font-black text-[#D27A2D]">
                                            {formatPrice(plan.price, plan.currency, plan.intervalMonths)}
                                        </p>
                                        <span
                                            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                                            style={{
                                                background: plan.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                                color: plan.isActive ? '#10B981' : '#EF4444',
                                            }}
                                        >
                                            {plan.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>

                                    {plan.description && (
                                        <p className="mt-3 text-[13px] font-semibold text-[#5a7a99] line-clamp-2">{plan.description}</p>
                                    )}
                                </div>

                                <div className="p-8 flex-1">
                                    <p className="text-[13px] font-bold text-[#5a7a99] uppercase tracking-wider mb-4">Fonctionnalités</p>
                                    <ul className="space-y-3">
                                        {features.slice(0, 5).map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-3 text-[14px] font-semibold text-[#172E42]">
                                                <Check size={18} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                        {features.length > 5 && (
                                            <li className="text-[12px] font-bold text-[#5a7a99] pl-5">
                                                +{features.length - 5} autres...
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="p-8 mt-auto border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[12px] font-black text-[#5a7a99] flex items-center gap-1.5">
                                        <Users size={14} />
                                        {plan._count.subscriptions} abonné{plan._count.subscriptions !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <PlanModal
                isOpen={modalOpen}
                plan={editingPlan}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
            />

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onHide={hide}
            />
        </div>
    );
}