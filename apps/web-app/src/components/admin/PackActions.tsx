'use client';

import { IPackStats } from '@/lib/pack.types';
import React from 'react';

interface PackActionsProps {
    stats: IPackStats | null;
    onCreateNew: () => void;
}

export function PackActions({ stats, onCreateNew }: PackActionsProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {stats && (
                <div className="flex flex-wrap items-center gap-2">
                    <StatPill label="Total"    value={stats.total}   color="text-[#172E42] bg-[rgba(30,58,95,0.08)]" />
                    <StatPill label="Actifs"   value={stats.active}  color="text-[#10B981] bg-[rgba(16,185,129,0.1)]" />
                    <StatPill label="Gratuits" value={stats.free}    color="text-[#D27A2D] bg-[rgba(210,122,45,0.1)]" />
                    <StatPill label="Visiteur" value={stats.visiteur} color="text-[#10B981] bg-[rgba(16,185,129,0.1)]" />
                    <StatPill label="Premium"  value={stats.premium} color="text-[#7C3AED] bg-[rgba(124,58,237,0.1)]" />
                </div>
            )}

            <button
                onClick={onCreateNew}
                className="h-[42px] px-5 rounded-[12px] border-none
          bg-gradient-to-br from-[#D27A2D] to-[#F59E0B]
          font-extrabold text-[13px] text-white cursor-pointer font-nunito
          flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-[rgba(210,122,45,0.3)]
          hover:-translate-y-px"
            >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Nouveau pack
            </button>
        </div>
    );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${color}`}>
            <span className="text-[13px] font-extrabold">{value}</span>
            <span className="text-[11px] font-bold">{label}</span>
        </div>
    );
}
