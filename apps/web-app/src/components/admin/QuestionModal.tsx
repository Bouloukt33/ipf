'use client';

import React, { useState, useEffect } from 'react';
import {
    IQuestion,
    IQuestionFormData,
    ICategory,
    QuestionStatus,
    DifficultyLevel,
    DIFFICULTY_LABELS,
    STATUS_LABELS,
} from '@/lib/question.types';
import { IPack } from '@/lib/pack.types';

interface QuestionModalProps {
    isOpen:     boolean;
    question:   IQuestion | null;
    categories: ICategory[];
    packs:      IPack[];
    onClose:    () => void;
    onSave:     (data: IQuestionFormData) => Promise<void>;
}

const EMPTY_FORM: IQuestionFormData = {
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    leaseType: '',
    categoryId: '',
    difficulty: 'FACILE',
    timeToRead: 5,
    packId: '',
    videoUrl: '',
    pedagogicalUrl: '',
    status: 'ACTIVE',
    isPremium: false,
    explanation: '',
};

const ANSWER_KEYS = ['A', 'B', 'C', 'D'] as const;
const OPTION_FIELDS: Record<typeof ANSWER_KEYS[number], keyof IQuestionFormData> = {
    A: 'optionA', B: 'optionB', C: 'optionC', D: 'optionD',
};

const BORDER_ORANGE      = { border: '2px solid rgba(210,122,45,0.18)' };
const BORDER_ORANGE_FOOTER = { borderTop: '1px solid rgba(210,122,45,0.12)' };
const BORDER_RED         = { border: '2px solid #EF4444' };
const BORDER_GREEN       = { border: '2px solid #10B981' };
const BG_GREEN_LIGHT     = { background: 'rgba(16,185,129,0.04)' };
const BG_OVERLAY         = { background: 'rgba(23,46,66,0.7)', backdropFilter: 'blur(8px)' };

