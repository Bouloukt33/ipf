'use client';

import React from 'react';
import { UserAnalyticsFilters } from '@/components/admin/UserAnalyticsFilters';
import { UserAnalyticsTable } from '@/components/admin/UserAnalyticsTable';
import { Toast, useToast } from '@/components/admin/Toast';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import {
    Pagination, PaginationContent, PaginationEllipsis,
    PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';

export default function AdminUsersPage() {
    const {
        users, filters, isLoading, error,
        currentPage, totalPages, total,
        setPage, setFilters, resetFilters,
    } = useUserAnalytics();

    const { toast, hide: hideToast } = useToast();

    const getPageNumbers = (): (number | '…')[] => {
        const pages: (number | '…')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('…');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('…');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            <div className="mb-6">
                <h1 className="text-[24px] font-black text-[#172E42] mb-1">Utilisateurs</h1>
                <p className="text-[14px] font-semibold text-[#5a7a99]">
                    Analytics détaillées — profil, performance et engagement
                </p>
            </div>

            {error && (
                <div className="mb-5 px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl
                    text-[13px] font-bold text-[#EF4444] flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            <UserAnalyticsFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

            {!isLoading && (
                <p className="text-[12px] font-bold text-[#5a7a99] mb-3">
                    {total} utilisateur{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
                </p>
            )}

            <UserAnalyticsTable users={users} isLoading={isLoading} />

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
                                    <PaginationItem key={`e-${idx}`}><PaginationEllipsis /></PaginationItem>
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

            <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onHide={hideToast} />
        </div>
    );
}
