import { useState } from 'react';
import { Plus, Settings, Trash2, Check, Users } from 'lucide-react';
import { useAdminPlans } from '../hooks/useAdminMarketing';
import type { IPlan, IPlanFormData } from '../hooks/useAdminMarketing';
import { PlanModal } from '../components/admin/PlanModal';
import { Toast, useToast } from '../components/admin/Toast';

function parseFeatures(features: string[] | null | unknown): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try { return JSON.parse(features as string); } catch { return []; }
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
    } catch {
      show('Une erreur est survenue', 'error');
    }
  }

  async function handleDelete(plan: IPlan) {
    if (!window.confirm(`Supprimer le plan "${plan.name}" ?`)) return;
    try {
      await deletePlan(plan.id);
      show('Plan supprime', 'success');
    } catch {
      show('Impossible de supprimer ce plan', 'error');
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

  return (
    <div className="p-8 min-h-screen bg-[#F8F5F1]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#172E42]">Plans tarifaires</h1>
          <p className="text-[14px] font-semibold text-[#5a7a99] mt-1">
            {plans.length} plan{plans.length !== 1 ? 's' : ''} configure{plans.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-11 px-5 rounded-[14px] border-none font-extrabold text-[14px] text-white cursor-pointer shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #D27A2D, #F59E0B)' }}
        >
          <Plus size={18} />
          Nouveau plan
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(245,158,11,0.1)' }}>
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
      )}

      {/* Plans grid */}
      {!isLoading && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[17px] font-black text-[#172E42] truncate">{plan.name}</h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex-shrink-0"
                      style={{
                        background: plan.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                        color: plan.isActive ? '#10B981' : '#EF4444',
                      }}
                    >
                      {plan.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-[13px] font-semibold text-[#5a7a99] line-clamp-2">{plan.description}</p>
                  )}
                </div>
                <div className="flex gap-1.5 ml-3 flex-shrink-0">
                  <button
                    onClick={() => openEdit(plan)}
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Settings size={13} color="#172E42" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center border border-red-100 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} color="#EF4444" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4 p-3 rounded-[12px]" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <span className="text-[22px] font-black text-[#D27A2D]">
                  {formatPrice(plan.price, plan.currency, plan.intervalMonths)}
                </span>
              </div>

              {/* Features */}
              {parseFeatures(plan.features).length > 0 && (
                <ul className="flex flex-col gap-1.5 mb-4">
                  {parseFeatures(plan.features).slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={14} color="#10B981" className="flex-shrink-0" />
                      <span className="text-[13px] font-semibold text-[#172E42]">{f}</span>
                    </li>
                  ))}
                  {parseFeatures(plan.features).length > 5 && (
                    <li className="text-[12px] font-bold text-[#5a7a99] pl-5">
                      +{parseFeatures(plan.features).length - 5} autres...
                    </li>
                  )}
                </ul>
              )}

              {/* Subscribers count */}
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#5a7a99]">
                <Users size={14} />
                <span>{plan._count.subscriptions} abonne{plan._count.subscriptions !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PlanModal
        isOpen={modalOpen}
        plan={editingPlan}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onHide={hide}
      />
    </div>
  );
}
