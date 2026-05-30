import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { ICategory, IQuestion, IQuestionFilters, IQuestionFormData, IQuestionStats } from '../lib/types';
import { questionsService } from '../services/questions.service';
import { categoriesService } from '../services/categories.service';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

const ITEMS_PER_PAGE = 50;

interface UseQuestionsReturn {
    questions: IQuestion[];
    stats: IQuestionStats | null;
    filters: IQuestionFilters;
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    categories: ICategory[];
    total: number;
    setPage: (page: number) => void;
    setFilters: (filters: Partial<IQuestionFilters>) => void;
    resetFilters: () => void;
    createQuestion: (data: IQuestionFormData) => Promise<IQuestion>;
    updateQuestion: (id: string, data: Partial<IQuestionFormData>) => Promise<IQuestion>;
    deleteQuestion: (id: string) => Promise<void>;
    updateStatus: (id: string, status: string) => Promise<IQuestion>;
    refresh: () => Promise<void>;
}

const DEFAULT_FILTERS: IQuestionFilters = {
    search: '',
    categoryId: '',
    themeId: '',
    level: '',
    status: '',
};

export function useQuestions(): UseQuestionsReturn {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [stats, setStats] = useState<IQuestionStats | null>(null);
    const [filters, setFiltersState] = useState<IQuestionFilters>(DEFAULT_FILTERS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const getToken = useCallback(() => getAccessTokenSilently({
        authorizationParams: {
            audience: ENV.auth0Audience,
            scope: AUTH0_SCOPE,
        }
    }), [getAccessTokenSilently]);

    const loadQuestions = useCallback(async (currentFilters: IQuestionFilters, page: number) => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const [paginatedData, statsData] = await Promise.all([
                questionsService.getAll(token, currentFilters, page, ITEMS_PER_PAGE),
                questionsService.getStats(token),
            ]);
            setQuestions(paginatedData.data);
            setTotal(paginatedData.total);
            setTotalPages(paginatedData.totalPages);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, getToken]);

    const loadCategories = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const token = await getToken();
            const cats = await categoriesService.getCategories(token);
            setCategories(cats);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    }, [isAuthenticated, getToken]);

    useEffect(() => {
        loadQuestions(filters, currentPage);
        loadCategories();
    }, [filters, currentPage, loadQuestions, loadCategories]);

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
        const token = await getToken();
        const created = await questionsService.create(token, data);
        await refresh();
        return created;
    }, [getToken, refresh]);

    const updateQuestion = useCallback(async (id: string, data: Partial<IQuestionFormData>): Promise<IQuestion> => {
        const token = await getToken();
        const updated = await questionsService.update(token, id, data);
        await refresh();
        return updated;
    }, [getToken, refresh]);

    const deleteQuestion = useCallback(async (id: string): Promise<void> => {
        const token = await getToken();
        await questionsService.delete(token, id);
        await refresh();
    }, [getToken, refresh]);

    const updateStatus = useCallback(async (id: string, status: string): Promise<IQuestion> => {
        const token = await getToken();
        const updated = await questionsService.updateStatus(token, id, status);
        await refresh();
        return updated;
    }, [getToken, refresh]);

    return {
        questions,
        categories,
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
        updateStatus,
        refresh,
    };
}
