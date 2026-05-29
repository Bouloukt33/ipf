'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserAnalyticsDetail } from '@/hooks/useUserAnalyticsDetail';
import { AGE_RANGE_LABELS, PRO_STATUS_LABELS } from '@/lib/user.analytics.types';
import { ArrowLeft } from 'lucide-react';
import { ActivityAreaChart } from '@/components/admin/charts/ActivityAreaChart';
import { CategoryHBarChart } from '@/components/admin/charts/CategoryHBarChart';

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

// ── Sub-components ─────────────────────────────────────────────────────────────
function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white rounded-[18px] border border-[rgba(210,122,45,0.12)] p-6 ${className}`}>
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-4">{title}</h3>
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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminUserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router  = useRouter();
    const { user, isLoading, error } = useUserAnalyticsDetail(id);

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
                    <button onClick={() => router.back()} className="text-[#D27A2D] font-bold text-sm underline">
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    const p   = user.profile;
    const s   = user.stats;
    const r   = user.ranking;

    // Activité calendrier : build 30-day grid
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
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[13px] font-bold text-[#5a7a99] hover:text-[#D27A2D] transition-colors mb-4 cursor-pointer border-none bg-transparent"
                >
                    <ArrowLeft size={16} strokeWidth={2.5} />
                    Retour à la liste
                </button>

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
                                user.isActive
                                    ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)]'
                                    : 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]'
                            }`}>
                                {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                            <span className="text-[11px] font-extrabold text-[#7C3AED] bg-[rgba(124,58,237,0.1)] px-2 py-0.5 rounded-full">
                                {user.role}
                            </span>
                            <span className="text-[11px] font-semibold text-[#5a7a99]">
                                Inscrit le {fmtDate(user.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid 2×2 */}
            <div className="grid grid-cols-2 gap-5 mb-5">
                {/* Profil */}
                <Card title="Profil">
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
                    <KpiRow label="Série actuelle"   value={<span>🔥 {p.streakDays} jour{p.streakDays !== 1 ? 's' : ''}</span>} />
                    <KpiRow label="Sessions jouées"  value={s.sessionsPlayed} />
                    <KpiRow label="Questions réalisées" value={s.totalQuestionsAnswered.toLocaleString('fr-FR')} />
                    <KpiRow label="Durée totale"     value={fmtDuration(s.totalDurationMs)} />
                    <KpiRow label="Durée moy. session" value={fmtDuration(s.avgSessionDurationMs)} />
                </Card>

                {/* Répartition par bail */}
                <Card title="Types de bail consultés">
                    {user.categoryBreakdown.length === 0 ? (
                        <p className="text-[13px] font-semibold text-[#5a7a99]">Aucune session complétée</p>
                    ) : (
                        <CategoryHBarChart
                            data={user.categoryBreakdown.map((c) => ({
                                category: c.categoryName,
                                color:    c.color,
                                count:    c.sessionsCount,
                                accuracy: c.accuracy,
                            }))}
                            dataKey="accuracy"
                            label="Taux de réussite"
                            suffix="%"
                        />
                    )}
                </Card>
            </div>

            {/* Calendrier d'activité (30j) — Area chart */}
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
                                        <th key={h} className="px-3 py-2 text-left text-[10px] font-extrabold uppercase tracking-widest text-[#5a7a99] border-b border-[rgba(210,122,45,0.1)] bg-[#fafaf9] whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {user.recentSessions.map((sess, idx) => (
                                    <tr
                                        key={sess.id}
                                        className={`border-b border-[rgba(210,122,45,0.06)] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafaf9]'}`}
                                    >
                                        <td className="px-3 py-2 text-[12px] font-semibold text-[#5a7a99] whitespace-nowrap">
                                            {fmtDateShort(sess.completedAt)}
                                        </td>
                                        <td className="px-3 py-2">
                                            {sess.category ? (
                                                <span className="text-[11px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-2 py-0.5 rounded-full">
                                                    {sess.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-[12px] text-[#5a7a99]">—</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="text-[11px] font-bold text-[#172E42] bg-[rgba(30,58,95,0.06)] px-2 py-0.5 rounded">
                                                {sess.mode}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className={`text-[13px] font-extrabold ${
                                                sess.accuracy >= 70 ? 'text-[#10B981]' : sess.accuracy >= 50 ? 'text-[#D27A2D]' : 'text-[#EF4444]'
                                            }`}>
                                                {sess.accuracy}%
                                            </span>
                                            <span className="text-[10px] font-semibold text-[#5a7a99] ml-1">
                                                ({sess.correctAnswers}/{sess.totalQuestions})
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-[12px] font-bold text-[#D27A2D] whitespace-nowrap">
                                            +{sess.xpEarned} XP
                                        </td>
                                        <td className="px-3 py-2 text-[12px] font-semibold text-[#5a7a99] whitespace-nowrap">
                                            {fmtDuration(sess.durationMs)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Badges */}
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
        </div>
    );
}
