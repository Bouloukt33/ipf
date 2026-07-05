import { SearchX } from 'lucide-react';
import type { IQuestion, IPack } from '../../lib/types';
import { QuestionRow } from './QuestionRow';
import { enterAt } from '../../lib/utils';

interface QuestionTableProps {
    packs:      IPack[];
    questions:  IQuestion[];
    /** Index (0-based) de la première ligne — continuité du numéro à travers la pagination */
    startIndex: number;
    isLoading:  boolean;
    onEdit:     (question: IQuestion) => void;
    onDelete:   (id: string) => void;
    onSuspend:  (id: string) => void;
    onArchive:  (id: string) => void;
    onRestore:  (id: string) => void;
}

const COLUMNS = [
    { key: 'number', label: 'N°', width: 'w-[60px]' },
    { key: 'code', label: 'Code', width: 'w-[130px]' },
    { key: 'text', label: 'Question', width: 'flex-1' },
    { key: 'categoryName', label: 'Catégorie', width: 'w-[150px]' },
    { key: 'difficulty', label: 'Difficulté', width: 'w-[110px]' },
    { key: 'timeToRead', label: 'Durée', width: 'w-[70px]' },
    { key: 'packId', label: 'Pack', width: 'w-[110px]' },
    { key: 'status', label: 'Statut', width: 'w-[100px]' },
    { key: 'actions', label: 'Actions', width: 'w-[110px]' },
];

export function QuestionTable({
    questions, startIndex, isLoading, onEdit, onDelete, onSuspend, onArchive, onRestore, packs,
}: QuestionTableProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-[28px] border border-ink-100 shadow-soft overflow-hidden p-6" aria-busy="true">
                <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-5 w-10 rounded-lg bg-ink-100 animate-pulse flex-shrink-0" />
                            <div className="h-5 w-24 rounded-lg bg-ink-100 animate-pulse flex-shrink-0" />
                            <div className="h-5 flex-1 rounded-lg bg-ink-100 animate-pulse" />
                            <div className="h-5 w-28 rounded-full bg-ink-100 animate-pulse flex-shrink-0" />
                            <div className="h-5 w-20 rounded-full bg-ink-100 animate-pulse flex-shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="bg-white rounded-[28px] border border-ink-100 shadow-soft overflow-hidden motion-safe:animate-scale-in">
                <div className="flex flex-col items-center justify-center py-16 text-steel">
                    <span aria-hidden className="flex items-center justify-center w-14 h-14 rounded-2xl bg-cream text-primary mb-4">
                        <SearchX size={26} />
                    </span>
                    <div className="text-base font-black text-text-primary">Aucune question trouvée</div>
                    <div className="text-sm font-semibold mt-1">Modifiez vos filtres ou créez une nouvelle question</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-white rounded-[28px] border border-ink-100 overflow-hidden shadow-soft motion-safe:animate-fade-in-up"
            style={enterAt(160)}
        >
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-ink-100">
                            {COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    className={`
                    ${col.width} px-4 py-4 text-left
                    text-[11px] font-black uppercase tracking-wider text-steel whitespace-nowrap
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
                                number={startIndex + idx + 1}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onSuspend={onSuspend}
                                onArchive={onArchive}
                                onRestore={onRestore}
                                packs={packs}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
