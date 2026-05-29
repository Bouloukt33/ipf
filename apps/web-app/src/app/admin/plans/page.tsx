'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { plansAdminService } from '@/services/subscriptions.admin.service';
import { IAdminPlan } from '@/lib/subscription.types';
import { Toast, useToast } from '@/components/admin/Toast';
import { useAuthStore } from '@/store/auth.store';
import { Pencil } from 'lucide-react';

const BG_OVERLAY = { background: 'rgba(23,46,66,0.7)', backdropFilter: 'blur(8px)' };
const BORDER_ORANGE = { border: '2px solid rgba(210,122,45,0.18)' };
const BORDER_FOOTER = { borderTop: '1px solid rgba(210,122,45,0.12)' };

// ── Edit modal ─────────────────────────────────────────────────────────────────
function PlanEditModal({ plan, onClose, onSaved }: {
    plan: IAdminPlan; onClose: () => void; onSaved: (updated: IAdminPlan) => void;
}) {
    const [name, setName]         = useState(plan.name);
    const [description, setDesc]  = useState(plan.description ?? '');
    const [price, setPrice]       = useState(String(Number(plan.price)));
    const [features, setFeatures] = useState<string[]>(
        plan.features ? JSON.parse(plan.features) : []
    );
    const [isActive, setActive]   = useState(plan.isActive);
    const [saving, setSaving]     = useState(false);
    const [newFeature, setNewFeat] = useState('');

    const save = async () => {
        setSaving(true);
        try {
            const updated = await plansAdminService.update(plan.id, {
                name,
                description,
                price: parseFloat(price),
                features,
                isActive,
            });
            onSaved(updated);
            onClose();
        } catch { /* handled */ } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-8"
                style={{ animation: 'modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[20px] font-black text-[#172E42]">Modifier le plan <span className="text-[#D27A2D]">{plan.name}</span></h2>
                    <button onClick={onClose} className="w-9 h-9 rounded-full text-[#EF4444] border-none cursor-pointer font-bold flex items-center justify-center text-[18px]"
                        style={{ background: 'rgba(239,68,68,0.1)' }}>✕</button>
                </div>

                <div className="mb-4">
                    <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Nom</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-3.5 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none font-nunito" style={BORDER_ORANGE} />
                </div>

                <div className="mb-4">
                    <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Description</label>
                    <input value={description} onChange={(e) => setDesc(e.target.value)} className="w-full h-11 px-3.5 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none font-nunito" style={BORDER_ORANGE} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Prix mensuel (€)</label>
                        <input type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none font-nunito" style={BORDER_ORANGE} />
                    </div>
                    <div>
                        <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Actif</label>
                        <div className="h-11 flex items-center">
                            <button type="button" onClick={() => setActive(!isActive)}
                                className="relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none"
                                style={{ background: isActive ? '#D27A2D' : '#E5E7EB' }}>
                                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                    style={{ transform: isActive ? 'translateX(24px)' : 'translateX(0)' }} />
                            </button>
                            <span className="ml-2 text-[13px] font-bold text-[#5a7a99]">{isActive ? 'Oui' : 'Non'}</span>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                    <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-2">Features</label>
                    <div className="space-y-2 mb-3">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input value={f} onChange={(e) => setFeatures((prev) => prev.map((x, j) => j === i ? e.target.value : x))}
                                    className="flex-1 h-9 px-3 rounded-[9px] font-semibold text-[13px] text-[#172E42] bg-white outline-none font-nunito" style={BORDER_ORANGE} />
                                <button onClick={() => setFeatures((prev) => prev.filter((_, j) => j !== i))}
                                    className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#EF4444] bg-[rgba(239,68,68,0.08)] border-none cursor-pointer font-bold text-sm">×</button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newFeature} onChange={(e) => setNewFeat(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && newFeature.trim()) { setFeatures((p) => [...p, newFeature.trim()]); setNewFeat(''); } }}
                            placeholder="Nouvelle feature… (Entrée pour ajouter)"
                            className="flex-1 h-9 px-3 rounded-[9px] font-semibold text-[13px] text-[#172E42] bg-white outline-none font-nunito placeholder:text-[#5a7a99]" style={BORDER_ORANGE} />
                        <button onClick={() => { if (newFeature.trim()) { setFeatures((p) => [...p, newFeature.trim()]); setNewFeat(''); } }}
                            className="h-9 px-4 rounded-[9px] bg-[rgba(210,122,45,0.1)] text-[#D27A2D] font-extrabold text-[12px] border-none cursor-pointer">+ Ajouter</button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-5" style={BORDER_FOOTER}>
                    <button onClick={onClose} className="h-11 px-6 rounded-[12px] bg-white font-extrabold text-[14px] text-[#172E42] cursor-pointer font-nunito" style={BORDER_ORANGE}>Annuler</button>
                    <button onClick={save} disabled={saving}
                        className="h-11 px-7 rounded-[12px] border-none bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] font-extrabold text-[14px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement…</> : <>✓ Enregistrer</>}
                    </button>
                </div>
            </div>
            <style jsx>{`@keyframes modalPop { from { opacity:0; transform:scale(0.92) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
        </div>
    );
}

// ── Plan card ──────────────────────────────────────────────────────────────────
function PlanCard({ plan, onEdit }: { plan: IAdminPlan; onEdit: () => void }) {
    const features: string[] = plan.features ? JSON.parse(plan.features) : [];
    const price = Number(plan.price);

    return (
        <div className={`bg-white rounded-[20px] border-[1.5px] p-6 relative transition-all ${plan.isActive ? 'border-[rgba(210,122,45,0.2)]' : 'border-gray-200 opacity-60'}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[18px] font-black text-[#172E42]">{plan.name}</h3>
                        {!plan.isActive && <span className="text-[10px] font-extrabold text-[#6B7280] bg-[rgba(107,114,128,0.1)] px-2 py-0.5 rounded-full">Inactif</span>}
                    </div>
                    <p className="text-[13px] font-semibold text-[#5a7a99]">{plan.description}</p>
                </div>
                <button onClick={onEdit} className="w-9 h-9 rounded-[10px] bg-[rgba(30,58,95,0.08)] text-[#1e3a5f] hover:bg-[rgba(30,58,95,0.18)] flex items-center justify-center border-none cursor-pointer transition-all">
                    <Pencil size={15} strokeWidth={2.2} />
                </button>
            </div>

            <div className="mb-4">
                <span className="text-[32px] font-black text-[#D27A2D]">
                    {price === 0 ? 'Gratuit' : `${price} €`}
                </span>
                {price > 0 && <span className="text-[14px] font-semibold text-[#5a7a99] ml-1">/mois</span>}
            </div>

            <div className="space-y-2 mb-5">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-[#10B981] text-[14px]">✓</span>
                        <span className="text-[13px] font-semibold text-[#172E42]">{f}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[rgba(210,122,45,0.08)]">
                <span className="text-[12px] font-semibold text-[#5a7a99]">
                    {plan._count.subscriptions} abonné{plan._count.subscriptions !== 1 ? 's' : ''}
                </span>
                <span className="font-mono text-[11px] font-bold text-[#5a7a99] bg-[rgba(90,122,153,0.08)] px-2 py-0.5 rounded">{plan.slug}</span>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminPlansPage() {
    const [plans, setPlans]       = useState<IAdminPlan[]>([]);
    const [editing, setEditing]   = useState<IAdminPlan | null>(null);
    const [isLoading, setLoading] = useState(false);
    const { toast, show: showToast, hide: hideToast } = useToast();

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        setLoading(true);
        plansAdminService.getAll().then(setPlans).finally(() => setLoading(false));
    }, [authLoading, accessToken]);

    const handleSaved = useCallback((updated: IAdminPlan) => {
        setPlans((prev) => prev.map((p) => p.id === updated.id ? { ...updated, _count: p._count } : p));
        showToast('Plan mis à jour !', 'success');
    }, [showToast]);

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            <div className="mb-8">
                <h1 className="text-[24px] font-black text-[#172E42] mb-1">Plans tarifaires</h1>
                <p className="text-[14px] font-semibold text-[#5a7a99]">Configurez les prix et les fonctionnalités des plans</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((p) => <PlanCard key={p.id} plan={p} onEdit={() => setEditing(p)} />)}
                </div>
            )}

            {editing && (
                <PlanEditModal plan={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onHide={hideToast} />
        </div>
    );
}
