'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSubscriptions } from '@/hooks/useAdminSubscriptions';
import { emailAdminService, subscriptionsAdminService, plansAdminService } from '@/services/subscriptions.admin.service';
import { Toast, useToast } from '@/components/admin/Toast';
import {
    ISubscriptionUser, ISubscriptionFilters, IAdminPlan,
    PLAN_LABELS, PLAN_COLORS, STATUS_LABELS, STATUS_COLORS,
    PlanSlug, SubscriptionStatus,
} from '@/lib/subscription.types';
import { EmailTemplateId } from '@/lib/subscription.types';
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Eye, Mail, XCircle, RefreshCw } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null | undefined) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
}

const BG_OVERLAY = { background: 'rgba(23,46,66,0.7)', backdropFilter: 'blur(8px)' };
const BORDER_ORANGE = { border: '2px solid rgba(210,122,45,0.18)' };

// ── Email modal ────────────────────────────────────────────────────────────────
const TEMPLATES: { id: EmailTemplateId; label: string }[] = [
    { id: 'upsell',   label: '🚀 Upsell — plan Apprenti engagé' },
    { id: 'coaching', label: '💡 Coaching — faible précision' },
    { id: 'welcome',  label: '🎉 Bienvenue' },
    { id: 'reminder', label: '🔥 Rappel de série' },
];

