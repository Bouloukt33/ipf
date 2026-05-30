'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserAnalyticsDetail } from '@/hooks/useUserAnalyticsDetail';
import { AGE_RANGE_LABELS, PRO_STATUS_LABELS } from '@/lib/user.analytics.types';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { ActivityAreaChart } from '@/components/admin/charts/ActivityAreaChart';
import { CategoryHBarChart } from '@/components/admin/charts/CategoryHBarChart';
import { analyticsService } from '@/services/analytics.service';
import { Toast, useToast } from '@/components/admin/Toast';

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDuration(ms: number | null | undefined): string {
    if (!ms) return '—';
    const s = Math.round(ms / 1000);
    if (s < 60)   return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}min ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}min`;
}
function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}
function fmtDateShort(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

const BG_OVERLAY    = { background: 'rgba(23,46,66,0.7)', backdropFilter: 'blur(8px)' };
const BORDER_ORANGE = { border: '2px solid rgba(210,122,45,0.18)' };

// ── Sub-components ─────────────────────────────────────────────────────────────
function Card({ title, children, className = '', action }: {
    title: string; children: React.ReactNode; className?: string; action?: React.ReactNode;
}) {
    return (
        <div className={`bg-white rounded-[18px] border border-[rgba(210,122,45,0.12)] p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#5a7a99]">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function KpiRow({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-[rgba(210,122,45,0.07)] last:border-0">
            <span className="text-[13px] font-semibold text-[#5a7a99]">{label}</span>
            <div className="text-right">
                <span className="text-[14px] font-extrabold text-[#172E42]">{value}</span>
                {sub && <p className="text-[11px] font-semibold text-[#5a7a99]">{sub}</p>}
            </div>
        </div>
    );
}

// ── Edit profile modal ─────────────────────────────────────────────────────────
const AGE_OPTIONS = [
    { value: 'AGE_18_25', label: '18–25 ans' },
    { value: 'AGE_26_35', label: '26–35 ans' },
    { value: 'AGE_36_45', label: '36–45 ans' },
    { value: 'AGE_46_55', label: '46–55 ans' },
    { value: 'AGE_56_PLUS', label: '56 ans et +' },
];
const PRO_OPTIONS = [
    { value: 'SALARIE',     label: 'Salarié' },
    { value: 'INDEPENDANT', label: 'Indépendant' },
    { value: 'MANDATAIRE',  label: 'Mandataire' },
];

