'use client';

import { PackActions } from '@/components/admin/PackActions';
import { PackFilters } from '@/components/admin/PackFilters';
import { PackModal } from '@/components/admin/PackModal';
import { PackTable } from '@/components/admin/PackTable';
import { Toast, useToast } from '@/components/admin/Toast';
import { usePacks } from '@/hooks/usePacks';
import { IPack, IPackFormData } from '@/lib/pack.types';
import React, { useState, useCallback } from 'react';

export default function AdminPacksPage() {
    const {
        packs,
        stats,
        filters,
        isLoading,
        error,
        categories,
        setFilters,
        resetFilters,
        createPack,
        updatePack,
        deletePack,
        toggleActive,
    } = usePacks();

    const [modalOpen, setModalOpen]     = useState(false);
    const [editingPack, setEditingPack] = useState<IPack | null>(null);
    const { toast, show: showToast, hide: hideToast } = useToast();

    const openCreate = useCallback(() => { setEditingPack(null); setModalOpen(true); }, []);
    const openEdit   = useCallback((p: IPack) => { setEditingPack(p); setModalOpen(true); }, []);
    const closeModal = useCallback(() => { setModalOpen(false); setEditingPack(null); }, []);

    const handleSave = useCallback(async (data: IPackFormData) => {
        if (editingPack) {
            await updatePack(editingPack.id, data);
            showToast('Pack modifié avec succès !', 'success');
        } else {
            await createPack(data);
            showToast('Pack créé avec succès !', 'success');
        }
    }, [editingPack, updatePack, createPack, showToast]);

    const handleDelete = useCallback(async (id: string) => {
        await deletePack(id);
        showToast('Pack supprimé.', 'info');
    }, [deletePack, showToast]);

    const handleToggle = useCallback(async (id: string) => {
        const updated = await toggleActive(id);
        showToast(updated.isActive ? 'Pack activé.' : 'Pack désactivé.', 'info');
    }, [toggleActive, showToast]);

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            <div className="mb-6">
                <h1 className="text-[24px] font-black text-[#172E42] mb-1">Packs</h1>
                <p className="text-[14px] font-semibold text-[#5a7a99]">
                    Créez et organisez les packs de questions par type de bail
                </p>
            </div>

            {error && (
                <div className="mb-5 px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl
                    text-[13px] font-bold text-[#EF4444] flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            <PackActions stats={stats} onCreateNew={openCreate} />
            <PackFilters filters={filters} categories={categories} onChange={setFilters} onReset={resetFilters} />

            {!isLoading && (
                <p className="text-[12px] font-bold text-[#5a7a99] mb-3">
                    {packs.length} pack{packs.length !== 1 ? 's' : ''} trouvé{packs.length !== 1 ? 's' : ''}
                </p>
            )}

            <PackTable
                packs={packs}
                isLoading={isLoading}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggle}
            />

            <PackModal
                isOpen={modalOpen}
                pack={editingPack}
                categories={categories}
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
