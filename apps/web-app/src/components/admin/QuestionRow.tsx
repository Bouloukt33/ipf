'use client';

import React, { useState } from 'react';
import {
    IQuestion,
    QuestionStatus,
    DifficultyLevel,
    LEASE_TYPE_LABELS,
    DIFFICULTY_LABELS,
    STATUS_LABELS,
} from '@/lib/question.types';
import { truncateText } from '@/lib/generateCode';

interface QuestionRowProps {
    question: IQuestion;
    isEven: boolean;
    onEdit: (question: IQuestion) => void;
    onDelete: (id: string) => void;
    onSuspend: (id: string) => void;
    onArchive: (id: string) => void;
    onRestore: (id: string) => void;
}

const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
    FACILE: 'text-[#10B981] bg-[rgba(16,185,129,0.1)]',
    MOYEN: 'text-[#D27A2D] bg-[rgba(210,122,45,0.1)]',
    DIFFICILE: 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]',
    ETUDE_DE_CAS: 'text-[#7C3AED] bg-[rgba(124,58,237,0.1)]',
};

const STATUS_STYLES: Record<QuestionStatus, string> = {
    ACTIVE: 'text-[#10B981] bg-[rgba(16,185,129,0.1)]',
    SUSPENDED: 'text-[#F59E0B] bg-[rgba(245,158,11,0.1)]',
    ARCHIVED: 'text-[#6B7280] bg-[rgba(107,114,128,0.1)]',
};

const STATUS_DOTS: Record<QuestionStatus, string> = {
    ACTIVE: 'bg-[#10B981]',
    SUSPENDED: 'bg-[#F59E0B]',
    ARCHIVED: 'bg-[#6B7280]',
};

export function QuestionRow({
    question,
    isEven,
    onEdit,
    onDelete,
    onSuspend,
    onArchive,
    onRestore,
}: QuestionRowProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleDelete = () => {
        setMenuOpen(false);
        if (confirm(`Supprimer la question "${question.code}" ?`)) {
            onDelete(question.id);
        }
    };

    return (
        <tr
            className={`
        border-b border-[rgba(210,122,45,0.08)] transition-colors cursor-pointer
        hover:bg-[rgba(210,122,45,0.04)]
        ${isEven ? 'bg-white' : 'bg-[#fafaf9]'}
      `}
            onClick={() => onEdit(question)}
        >
            {/* Code */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-mono text-[12px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-2 py-0.5 rounded-md">
                    {question.code}
                </span>
            </td>

            {/* Question text */}
            <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                    <span className="text-[13.5px] font-bold text-[#172E42] leading-snug">
                        {truncateText(question.text, 72)}
                    </span>
                    <div className="flex items-center gap-2">
                        {question.successRate !== undefined && (
                            <span className="text-[11px] font-bold text-[#5a7a99] flex items-center gap-1">
                                <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {question.successRate}%
                            </span>
                        )}
                        {question.isPremium && (
                            <span className="text-[10px] font-extrabold text-[#7C3AED] bg-[rgba(124,58,237,0.1)] px-1.5 py-0.5 rounded">
                                PREMIUM
                            </span>
                        )}
                    </div>
                </div>
            </td>

            {/* Lease type */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-2.5 py-1 rounded-full">
                    {LEASE_TYPE_LABELS[question.leaseType]}
                </span>
            </td>

            {/* Category */}
            <td className="px-4 py-3">
                <span className="text-[13px] font-semibold text-[#172E42]">
                    {question.categoryName ?? '—'}
                </span>
            </td>

            {/* Difficulty */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span
                    className={`text-[12px] font-extrabold px-2.5 py-1 rounded-full ${DIFFICULTY_STYLES[question.difficulty]}`}
                >
                    {DIFFICULTY_LABELS[question.difficulty]}
                </span>
            </td>

            {/* Duration */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[13px] font-bold text-[#5a7a99]">{question.timeToRead}s</span>
            </td>

            {/* Pack */}
            <td className="px-4 py-3 whitespace-nowrap">
                {question.packId ? (
                    <span className="text-[11px] font-extrabold text-[#1e3a5f] bg-[rgba(30,58,95,0.08)] px-2 py-0.5 rounded">
                        {question.packId}
                    </span>
                ) : (
                    <span className="text-[13px] text-[#5a7a99]">—</span>
                )}
            </td>

            {/* Status */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span
                    className={`inline-flex items-center gap-1.5 text-[12px] font-extrabold px-2.5 py-1 rounded-full ${STATUS_STYLES[question.status]}`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[question.status]}`} />
                    {STATUS_LABELS[question.status]}
                </span>
            </td>

            {/* Actions */}
            <td
                className="px-4 py-3 whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2">
                    {/* Edit */}
                    <button
                        title="Modifier"
                        onClick={() => onEdit(question)}
                        className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center
              bg-[rgba(30,58,95,0.08)] text-[#1e3a5f] hover:bg-[rgba(30,58,95,0.18)]
              transition-all text-sm cursor-pointer border-none"
                    >
                        ✏️
                    </button>

                    {/* Status toggle menu */}
                    <div className="relative">
                        <button
                            title="Actions"
                            onClick={() => setMenuOpen((v) => !v)}
                            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center
                bg-[rgba(210,122,45,0.08)] text-[#D27A2D] hover:bg-[rgba(210,122,45,0.18)]
                transition-all text-sm cursor-pointer border-none"
                        >
                            ⋯
                        </button>
                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-9 z-20 bg-white border border-[rgba(210,122,45,0.18)] rounded-xl shadow-lg py-1.5 min-w-[160px]">
                                    {question.status !== 'ACTIVE' && (
                                        <button
                                            onClick={() => { setMenuOpen(false); onRestore(question.id); }}
                                            className="w-full px-4 py-2 text-left text-[13px] font-bold text-[#10B981] hover:bg-[rgba(16,185,129,0.06)] transition-colors"
                                        >
                                            ✅ Activer
                                        </button>
                                    )}
                                    {question.status !== 'SUSPENDED' && (
                                        <button
                                            onClick={() => { setMenuOpen(false); onSuspend(question.id); }}
                                            className="w-full px-4 py-2 text-left text-[13px] font-bold text-[#F59E0B] hover:bg-[rgba(245,158,11,0.06)] transition-colors"
                                        >
                                            ⏸️ Suspendre
                                        </button>
                                    )}
                                    {question.status !== 'ARCHIVED' && (
                                        <button
                                            onClick={() => { setMenuOpen(false); onArchive(question.id); }}
                                            className="w-full px-4 py-2 text-left text-[13px] font-bold text-[#6B7280] hover:bg-[rgba(107,114,128,0.06)] transition-colors"
                                        >
                                            📦 Archiver
                                        </button>
                                    )}
                                    <div className="my-1 h-px bg-[rgba(210,122,45,0.1)]" />
                                    <button
                                        onClick={handleDelete}
                                        className="w-full px-4 py-2 text-left text-[13px] font-bold text-[#EF4444] hover:bg-[rgba(239,68,68,0.06)] transition-colors"
                                    >
                                        🗑️ Supprimer
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