function EditProfileModal({ userId, profile, onClose, onSaved }: {
    userId: string;
    profile: { displayName: string | null; ageRange: string | null; professionalStatus: string | null };
    onClose: () => void;
    onSaved: (updated: { displayName: string | null; ageRange: string | null; professionalStatus: string | null }) => void;
}) {
    const [displayName, setName]   = useState(profile.displayName ?? '');
    const [ageRange, setAge]       = useState(profile.ageRange ?? '');
    const [proStatus, setPro]      = useState(profile.professionalStatus ?? '');
    const [saving, setSaving]      = useState(false);
    const [error, setError]        = useState('');

    const save = async () => {
        setSaving(true);
        setError('');
        try {
            await analyticsService.updateUserProfile(userId, {
                displayName:        displayName || undefined,
                ageRange:           ageRange     || undefined,
                professionalStatus: proStatus    || undefined,
            });
            onSaved({
                displayName:        displayName || null,
                ageRange:           ageRange    || null,
                professionalStatus: proStatus   || null,
            });
            onClose();
        } catch (e: any) {
            setError(e?.message ?? 'Erreur lors de la mise à jour');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[480px] max-w-[95vw] p-8"
                style={{ animation: 'modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[20px] font-black text-[#172E42]">Modifier le <span className="text-[#D27A2D]">profil</span></h2>
                    <button onClick={onClose} className="w-9 h-9 rounded-full text-[#EF4444] border-none cursor-pointer font-bold flex items-center justify-center text-[18px]"
                        style={{ background: 'rgba(239,68,68,0.1)' }}>✕</button>
                </div>

                {error && <p className="mb-4 text-[13px] font-bold text-[#EF4444] bg-[rgba(239,68,68,0.08)] px-3 py-2 rounded-[8px]">{error}</p>}

                <div className="mb-4">
                    <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Nom affiché</label>
                    <input value={displayName} onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none font-nunito" style={BORDER_ORANGE} />
                </div>

                <div className="mb-4">
                    <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Tranche d'âge</label>
                    <select value={ageRange} onChange={(e) => setAge(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none cursor-pointer font-nunito" style={BORDER_ORANGE}>
                        <option value="">— Non renseigné —</option>
                        {AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Statut professionnel</label>
                    <select value={proStatus} onChange={(e) => setPro(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none cursor-pointer font-nunito" style={BORDER_ORANGE}>
                        <option value="">— Non renseigné —</option>
                        {PRO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-5" style={{ borderTop: '1px solid rgba(210,122,45,0.12)' }}>
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

// ── Delete confirm modal ───────────────────────────────────────────────────────
function DeleteUserModal({ userId, displayName, email, onClose, onDeleted }: {
    userId: string; displayName: string | null; email: string;
    onClose: () => void; onDeleted: () => void;
}) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError]       = useState('');

    const confirm = async () => {
        setDeleting(true);
        setError('');
        try {
            await analyticsService.deleteUser(userId);
            onDeleted();
        } catch (e: any) {
            setError(e?.message ?? 'Erreur lors de la suppression');
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[460px] max-w-[95vw] p-8"
                style={{ animation: 'modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-[18px] font-black text-[#172E42]">Supprimer l'utilisateur</h2>
                    <button onClick={onClose} className="text-[#EF4444] font-bold text-lg border-none bg-transparent cursor-pointer">✕</button>
                </div>
                <p className="text-[14px] font-semibold text-[#5a7a99] mb-2">
                    Supprimer <span className="font-black text-[#172E42]">{displayName ?? email}</span> définitivement ?
                </p>
                <p className="text-[12px] font-semibold text-[#5a7a99] mb-5">
                    Toutes les données associées (profil, sessions, abonnement, badges) seront effacées. Cette action est <strong>irréversible</strong>.
                </p>
                {error && <p className="mb-4 text-[13px] font-bold text-[#EF4444] bg-[rgba(239,68,68,0.08)] px-3 py-2 rounded-[8px]">{error}</p>}
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="h-10 px-5 rounded-[10px] font-bold text-[13px] text-[#172E42] bg-white cursor-pointer" style={BORDER_ORANGE}>Annuler</button>
                    <button onClick={confirm} disabled={deleting}
                        className="h-10 px-6 rounded-[10px] border-none bg-[#EF4444] font-extrabold text-[13px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {deleting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Suppression…</> : <><Trash2 size={14} />Supprimer définitivement</>}
                    </button>
                </div>
            </div>
            <style jsx>{`@keyframes modalPop { from { opacity:0; transform:scale(0.92) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminUserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router  = useRouter();
    const { user, setUser, isLoading, error } = useUserAnalyticsDetail(id);
    const { toast, show: showToast, hide: hideToast } = useToast();

    const [editingProfile, setEditingProfile] = useState(false);
    const [deletingUser, setDeletingUser]     = useState(false);

    if (isLoading) {
        return (
            <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-bold text-[#5a7a99]">Chargement du profil…</span>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#EF4444] font-bold mb-3">{error ?? 'Utilisateur introuvable'}</p>
                    <button onClick={() => router.back()} className="text-[#D27A2D] font-bold text-sm underline">Retour</button>
                </div>
            </div>
        );
    }

    const p = user.profile;
    const s = user.stats;
    const r = user.ranking;

    const today = new Date();
    const calMap = new Map(user.activityCalendar.map((d) => [d.date, d.count]));
    const calDays = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        const key = d.toISOString().slice(0, 10);
        return { date: key, count: calMap.get(key) ?? 0 };
    });

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            {/* Back + Header */}
            <div className="mb-6">
                <button onClick={() => router.back()}
                    className="flex items-center gap-2 text-[13px] font-bold text-[#5a7a99] hover:text-[#D27A2D] transition-colors mb-4 cursor-pointer border-none bg-transparent">
                    <ArrowLeft size={16} strokeWidth={2.5} />
                    Retour à la liste
                </button>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {p.avatarUrl ? (
                            <img src={p.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[rgba(210,122,45,0.2)]" />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-[rgba(210,122,45,0.15)] flex items-center justify-center border-2 border-[rgba(210,122,45,0.2)]">
                                <span className="text-[22px] font-black text-[#D27A2D]">
                                    {(p.displayName ?? user.email).charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div>
                            <h1 className="text-[24px] font-black text-[#172E42]">{p.displayName ?? '—'}</h1>
                            <p className="text-[13px] font-semibold text-[#5a7a99]">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                                    user.isActive ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)]' : 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]'
                                }`}>{user.isActive ? 'Actif' : 'Inactif'}</span>
                                <span className="text-[11px] font-extrabold text-[#7C3AED] bg-[rgba(124,58,237,0.1)] px-2 py-0.5 rounded-full">{user.role}</span>
                                <span className="text-[11px] font-semibold text-[#5a7a99]">Inscrit le {fmtDate(user.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Header actions */}
                    <div className="flex gap-2">
                        <button onClick={() => setDeletingUser(true)} title="Supprimer l'utilisateur"
                            className="h-10 px-4 rounded-[10px] bg-[rgba(239,68,68,0.08)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.18)] font-extrabold text-[13px] border-none cursor-pointer flex items-center gap-2 transition-all">
                            <Trash2 size={15} strokeWidth={2.2} />Supprimer
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid 2×2 */}
            <div className="grid grid-cols-2 gap-5 mb-5">
                {/* Profil */}
                <Card title="Profil" action={
                    <button onClick={() => setEditingProfile(true)}
                        className="w-8 h-8 rounded-[8px] bg-[rgba(30,58,95,0.08)] text-[#1e3a5f] hover:bg-[rgba(30,58,95,0.18)] flex items-center justify-center border-none cursor-pointer transition-all">
                        <Pencil size={13} strokeWidth={2.2} />
                    </button>
                }>
                    <KpiRow label="Nom affiché"      value={p.displayName ?? '—'} />
                    <KpiRow label="Tranche d'âge"    value={p.ageRange           ? AGE_RANGE_LABELS[p.ageRange]           : '—'} />
                    <KpiRow label="Statut pro"        value={p.professionalStatus ? PRO_STATUS_LABELS[p.professionalStatus] : '—'} />
                    <KpiRow label="Métier"            value={p.jobProfile?.name   ?? '—'} />
                    <KpiRow label="Secteur"           value={p.jobProfile?.sector?.name ?? '—'} />
                    <KpiRow label="Dernière activité" value={fmtDate(p.lastPlayedAt)} />
                </Card>

                {/* Performance */}
                <Card title="Performance">
                    <KpiRow label="XP total"         value={<span className="text-[#D27A2D]">{p.xpTotal.toLocaleString('fr-FR')} XP</span>} />
                    <KpiRow label="Niveau"           value={`Niv. ${p.level}`} />
                    <KpiRow label="Taux de réussite" value={
                        <span className={s.accuracy >= 70 ? 'text-[#10B981]' : s.accuracy >= 50 ? 'text-[#D27A2D]' : 'text-[#EF4444]'}>
                            {s.accuracy}%
                        </span>
                    } sub={`${s.totalCorrectAnswers}/${s.totalQuestionsAnswered} questions`} />
                    <KpiRow label="ELO"              value={r?.eloScore ?? '—'} sub={r?.globalRank ? `Rang #${r.globalRank}` : undefined} />
                    <KpiRow label="Meilleure série"  value={`${p.bestStreak} jours`} />
                </Card>

                {/* Engagement */}
                <Card title="Engagement">
                    <KpiRow label="Série actuelle"      value={<span>🔥 {p.streakDays} jour{p.streakDays !== 1 ? 's' : ''}</span>} />
                    <KpiRow label="Sessions jouées"     value={s.sessionsPlayed} />
                    <KpiRow label="Questions réalisées" value={s.totalQuestionsAnswered.toLocaleString('fr-FR')} />
                    <KpiRow label="Durée totale"        value={fmtDuration(s.totalDurationMs)} />
                    <KpiRow label="Durée moy. session"  value={fmtDuration(s.avgSessionDurationMs)} />
                </Card>

                {/* Répartition par bail */}
                <Card title="Types de bail consultés">
                    {user.categoryBreakdown.length === 0 ? (
                        <p className="text-[13px] font-semibold text-[#5a7a99]">Aucune session complétée</p>
                    ) : (
                        <CategoryHBarChart
                            data={user.categoryBreakdown.map((c) => ({
                                category: c.categoryName, color: c.color,
                                count: c.sessionsCount, accuracy: c.accuracy,
                            }))}
                            dataKey="accuracy" label="Taux de réussite" suffix="%" />
                    )}
                </Card>
            </div>

            {/* Activité calendrier */}
            <Card title="Activité — 30 derniers jours" className="mb-5">
                <ActivityAreaChart data={calDays} />
            </Card>

            {/* Sessions récentes */}
            <Card title={`Sessions récentes (${user.recentSessions.length})`}>
                {user.recentSessions.length === 0 ? (
                    <p className="text-[13px] font-semibold text-[#5a7a99]">Aucune session</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {['Date', 'Type de bail', 'Mode', 'Réussite', 'XP', 'Durée'].map((h) => (
                                        <th key={h} className="px-3 py-2 text-left text-[10px] font-extrabold uppercase tracking-widest text-[#5a7a99] border-b border-[rgba(210,122,45,0.1)] bg-[#fafaf9] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {user.recentSessions.map((sess, idx) => (
                                    <tr key={sess.id} className={`border-b border-[rgba(210,122,45,0.06)] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafaf9]'}`}>
                                        <td className="px-3 py-2 text-[12px] font-semibold text-[#5a7a99] whitespace-nowrap">{fmtDateShort(sess.completedAt)}</td>
                                        <td className="px-3 py-2">
                                            {sess.category
                                                ? <span className="text-[11px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-2 py-0.5 rounded-full">{sess.category.name}</span>
                                                : <span className="text-[12px] text-[#5a7a99]">—</span>}
                                        </td>
                                        <td className="px-3 py-2"><span className="text-[11px] font-bold text-[#172E42] bg-[rgba(30,58,95,0.06)] px-2 py-0.5 rounded">{sess.mode}</span></td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className={`text-[13px] font-extrabold ${sess.accuracy >= 70 ? 'text-[#10B981]' : sess.accuracy >= 50 ? 'text-[#D27A2D]' : 'text-[#EF4444]'}`}>{sess.accuracy}%</span>
                                            <span className="text-[10px] font-semibold text-[#5a7a99] ml-1">({sess.correctAnswers}/{sess.totalQuestions})</span>
                                        </td>
                                        <td className="px-3 py-2 text-[12px] font-bold text-[#D27A2D] whitespace-nowrap">+{sess.xpEarned} XP</td>
                                        <td className="px-3 py-2 text-[12px] font-semibold text-[#5a7a99] whitespace-nowrap">{fmtDuration(sess.durationMs)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {user.badges.length > 0 && (
                <Card title="Badges débloqués" className="mt-5">
                    <div className="flex flex-wrap gap-2">
                        {user.badges.map((b) => (
                            <div key={b.slug} className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(210,122,45,0.06)] border border-[rgba(210,122,45,0.12)] rounded-full">
                                <span className="text-[12px] font-bold text-[#172E42]">{b.name}</span>
                                <span className="text-[10px] font-semibold text-[#5a7a99]">{fmtDateShort(b.unlockedAt)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Modals */}
            {editingProfile && (
                <EditProfileModal
                    userId={id}
                    profile={{ displayName: p.displayName, ageRange: p.ageRange, professionalStatus: p.professionalStatus }}
                    onClose={() => setEditingProfile(false)}
                    onSaved={(updated) => {
                        if (setUser) setUser((prev) => prev ? { ...prev, profile: { ...prev.profile, ...updated } } : prev);
                        showToast('Profil mis à jour !', 'success');
                    }}
                />
            )}

            {deletingUser && (
                <DeleteUserModal
                    userId={id}
                    displayName={p.displayName}
                    email={user.email}
                    onClose={() => setDeletingUser(false)}
                    onDeleted={() => {
                        showToast('Utilisateur supprimé', 'success');
                        setTimeout(() => router.push('/admin/users'), 1000);
                    }}
                />
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onHide={hideToast} />
        </div>
    );
}
