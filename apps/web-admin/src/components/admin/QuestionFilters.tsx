import type {
    IQuestionFilters,
    QuestionStatus,
    ICategory,
} from '../../lib/types';
import {
    DIFFICULTY_LABELS,
    STATUS_LABELS,
} from '../../lib/types';

interface QuestionFiltersProps {
    filters: IQuestionFilters;
    categories: ICategory[];
    onChange: (filters: Partial<IQuestionFilters>) => void;
    onReset: () => void;
}

export function QuestionFilters({ filters, categories, onChange, onReset }: QuestionFiltersProps) {
    const hasActiveFilters =
        filters.search ||
        filters.level ||
        filters.status ||
        filters.categoryId;

    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-[380px]">
                <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a7a99] pointer-events-none"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => onChange({ search: e.target.value })}
                    placeholder="Rechercher une question ou un code…"
                    className="w-full h-[42px] pl-10 pr-4 border-2 border-[rgba(210,122,45,0.18)] rounded-xl
            font-semibold text-sm text-[#172E42] bg-white outline-none
            focus:border-[#D27A2D] transition-colors placeholder:text-[#5a7a99]
            font-nunito"
                />
            </div>

            {/* Category */}
            <select
                value={filters.categoryId}
                onChange={(e) => onChange({ categoryId: e.target.value })}
                className="h-[42px] px-3.5 border-2 border-[rgba(210,122,45,0.18)] rounded-xl
          font-bold text-[13px] text-[#172E42] bg-white cursor-pointer outline-none
          focus:border-[#D27A2D] transition-colors font-nunito"
            >
                <option value="">Tous les types</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
            </select>

            {/* Level */}
            <select
                value={filters.level}
                onChange={(e) => onChange({ level: e.target.value ? Number(e.target.value) : '' })}
                className="h-[42px] px-3.5 border-2 border-[rgba(210,122,45,0.18)] rounded-xl
          font-bold text-[13px] text-[#172E42] bg-white cursor-pointer outline-none
          focus:border-[#D27A2D] transition-colors font-nunito"
            >
                <option value="">Toutes les difficultés</option>
                {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>

            {/* Status */}
            <select
                value={filters.status}
                onChange={(e) => onChange({ status: e.target.value as QuestionStatus | '' })}
                className="h-[42px] px-3.5 border-2 border-[rgba(210,122,45,0.18)] rounded-xl
          font-bold text-[13px] text-[#172E42] bg-white cursor-pointer outline-none
          focus:border-[#D27A2D] transition-colors font-nunito"
            >
                <option value="">Tous les statuts</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>

            {/* Reset */}
            {hasActiveFilters && (
                <button
                    onClick={onReset}
                    className="h-[42px] px-4 border-2 border-[rgba(210,122,45,0.18)] rounded-xl
            font-bold text-[13px] text-[#5a7a99] bg-white hover:border-[#D27A2D]
            hover:text-[#D27A2D] transition-all cursor-pointer font-nunito
            flex items-center gap-2"
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
