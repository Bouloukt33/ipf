import { useState, useCallback, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuestions } from '../hooks/useQuestions';
import type { IQuestion, IQuestionFormData, IPack } from '../lib/types';
import { packsService } from '../services/packs.service';
import { QuestionActions } from '../components/admin/QuestionActions';
import { QuestionFilters } from '../components/admin/QuestionFilters';
import { QuestionModal } from '../components/admin/QuestionModal';
import { QuestionTable } from '../components/admin/QuestionTable';
import { Toast, useToast } from '../components/admin/Toast';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';

export function AdminQuestionsPage() {
    const { getAccessTokenSilently } = useAuth0();
    const {
        questions,
        stats,
        filters,
        isLoading,
        error,
        currentPage,
        totalPages,
        pageSize,
        total,
        setPage,
        setFilters,
        resetFilters,
        createQuestion,
        updateQuestion,
        deleteQuestion,
        updateStatus,
        categories
    } = useQuestions();

    const [packs, setPacks] = useState<IPack[]>([]);
    
    const loadPacks = useCallback(async () => {
        try {
            const token = await getAccessTokenSilently({
                authorizationParams: {
                    audience: ENV.auth0Audience,
                    scope: AUTH0_SCOPE,
                }
            });
            const data = await packsService.getAll(token);
            setPacks(data);
        } catch (err) {
            console.error('Failed to load packs:', err);
        }
    }, [getAccessTokenSilently]);

    useEffect(() => { loadPacks(); }, [loadPacks]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);
    const { toast, show: showToast, hide: hideToast } = useToast();

    const openCreate = useCallback(() => { setEditingQuestion(null); setModalOpen(true); }, []);
    const openEdit   = useCallback((q: IQuestion) => { setEditingQuestion(q); setModalOpen(true); }, []);
    const closeModal = useCallback(() => { setModalOpen(false); setEditingQuestion(null); }, []);

    const handleSave = useCallback(async (data: IQuestionFormData) => {
        try {
            if (editingQuestion) {
                await updateQuestion(editingQuestion.id, data);
                showToast('Question modifiée avec succès !', 'success');
            } else {
                await createQuestion(data);
                showToast('Question créée avec succès !', 'success');
            }
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de la sauvegarde', 'error');
        }
    }, [editingQuestion, updateQuestion, createQuestion, showToast]);

    const handleDelete  = useCallback(async (id: string) => { 
        try { await deleteQuestion(id); showToast('Question supprimée.', 'info'); } 
        catch (err: any) { showToast(err.message, 'error'); }
    }, [deleteQuestion, showToast]);

    const handleStatus = useCallback(async (id: string, status: string) => {
        try { 
            await updateStatus(id, status); 
            const msg = status === 'ACTIVE' ? 'Question réactivée.' : status === 'SUSPENDED' ? 'Question suspendue.' : 'Question archivée.';
            showToast(msg, status === 'ACTIVE' ? 'success' : 'info'); 
        } catch (err: any) { showToast(err.message, 'error'); }
    }, [updateStatus, showToast]);

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
                startIndex={(currentPage - 1) * pageSize}
                isLoading={isLoading}
                onEdit={openEdit}
                packs={packs}
                onDelete={handleDelete}
                onSuspend={(id) => handleStatus(id, 'SUSPENDED')}
                onArchive={(id) => handleStatus(id, 'ARCHIVED')}
                onRestore={(id) => handleStatus(id, 'ACTIVE')}
            />

            {/* Pagination simple pour le moment */}
            {!isLoading && totalPages > 1 && (
                <div className="mt-7 flex justify-center gap-2">
                    <button 
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                        Précédent
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-[#172E42]">
                        Page {currentPage} sur {totalPages}
                    </span>
                    <button 
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                        Suivant
                    </button>
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
