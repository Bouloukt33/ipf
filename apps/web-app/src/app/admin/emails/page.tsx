'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { emailAdminService, subscriptionsAdminService } from '@/services/subscriptions.admin.service';
import { IEmailTemplate, IEmailTemplatePreview, EmailTemplateId, IProspect } from '@/lib/subscription.types';
import { Toast, useToast } from '@/components/admin/Toast';
import { useAuthStore } from '@/store/auth.store';
import { Mail, Send, Eye } from 'lucide-react';

const BG_OVERLAY  = { background: 'rgba(23,46,66,0.7)', backdropFilter: 'blur(8px)' };
const TEMPLATE_SEGMENTS: Record<EmailTemplateId, { segment?: 'upsell' | 'coaching'; label: string; color: string }> = {
    upsell:   { segment: 'upsell',   label: '🚀 Segment Upsell',   color: 'text-[#10B981] bg-[rgba(16,185,129,0.1)]' },
    coaching: { segment: 'coaching', label: '💡 Segment Coaching',  color: 'text-[#D27A2D] bg-[rgba(210,122,45,0.1)]' },
    welcome:  { label: 'Tous les nouveaux',   color: 'text-[#7C3AED] bg-[rgba(124,58,237,0.1)]' },
    reminder: { label: 'Utilisateurs inactifs', color: 'text-[#1CB0F6] bg-[rgba(28,176,246,0.1)]' },
};

