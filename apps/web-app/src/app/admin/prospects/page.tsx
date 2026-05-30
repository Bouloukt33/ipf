'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptionsAdminService, emailAdminService } from '@/services/subscriptions.admin.service';
import { IProspect, EmailTemplateId } from '@/lib/subscription.types';
import { Toast, useToast } from '@/components/admin/Toast';
import { useAuthStore } from '@/store/auth.store';
import { Eye, Mail, Send } from 'lucide-react';

const BG_OVERLAY = { background: 'rgba(23,46,66,0.7)', backdropFilter: 'blur(8px)' };

// ── Bulk send modal ────────────────────────────────────────────────────────────
function BulkSendModal({ segment, count, onClose, onSent }: {
    segment: 'upsell' | 'coaching'; count: number; onClose: () => void; onSent: (n: number) => void;
}) {
    const tplId: EmailTemplateId = segment === 'upsell' ? 'upsell' : 'coaching';
    const [sending, setSending] = useState(false);

    const send = async () => {
        setSending(true);
        try {
            const r = await emailAdminService.sendToSegment(segment, tplId);
            onSent(r.sent ?? r.total);
            onClose();
        } catch { /* handled */ } finally { setSending(false); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[420px] max-w-[95vw] p-8">
                <h2 className="text-[18px] font-black text-[#172E42] mb-3">Envoyer à tout le segment</h2>
                <p className="text-[13px] font-semibold text-[#5a7a99] mb-6">
                    Tu t'apprêtes à envoyer le template <strong className="text-[#172E42]">{segment === 'upsell' ? '🚀 Upsell' : '💡 Coaching'}</strong> à <strong className="text-[#172E42]">{count} utilisateur{count !== 1 ? 's' : ''}</strong>.
                </p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="h-10 px-5 rounded-[10px] border-2 border-[rgba(210,122,45,0.2)] font-bold text-[13px] text-[#172E42] bg-white cursor-pointer">Annuler</button>
                    <button onClick={send} disabled={sending}
                        className="h-10 px-6 rounded-[10px] bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] border-none font-extrabold text-[13px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {sending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi…</> : <><Send size={14} />Envoyer {count} emails</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Prospect row ───────────────────────────────────────────────────────────────
function ProspectRow({ p, isEven, segment, onEmail }: {
    p: IProspect; isEven: boolean; segment: 'upsell' | 'coaching'; onEmail: (p: IProspect) => void;
}) {
    const router = useRouter();
    return (
        <tr className={`border-b border-[rgba(210,122,45,0.08)] hover:bg-[rgba(210,122,45,0.04)] cursor-pointer transition-colors ${isEven ? 'bg-white' : 'bg-[#fafaf9]'}`}
            onClick={() => router.push(`/admin/users/${p.id}`)}>

            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    {p.avatarUrl
                        ? <img src={p.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 rounded-full bg-[rgba(210,122,45,0.15)] flex items-center justify-center flex-shrink-0">
                            <span className="text-[12px] font-black text-[#D27A2D]">{(p.displayName ?? p.email).charAt(0).toUpperCase()}</span>
                          </div>}
                    <div>
                        <p className="text-[13px] font-bold text-[#172E42]">{p.displayName ?? '—'}</p>
                        <p className="text-[11px] font-semibold text-[#5a7a99]">{p.email}</p>
                    </div>
                </div>
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-2.5 py-1 rounded-full">{p.planName}</span>
            </td>

            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-bold text-[#172E42]">🔥 {p.streakDays}j</td>
            <td className="px-4 py-3 whitespace-nowrap text-[13px] font-bold text-[#172E42]">{p.sessions}</td>
            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-[13px] font-extrabold ${p.accuracy >= 70 ? 'text-[#10B981]' : p.accuracy >= 50 ? 'text-[#D27A2D]' : 'text-[#EF4444]'}`}>
                    {p.accuracy}%
                </span>
            </td>

            {segment === 'upsell' && (
                <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, Math.round((p.engagementScore ?? 0) / 10)))].map((_, i) => (
                            <span key={i} className="text-[#D27A2D] text-xs">●</span>
                        ))}
                    </div>
                </td>
            )}

            <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                    <button onClick={() => router.push(`/admin/users/${p.id}`)}
                        className="w-[32px] h-[32px] rounded-[8px] bg-[rgba(30,58,95,0.08)] text-[#1e3a5f] hover:bg-[rgba(30,58,95,0.18)] flex items-center justify-center border-none cursor-pointer">
                        <Eye size={14} strokeWidth={2.2} />
                    </button>
                    <button onClick={() => onEmail(p)}
                        className="w-[32px] h-[32px] rounded-[8px] bg-[rgba(210,122,45,0.08)] text-[#D27A2D] hover:bg-[rgba(210,122,45,0.18)] flex items-center justify-center border-none cursor-pointer">
                        <Mail size={14} strokeWidth={2.2} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function ProspectTable({ title, desc, color, prospects, segment, onBulkSend, onEmail }: {
    title: string; desc: string; color: string;
    prospects: IProspect[]; segment: 'upsell' | 'coaching';
    onBulkSend: () => void; onEmail: (p: IProspect) => void;
}) {
    const cols = segment === 'upsell'
        ? ['Utilisateur', 'Plan', 'Streak', 'Sessions', 'Réussite', 'Engagement', '']
        : ['Utilisateur', 'Plan', 'Streak', 'Sessions', 'Réussite', ''];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-[18px] font-black text-[#172E42]">{title}</h2>
                    <p className="text-[13px] font-semibold text-[#5a7a99]">{desc}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-[13px] font-extrabold px-3 py-1.5 rounded-full ${color}`}>{prospects.length} utilisateur{prospects.length !== 1 ? 's' : ''}</span>
                    {prospects.length > 0 && (
                        <button onClick={onBulkSend}
                            className="h-[38px] px-4 rounded-[10px] border-none bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] font-extrabold text-[12px] text-white cursor-pointer flex items-center gap-2">
                            <Send size={13} />Envoyer à tous
                        </button>
                    )}
                </div>
            </div>

            {prospects.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-10 text-[#5a7a99]">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="text-sm font-semibold">Aucun utilisateur dans ce segment</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border-[1.5px] border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead><tr>{cols.map((c, i) => (
                                <th key={i} className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-[#5a7a99] border-b-2 border-[rgba(210,122,45,0.15)] bg-[#fafaf9] whitespace-nowrap">{c}</th>
                            ))}</tr></thead>
                            <tbody>{prospects.map((p, idx) => (
                                <ProspectRow key={p.id} p={p} isEven={idx % 2 === 0} segment={segment} onEmail={onEmail} />
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminProspectsPage() {
    const [upsell,   setUpsell]   = useState<IProspect[]>([]);
    const [coaching, setCoaching] = useState<IProspect[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const [bulkSegment, setBulkSegment] = useState<'upsell' | 'coaching' | null>(null);
    const [emailTarget, setEmailTarget] = useState<IProspect | null>(null);
    const { toast, show: showToast, hide: hideToast } = useToast();

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        setLoading(true);
        subscriptionsAdminService.getProspects()
            .then((d) => { setUpsell(d.upsell); setCoaching(d.coaching); })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [authLoading, accessToken]);

    const handleEmailSent = useCallback((n: number) => {
        showToast(`${n} email${n !== 1 ? 's' : ''} envoyé${n !== 1 ? 's' : ''} !`, 'success');
    }, [showToast]);

    const handleSingleSent = useCallback(() => {
        showToast('Email envoyé !', 'success');
        setEmailTarget(null);
    }, [showToast]);

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            <div className="mb-8">
                <h1 className="text-[24px] font-black text-[#172E42] mb-1">Prospects</h1>
                <p className="text-[14px] font-semibold text-[#5a7a99]">Identifiez les cibles d'upsell et les utilisateurs à coacher</p>
            </div>

            {error && <div className="mb-5 px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[13px] font-bold text-[#EF4444]"><span>⚠️</span> {error}</div>}

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    <ProspectTable
                        title="🚀 Cibles upsell"
                        desc="Utilisateurs Apprenti très engagés — streak > 5j ou > 8 sessions"
                        color="text-[#10B981] bg-[rgba(16,185,129,0.1)]"
                        prospects={upsell}
                        segment="upsell"
                        onBulkSend={() => setBulkSegment('upsell')}
                        onEmail={(p) => setEmailTarget(p)}
                    />

                    <ProspectTable
                        title="💡 Cibles coaching"
                        desc="Abonnés Compagnon/Réussite avec taux de réussite < 55%"
                        color="text-[#D27A2D] bg-[rgba(210,122,45,0.1)]"
                        prospects={coaching}
                        segment="coaching"
                        onBulkSend={() => setBulkSegment('coaching')}
                        onEmail={(p) => setEmailTarget(p)}
                    />
                </>
            )}

            {bulkSegment && (
                <BulkSendModal
                    segment={bulkSegment}
                    count={bulkSegment === 'upsell' ? upsell.length : coaching.length}
                    onClose={() => setBulkSegment(null)}
                    onSent={handleEmailSent}
                />
            )}

            {emailTarget && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
                    onClick={(e) => { if (e.target === e.currentTarget) setEmailTarget(null); }}>
                    <div className="bg-white rounded-[22px] w-[440px] max-w-[95vw] p-8">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-[18px] font-black text-[#172E42]">Envoyer un email</h2>
                            <button onClick={() => setEmailTarget(null)} className="text-[#EF4444] font-bold border-none bg-transparent cursor-pointer text-lg">✕</button>
                        </div>
                        <p className="text-[13px] font-semibold text-[#5a7a99] mb-6">À : <strong className="text-[#172E42]">{emailTarget.email}</strong></p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setEmailTarget(null)} className="h-10 px-5 rounded-[10px] border-2 border-[rgba(210,122,45,0.2)] font-bold text-[13px] text-[#172E42] bg-white cursor-pointer">Annuler</button>
                            <button onClick={async () => {
                                const tpl: EmailTemplateId = upsell.some((u) => u.id === emailTarget.id) ? 'upsell' : 'coaching';
                                await emailAdminService.sendToUser(emailTarget.id, tpl);
                                handleSingleSent();
                            }} className="h-10 px-6 rounded-[10px] bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] border-none font-extrabold text-[13px] text-white cursor-pointer flex items-center gap-2">
                                <Mail size={14} />Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onHide={hideToast} />
        </div>
    );
}
