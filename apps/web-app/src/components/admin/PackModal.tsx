'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IPack, IPackFormData, PackType, PACK_TYPE_LABELS } from '@/lib/pack.types';
import { ICategory } from '@/lib/question.types';
import { packsService } from '@/services/packs.service';
import { apiFetch } from '@/lib/api.fetch';
import { API_ENDPOINTS } from '@/lib/api.config';
import { Trash2, Plus, Search } from 'lucide-react';

interface PackModalProps {
    isOpen:     boolean;
    pack:       IPack | null;
    categories: ICategory[];
    onClose:    () => void;
    onSave:     (data: IPackFormData) => Promise<void>;
}

interface IPackQuestion {
    id:        string;
    text:      string;
    level:     number;
    isPremium: boolean;
    isActive:  boolean;
    theme:     { name: string } | null;
}

const EMPTY_FORM: IPackFormData = {
    name: '', slug: '', categoryId: '', description: '',
    type: 'STANDARD', isFree: false, price: '', order: 0, isActive: true,
};

const BORDER_ORANGE        = { border: '2px solid rgba(210,122,45,0.18)' };
const BORDER_ORANGE_FOOTER = { borderTop: '1px solid rgba(210,122,45,0.12)' };
const BORDER_RED           = { border: '2px solid #EF4444' };
const BG_OVERLAY           = { background: 'rgba(23,46,66,0.7)', backdropFilter: 'blur(8px)' };
const DIFFICULTY_LABELS: Record<number, string> = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile', 4: 'Étude de cas' };
const DIFFICULTY_COLORS: Record<number, string> = {
    1: 'text-[#10B981] bg-[rgba(16,185,129,0.1)]',
    2: 'text-[#D27A2D] bg-[rgba(210,122,45,0.1)]',
    3: 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]',
    4: 'text-[#7C3AED] bg-[rgba(124,58,237,0.1)]',
};