// ── Preview modal ──────────────────────────────────────────────────────────────
function PreviewModal({ template, onClose, onSend }: {
    template: IEmailTemplatePreview; onClose: () => void;
    onSend: (segment?: 'upsell' | 'coaching') => void;
}) {
    const seg = TEMPLATE_SEGMENTS[template.id];
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[720px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-[rgba(210,122,45,0.1)]">
                    <div>
                        <h2 className="text-[18px] font-black text-[#172E42]">{template.name}</h2>
                        <p className="text-[12px] font-semibold text-[#5a7a99]">Objet : <strong className="text-[#172E42]">{template.subject}</strong></p>
                    </div>
                    <button onClick={onClose} className="text-[#EF4444] font-bold border-none bg-transparent cursor-pointer text-lg">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <iframe srcDoc={template.html} className="w-full h-[420px] border-0 rounded-[10px]" />
                </div>
                <div className="flex items-center justify-between p-6 border-t border-[rgba(210,122,45,0.1)]">
                    {seg?.segment && (
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${seg.color}`}>{seg.label}</span>
                        </div>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <button onClick={onClose} className="h-10 px-5 rounded-[10px] border-2 border-[rgba(210,122,45,0.2)] font-bold text-[13px] text-[#172E42] bg-white cursor-pointer">Fermer</button>
                        {seg?.segment && (
                            <button onClick={() => onSend(seg.segment)}
                                className="h-10 px-6 rounded-[10px] bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] border-none font-extrabold text-[13px] text-white cursor-pointer flex items-center gap-2">
                                <Send size={14} />Envoyer au segment
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Confirm bulk send ──────────────────────────────────────────────────────────
function ConfirmSendModal({ template, segment, count, onClose, onConfirm }: {
    template: IEmailTemplate; segment: 'upsell' | 'coaching'; count: number;
    onClose: () => void; onConfirm: () => void;
}) {
    const [sending, setSending] = useState(false);
    const go = async () => { setSending(true); try { onConfirm(); onClose(); } finally { setSending(false); } };
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[400px] max-w-[95vw] p-8">
                <h2 className="text-[18px] font-black text-[#172E42] mb-3">Confirmer l'envoi</h2>
                <p className="text-[13px] font-semibold text-[#5a7a99] mb-6">
                    Envoyer <strong className="text-[#172E42]">"{template.subject}"</strong> à <strong className="text-[#172E42]">{count} utilisateur{count !== 1 ? 's' : ''}</strong> du segment <strong className="text-[#D27A2D]">{segment}</strong> ?
                </p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="h-10 px-5 rounded-[10px] border-2 border-[rgba(210,122,45,0.2)] font-bold text-[13px] text-[#172E42] bg-white cursor-pointer">Annuler</button>
                    <button onClick={go} disabled={sending}
                        className="h-10 px-6 rounded-[10px] bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] border-none font-extrabold text-[13px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {sending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi…</> : <><Send size={14} />Confirmer</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Template card ──────────────────────────────────────────────────────────────
function TemplateCard({ tpl, onPreview, onSend }: {
    tpl: IEmailTemplate; onPreview: () => void; onSend?: () => void;
}) {
    const meta = TEMPLATE_SEGMENTS[tpl.id];
    return (
        <div className="bg-white rounded-[18px] border border-[rgba(210,122,45,0.12)] p-6">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-[15px] font-extrabold text-[#172E42] mb-0.5">{tpl.name}</h3>
                    <p className="text-[12px] font-semibold text-[#5a7a99]">Objet : {tpl.subject}</p>
                </div>
                {meta && <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full ${meta.color}`}>{meta.label}</span>}
            </div>
            <p className="text-[12px] font-semibold text-[#5a7a99] mb-5">{tpl.description}</p>
            <div className="flex gap-2">
                <button onClick={onPreview}
                    className="flex-1 h-9 rounded-[9px] border-2 border-[rgba(210,122,45,0.18)] font-bold text-[12px] text-[#172E42] bg-white hover:border-[#D27A2D] transition-all cursor-pointer flex items-center justify-center gap-1.5">
                    <Eye size={13} strokeWidth={2.2} />Prévisualiser
                </button>
                {onSend && (
                    <button onClick={onSend}
                        className="flex-1 h-9 rounded-[9px] bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] border-none font-extrabold text-[12px] text-white cursor-pointer flex items-center justify-center gap-1.5">
                        <Send size={13} />Envoyer
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminEmailsPage() {
    const [templates, setTemplates]   = useState<IEmailTemplate[]>([]);
    const [preview,   setPreview]     = useState<IEmailTemplatePreview | null>(null);
    const [confirm,   setConfirm]     = useState<{ tpl: IEmailTemplate; segment: 'upsell' | 'coaching'; count: number } | null>(null);
    const [counts,    setCounts]      = useState<{ upsell: number; coaching: number }>({ upsell: 0, coaching: 0 });
    const [isLoading, setLoading]     = useState(false);
    const { toast, show: showToast, hide: hideToast } = useToast();

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        setLoading(true);
        Promise.all([
            emailAdminService.getTemplates(),
            subscriptionsAdminService.getProspects(),
        ]).then(([tpls, prospects]) => {
            setTemplates(tpls);
            setCounts({ upsell: prospects.upsell.length, coaching: prospects.coaching.length });
        }).finally(() => setLoading(false));
    }, [authLoading, accessToken]);

    const openPreview = useCallback(async (id: EmailTemplateId) => {
        const p = await emailAdminService.preview(id);
        setPreview(p);
    }, []);

    const handleSendFromPreview = useCallback(async (segment?: 'upsell' | 'coaching') => {
        if (!preview || !segment) return;
        const tpl = templates.find((t) => t.id === preview.id);
        if (!tpl) return;
        setPreview(null);
        setConfirm({ tpl, segment, count: counts[segment] });
    }, [preview, templates, counts]);

    const handleConfirmed = useCallback(async () => {
        if (!confirm) return;
        try {
            const r = await emailAdminService.sendToSegment(confirm.segment, confirm.tpl.id as EmailTemplateId);
            showToast(`${r.sent ?? r.total} email${(r.sent ?? r.total) !== 1 ? 's' : ''} envoyé${(r.sent ?? r.total) !== 1 ? 's' : ''} !`, 'success');
        } catch (e: any) {
            showToast(e.message ?? 'Erreur', 'error');
        }
    }, [confirm, showToast]);

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            <div className="mb-8">
                <h1 className="text-[24px] font-black text-[#172E42] mb-1">Bibliothèque d'emails</h1>
                <p className="text-[14px] font-semibold text-[#5a7a99]">Prévisualisez et envoyez des emails aux segments d'utilisateurs</p>
            </div>

            {/* Segments info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-[16px] border border-[rgba(210,122,45,0.12)] p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[11px] bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-xl">🚀</div>
                    <div>
                        <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99]">Segment Upsell</p>
                        <p className="text-[22px] font-black text-[#172E42]">{counts.upsell} <span className="text-[14px] font-semibold text-[#5a7a99]">utilisateurs</span></p>
                        <p className="text-[11px] font-semibold text-[#5a7a99]">Apprenti très engagés</p>
                    </div>
                </div>
                <div className="bg-white rounded-[16px] border border-[rgba(210,122,45,0.12)] p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[11px] bg-[rgba(210,122,45,0.1)] flex items-center justify-center text-xl">💡</div>
                    <div>
                        <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99]">Segment Coaching</p>
                        <p className="text-[22px] font-black text-[#172E42]">{counts.coaching} <span className="text-[14px] font-semibold text-[#5a7a99]">utilisateurs</span></p>
                        <p className="text-[11px] font-semibold text-[#5a7a99]">Précision &lt; 55%</p>
                    </div>
                </div>
            </div>

            {/* Config SMTP warning */}
            <div className="mb-6 px-4 py-3 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-xl text-[13px] font-semibold text-[#D27A2D] flex items-center gap-2">
                <span>⚙️</span>
                <span>Pour envoyer de vrais emails, configurez <strong>MAILER_HOST</strong>, <strong>MAILER_USER</strong> et <strong>MAILER_PASS</strong> dans le fichier <code>.env</code> de l'API. Sans config, les envois sont loggés en console.</span>
            </div>

            {/* Templates grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-5">
                    {templates.map((tpl) => {
                        const meta = TEMPLATE_SEGMENTS[tpl.id];
                        return (
                            <TemplateCard
                                key={tpl.id}
                                tpl={tpl}
                                onPreview={() => openPreview(tpl.id as EmailTemplateId)}
                                onSend={meta?.segment ? () => {
                                    setConfirm({ tpl, segment: meta.segment!, count: counts[meta.segment!] });
                                } : undefined}
                            />
                        );
                    })}
                </div>
            )}

            {preview && <PreviewModal template={preview} onClose={() => setPreview(null)} onSend={handleSendFromPreview} />}
            {confirm && <ConfirmSendModal template={confirm.tpl} segment={confirm.segment} count={confirm.count} onClose={() => setConfirm(null)} onConfirm={handleConfirmed} />}

            <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onHide={hideToast} />
        </div>
    );
}
