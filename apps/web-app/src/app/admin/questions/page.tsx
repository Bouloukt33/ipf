'use client';

import { QuestionActions } from '@/components/admin/QuestionActions';
import { QuestionFilters } from '@/components/admin/QuestionFilters';
import { QuestionModal } from '@/components/admin/QuestionModal';
import { QuestionTable } from '@/components/admin/QuestionTable';
import { Toast, useToast } from '@/components/admin/Toast';
import { useQuestions } from '@/hooks/useQuestions';
import { IQuestion, IQuestionFormData } from '@/lib/question.types';
import { IPack } from '@/lib/pack.types';
import { packsService } from '@/services/packs.service';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import React, { useState, useCallback, useEffect } from 'react';

export default function AdminQuestionsPage() {
    const {
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
        categories
    } = useQuestions();

    const [packs, setPacks] = useState<IPack[]>([]);
    useEffect(() => { packsService.getAll({ }).then(setPacks).catch(() => {}); }, []);

    const [modalOpen, setModalOpen]             = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);
    const { toast, show: showToast, hide: hideToast } = useToast();

    const openCreate = useCallback(() => { setEditingQuestion(null); setModalOpen(true); }, []);
    const openEdit   = useCallback((q: IQuestion) => { setEditingQuestion(q); setModalOpen(true); }, []);
    const closeModal = useCallback(() => { setModalOpen(false); setEditingQuestion(null); }, []);

    const handleSave = useCallback(async (data: IQuestionFormData) => {
        if (editingQuestion) {
            await updateQuestion(editingQuestion.id, data);
            showToast('Question modifiée avec succès !', 'success');
        } else {
            await createQuestion(data);
            showToast('Question créée avec succès !', 'success');
        }
    }, [editingQuestion, updateQuestion, createQuestion, showToast]);

    const handleDelete  = useCallback(async (id: string) => { await deleteQuestion(id);  showToast('Question supprimée.', 'info'); },    [deleteQuestion, showToast]);
    const handleSuspend = useCallback(async (id: string) => { await suspendQuestion(id); showToast('Question suspendue.', 'info'); },    [suspendQuestion, showToast]);
    const handleArchive = useCallback(async (id: string) => { await archiveQuestion(id); showToast('Question archivée.', 'info'); },    [archiveQuestion, showToast]);
    const handleRestore = useCallback(async (id: string) => { await restoreQuestion(id); showToast('Question réactivée.', 'success'); }, [restoreQuestion, showToast]);

    // Build page numbers with ellipsis
    const getPageNumbers = (): (number | '…')[] => {
        const pages: (number | '…')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('…');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('…');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            <div className="mb-6">
                <h1 className="text-[24px] font-black text-[#172E42] mb-1">Questions / Quiz</h1>
                <p className="text-[14px] font-semibold text-[#5a7a99]">
                    Gérez vos questions, leurs associations et leurs statuts
                </p>
            </div>

            {error && (
                <div className="mb-5 px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl
                    text-[13px] font-bold text-[#EF4444] flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            <QuestionActions stats={stats} onCreateNew={openCreate} />
            <QuestionFilters categories={categories} filters={filters} onChange={setFilters} onReset={resetFilters} />

            {!isLoading && (
                <p className="text-[12px] font-bold text-[#5a7a99] mb-3">
                    {total} question{total !== 1 ? 's' : ''} trouvée{total !== 1 ? 's' : ''}
                </p>
            )}

            <QuestionTable
                questions={questions}
                isLoading={isLoading}
                onEdit={openEdit}
                categories={categories}
                packs={packs}
                onDelete={handleDelete}
                onSuspend={handleSuspend}
                onArchive={handleArchive}
                onRestore={handleRestore}
            />

            {/* Shadcn Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-7 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(currentPage - 1)}
                                    aria-disabled={currentPage === 1}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            {getPageNumbers().map((page, idx) =>
                                page === '…' ? (
                                    <PaginationItem key={`ellipsis-${idx}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => setPage(page as number)}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ),
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(currentPage + 1)}
                                    aria-disabled={currentPage === totalPages}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <QuestionModal
                isOpen={modalOpen}
                question={editingQuestion}
                categories={categories}
                packs={packs}
                onClose={closeModal}
                onSave={handleSave}
            />

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onHide={hideToast}
            />
        </div>
    );
}