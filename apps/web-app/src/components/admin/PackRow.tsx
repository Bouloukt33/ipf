'use client';

import React, { useState } from 'react';
import { IPack, PackType, PACK_TYPE_LABELS, PACK_TYPE_STYLES } from '@/lib/pack.types';
import { Pencil, MoreHorizontal, CheckCircle2, PauseCircle, Trash2 } from 'lucide-react';

interface PackRowProps {
    pack: IPack;
    isEven: boolean;
    onEdit: (pack: IPack) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string) => void;
}

export function PackRow({ pack, isEven, onEdit, onDelete, onToggleActive }: PackRowProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleDelete = () => {
        setMenuOpen(false);
        if (confirm(`Supprimer le pack "${pack.name}" ? Les questions associées seront dissociées.`)) {
            onDelete(pack.id);
        }
    };

    const questionCount = pack._count?.questions ?? 0;

    return (
        <tr
            className={`
        border-b border-[rgba(210,122,45,0.08)] transition-colors cursor-pointer
        hover:bg-[rgba(210,122,45,0.04)]
        ${isEven ? 'bg-white' : 'bg-[#fafaf9]'}
      `}
            onClick={() => onEdit(pack)}
        >
            {/* Nom */}
            <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[13.5px] font-bold text-[#172E42] leading-snug">{pack.name}</span>
                    <span className="font-mono text-[11px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-1.5 py-0.5 rounded w-fit">
                        {pack.slug}
                    </span>
                </div>
            </td>

            {/* Catégorie */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-2.5 py-1 rounded-full">
                    {pack.category?.name ?? '—'}
                </span>
            </td>

            {/* Type */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-[12px] font-extrabold px-2.5 py-1 rounded-full ${PACK_TYPE_STYLES[pack.type]}`}>
                    {PACK_TYPE_LABELS[pack.type]}
                </span>
            </td>

            {/* Questions */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[13px] font-bold text-[#172E42]">{questionCount}</span>
                <span className="text-[11px] font-semibold text-[#5a7a99] ml-1">question{questionCount !== 1 ? 's' : ''}</span>
            </td>

            {/* Gratuit */}
            <td className="px-4 py-3 whitespace-nowrap">
                {pack.isFree ? (
                    <span className="text-[12px] font-extrabold text-[#10B981] bg-[rgba(16,185,129,0.1)] px-2.5 py-1 rounded-full">
                        Gratuit
                    </span>
                ) : (
                    <span className="text-[12px] font-extrabold text-[#5a7a99] bg-[rgba(90,122,153,0.08)] px-2.5 py-1 rounded-full">
                        {pack.price ? `${pack.price} €` : 'Payant'}
                    </span>
                )}
            </td>

            {/* Statut */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span
                    className={`inline-flex items-center gap-1.5 text-[12px] font-extrabold px-2.5 py-1 rounded-full ${
                        pack.isActive
                            ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)]'
                            : 'text-[#6B7280] bg-[rgba(107,114,128,0.1)]'
                    }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${pack.isActive ? 'bg-[#10B981]' : 'bg-[#6B7280]'}`} />
                    {pack.isActive ? 'Actif' : 'Inactif'}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    <button
                        title="Modifier"
                        onClick={() => onEdit(pack)}
                        className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center
              bg-[rgba(30,58,95,0.08)] text-[#1e3a5f] hover:bg-[rgba(30,58,95,0.18)]
              transition-all cursor-pointer border-none"
                    >
                        <Pencil size={15} strokeWidth={2.2} />
                    </button>

                    <div className="relative">
                        <button
                            title="Actions"
                            onClick={() => setMenuOpen((v) => !v)}
                            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center
                bg-[rgba(210,122,45,0.08)] text-[#D27A2D] hover:bg-[rgba(210,122,45,0.18)]
                transition-all cursor-pointer border-none"
                        >
                            <MoreHorizontal size={17} strokeWidth={2.2} />
                        </button>
                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                <div className="absolute right-0 top-9 z-20 bg-white border border-[rgba(210,122,45,0.18)] rounded-xl shadow-lg py-1.5 min-w-[160px]">
                                    <button
                                        onClick={() => { setMenuOpen(false); onToggleActive(pack.id); }}
                                        className={`w-full px-4 py-2 text-left text-[13px] font-bold flex items-center gap-2.5 transition-colors ${
                                            pack.isActive
                                                ? 'text-[#F59E0B] hover:bg-[rgba(245,158,11,0.06)]'
                                                : 'text-[#10B981] hover:bg-[rgba(16,185,129,0.06)]'
                                        }`}
                                    >
                                        {pack.isActive
                                            ? <><PauseCircle size={14} strokeWidth={2.2} />Désactiver</>
                                            : <><CheckCircle2 size={14} strokeWidth={2.2} />Activer</>
                                        }
                                    </button>
                                    <div className="my-1 h-px bg-[rgba(210,122,45,0.1)]" />
                                    <button
                                        onClick={handleDelete}
                                        className="w-full px-4 py-2 text-left text-[13px] font-bold text-[#EF4444] hover:bg-[rgba(239,68,68,0.06)] transition-colors flex items-center gap-2.5"
                                    >
                                        <Trash2 size={14} strokeWidth={2.2} />
                                        Supprimer
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
}
