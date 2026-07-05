import { useState } from 'react';
import type {
    IQuestion,
    QuestionStatus,
    IPack,
} from '../../lib/types';
import {
    DIFFICULTY_LABELS,
    STATUS_LABELS,
} from '../../lib/types';
import {
    Pencil,
    MoreHorizontal,
    CheckCircle2,
    PauseCircle,
    Archive,
    Trash2,
} from 'lucide-react';

interface QuestionRowProps {
    question:   IQuestion;
    packs:      IPack[];
    number:     number;
    isEven:     boolean;
    onEdit:     (question: IQuestion) => void;
    onDelete:   (id: string) => void;
    onSuspend:  (id: string) => void;
    onArchive:  (id: string) => void;
    onRestore:  (id: string) => void;
}

const DIFFICULTY_STYLES: Record<number, string> = {
    1: 'text-[#10B981] bg-[rgba(16,185,129,0.1)]',
    2: 'text-[#D27A2D] bg-[rgba(210,122,45,0.1)]',
    3: 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]',
    4: 'text-[#7C3AED] bg-[rgba(124,58,237,0.1)]',
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
    question, number, isEven, onEdit, onDelete, onSuspend, onArchive, onRestore, packs,
}: QuestionRowProps) {
    const packName = question.packId
        ? (packs.find((p) => p.id === question.packId)?.name ?? question.packId)
        : null;
    const [menuOpen, setMenuOpen] = useState(false);

    const handleDelete = () => {
        setMenuOpen(false);
        if (confirm(`Supprimer la question "${question.codification}" ?`)) {
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
            {/* Numéro */}
            <td className="px-4 py-3 whitespace-nowrap text-right">
                <span className="font-mono text-[12px] font-bold text-[#5a7a99]">
                    {number}
                </span>
            </td>

            {/* Code */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-mono text-[12px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-2 py-0.5 rounded-md">
                    {question.codification}
                </span>
            </td>

            {/* Question text */}
            <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                    <span className="text-[13.5px] font-bold text-[#172E42] leading-snug">
                        {question.text}
                    </span>
                    <div className="flex items-center gap-2">
                        {question.isPremium && (
                            <span className="text-[10px] font-extrabold text-[#7C3AED] bg-[rgba(124,58,237,0.1)] px-1.5 py-0.5 rounded">
                                PREMIUM
                            </span>
                        )}
                    </div>
                </div>
            </td>

            {/* Category */}
            <td className="px-4 py-3">
                <span className="text-[12px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-2.5 py-1 rounded-full whitespace-nowrap">
                    {question.category?.name ?? '—'}
                </span>
            </td>

            {/* Difficulty */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span
                    className={`text-[12px] font-extrabold px-2.5 py-1 rounded-full ${DIFFICULTY_STYLES[question.level]}`}
                >
                    {DIFFICULTY_LABELS[question.level]}
                </span>
            </td>

            {/* Duration */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[13px] font-bold text-[#5a7a99]">{question.timeToRead ?? '5'}s</span>
            </td>

            {/* Pack */}
            <td className="px-4 py-3 whitespace-nowrap">
                {packName ? (
                    <span className="text-[11px] font-extrabold text-[#1e3a5f] bg-[rgba(30,58,95,0.08)] px-2 py-0.5 rounded">
                        {packName}
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
              transition-all cursor-pointer border-none"
                    >
                        <Pencil size={15} strokeWidth={2.2} />
                    </button>

                    {/* Status toggle menu */}
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
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-9 z-20 bg-white border border-[rgba(210,122,45,0.18)] rounded-xl shadow-lg py-1.5 min-w-[160px]">
                                    {question.status !== 'ACTIVE' && (
                                        <button
                                            title="La question redevient jouable dans les quiz"
                                            onClick={() => { setMenuOpen(false); onRestore(question.id); }}
                                            className="w-full px-4 py-2 text-left text-[13px] font-bold text-[#10B981] hover:bg-[rgba(16,185,129,0.06)] transition-colors flex items-center gap-2.5"
                                        >
                                            <CheckCircle2 size={14} strokeWidth={2.2} />
                                            Activer
                                        </button>
                                    )}
                                    {question.status !== 'SUSPENDED' && (
                                        <button
                                            title="Retire temporairement la question des quiz — réactivable à tout moment"
                                            onClick={() => { setMenuOpen(false); onSuspend(question.id); }}
                                            className="w-full px-4 py-2 text-left text-[13px] font-bold text-[#F59E0B] hover:bg-[rgba(245,158,11,0.06)] transition-colors flex items-center gap-2.5"
                                        >
                                            <PauseCircle size={14} strokeWidth={2.2} />
                                            Suspendre
                                        </button>
                                    )}
                                    {question.status !== 'ARCHIVED' && (
                                        <button
                                            title="Sort définitivement la question des quiz — conservée pour l'historique"
                                            onClick={() => { setMenuOpen(false); onArchive(question.id); }}
                                            className="w-full px-4 py-2 text-left text-[13px] font-bold text-[#6B7280] hover:bg-[rgba(107,114,128,0.06)] transition-colors flex items-center gap-2.5"
                                        >
                                            <Archive size={14} strokeWidth={2.2} />
                                            Archiver
                                        </button>
                                    )}
                                    <div className="my-1 h-px bg-[rgba(210,122,45,0.1)]" />
                                    <button
                                        title="Suppression définitive et irréversible"
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
