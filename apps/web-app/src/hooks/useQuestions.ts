// src/app/hooks/useQuestions.ts

'use client';

import { IQuestion, IQuestionFilters, IQuestionFormData, IQuestionStats } from '@/lib/question.types';
import { questionsService } from '@/services/questions.service';
import { useState, useEffect, useCallback } from 'react';

interface UseQuestionsReturn {
    questions: IQuestion[];
    stats: IQuestionStats | null;
    filters: IQuestionFilters;
    isLoading: boolean;
    error: string | null;
    // Filter actions
    setFilters: (filters: Partial<IQuestionFilters>) => void;
    resetFilters: () => void;
    // CRUD
    createQuestion: (data: IQuestionFormData) => Promise<IQuestion>;
    updateQuestion: (id: string, data: Partial<IQuestionFormData>) => Promise<IQuestion>;
    deleteQuestion: (id: string) => Promise<void>;
    suspendQuestion: (id: string) => Promise<IQuestion>;
    archiveQuestion: (id: string) => Promise<IQuestion>;
    restoreQuestion: (id: string) => Promise<IQuestion>;
    // Refresh
    refresh: () => Promise<void>;
}

const DEFAULT_FILTERS: IQuestionFilters = {
    search: '',
    leaseType: '',
    categoryId: '',
    difficulty: '',
    status: '',
};

export function useQuestions(): UseQuestionsReturn {
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [stats, setStats] = useState<IQuestionStats | null>(null);
    const [filters, setFiltersState] = useState<IQuestionFilters>(DEFAULT_FILTERS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadQuestions = useCallback(async (currentFilters: IQuestionFilters) => {
        setIsLoading(true);
        setError(null);
        try {
            const [data, statsData] = await Promise.all([
                questionsService.getAll(currentFilters),
                questionsService.getStats(),
            ]);
            setQuestions(data);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQuestions(filters);
    }, [filters, loadQuestions]);

    const setFilters = useCallback((newFilters: Partial<IQuestionFilters>) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
    }, []);

    const resetFilters = useCallback(() => {
        setFiltersState(DEFAULT_FILTERS);
    }, []);

    const refresh = useCallback(async () => {
        await loadQuestions(filters);
    }, [filters, loadQuestions]);

    const createQuestion = useCallback(async (data: IQuestionFormData): Promise<IQuestion> => {
        const created = await questionsService.create(data);
        await refresh();
        return created;
    }, [refresh]);

    const updateQuestion = useCallback(
        async (id: string, data: Partial<IQuestionFormData>): Promise<IQuestion> => {
            const updated = await questionsService.update(id, data);
            await refresh();
            return updated;
        },
        [refresh]
    );

    const deleteQuestion = useCallback(async (id: string): Promise<void> => {
        await questionsService.delete(id);
        await refresh();
    }, [refresh]);

    const suspendQuestion = useCallback(async (id: string): Promise<IQuestion> => {
        const updated = await questionsService.suspend(id);
        await refresh();
        return updated;
    }, [refresh]);

    const archiveQuestion = useCallback(async (id: string): Promise<IQuestion> => {
        const updated = await questionsService.archive(id);
        await refresh();
        return updated;
    }, [refresh]);

    const restoreQuestion = useCallback(async (id: string): Promise<IQuestion> => {
        const updated = await questionsService.restore(id);
        await refresh();
        return updated;
    }, [refresh]);

    return {
        questions,
        stats,
        filters,
        isLoading,
        error,
        setFilters,
        resetFilters,
        createQuestion,
        updateQuestion,
        deleteQuestion,
        suspendQuestion,
        archiveQuestion,
        restoreQuestion,
        refresh,
    };
}
