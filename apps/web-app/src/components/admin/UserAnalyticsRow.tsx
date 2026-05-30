'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IUserAnalytics, AGE_RANGE_LABELS, PRO_STATUS_LABELS } from '@/lib/user.analytics.types';
import { Eye } from 'lucide-react';

interface Props {
    user:   IUserAnalytics;
    isEven: boolean;
}

function fmtDuration(ms: number): string {
    if (!ms) return '—';
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.round(s / 60)}min`;
}

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
}

export function UserAnalyticsRow({ user, isEven }: Props) {
    const router = useRouter();
    const p = user.profile;

    return (
        <tr
            className={`
        border-b border-[rgba(210,122,45,0.08)] transition-colors cursor-pointer
        hover:bg-[rgba(210,122,45,0.04)]
        ${isEven ? 'bg-white' : 'bg-[#fafaf9]'}
      `}
            onClick={() => router.push(`/admin/users/${user.id}`)}
        >
            {/* Avatar + Nom */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-[rgba(210,122,45,0.15)] flex items-center justify-center flex-shrink-0">
                            <span className="text-[12px] font-black text-[#D27A2D]">
                                {(p.displayName ?? user.email).charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#172E42] truncate">
                            {p.displayName ?? '—'}
                        </p>
                        <p className="text-[11px] font-semibold text-[#5a7a99] truncate">{user.email}</p>
                    </div>
                </div>
            </td>

            {/* Profil */}
            <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-[#172E42]">
                        {p.ageRange ? AGE_RANGE_LABELS[p.ageRange] : '—'}
                    </span>
                    <span className="text-[11px] font-semibold text-[#5a7a99]">
                        {p.professionalStatus ? PRO_STATUS_LABELS[p.professionalStatus] : '—'}
                    </span>
                </div>
            </td>

            {/* Métier */}
            <td className="px-4 py-3">
                <span className="text-[12px] font-semibold text-[#172E42]">
                    {p.jobProfile?.name ?? '—'}
                </span>
            </td>

            {/* XP / Niveau */}
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-extrabold text-[#D27A2D]">{p.xpTotal.toLocaleString('fr-FR')} XP</span>
                    <span className="text-[11px] font-bold text-[#5a7a99]">Niv. {p.level}</span>
                </div>
            </td>

            {/* Taux de réussite */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-[13px] font-extrabold ${
                    user.stats.accuracy >= 70
                        ? 'text-[#10B981]'
                        : user.stats.accuracy >= 50
                        ? 'text-[#D27A2D]'
                        : 'text-[#EF4444]'
                }`}>
                    {user.stats.accuracy}%
                </span>
                <p className="text-[10px] font-semibold text-[#5a7a99]">
                    {user.stats.totalCorrectAnswers}/{user.stats.totalQuestionsAnswered} questions
                </p>
            </td>

            {/* Streak / Sessions */}
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-[#172E42]">
                        🔥 {p.streakDays}j
                    </span>
                    <span className="text-[11px] font-semibold text-[#5a7a99]">
                        {user.stats.sessionsPlayed} sessions
                    </span>
                </div>
            </td>

            {/* Durée totale */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[13px] font-bold text-[#5a7a99]">
                    {fmtDuration(user.stats.totalDurationMs)}
                </span>
            </td>

            {/* Dernière activité */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] font-semibold text-[#5a7a99]">
                    {fmtDate(p.lastPlayedAt)}
                </span>
            </td>

            {/* Action */}
            <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    title="Voir le profil"
                    className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center
              bg-[rgba(30,58,95,0.08)] text-[#1e3a5f] hover:bg-[rgba(30,58,95,0.18)]
              transition-all cursor-pointer border-none"
                >
                    <Eye size={15} strokeWidth={2.2} />
                </button>
            </td>
        </tr>
    );
}