export function QuestionModal({ isOpen, question, categories, packs, onClose, onSave }: QuestionModalProps) {
    const [form, setForm]         = useState<IQuestionFormData>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors]     = useState<Partial<Record<keyof IQuestionFormData, string>>>({});

    // Packs filtrés par catégorie sélectionnée
    const availablePacks = form.categoryId
        ? packs.filter((p) => p.categoryId === form.categoryId && p.isActive)
        : packs.filter((p) => p.isActive);

    useEffect(() => {
        if (!isOpen) return;
        if (question) {
            setForm({
                text:           question.text,
                optionA:        question.optionA,
                optionB:        question.optionB,
                optionC:        question.optionC,
                optionD:        question.optionD,
                correctAnswer:  question.correctAnswer,
                leaseType:      question.leaseType ?? '',
                categoryId:     question.categoryId,
                difficulty:     question.difficulty,
                timeToRead:     question.timeToRead,
                packId:         question.packId ?? '',
                videoUrl:       question.videoUrl ?? '',
                pedagogicalUrl: question.pedagogicalUrl ?? '',
                status:         question.status,
                isPremium:      question.isPremium,
                explanation:    question.explanation ?? '',
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [isOpen, question]);

    const update = <K extends keyof IQuestionFormData>(key: K, value: IQuestionFormData[K]) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            // Quand on change la catégorie, on vide le pack (il appartient peut-être à l'autre catégorie)
            if (key === 'categoryId') next.packId = '';
            return next;
        });
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = (): boolean => {
        const e: Partial<Record<keyof IQuestionFormData, string>> = {};
        if (!form.text.trim())    e.text    = 'La question est obligatoire';
        if (!form.optionA.trim()) e.optionA = 'Réponse A obligatoire';
        if (!form.optionB.trim()) e.optionB = 'Réponse B obligatoire';
        if (!form.optionC.trim()) e.optionC = 'Réponse C obligatoire';
        if (!form.optionD.trim()) e.optionD = 'Réponse D obligatoire';
        if (!form.categoryId)     e.categoryId = 'Le type de bail est obligatoire';
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

    const isEdit = !!question;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={BG_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[22px] w-[720px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-8"
                style={{ animation: 'modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h2 className="text-[20px] font-black text-[#172E42]">
                            {isEdit ? 'Modifier la question' : 'Nouvelle question'}
                        </h2>
                        {isEdit && (
                            <p className="text-[12px] font-bold text-[#5a7a99] mt-0.5">
                                Code : <span className="font-mono text-[#D27A2D]">{question.code}</span>
                            </p>
                        )}
                    </div>
                    <button onClick={onClose}
                        className="w-9 h-9 rounded-full text-[#EF4444] border-none cursor-pointer text-[18px] font-bold flex items-center justify-center transition-all hover:rotate-90"
                        style={{ background: 'rgba(239,68,68,0.1)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}>
                        ✕
                    </button>
                </div>

                {/* Question text */}
                <div className="mb-5">
                    <Label>Question</Label>
                    <textarea value={form.text} onChange={(e) => update('text', e.target.value)}
                        placeholder="Saisir la question ici…" rows={3}
                        className="w-full px-3.5 py-3 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none resize-y transition-colors font-nunito"
                        style={errors.text ? BORDER_RED : BORDER_ORANGE} />
                    {errors.text && <ErrorMsg>{errors.text}</ErrorMsg>}
                </div>

                {/* Type de bail + Pack */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                        <Label>Type de bail</Label>
                        <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito cursor-pointer"
                            style={errors.categoryId ? BORDER_RED : BORDER_ORANGE}>
                            <option value="">Sélectionner un type de bail…</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}{cat.isPremium ? ' 🔒' : ''}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && <ErrorMsg>{errors.categoryId}</ErrorMsg>}
                    </div>
                    <div>
                        <Label>Pack <span className="normal-case tracking-normal text-[11px] font-semibold">(optionnel)</span></Label>
                        <select value={form.packId ?? ''} onChange={(e) => update('packId', e.target.value)}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito cursor-pointer"
                            style={BORDER_ORANGE}>
                            <option value="">— Aucun pack —</option>
                            {availablePacks.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}{p.isFree ? ' 🆓' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Difficulté, Durée, Statut, Premium */}
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <div>
                        <Label>Difficulté</Label>
                        <select value={form.difficulty} onChange={(e) => update('difficulty', e.target.value as DifficultyLevel)}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito cursor-pointer"
                            style={BORDER_ORANGE}>
                            {(Object.entries(DIFFICULTY_LABELS) as [DifficultyLevel, string][]).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Durée (s)</Label>
                        <input type="number" min={5} max={30} step={1} value={form.timeToRead}
                            onChange={(e) => update('timeToRead', Number(e.target.value))}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito"
                            style={BORDER_ORANGE} />
                    </div>
                    <div>
                        <Label>Statut</Label>
                        <select value={form.status} onChange={(e) => update('status', e.target.value as QuestionStatus)}
                            className="w-full h-11 px-3.5 rounded-[11px] font-bold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito cursor-pointer"
                            style={BORDER_ORANGE}>
                            {(Object.entries(STATUS_LABELS) as [QuestionStatus, string][]).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Premium</Label>
                        <div className="h-11 flex items-center">
                            <button type="button" onClick={() => update('isPremium', !form.isPremium)}
                                className="relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none"
                                style={{ background: form.isPremium ? '#D27A2D' : '#E5E7EB' }}>
                                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                    style={{ transform: form.isPremium ? 'translateX(24px)' : 'translateX(0)' }} />
                            </button>
                            <span className="ml-2 text-[13px] font-bold text-[#5a7a99]">{form.isPremium ? 'Oui' : 'Non'}</span>
                        </div>
                    </div>
                </div>

                {/* Réponses */}
                <div className="mb-5">
                    <Label>Réponses <span className="font-semibold normal-case tracking-normal text-[11px]">(sélectionner la bonne réponse)</span></Label>
                    <div className="flex flex-col gap-2.5">
                        {ANSWER_KEYS.map((letter) => {
                            const fieldKey  = OPTION_FIELDS[letter];
                            const isCorrect = form.correctAnswer === letter;
                            return (
                                <div key={letter} className="flex items-center gap-3">
                                    <span className="text-[12px] font-extrabold text-[#5a7a99] w-5 flex-shrink-0 text-center">{letter}</span>
                                    <input type="text" value={form[fieldKey] as string}
                                        onChange={(e) => update(fieldKey, e.target.value)}
                                        placeholder={`Réponse ${letter}`}
                                        className="flex-1 h-10 px-3 rounded-[10px] font-semibold text-[14px] text-[#172E42] outline-none transition-colors font-nunito"
                                        style={errors[fieldKey] ? BORDER_RED : isCorrect ? { ...BORDER_GREEN, ...BG_GREEN_LIGHT } : BORDER_ORANGE} />
                                    <button type="button" onClick={() => update('correctAnswer', letter)}
                                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer"
                                        style={isCorrect ? { border: '2px solid #10B981', background: '#10B981' } : { border: '2px solid rgba(210,122,45,0.3)', background: 'white' }}
                                        title={`Définir ${letter} comme bonne réponse`}>
                                        {isCorrect && <svg width="10" height="10" fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Explication */}
                <div className="mb-5">
                    <Label>Explication de la bonne réponse</Label>
                    <textarea value={form.explanation} onChange={(e) => update('explanation', e.target.value)}
                        placeholder="Explication affichée après réponse…" rows={3}
                        className="w-full px-3.5 py-3 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none resize-y transition-colors font-nunito"
                        style={BORDER_ORANGE} />
                </div>

                {/* URL Vidéo + Pédagogique */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    {([
                        { label: 'URL Vidéo',       field: 'videoUrl'       as const, placeholder: 'https://…' },
                        { label: 'URL Pédagogique', field: 'pedagogicalUrl' as const, placeholder: 'https://…' },
                    ] as const).map(({ label, field, placeholder }) => (
                        <div key={field}>
                            <Label>{label}</Label>
                            <input type="url" value={(form[field] as string) ?? ''}
                                onChange={(e) => update(field, e.target.value)}
                                placeholder={placeholder}
                                className="w-full h-11 px-3.5 rounded-[11px] font-semibold text-[14px] text-[#172E42] bg-white outline-none transition-colors font-nunito"
                                style={BORDER_ORANGE} />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-5" style={BORDER_ORANGE_FOOTER}>
                    <button onClick={onClose}
                        className="h-11 px-6 rounded-[12px] bg-white font-extrabold text-[14px] text-[#172E42] cursor-pointer font-nunito hover:text-[#D27A2D] transition-all"
                        style={BORDER_ORANGE}>
                        Annuler
                    </button>
                    <button onClick={handleSave} disabled={isSaving}
                        className="h-11 px-7 rounded-[12px] border-none bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] font-extrabold text-[14px] text-white cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {isSaving ? (
                            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement…</>
                        ) : (
                            <><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Enregistrer</>
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
    return <label className="block text-[12px] font-extrabold text-[#5a7a99] uppercase tracking-widest mb-1.5">{children}</label>;
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
    return <p className="text-[11px] font-bold text-[#EF4444] mt-1">{children}</p>;
}
