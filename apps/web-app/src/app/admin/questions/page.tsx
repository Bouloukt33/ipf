'use client';

import { QuestionActions } from '@/components/admin/QuestionActions';
import { QuestionFilters } from '@/components/admin/QuestionFilters';
import { QuestionModal } from '@/components/admin/QuestionModal';
import { QuestionTable } from '@/components/admin/QuestionTable';
import { Toast, useToast } from '@/components/admin/Toast';
import { useQuestions } from '@/hooks/useQuestions';
import { IQuestion, IQuestionFormData } from '@/lib/question.types';
import React, { useState, useCallback } from 'react';

const ITEMS_PER_PAGE = 10;

export default function AdminQuestionsPage() {
    const {
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
    } = useQuestions();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Toast
    const { toast, show: showToast, hide: hideToast } = useToast();

    // ── Pagination logic ──────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(questions.length / ITEMS_PER_PAGE));
    const paginatedQuestions = questions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // ── Modal handlers ────────────────────────────────────────────────────────
    const openCreate = useCallback(() => {
        setEditingQuestion(null);
        setModalOpen(true);
    }, []);

    const openEdit = useCallback((question: IQuestion) => {
        setEditingQuestion(question);
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingQuestion(null);
    }, []);

    const handleSave = useCallback(
        async (data: IQuestionFormData) => {
            if (editingQuestion) {
                await updateQuestion(editingQuestion.id, data);
                showToast('Question modifiée avec succès !', 'success');
            } else {
                await createQuestion(data);
                showToast('Question créée avec succès !', 'success');
            }
            setCurrentPage(1);
        },
        [editingQuestion, updateQuestion, createQuestion, showToast]
    );

    // ── CRUD action handlers ──────────────────────────────────────────────────
    const handleDelete = useCallback(
        async (id: string) => {
            await deleteQuestion(id);
            showToast('Question supprimée.', 'info');
        },
        [deleteQuestion, showToast]
    );

    const handleSuspend = useCallback(
        async (id: string) => {
            await suspendQuestion(id);
            showToast('Question suspendue.', 'info');
        },
        [suspendQuestion, showToast]
    );

    const handleArchive = useCallback(
        async (id: string) => {
            await archiveQuestion(id);
            showToast('Question archivée.', 'info');
        },
        [archiveQuestion, showToast]
    );

    const handleRestore = useCallback(
        async (id: string) => {
            await restoreQuestion(id);
            showToast('Question réactivée.', 'success');
        },
        [restoreQuestion, showToast]
    );

    // ── Pagination pages array ────────────────────────────────────────────────
    const getPageNumbers = () => {
        const pages: (number | '…')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('…');
            for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
            ) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('…');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-[24px] font-black text-[#172E42] mb-1">Questions / Quiz</h1>
                <p className="text-[14px] font-semibold text-[#5a7a99]">
                    Gérez vos questions, leurs associations et leurs statuts
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-5 px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl
          text-[13px] font-bold text-[#EF4444] flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Stats + CTA */}
            <QuestionActions stats={stats} onCreateNew={openCreate} />

            {/* Filters */}
            <QuestionFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

            {/* Results count */}
            {!isLoading && (
                <p className="text-[12px] font-bold text-[#5a7a99] mb-3">
                    {questions.length} question{questions.length !== 1 ? 's' : ''} trouvée
                    {questions.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* Table */}
            <QuestionTable
                questions={paginatedQuestions}
                isLoading={isLoading}
                onEdit={openEdit}
                onDelete={handleDelete}
                onSuspend={handleSuspend}
                onArchive={handleArchive}
                onRestore={handleRestore}
            />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-7">
                    {/* Prev */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-9 h-9 rounded-[9px] border-[1.5px] border-[rgba(210,122,45,0.18)] bg-white
              text-[#172E42] font-extrabold text-[13px] cursor-pointer flex items-center justify-center
              hover:border-[#D27A2D] hover:text-[#D27A2D] transition-all
              disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ‹
                    </button>

                    {getPageNumbers().map((page, idx) =>
                        page === '…' ? (
                            <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-[#5a7a99] font-bold">
                                …
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page as number)}
                                className={`w-9 h-9 rounded-[9px] border-[1.5px] font-extrabold text-[13px] cursor-pointer
                  flex items-center justify-center transition-all
                  ${currentPage === page
                                        ? 'bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] border-transparent text-white'
                                        : 'border-[rgba(210,122,45,0.18)] bg-white text-[#172E42] hover:border-[#D27A2D] hover:text-[#D27A2D]'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}

                    {/* Next */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 rounded-[9px] border-[1.5px] border-[rgba(210,122,45,0.18)] bg-white
              text-[#172E42] font-extrabold text-[13px] cursor-pointer flex items-center justify-center
              hover:border-[#D27A2D] hover:text-[#D27A2D] transition-all
              disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ›
                    </button>
                </div>
            )}

            {/* Modal */}
            <QuestionModal
                isOpen={modalOpen}
                question={editingQuestion}
                onClose={closeModal}
                onSave={handleSave}
            />

            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onHide={hideToast}
            />
        </div>
    );
}
