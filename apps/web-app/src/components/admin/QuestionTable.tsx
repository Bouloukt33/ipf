'use client';

import React from 'react';
import { IQuestion, LEASE_TYPE_LABELS, DIFFICULTY_LABELS, STATUS_LABELS } from '@/lib/question.types';
import { QuestionRow } from './QuestionRow';

interface QuestionTableProps {
    questions: IQuestion[];
    isLoading: boolean;
    onEdit: (question: IQuestion) => void;
    onDelete: (id: string) => void;
    onSuspend: (id: string) => void;
    onArchive: (id: string) => void;
    onRestore: (id: string) => void;
}

const COLUMNS = [
    { key: 'code', label: 'Code', width: 'w-[130px]' },
    { key: 'text', label: 'Question', width: 'flex-1' },
    { key: 'leaseType', label: 'Type', width: 'w-[140px]' },
    { key: 'categoryName', label: 'Catégorie', width: 'w-[150px]' },
    { key: 'difficulty', label: 'Difficulté', width: 'w-[110px]' },
    { key: 'timeToRead', label: 'Durée', width: 'w-[70px]' },
    { key: 'packId', label: 'Pack', width: 'w-[110px]' },
    { key: 'status', label: 'Statut', width: 'w-[100px]' },
    { key: 'actions', label: 'Actions', width: 'w-[110px]' },
];

export function QuestionTable({
    questions,
    isLoading,
    onEdit,
    onDelete,
    onSuspend,
    onArchive,
    onRestore,
}: QuestionTableProps) {
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

    if (questions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex flex-col items-center justify-center py-16 text-[#5a7a99]">
                    <div className="text-5xl mb-3">🔍</div>
                    <div className="text-base font-bold">Aucune question trouvée</div>
                    <div className="text-sm font-semibold mt-1">Modifiez vos filtres ou créez une nouvelle question</div>
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
                        {questions.map((question, idx) => (
                            <QuestionRow
                                key={question.id}
                                question={question}
                                isEven={idx % 2 === 0}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onSuspend={onSuspend}
                                onArchive={onArchive}
                                onRestore={onRestore}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
