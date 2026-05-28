import { api, PackData, PackWithQuestions, CreatePackPayload, UpdatePackPayload, PackType } from '@/lib/api';

export type { PackData, PackWithQuestions, PackType };

export const packsService = {
    getAll: (params?: { categoryId?: string; type?: PackType; isFree?: boolean }) =>
        api.packs.list(params),

    getById: (id: string) =>
        api.packs.get(id),

    getBySlug: (categorySlug: string, packSlug: string) =>
        api.packs.bySlug(categorySlug, packSlug),

    getVisiteur: () =>
        api.packs.list({ type: 'VISITEUR', isFree: true }),

    create: (data: CreatePackPayload) =>
        api.packs.create(data),

    update: (id: string, data: UpdatePackPayload) =>
        api.packs.update(id, data),

    delete: (id: string) =>
        api.packs.delete(id),

    toggleActive: (id: string) =>
        api.packs.toggleActive(id),

    addQuestions: (id: string, questionIds: string[]) =>
        api.packs.addQuestions(id, questionIds),

    removeQuestion: (id: string, questionId: string) =>
        api.packs.removeQuestion(id, questionId),
};
