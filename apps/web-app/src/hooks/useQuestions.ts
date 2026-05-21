'use client';

import { IQuestion, IQuestionFilters, IQuestionFormData, IQuestionStats } from '@/lib/question.types';
import { questionsService } from '@/services/questions.service';
import { useAuthStore } from '@/store/auth.store';
import { useState, useEffect, useCallback } from 'react';

const ITEMS_PER_PAGE = 10;

interface UseQuestionsReturn {
    questions: IQuestion[];
    stats: IQuestionStats | null;
    filters: IQuestionFilters;
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    total: number;
    setPage: (page: number) => void;
    setFilters: (filters: Partial<IQuestionFilters>) => void;
    resetFilters: () => void;
    createQuestion: (data: IQuestionFormData) => Promise<IQuestion>;
    updateQuestion: (id: string, data: Partial<IQuestionFormData>) => Promise<IQuestion>;
    deleteQuestion: (id: string) => Promise<void>;
    suspendQuestion: (id: string) => Promise<IQuestion>;
    archiveQuestion: (id: string) => Promise<IQuestion>;
    restoreQuestion: (id: string) => Promise<IQuestion>;
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
    const [questions, setQuestions]  = useState<IQuestion[]>([]);
    const [stats, setStats]          = useState<IQuestionStats | null>(null);
    const [filters, setFiltersState] = useState<IQuestionFilters>(DEFAULT_FILTERS);
    const [isLoading, setIsLoading]  = useState(false);
    const [error, setError]          = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal]             = useState(0);
    const [totalPages, setTotalPages]   = useState(1);

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    const loadQuestions = useCallback(async (currentFilters: IQuestionFilters, page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const [{ data, total: count, totalPages: pages }, statsData] = await Promise.all([
                questionsService.getAll(currentFilters, page, ITEMS_PER_PAGE),
                questionsService.getStats(),
            ]);
            setQuestions(data);
            setTotal(count);
            setTotalPages(pages);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        loadQuestions(filters, currentPage);
    }, [filters, currentPage, loadQuestions, authLoading, accessToken]);

    const setFilters = useCallback((newFilters: Partial<IQuestionFilters>) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
        setCurrentPage(1);
    }, []);

    const resetFilters = useCallback(() => {
        setFiltersState(DEFAULT_FILTERS);
        setCurrentPage(1);
    }, []);

    const setPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    }, [totalPages]);

    const refresh = useCallback(async () => {
        await loadQuestions(filters, currentPage);
    }, [filters, currentPage, loadQuestions]);

    const createQuestion = useCallback(async (data: IQuestionFormData): Promise<IQuestion> => {
        const created = await questionsService.create(data);
        await refresh();
        return created;
    }, [refresh]);

    const updateQuestion = useCallback(async (id: string, data: Partial<IQuestionFormData>): Promise<IQuestion> => {
        const updated = await questionsService.update(id, data);
        await refresh();
        return updated;
    }, [refresh]);

    const deleteQuestion = useCallback(async (id: string): Promise<void> => {
        await questionsService.delete(id);
        const newTotal = total - 1;
        const maxPage = Math.max(1, Math.ceil(newTotal / ITEMS_PER_PAGE));
        const nextPage = Math.min(currentPage, maxPage);
        setCurrentPage(nextPage);
        await loadQuestions(filters, nextPage);
    }, [filters, currentPage, total, loadQuestions]);

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
        currentPage,
        totalPages,
        total,
        setPage,
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