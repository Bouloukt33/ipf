import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { IQuestionFilters, QuestionStatus, ICategory } from '../../lib/types';
import { DIFFICULTY_LABELS, STATUS_LABELS } from '../../lib/types';
import { enterAt } from '../../lib/utils';

interface QuestionFiltersProps {
    filters: IQuestionFilters;
    categories: ICategory[];
    onChange: (filters: Partial<IQuestionFilters>) => void;
    onReset: () => void;
}

const FIELD_CLASSES = `h-[44px] rounded-2xl border-2 border-transparent bg-cream
    font-bold text-[13px] text-text-primary outline-none cursor-pointer
    focus:border-primary focus:bg-white transition-colors font-nunito`;

export function QuestionFilters({ filters, categories, onChange, onReset }: QuestionFiltersProps) {
    const hasActiveFilters =
        filters.search ||
        filters.level ||
        filters.status ||
        filters.categoryId;

    return (
        <div
            className="flex flex-wrap items-center gap-3 mb-6 bg-white rounded-[24px] shadow-soft border border-ink-100 p-3
              motion-safe:animate-fade-in-up"
            style={enterAt(120)}
        >
            <span aria-hidden className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-cream text-primary flex-shrink-0">
                <SlidersHorizontal size={16} />
            </span>

            <div className="relative flex-1 min-w-[220px] max-w-[380px]">
                <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel pointer-events-none"
                    aria-hidden
                />
                <input
                    type="text"
                    value={filters.search}
                    onChange={(event) => onChange({ search: event.target.value })}
                    placeholder="Rechercher une question ou un code…"
                    aria-label="Rechercher une question"
                    className={`${FIELD_CLASSES} w-full pl-10 pr-4 font-semibold text-sm cursor-text placeholder:text-steel`}
                />
            </div>

            <select
                value={filters.categoryId}
                onChange={(event) => onChange({ categoryId: event.target.value })}
                aria-label="Filtrer par type de bail"
                className={`${FIELD_CLASSES} px-3.5`}
            >
                <option value="">Tous les types</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>

            <select
                value={filters.level}
                onChange={(event) => onChange({ level: event.target.value ? Number(event.target.value) : '' })}
                aria-label="Filtrer par difficulté"
                className={`${FIELD_CLASSES} px-3.5`}
            >
                <option value="">Toutes les difficultés</option>
                {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>

            <select
                value={filters.status}
                onChange={(event) => onChange({ status: event.target.value as QuestionStatus | '' })}
                aria-label="Filtrer par statut"
                className={`${FIELD_CLASSES} px-3.5`}
            >
                <option value="">Tous les statuts</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>

            {hasActiveFilters && (
                <button
                    onClick={onReset}
                    className="h-[44px] px-4 rounded-2xl border-2 border-transparent bg-cream
                      font-bold text-[13px] text-steel hover:text-primary hover:border-primary
                      transition-colors cursor-pointer font-nunito flex items-center gap-2"
                >
                    <X size={14} aria-hidden />
                    Réinitialiser
                </button>
            )}
        </div>
    );
}