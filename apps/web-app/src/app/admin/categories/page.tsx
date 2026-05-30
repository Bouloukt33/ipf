'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import { Toast, useToast } from '@/components/admin/Toast';
import { useAuthStore } from '@/store/auth.store';
import { Pencil, ToggleLeft, ToggleRight, Plus } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface IAdminCategory {
    id:          string;
    name:        string;
    slug:        string;
    description: string | null;
    color:       string | null;
    iconUrl:     string | null;
    order:       number;
    isActive:    boolean;
    isPremium:   boolean;
    createdAt:   string;
    _count:      { questions: number; packs: number; themes: number };
}

// ── Service ───────────────────────────────────────────────────────────────────
const categoriesAdminService = {
    getAll: (): Promise<IAdminCategory[]> =>
        apiFetch(API_ENDPOINTS.adminCategories.list),

    create: (data: Partial<IAdminCategory>): Promise<IAdminCategory> =>
        apiFetch(API_ENDPOINTS.adminCategories.create, {
            method: 'POST', body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<IAdminCategory>): Promise<IAdminCategory> =>
        apiFetch(API_ENDPOINTS.adminCategories.update(id), {
            method: 'PUT', body: JSON.stringify(data),
        }),

    toggleActive: (id: string): Promise<IAdminCategory> =>
        apiFetch(API_ENDPOINTS.adminCategories.toggleActive(id), { method: 'POST' }),
};

// ── Constants ─────────────────────────────────────────────────────────────────
const BORDER_ORANGE = { border: '2px solid rgba(210,122,45,0.18)' };
const BORDER_FOOTER = { borderTop: '1px solid rgba(210,122,45,0.12)' };
const BG_OVERLAY    = { background: 'rgba(23,46,66,0.7)', backdropFilter: 'blur(8px)' };

const PRESET_COLORS = [
    '#D27A2D', '#1CB0F6', '#58CC02', '#CE82FF',
    '#FF4B4B', '#FFC800', '#1e3a5f', '#10B981',
];

function slugify(str: string) {
    return str.toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function CategoryModal({ cat, onClose, onSaved }: {
    cat: IAdminCategory | null;
    onClose: () => void;
    onSaved: (c: IAdminCategory) => void;
}) {
    const isEdit = !!cat;
    const [name,        setName]        = useState(cat?.name        ?? '');
    const [slug,        setSlug]        = useState(cat?.slug        ?? '');
    const [description, setDescription] = useState(cat?.description ?? '');
    const [color,       setColor]       = useState(cat?.color       ?? '#D27A2D');
    const [order,       setOrder]       = useState(cat?.order       ?? 0);
    const [isPremium,   setIsPremium]   = useState(cat?.isPremium   ?? false);
    const [slugTouched, setSlugTouched] = useState(isEdit);
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState<string | null>(null);

    const handleNameChange = (v: string) => {
        setName(v);
        if (!slugTouched) setSlug(slugify(v));
    };

    const save = async () => {
        if (!name.trim() || !slug.trim()) {
            setError('Nom et slug obligatoires');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const data = { name, slug, description: description || undefined, color, order, isPremium };
            const result = isEdit
                ? await categoriesAdminService.update(cat!.id, data)
                : await categoriesAdminService.create(data);
            onSaved(result);
            onClose();
        } catch (e: any) {
            setError(e.message ?? 'Erreur');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-8"
                style={{ animation: 'modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[20px] font-black text-[#172E42]">
                        {isEdit ? 'Modifier le type de bail' : 'Nouveau type de bail'}
                    </h2>
                    <button onClick={onClose}
                        className="w-9 h-9 rounded-full text-[#EF4444] border-none cursor-pointer font-bold flex items-center justify-center text-[18px] transition-all hover:rotate-90"
                        style={{ background: 'rgba(239,68,68,0.1)' }}>✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 px-3 py-2 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg text-[13px] font-bold text-[#EF4444]">
                        {error}
                    </div>
                )}

                {/* Nom */}
                <div className="mb-4">
                    <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Nom</label>
                    <input value={name} onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="ex : Bail commercial"
                        className="w-full h-11 px-3.5 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none font-nunito"
                        style={BORDER_ORANGE} />
                </div>

                {/* Slug */}
                <div className="mb-4">
                    <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Slug</label>
                    <input value={slug}
                        onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
                        placeholder="ex : bail-commercial"
                        className="w-full h-11 px-3.5 rounded-[11px] font-mono font-bold text-[14px] text-[#D27A2D] bg-white outline-none"
                        style={BORDER_ORANGE} />
                    <p className="text-[11px] font-semibold text-[#5a7a99] mt-1">Identifiant unique, ne pas modifier après création si des questions y sont liées.</p>
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description affichée aux utilisateurs…"
                        rows={2}
                        className="w-full px-3.5 py-3 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none resize-none font-nunito"
                        style={BORDER_ORANGE} />
                </div>

                {/* Couleur + Ordre + Premium */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="col-span-2">
                        <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Couleur</label>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-[9px] flex-shrink-0 border-2 border-[rgba(210,122,45,0.18)]" style={{ background: color }} />
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_COLORS.map((c) => (
                                    <button key={c} onClick={() => setColor(c)}
                                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${color === c ? 'border-[#172E42] scale-110' : 'border-transparent'}`}
                                        style={{ background: c }} />
                                ))}
                            </div>
                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" title="Couleur personnalisée" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-1.5">Ordre</label>
                        <input type="number" min={0} value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none font-nunito"
                            style={BORDER_ORANGE} />
                    </div>
                </div>

                {/* Premium toggle */}
                <div className="flex items-center gap-3 mb-6">
                    <button type="button" onClick={() => setIsPremium(!isPremium)}
                        className="relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none"
                        style={{ background: isPremium ? '#7C3AED' : '#E5E7EB' }}>
                        <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                            style={{ transform: isPremium ? 'translateX(24px)' : 'translateX(0)' }} />
                    </button>
                    <div>
                        <span className="text-[13px] font-bold text-[#172E42]">
                            {isPremium ? 'Premium 🔒' : 'Gratuit 🆓'}
                        </span>
                        <p className="text-[11px] font-semibold text-[#5a7a99]">
                            {isPremium ? 'Réservé aux abonnés payants' : 'Accessible à tous les utilisateurs'}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-5" style={BORDER_FOOTER}>
                    <button onClick={onClose}
                        className="h-11 px-6 rounded-[12px] bg-white font-extrabold text-[14px] text-[#172E42] cursor-pointer font-nunito hover:text-[#D27A2D] transition-all"
                        style={BORDER_ORANGE}>
                        Annuler
                    </button>
                    <button onClick={save} disabled={saving}
                        className="h-11 px-7 rounded-[12px] border-none bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] font-extrabold text-[14px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {saving
                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement…</>
                            : <><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Enregistrer</>
                        }
                    </button>
                </div>
            </div>
            <style jsx>{`@keyframes modalPop { from{opacity:0;transform:scale(0.92) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
        </div>
    );
}

// ── Category row ──────────────────────────────────────────────────────────────
function CategoryRow({ cat, isEven, onEdit, onToggle }: {
    cat: IAdminCategory; isEven: boolean;
    onEdit: () => void; onToggle: () => void;
}) {
    return (
        <tr className={`border-b border-[rgba(210,122,45,0.08)] transition-colors hover:bg-[rgba(210,122,45,0.04)] ${isEven ? 'bg-white' : 'bg-[#fafaf9]'}`}>

            {/* Couleur + Nom */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-8 rounded-full flex-shrink-0" style={{ background: cat.color ?? '#D27A2D' }} />
                    <div>
                        <p className="text-[13.5px] font-bold text-[#172E42]">{cat.name}</p>
                        <span className="font-mono text-[11px] font-extrabold text-[#D27A2D] bg-[rgba(210,122,45,0.1)] px-1.5 py-0.5 rounded">
                            {cat.slug}
                        </span>
                    </div>
                </div>
            </td>

            {/* Description */}
            <td className="px-4 py-3">
                <span className="text-[12px] font-semibold text-[#5a7a99] line-clamp-1">
                    {cat.description ?? '—'}
                </span>
            </td>

            {/* Accès */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                    cat.isPremium
                        ? 'text-[#7C3AED] bg-[rgba(124,58,237,0.1)]'
                        : 'text-[#10B981] bg-[rgba(16,185,129,0.1)]'
                }`}>
                    {cat.isPremium ? '🔒 Premium' : '🆓 Gratuit'}
                </span>
            </td>

            {/* Stats */}
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-[#172E42]">{cat._count?.questions ?? 0} questions</span>
                    <span className="text-[11px] font-semibold text-[#5a7a99]">{cat._count?.packs ?? 0} packs · {cat._count?.themes ?? 0} thèmes</span>
                </div>
            </td>

            {/* Ordre */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[13px] font-bold text-[#5a7a99]">#{cat.order}</span>
            </td>

            {/* Statut */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1.5 text-[12px] font-extrabold px-2.5 py-1 rounded-full ${
                    cat.isActive
                        ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)]'
                        : 'text-[#6B7280] bg-[rgba(107,114,128,0.1)]'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-[#10B981]' : 'bg-[#6B7280]'}`} />
                    {cat.isActive ? 'Actif' : 'Inactif'}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <button onClick={onEdit} title="Modifier"
                        className="w-[34px] h-[34px] rounded-[9px] bg-[rgba(30,58,95,0.08)] text-[#1e3a5f] hover:bg-[rgba(30,58,95,0.18)] flex items-center justify-center border-none cursor-pointer transition-all">
                        <Pencil size={15} strokeWidth={2.2} />
                    </button>
                    <button onClick={onToggle} title={cat.isActive ? 'Désactiver' : 'Activer'}
                        className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center border-none cursor-pointer transition-all ${
                            cat.isActive
                                ? 'bg-[rgba(245,158,11,0.08)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.18)]'
                                : 'bg-[rgba(16,185,129,0.08)] text-[#10B981] hover:bg-[rgba(16,185,129,0.18)]'
                        }`}>
                        {cat.isActive ? <ToggleLeft size={17} strokeWidth={2.2} /> : <ToggleRight size={17} strokeWidth={2.2} />}
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
const COLS = ['Nom / Slug', 'Description', 'Accès', 'Contenu', 'Ordre', 'Statut', 'Actions'];

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<IAdminCategory[]>([]);
    const [editing,    setEditing]    = useState<IAdminCategory | null | 'new'>('new' as any);
    const [modalOpen,  setModalOpen]  = useState(false);
    const [isLoading,  setLoading]    = useState(false);
    const { toast, show: showToast, hide: hideToast } = useToast();

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        setLoading(true);
        categoriesAdminService.getAll().then(setCategories).finally(() => setLoading(false));
    }, [authLoading, accessToken]);

    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const openEdit   = (cat: IAdminCategory) => { setEditing(cat); setModalOpen(true); };

    const handleSaved = useCallback((updated: IAdminCategory) => {
        setCategories((prev) => {
            const exists = prev.find((c) => c.id === updated.id);
            return exists
                ? prev.map((c) => c.id === updated.id ? updated : c)
                : [...prev, updated].sort((a, b) => a.order - b.order);
        });
        showToast(editing ? 'Type de bail modifié !' : 'Type de bail créé !', 'success');
    }, [editing, showToast]);

    const handleToggle = useCallback(async (cat: IAdminCategory) => {
        try {
            const updated = await categoriesAdminService.toggleActive(cat.id);
            setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, isActive: updated.isActive } : c));
            showToast(updated.isActive ? 'Catégorie activée.' : 'Catégorie désactivée.', 'info');
        } catch (e: any) {
            showToast(e.message ?? 'Erreur', 'error');
        }
    }, [showToast]);

    const active   = categories.filter((c) => c.isActive).length;
    const premium  = categories.filter((c) => c.isPremium).length;
    const inactive = categories.filter((c) => !c.isActive).length;

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[24px] font-black text-[#172E42] mb-1">Types de baux</h1>
                    <p className="text-[14px] font-semibold text-[#5a7a99]">Gérez les catégories de questions disponibles sur la plateforme</p>
                </div>
                <button onClick={openCreate}
                    className="h-[42px] px-5 rounded-[12px] border-none bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] font-extrabold text-[13px] text-white cursor-pointer flex items-center gap-2 hover:shadow-lg hover:shadow-[rgba(210,122,45,0.3)] hover:-translate-y-px transition-all">
                    <Plus size={16} strokeWidth={2.5} />Nouveau type de bail
                </button>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-2 mb-6">
                {[
                    { label: 'Total',    value: categories.length, color: 'text-[#172E42] bg-[rgba(30,58,95,0.08)]' },
                    { label: 'Actifs',   value: active,   color: 'text-[#10B981] bg-[rgba(16,185,129,0.1)]' },
                    { label: 'Inactifs', value: inactive, color: 'text-[#6B7280] bg-[rgba(107,114,128,0.1)]' },
                    { label: 'Premium',  value: premium,  color: 'text-[#7C3AED] bg-[rgba(124,58,237,0.1)]' },
                ].map(({ label, value, color }) => (
                    <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${color}`}>
                        <span className="text-[13px] font-extrabold">{value}</span>
                        <span className="text-[11px] font-bold">{label}</span>
                    </div>
                ))}
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-3 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border-[1.5px] border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>{COLS.map((c) => (
                                    <th key={c} className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-[#5a7a99] border-b-2 border-[rgba(210,122,45,0.15)] bg-[#fafaf9] whitespace-nowrap">{c}</th>
                                ))}</tr>
                            </thead>
                            <tbody>
                                {categories.map((cat, idx) => (
                                    <CategoryRow
                                        key={cat.id}
                                        cat={cat}
                                        isEven={idx % 2 === 0}
                                        onEdit={() => openEdit(cat)}
                                        onToggle={() => handleToggle(cat)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalOpen && (
                <CategoryModal
                    cat={editing as IAdminCategory | null}
                    onClose={() => { setModalOpen(false); setEditing(null); }}
                    onSaved={handleSaved}
                />
            )}

            <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onHide={hideToast} />
        </div>
    );
}