function EmailModal({ userId, email, onClose, onSent }: {
    userId: string; email: string; onClose: () => void; onSent: () => void;
}) {
    const [templateId, setTemplateId] = useState<EmailTemplateId>('upsell');
    const [sending, setSending]       = useState(false);

    const send = async () => {
        setSending(true);
        try {
            await emailAdminService.sendToUser(userId, templateId);
            onSent();
            onClose();
        } catch { /* handled */ } finally { setSending(false); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[440px] max-w-[95vw] p-8">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-[18px] font-black text-[#172E42]">Envoyer un email</h2>
                    <button onClick={onClose} className="text-[#EF4444] font-bold text-lg border-none bg-transparent cursor-pointer">✕</button>
                </div>
                <p className="text-[13px] font-semibold text-[#5a7a99] mb-4">À : <span className="text-[#172E42] font-bold">{email}</span></p>
                <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-2">Template</label>
                <select value={templateId} onChange={(e) => setTemplateId(e.target.value as EmailTemplateId)}
                    className="w-full h-11 px-3 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none border-2 border-[rgba(210,122,45,0.18)] cursor-pointer mb-6">
                    {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="h-10 px-5 rounded-[10px] border-2 border-[rgba(210,122,45,0.2)] font-bold text-[13px] text-[#172E42] bg-white cursor-pointer">Annuler</button>
                    <button onClick={send} disabled={sending}
                        className="h-10 px-6 rounded-[10px] bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] border-none font-extrabold text-[13px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {sending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi…</> : <><Mail size={14} />Envoyer</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Cancel confirm modal ───────────────────────────────────────────────────────
function CancelModal({ user, onClose, onCancelled }: {
    user: ISubscriptionUser; onClose: () => void; onCancelled: (userId: string) => void;
}) {
    const [cancelling, setCancelling] = useState(false);
    const [error, setError]           = useState('');

    const confirm = async () => {
        setCancelling(true);
        setError('');
        try {
            await subscriptionsAdminService.cancel(user.subscription.id);
            onCancelled(user.id);
            onClose();
        } catch (e: any) {
            setError(e?.message ?? 'Erreur lors de l\'annulation');
            setCancelling(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[440px] max-w-[95vw] p-8">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-[18px] font-black text-[#172E42]">Annuler l'abonnement</h2>
                    <button onClick={onClose} className="text-[#EF4444] font-bold text-lg border-none bg-transparent cursor-pointer">✕</button>
                </div>
                <p className="text-[14px] font-semibold text-[#5a7a99] mb-2">
                    Annuler l'abonnement de <span className="font-black text-[#172E42]">{user.profile.displayName ?? user.email}</span> ?
                </p>
                <p className="text-[12px] font-semibold text-[#5a7a99] mb-5">
                    Cette action passe le statut à <strong>Résilié</strong> immédiatement (override admin, sans Stripe).
                </p>
                {error && <p className="mb-4 text-[13px] font-bold text-[#EF4444] bg-[rgba(239,68,68,0.08)] px-3 py-2 rounded-[8px]">{error}</p>}
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="h-10 px-5 rounded-[10px] font-bold text-[13px] text-[#172E42] bg-white cursor-pointer" style={BORDER_ORANGE}>Annuler</button>
                    <button onClick={confirm} disabled={cancelling}
                        className="h-10 px-6 rounded-[10px] border-none bg-[#EF4444] font-extrabold text-[13px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {cancelling ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Annulation…</> : <><XCircle size={14} />Confirmer</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Change plan modal ──────────────────────────────────────────────────────────
function ChangePlanModal({ user, onClose, onChanged }: {
    user: ISubscriptionUser; onClose: () => void; onChanged: (userId: string, planSlug: string, planName: string) => void;
}) {
    const [plans, setPlans]       = useState<IAdminPlan[]>([]);
    const [planId, setPlanId]     = useState('');
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');

    useEffect(() => {
        plansAdminService.getAll().then((data) => {
            const active = data.filter((p) => p.isActive);
            setPlans(active);
            const current = active.find((p) => p.slug === user.subscription.plan.slug);
            if (current) setPlanId(current.id);
        }).finally(() => setLoading(false));
    }, [user.subscription.plan.slug]);

    const save = async () => {
        if (!planId) return;
        setSaving(true);
        setError('');
        try {
            await subscriptionsAdminService.changePlan(user.subscription.id, planId);
            const selected = plans.find((p) => p.id === planId);
            onChanged(user.id, selected?.slug ?? '', selected?.name ?? '');
            onClose();
        } catch (e: any) {
            setError(e?.message ?? 'Erreur lors du changement de plan');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[440px] max-w-[95vw] p-8">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-[18px] font-black text-[#172E42]">Changer de plan</h2>
                    <button onClick={onClose} className="text-[#EF4444] font-bold text-lg border-none bg-transparent cursor-pointer">✕</button>
                </div>
                <p className="text-[13px] font-semibold text-[#5a7a99] mb-4">
                    Utilisateur : <span className="font-black text-[#172E42]">{user.profile.displayName ?? user.email}</span>
                </p>
                <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-2">Nouveau plan</label>
                {loading ? (
                    <div className="h-11 flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <select value={planId} onChange={(e) => setPlanId(e.target.value)}
                        className="w-full h-11 px-3 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none border-2 border-[rgba(210,122,45,0.18)] cursor-pointer mb-6">
                        {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name} — {Number(p.price) === 0 ? 'Gratuit' : `${Number(p.price)} €/mois`}
                            </option>
                        ))}
                    </select>
                )}
                {error && <p className="mb-4 text-[13px] font-bold text-[#EF4444] bg-[rgba(239,68,68,0.08)] px-3 py-2 rounded-[8px]">{error}</p>}
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="h-10 px-5 rounded-[10px] font-bold text-[13px] text-[#172E42] bg-white cursor-pointer" style={BORDER_ORANGE}>Annuler</button>
                    <button onClick={save} disabled={saving || loading}
                        className="h-10 px-6 rounded-[10px] bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] border-none font-extrabold text-[13px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement…</> : <><RefreshCw size={14} />Changer</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Row ────────────────────────────────────────────────────────────────────────
function SubscriptionRow({ user, isEven, onEmail, onCancel, onChangePlan }: {
    user: ISubscriptionUser; isEven: boolean;
    onEmail: (u: ISubscriptionUser) => void;
    onCancel: (u: ISubscriptionUser) => void;
    onChangePlan: (u: ISubscriptionUser) => void;
}) {
    const router = useRouter();
    const sub    = user.subscription;
    const plan   = sub.plan.slug as PlanSlug;
    const status = sub.status as SubscriptionStatus;
    const pc     = PLAN_COLORS[plan] ?? PLAN_COLORS.apprenti;
    const isCancelled = status === 'CANCELED';

    return (
        <tr className={`border-b border-[rgba(210,122,45,0.08)] transition-colors cursor-pointer hover:bg-[rgba(210,122,45,0.04)] ${isEven ? 'bg-white' : 'bg-[#fafaf9]'}`}
            onClick={() => router.push(`/admin/users/${user.id}`)}>

            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    {user.profile.avatarUrl
                        ? <img src={user.profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 rounded-full bg-[rgba(210,122,45,0.15)] flex items-center justify-center flex-shrink-0">
                            <span className="text-[12px] font-black text-[#D27A2D]">{(user.profile.displayName ?? user.email).charAt(0).toUpperCase()}</span>
                          </div>}
                    <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#172E42] truncate">{user.profile.displayName ?? '—'}</p>
                        <p className="text-[11px] font-semibold text-[#5a7a99] truncate">{user.email}</p>
                    </div>
                </div>
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-[12px] font-extrabold px-2.5 py-1 rounded-full ${pc.text} ${pc.bg}`}>
                    {PLAN_LABELS[plan] ?? sub.plan.name}
                </span>
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-[12px] font-extrabold px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}>
                    {STATUS_LABELS[status] ?? status}
                </span>
                {sub.cancelAtPeriodEnd && <span className="ml-1 text-[10px] font-bold text-[#EF4444]">résilie bientôt</span>}
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[13px] font-extrabold text-[#172E42]">
                    {sub.plan.price === 0 ? 'Gratuit' : `${sub.plan.price} €/mois`}
                </span>
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] font-semibold text-[#5a7a99]">{fmtDate(sub.currentPeriodStart)}</span>
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] font-semibold text-[#5a7a99]">{fmtDate(sub.currentPeriodEnd)}</span>
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[13px] font-bold text-[#172E42]">{user.usage.totalHours}h</span>
                <span className="text-[11px] font-semibold text-[#5a7a99] ml-1">({user.usage.sessionsPlayed} sessions)</span>
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[13px] font-bold text-[#172E42]">🔥 {user.profile.streakDays}j</span>
            </td>

            <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1.5">
                    <button onClick={() => router.push(`/admin/users/${user.id}`)} title="Voir profil"
                        className="w-[32px] h-[32px] rounded-[8px] bg-[rgba(30,58,95,0.08)] text-[#1e3a5f] hover:bg-[rgba(30,58,95,0.18)] flex items-center justify-center border-none cursor-pointer">
                        <Eye size={14} strokeWidth={2.2} />
                    </button>
                    <button onClick={() => onEmail(user)} title="Envoyer email"
                        className="w-[32px] h-[32px] rounded-[8px] bg-[rgba(210,122,45,0.08)] text-[#D27A2D] hover:bg-[rgba(210,122,45,0.18)] flex items-center justify-center border-none cursor-pointer">
                        <Mail size={14} strokeWidth={2.2} />
                    </button>
                    <button onClick={() => onChangePlan(user)} title="Changer de plan" disabled={isCancelled}
                        className="w-[32px] h-[32px] rounded-[8px] bg-[rgba(124,58,237,0.08)] text-[#7C3AED] hover:bg-[rgba(124,58,237,0.18)] flex items-center justify-center border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        <RefreshCw size={14} strokeWidth={2.2} />
                    </button>
                    <button onClick={() => onCancel(user)} title="Annuler l'abonnement" disabled={isCancelled}
                        className="w-[32px] h-[32px] rounded-[8px] bg-[rgba(239,68,68,0.08)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.18)] flex items-center justify-center border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        <XCircle size={14} strokeWidth={2.2} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
const COLS = ['Utilisateur', 'Plan', 'Statut', 'Prix', 'Début', 'Fin', 'Durée sessions', 'Streak', ''];

export default function AdminSubscriptionsPage() {
    const { users, setUsers, filters, isLoading, error, currentPage, totalPages, total, setPage, setFilters, resetFilters } = useAdminSubscriptions();
    const { toast, show: showToast, hide: hideToast } = useToast();
    const [emailTarget, setEmailTarget]       = useState<ISubscriptionUser | null>(null);
    const [cancelTarget, setCancelTarget]     = useState<ISubscriptionUser | null>(null);
    const [changePlanTarget, setChangePlanTarget] = useState<ISubscriptionUser | null>(null);

    const hasActive = filters.search || filters.planSlug || filters.status;

    const handleCancelled = useCallback((userId: string) => {
        setUsers((prev) => prev.map((u) =>
            u.id === userId
                ? { ...u, subscription: { ...u.subscription, status: 'CANCELED' as SubscriptionStatus, cancelAtPeriodEnd: false } }
                : u,
        ));
        showToast('Abonnement annulé', 'success');
    }, [setUsers, showToast]);

    const handlePlanChanged = useCallback((userId: string, planSlug: string, planName: string) => {
        setUsers((prev) => prev.map((u) =>
            u.id === userId
                ? { ...u, subscription: { ...u.subscription, plan: { ...u.subscription.plan, slug: planSlug as PlanSlug, name: planName } } }
                : u,
        ));
        showToast('Plan mis à jour', 'success');
    }, [setUsers, showToast]);

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            <div className="mb-6">
                <h1 className="text-[24px] font-black text-[#172E42] mb-1">Abonnements</h1>
                <p className="text-[14px] font-semibold text-[#5a7a99]">Gérez les abonnements et la durée d'utilisation</p>
            </div>

            {error && <div className="mb-5 px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[13px] font-bold text-[#EF4444] flex items-center gap-2"><span>⚠️</span>{error}</div>}

            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[220px] max-w-[360px]">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a7a99] pointer-events-none" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
                    <input type="text" value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} placeholder="Rechercher…"
                        className="w-full h-[42px] pl-10 pr-4 border-2 border-[rgba(210,122,45,0.18)] rounded-xl font-semibold text-sm text-[#172E42] bg-white outline-none focus:border-[#D27A2D] transition-colors placeholder:text-[#5a7a99] font-nunito" />
                </div>
                <select value={filters.planSlug} onChange={(e) => setFilters({ planSlug: e.target.value as any })}
                    className="h-[42px] px-3.5 border-2 border-[rgba(210,122,45,0.18)] rounded-xl font-bold text-[13px] text-[#172E42] bg-white cursor-pointer outline-none focus:border-[#D27A2D] font-nunito">
                    <option value="">Tous les plans</option>
                    <option value="apprenti">Apprenti</option>
                    <option value="compagnon">Compagnon</option>
                    <option value="reussite">Réussite</option>
                </select>
                <select value={filters.status} onChange={(e) => setFilters({ status: e.target.value as any })}
                    className="h-[42px] px-3.5 border-2 border-[rgba(210,122,45,0.18)] rounded-xl font-bold text-[13px] text-[#172E42] bg-white cursor-pointer outline-none focus:border-[#D27A2D] font-nunito">
                    <option value="">Tous les statuts</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="CANCELED">Résilié</option>
                    <option value="PAST_DUE">En retard</option>
                    <option value="TRIALING">Essai</option>
                </select>
                {hasActive && (
                    <button onClick={resetFilters} className="h-[42px] px-4 border-2 border-[rgba(210,122,45,0.18)] rounded-xl font-bold text-[13px] text-[#5a7a99] bg-white hover:border-[#D27A2D] hover:text-[#D27A2D] transition-all cursor-pointer flex items-center gap-2">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        Réinitialiser
                    </button>
                )}
            </div>

            {!isLoading && <p className="text-[12px] font-bold text-[#5a7a99] mb-3">{total} abonnement{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}</p>}

            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-3 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 text-[#5a7a99]">
                    <div className="text-5xl mb-3">💳</div>
                    <div className="text-base font-bold">Aucun abonnement trouvé</div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border-[1.5px] border-gray-200 overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>{COLS.map((c, i) => (
                                    <th key={i} className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-[#5a7a99] border-b-2 border-[rgba(210,122,45,0.15)] bg-[#fafaf9] whitespace-nowrap">{c}</th>
                                ))}</tr>
                            </thead>
                            <tbody>
                                {users.map((u, idx) => (
                                    <SubscriptionRow key={u.id} user={u} isEven={idx % 2 === 0}
                                        onEmail={setEmailTarget}
                                        onCancel={setCancelTarget}
                                        onChangePlan={setChangePlanTarget}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isLoading && totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem><PaginationPrevious onClick={() => setPage(currentPage - 1)} aria-disabled={currentPage === 1} className={currentPage === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'} /></PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <PaginationItem key={p}><PaginationLink onClick={() => setPage(p)} isActive={currentPage === p} className="cursor-pointer">{p}</PaginationLink></PaginationItem>
                            ))}
                            <PaginationItem><PaginationNext onClick={() => setPage(currentPage + 1)} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'} /></PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {emailTarget && <EmailModal userId={emailTarget.id} email={emailTarget.email} onClose={() => setEmailTarget(null)} onSent={() => showToast('Email envoyé !', 'success')} />}
            {cancelTarget && <CancelModal user={cancelTarget} onClose={() => setCancelTarget(null)} onCancelled={handleCancelled} />}
            {changePlanTarget && <ChangePlanModal user={changePlanTarget} onClose={() => setChangePlanTarget(null)} onChanged={handlePlanChanged} />}

            <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onHide={hideToast} />
        </div>
    );
}
