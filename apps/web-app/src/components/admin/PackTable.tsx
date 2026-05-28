'use client';

import React from 'react';
import { IPack } from '@/lib/pack.types';
import { PackRow } from './PackRow';

interface PackTableProps {
    packs: IPack[];
    isLoading: boolean;
    onEdit: (pack: IPack) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string) => void;
}

const COLUMNS = [
    { key: 'name',     label: 'Nom / Slug',   width: 'flex-1' },
    { key: 'category', label: 'Catégorie',     width: 'w-[160px]' },
    { key: 'type',     label: 'Type',          width: 'w-[110px]' },
    { key: 'questions',label: 'Questions',     width: 'w-[110px]' },
    { key: 'price',    label: 'Tarif',         width: 'w-[110px]' },
    { key: 'status',   label: 'Statut',        width: 'w-[100px]' },
    { key: 'actions',  label: 'Actions',       width: 'w-[100px]' },
];

export function PackTable({ packs, isLoading, onEdit, onDelete, onToggleActive }: PackTableProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-3 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold text-[#5a7a99]">Chargement…</span>
                    </div>
                </div>
            </div>
        );
    }

    if (packs.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex flex-col items-center justify-center py-16 text-[#5a7a99]">
                    <div className="text-5xl mb-3">📦</div>
                    <div className="text-base font-bold">Aucun pack trouvé</div>
                    <div className="text-sm font-semibold mt-1">Modifiez vos filtres ou créez un nouveau pack</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border-[1.5px] border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            {COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    className={`
                    ${col.width} px-4 py-3 text-left
                    text-[11px] font-extrabold uppercase tracking-widest text-[#5a7a99]
                    border-b-2 border-[rgba(210,122,45,0.15)] bg-[#fafaf9] whitespace-nowrap
                  `}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {packs.map((pack, idx) => (
                            <PackRow
                                key={pack.id}
                                pack={pack}
                                isEven={idx % 2 === 0}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onToggleActive={onToggleActive}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
