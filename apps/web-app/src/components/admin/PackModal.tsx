'use client';

import React, { useState, useEffect } from 'react';
import { IPack, IPackFormData, PackType, PACK_TYPE_LABELS } from '@/lib/pack.types';
import { ICategory } from '@/lib/question.types';

interface PackModalProps {
    isOpen: boolean;
    pack: IPack | null;
    categories: ICategory[];
    onClose: () => void;
    onSave: (data: IPackFormData) => Promise<void>;
}

const EMPTY_FORM: IPackFormData = {
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    type: 'STANDARD',
    isFree: false,
    price: '',
    order: 0,
    isActive: true,
};

const BORDER_ORANGE       = { border: '2px solid rgba(210,122,45,0.18)' };
const BORDER_ORANGE_FOOTER = { borderTop: '1px solid rgba(210,122,45,0.12)' };
const BORDER_RED          = { border: '2px solid #EF4444' };
const BG_OVERLAY          = { background: 'rgba(23,46,66,0.7)', backdropFilter: 'blur(8px)' };

function slugify(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function PackModal({ isOpen, pack, categories, onClose, onSave }: PackModalProps) {
    const [form, setForm]       = useState<IPackFormData>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors]   = useState<Partial<Record<keyof IPackFormData, string>>>({});
    const [slugTouched, setSlugTouched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (pack) {
                setForm({
                    name:        pack.name,
                    slug:        pack.slug,
                    categoryId:  pack.categoryId,
                    description: pack.description ?? '',
                    type:        pack.type,
                    isFree:      pack.isFree,
                    price:       pack.price ?? '',
                    order:       pack.order,
                    isActive:    pack.isActive,
                });
                setSlugTouched(true);
            } else {
                setForm(EMPTY_FORM);
                setSlugTouched(false);
            }
            setErrors({});
        }
    }, [isOpen, pack]);

    const update = <K extends keyof IPackFormData>(key: K, value: IPackFormData[K]) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (key === 'name' && !slugTouched) {
                next.slug = slugify(value as string);
            }
            return next;
        });
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = (): boolean => {
        const e: Partial<Record<keyof IPackFormData, string>> = {};
        if (!form.name.trim())      e.name      = 'Le nom est obligatoire';
        if (!form.slug.trim())      e.slug      = 'Le slug (PackID) est obligatoire';
        if (!form.categoryId)       e.categoryId = 'La catégorie est obligatoire';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            await onSave(form);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const isEdit = !!pack;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="bg-white rounded-[22px] w-[620px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-8"
                style={{ animation: 'modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h2 className="text-[20px] font-black text-[#172E42]">
                            {isEdit ? 'Modifier le pack' : 'Nouveau pack'}
                        </h2>
                        {isEdit && (
                            <p className="text-[12px] font-bold text-[#5a7a99] mt-0.5">
                                Slug : <span className="font-mono text-[#D27A2D]">{pack.slug}</span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full text-[#EF4444] border-none cursor-pointer text-[18px] font-bold flex items-center justify-center transition-all hover:rotate-90"
                        style={{ background: 'rgba(239,68,68,0.1)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                    >
                        ✕
                    </button>
                </div>

                {/* Nom */}
                <div className="mb-5">
                    <Label>Nom du pack</Label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="ex : Pack Découverte — Bail commercial"
                        className="w-full h-11 px-3.5 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito"
                        style={errors.name ? BORDER_RED : BORDER_ORANGE}
                    />
                    {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
                </div>

                {/* Slug */}
                <div className="mb-5">
                    <Label>Slug (PackID)</Label>
                    <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => { setSlugTouched(true); update('slug', e.target.value); }}
                        placeholder="ex : visiteur"
                        className="w-full h-11 px-3.5 rounded-[11px] font-mono font-bold text-[14px] text-[#D27A2D] bg-white outline-none transition-colors"
                        style={errors.slug ? BORDER_RED : BORDER_ORANGE}
                    />
                    {errors.slug && <ErrorMsg>{errors.slug}</ErrorMsg>}
                    <p className="text-[11px] font-semibold text-[#5a7a99] mt-1">
                        Généré automatiquement depuis le nom — doit être unique dans la catégorie
                    </p>
                </div>

                {/* Catégorie + Type */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                        <Label>Catégorie (type de bail)</Label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => update('categoryId', e.target.value)}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito cursor-pointer"
                            style={errors.categoryId ? BORDER_RED : BORDER_ORANGE}
                        >
                            <option value="">Sélectionner…</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.categoryId && <ErrorMsg>{errors.categoryId}</ErrorMsg>}
                    </div>
                    <div>
                        <Label>Type de pack</Label>
                        <select
                            value={form.type}
                            onChange={(e) => update('type', e.target.value as PackType)}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito cursor-pointer"
                            style={BORDER_ORANGE}
                        >
                            {(Object.entries(PACK_TYPE_LABELS) as [PackType, string][]).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-5">
                    <Label>Description</Label>
                    <textarea
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        placeholder="Description affichée aux utilisateurs…"
                        rows={3}
                        className="w-full px-3.5 py-3 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none resize-y transition-colors font-nunito"
                        style={BORDER_ORANGE}
                    />
                </div>

                {/* Gratuit + Prix + Ordre + Actif */}
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <div>
                        <Label>Gratuit</Label>
                        <div className="h-11 flex items-center">
                            <button
                                type="button"
                                onClick={() => update('isFree', !form.isFree)}
                                className="relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none"
                                style={{ background: form.isFree ? '#10B981' : '#E5E7EB' }}
                            >
                                <span
                                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                    style={{ transform: form.isFree ? 'translateX(24px)' : 'translateX(0)' }}
                                />
                            </button>
                            <span className="ml-2 text-[13px] font-bold text-[#5a7a99]">
                                {form.isFree ? 'Oui' : 'Non'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <Label>Prix (€)</Label>
                        <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={form.price}
                            onChange={(e) => update('price', e.target.value)}
                            placeholder="0.00"
                            disabled={form.isFree}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito disabled:opacity-40"
                            style={BORDER_ORANGE}
                        />
                    </div>
                    <div>
                        <Label>Ordre</Label>
                        <input
                            type="number"
                            min={0}
                            step={1}
                            value={form.order}
                            onChange={(e) => update('order', parseInt(e.target.value) || 0)}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito"
                            style={BORDER_ORANGE}
                        />
                    </div>
                    <div>
                        <Label>Actif</Label>
                        <div className="h-11 flex items-center">
                            <button
                                type="button"
                                onClick={() => update('isActive', !form.isActive)}
                                className="relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none"
                                style={{ background: form.isActive ? '#D27A2D' : '#E5E7EB' }}
                            >
                                <span
                                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                    style={{ transform: form.isActive ? 'translateX(24px)' : 'translateX(0)' }}
                                />
                            </button>
                            <span className="ml-2 text-[13px] font-bold text-[#5a7a99]">
                                {form.isActive ? 'Oui' : 'Non'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-5" style={BORDER_ORANGE_FOOTER}>
                    <button
                        onClick={onClose}
                        className="h-11 px-6 rounded-[12px] bg-white font-extrabold text-[14px] text-[#172E42] cursor-pointer font-nunito hover:text-[#D27A2D] transition-all"
                        style={BORDER_ORANGE}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-11 px-7 rounded-[12px] border-none bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] font-extrabold text-[14px] text-white cursor-pointer font-nunito transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Enregistrement…
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
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
    return (
        <label className="block text-[12px] font-extrabold text-[#5a7a99] uppercase tracking-widest mb-1.5">
            {children}
        </label>
    );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
    return <p className="text-[11px] font-bold text-[#EF4444] mt-1">{children}</p>;
}
