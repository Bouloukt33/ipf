'use client';

import React from 'react';
import {
    IUserAnalyticsFilters,
    ProfessionalStatus,
    AgeRange,
    PRO_STATUS_LABELS,
    AGE_RANGE_LABELS,
} from '@/lib/user.analytics.types';

interface Props {
    filters:  IUserAnalyticsFilters;
    onChange: (f: Partial<IUserAnalyticsFilters>) => void;
    onReset:  () => void;
}

export function UserAnalyticsFilters({ filters, onChange, onReset }: Props) {
    const hasActive = filters.search || filters.professionalStatus || filters.ageRange;

    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-[380px]">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a7a99] pointer-events-none"
                    width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => onChange({ search: e.target.value })}
                    placeholder="Rechercher un nom ou email…"
                    className="w-full h-[42px] pl-10 pr-4 border-2 border-[rgba(210,122,45,0.18)] rounded-xl
            font-semibold text-sm text-[#172E42] bg-white outline-none
            focus:border-[#D27A2D] transition-colors placeholder:text-[#5a7a99] font-nunito"
                />
            </div>

            {/* Statut pro */}
            <select
                value={filters.professionalStatus}
                onChange={(e) => onChange({ professionalStatus: e.target.value as ProfessionalStatus | '' })}
                className="h-[42px] px-3.5 border-2 border-[rgba(210,122,45,0.18)] rounded-xl
          font-bold text-[13px] text-[#172E42] bg-white cursor-pointer outline-none
          focus:border-[#D27A2D] transition-colors font-nunito"
            >
                <option value="">Tous les statuts</option>
                {(Object.entries(PRO_STATUS_LABELS) as [ProfessionalStatus, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                ))}
            </select>

            {/* Tranche d'âge */}
            <select
                value={filters.ageRange}
                onChange={(e) => onChange({ ageRange: e.target.value as AgeRange | '' })}
                className="h-[42px] px-3.5 border-2 border-[rgba(210,122,45,0.18)] rounded-xl
          font-bold text-[13px] text-[#172E42] bg-white cursor-pointer outline-none
          focus:border-[#D27A2D] transition-colors font-nunito"
            >
                <option value="">Toutes les tranches d'âge</option>
                {(Object.entries(AGE_RANGE_LABELS) as [AgeRange, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                ))}
            </select>

            {hasActive && (
                <button
                    onClick={onReset}
                    className="h-[42px] px-4 border-2 border-[rgba(210,122,45,0.18)] rounded-xl
            font-bold text-[13px] text-[#5a7a99] bg-white hover:border-[#D27A2D]
            hover:text-[#D27A2D] transition-all cursor-pointer font-nunito flex items-center gap-2"
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Réinitialiser
                </button>
            )}
        </div>
    );
}