function slugify(str: string): string {
    return str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function truncate(str: string, n = 80) {
    return str.length > n ? str.slice(0, n) + '…' : str;
}

export function PackModal({ isOpen, pack, categories, onClose, onSave }: PackModalProps) {
    const [tab,          setTab]          = useState<'info' | 'questions'>('info');
    const [form,         setForm]         = useState<IPackFormData>(EMPTY_FORM);
    const [isSaving,     setIsSaving]     = useState(false);
    const [errors,       setErrors]       = useState<Partial<Record<keyof IPackFormData, string>>>({});
    const [slugTouched,  setSlugTouched]  = useState(false);

    // Questions tab state
    const [packQuestions,  setPackQuestions]  = useState<IPackQuestion[]>([]);
    const [searchResults,  setSearchResults]  = useState<IPackQuestion[]>([]);
    const [searchQuery,    setSearchQuery]    = useState('');
    const [loadingQ,       setLoadingQ]       = useState(false);
    const [removing,       setRemoving]       = useState<string | null>(null);
    const [adding,         setAdding]         = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setTab('info');
        setSearchQuery('');
        setSearchResults([]);
        if (pack) {
            setForm({
                name: pack.name, slug: pack.slug, categoryId: pack.categoryId,
                description: pack.description ?? '', type: pack.type,
                isFree: pack.isFree, price: pack.price ?? '', order: pack.order, isActive: pack.isActive,
            });
            setSlugTouched(true);
        } else {
            setForm(EMPTY_FORM);
            setSlugTouched(false);
        }
        setErrors({});
    }, [isOpen, pack]);

    // Charger les questions du pack quand on ouvre l'onglet Questions
    useEffect(() => {
        if (tab !== 'questions' || !pack) return;
        setLoadingQ(true);
        packsService.getById(pack.id)
            .then((p: any) => setPackQuestions(p.questions ?? []))
            .finally(() => setLoadingQ(false));
    }, [tab, pack]);

    // Rechercher des questions disponibles
    const search = useCallback(async (q: string) => {
        if (!pack?.categoryId) return;
        const params = new URLSearchParams({ categoryId: pack.categoryId, limit: '30', page: '1' });
        if (q.trim()) params.set('search', q.trim());
        const res: any = await apiFetch(`${API_ENDPOINTS.questions.list}?${params}`);
        const all: IPackQuestion[] = res.data ?? res;
        const packIds = new Set(packQuestions.map((pq) => pq.id));
        setSearchResults(all.filter((q) => !packIds.has(q.id)));
    }, [pack?.categoryId, packQuestions]);

    useEffect(() => {
        if (tab !== 'questions' || !pack) return;
        const timer = setTimeout(() => search(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery, tab, pack, search]);

    const handleRemoveQuestion = async (questionId: string) => {
        if (!pack) return;
        setRemoving(questionId);
        try {
            await packsService.removeQuestion(pack.id, questionId);
            setPackQuestions((prev) => prev.filter((q) => q.id !== questionId));
            setSearchResults((prev) => {
                const removed = packQuestions.find((q) => q.id === questionId);
                return removed ? [...prev, removed] : prev;
            });
        } finally { setRemoving(null); }
    };

    const handleAddQuestion = async (question: IPackQuestion) => {
        if (!pack) return;
        setAdding(question.id);
        try {
            await packsService.addQuestions(pack.id, [question.id]);
            setPackQuestions((prev) => [...prev, question]);
            setSearchResults((prev) => prev.filter((q) => q.id !== question.id));
        } finally { setAdding(null); }
    };

    const update = <K extends keyof IPackFormData>(key: K, value: IPackFormData[K]) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (key === 'name' && !slugTouched) next.slug = slugify(value as string);
            return next;
        });
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = () => {
        const e: Partial<Record<keyof IPackFormData, string>> = {};
        if (!form.name.trim())      e.name       = 'Le nom est obligatoire';
        if (!form.slug.trim())      e.slug       = 'Le slug (PackID) est obligatoire';
        if (!form.categoryId)       e.categoryId = 'La catégorie est obligatoire';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSaving(true);
        try { await onSave(form); onClose(); }
        finally { setIsSaving(false); }
    };

    if (!isOpen) return null;
    const isEdit = !!pack;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[680px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col"
                style={{ animation: 'modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-0">
                    <div>
                        <h2 className="text-[20px] font-black text-[#172E42]">
                            {isEdit ? 'Modifier le pack' : 'Nouveau pack'}
                        </h2>
                        {isEdit && <p className="text-[12px] font-bold text-[#5a7a99] mt-0.5">Slug : <span className="font-mono text-[#D27A2D]">{pack.slug}</span></p>}
                    </div>
                    <button onClick={onClose}
                        className="w-9 h-9 rounded-full text-[#EF4444] border-none cursor-pointer font-bold flex items-center justify-center text-[18px] transition-all hover:rotate-90"
                        style={{ background: 'rgba(239,68,68,0.1)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,66,0.1)'; e.currentTarget.style.color = '#EF4444'; }}>
                        ✕
                    </button>
                </div>

                {/* Tabs — seulement en mode édition */}
                {isEdit && (
                    <div className="flex gap-1 px-8 mt-5 border-b border-[rgba(210,122,45,0.1)]">
                        {(['info', 'questions'] as const).map((t) => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`h-9 px-4 rounded-t-[8px] font-extrabold text-[13px] border-none cursor-pointer transition-all ${
                                    tab === t
                                        ? 'bg-[rgba(210,122,45,0.08)] text-[#D27A2D] border-b-2 border-[#D27A2D]'
                                        : 'bg-transparent text-[#5a7a99] hover:text-[#172E42]'
                                }`}>
                                {t === 'info' ? 'Informations' : `Questions (${packQuestions.length})`}
                            </button>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6">

                    {/* ── Tab : Informations ── */}
                    {tab === 'info' && (
                        <>
                            <div className="mb-4">
                                <Label>Nom du pack</Label>
                                <input value={form.name} onChange={(e) => update('name', e.target.value)}
                                    placeholder="ex : Pack Découverte — Bail commercial"
                                    className="w-full h-11 px-3.5 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none font-nunito"
                                    style={errors.name ? BORDER_RED : BORDER_ORANGE} />
                                {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
                            </div>

                            <div className="mb-4">
                                <Label>Slug (PackID)</Label>
                                <input value={form.slug}
                                    onChange={(e) => { setSlugTouched(true); update('slug', e.target.value); }}
                                    placeholder="ex : visiteur"
                                    className="w-full h-11 px-3.5 rounded-[11px] font-mono font-bold text-[14px] text-[#D27A2D] bg-white outline-none"
                                    style={errors.slug ? BORDER_RED : BORDER_ORANGE} />
                                {errors.slug && <ErrorMsg>{errors.slug}</ErrorMsg>}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <Label>Catégorie (type de bail)</Label>
                                    <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}
                                        className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none font-nunito cursor-pointer"
                                        style={errors.categoryId ? BORDER_RED : BORDER_ORANGE}>
                                        <option value="">Sélectionner…</option>
                                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                    {errors.categoryId && <ErrorMsg>{errors.categoryId}</ErrorMsg>}
                                </div>
                                <div>
                                    <Label>Type de pack</Label>
                                    <select value={form.type} onChange={(e) => update('type', e.target.value as PackType)}
                                        className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none font-nunito cursor-pointer"
                                        style={BORDER_ORANGE}>
                                        {(Object.entries(PACK_TYPE_LABELS) as [PackType, string][]).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <Label>Description</Label>
                                <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                                    placeholder="Description affichée aux utilisateurs…" rows={2}
                                    className="w-full px-3.5 py-3 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none resize-none font-nunito"
                                    style={BORDER_ORANGE} />
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <Label>Gratuit</Label>
                                    <div className="h-11 flex items-center">
                                        <button type="button" onClick={() => update('isFree', !form.isFree)}
                                            className="relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none"
                                            style={{ background: form.isFree ? '#10B981' : '#E5E7EB' }}>
                                            <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                                style={{ transform: form.isFree ? 'translateX(24px)' : 'translateX(0)' }} />
                                        </button>
                                        <span className="ml-2 text-[13px] font-bold text-[#5a7a99]">{form.isFree ? 'Oui' : 'Non'}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label>Prix (€)</Label>
                                    <input type="number" min={0} step={0.01} value={form.price}
                                        onChange={(e) => update('price', e.target.value)}
                                        disabled={form.isFree} placeholder="0.00"
                                        className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none font-nunito disabled:opacity-40"
                                        style={BORDER_ORANGE} />
                                </div>
                                <div>
                                    <Label>Ordre</Label>
                                    <input type="number" min={0} value={form.order} onChange={(e) => update('order', parseInt(e.target.value) || 0)}
                                        className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none font-nunito"
                                        style={BORDER_ORANGE} />
                                </div>
                                <div>
                                    <Label>Actif</Label>
                                    <div className="h-11 flex items-center">
                                        <button type="button" onClick={() => update('isActive', !form.isActive)}
                                            className="relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none"
                                            style={{ background: form.isActive ? '#D27A2D' : '#E5E7EB' }}>
                                            <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                                style={{ transform: form.isActive ? 'translateX(24px)' : 'translateX(0)' }} />
                                        </button>
                                        <span className="ml-2 text-[13px] font-bold text-[#5a7a99]">{form.isActive ? 'Oui' : 'Non'}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Tab : Questions ── */}
                    {tab === 'questions' && pack && (
                        <div>
                            {/* Questions actuelles du pack */}
                            <div className="mb-6">
                                <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-3">
                                    Questions dans ce pack ({packQuestions.length})
                                </p>
                                {loadingQ ? (
                                    <div className="flex justify-center py-6">
                                        <div className="w-6 h-6 border-2 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : packQuestions.length === 0 ? (
                                    <p className="text-[13px] font-semibold text-[#5a7a99] py-3">Aucune question dans ce pack — ajoutez-en ci-dessous.</p>
                                ) : (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                        {packQuestions.map((q) => (
                                            <div key={q.id} className="flex items-center gap-3 p-2.5 bg-[#fafaf9] rounded-[10px] border border-[rgba(210,122,45,0.1)]">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12.5px] font-semibold text-[#172E42] truncate">{q.text}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[q.level] ?? ''}`}>
                                                            {DIFFICULTY_LABELS[q.level] ?? q.level}
                                                        </span>
                                                        {q.theme && <span className="text-[10px] font-semibold text-[#5a7a99]">{q.theme.name}</span>}
                                                        {q.isPremium && <span className="text-[10px] font-extrabold text-[#7C3AED]">PREMIUM</span>}
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveQuestion(q.id)} disabled={removing === q.id}
                                                    className="w-7 h-7 flex items-center justify-center rounded-[7px] bg-[rgba(239,68,68,0.08)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.18)] border-none cursor-pointer transition-all disabled:opacity-40">
                                                    {removing === q.id
                                                        ? <span className="w-3 h-3 border border-[#EF4444] border-t-transparent rounded-full animate-spin" />
                                                        : <Trash2 size={13} strokeWidth={2.2} />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Ajouter des questions */}
                            <div>
                                <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-3">
                                    Ajouter des questions
                                </p>
                                <div className="relative mb-3">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a7a99] pointer-events-none" strokeWidth={2.5} />
                                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher dans les questions de cette catégorie…"
                                        className="w-full h-10 pl-9 pr-4 rounded-[10px] font-semibold text-[13px] text-[#172E42] bg-white outline-none font-nunito"
                                        style={BORDER_ORANGE} />
                                </div>
                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                    {searchResults.length === 0 ? (
                                        <p className="text-[12px] font-semibold text-[#5a7a99] py-2 text-center">
                                            {searchQuery ? 'Aucune question trouvée' : 'Toutes les questions sont déjà dans ce pack'}
                                        </p>
                                    ) : (
                                        searchResults.map((q) => (
                                            <div key={q.id} className="flex items-center gap-3 p-2.5 bg-white rounded-[10px] border border-[rgba(210,122,45,0.08)] hover:border-[rgba(210,122,45,0.2)] transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12.5px] font-semibold text-[#172E42] truncate">{truncate(q.text, 70)}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[q.level] ?? ''}`}>
                                                            {DIFFICULTY_LABELS[q.level] ?? q.level}
                                                        </span>
                                                        {q.theme && <span className="text-[10px] font-semibold text-[#5a7a99]">{q.theme.name}</span>}
                                                    </div>
                                                </div>
                                                <button onClick={() => handleAddQuestion(q)} disabled={adding === q.id}
                                                    className="w-7 h-7 flex items-center justify-center rounded-[7px] bg-[rgba(210,122,45,0.08)] text-[#D27A2D] hover:bg-[rgba(210,122,45,0.18)] border-none cursor-pointer transition-all disabled:opacity-40">
                                                    {adding === q.id
                                                        ? <span className="w-3 h-3 border border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                                                        : <Plus size={14} strokeWidth={2.5} />}
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {tab === 'info' && (
                    <div className="flex justify-end gap-3 px-8 py-5 flex-shrink-0" style={BORDER_ORANGE_FOOTER}>
                        <button onClick={onClose}
                            className="h-11 px-6 rounded-[12px] bg-white font-extrabold text-[14px] text-[#172E42] cursor-pointer font-nunito hover:text-[#D27A2D] transition-all"
                            style={BORDER_ORANGE}>
                            Annuler
                        </button>
                        <button onClick={handleSave} disabled={isSaving}
                            className="h-11 px-7 rounded-[12px] border-none bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] font-extrabold text-[14px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                            {isSaving
                                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement…</>
                                : <><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Enregistrer</>
                            }
                        </button>
                    </div>
                )}
                {tab === 'questions' && (
                    <div className="flex justify-end px-8 py-5 flex-shrink-0" style={BORDER_ORANGE_FOOTER}>
                        <button onClick={onClose}
                            className="h-11 px-6 rounded-[12px] border-none bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] font-extrabold text-[14px] text-white cursor-pointer">
                            Fermer
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="block text-[12px] font-extrabold text-[#5a7a99] uppercase tracking-widest mb-1.5">{children}</label>;
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
    return <p className="text-[11px] font-bold text-[#EF4444] mt-1">{children}</p>;
}
