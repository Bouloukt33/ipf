import { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Pencil, Trash2, MoreVertical, Power } from 'lucide-react';
import { useAdminCategories } from '../hooks/useAdminCategories';
import { Toast, useToast } from '../components/admin/Toast';
import type { ICategory } from '../lib/types';
import type { ICategoryFormData } from '../services/categories.service';

const PRESET_COLORS = [
    '#D27A2D', '#172E42', '#10B981', '#7C3AED',
    '#EF4444', '#3B82F6', '#F59E0B', '#EC4899',
];

function slugify(str: string) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

interface CategoryModalProps {
    isOpen: boolean;
    category: ICategory | null;
    onClose: () => void;
    onSave: (data: ICategoryFormData) => Promise<void>;
}

function CategoryModal({ isOpen, category, onClose, onSave }: CategoryModalProps) {
    const [form, setForm] = useState<ICategoryFormData>({
        name: '', slug: '', description: '', color: '#D27A2D',
        isPremium: false, isActive: true, order: 0,
    });
    const [saving, setSaving] = useState(false);
    const [slugTouched, setSlugTouched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setForm({
                    name: category.name,
                    slug: category.slug,
                    description: category.description || '',
                    color: category.color || '#D27A2D',
                    isPremium: category.isPremium,
                    isActive: category.isActive,
                    order: category.order,
                });
                setSlugTouched(true);
            } else {
                setForm({ name: '', slug: '', description: '', color: '#D27A2D', isPremium: false, isActive: true, order: 0 });
                setSlugTouched(false);
            }
        }
    }, [isOpen, category]);

    function updateName(name: string) {
        setForm(f => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(form);
            onClose();
        } finally {
            setSaving(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(23,46,66,0.5)' }}>
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md p-8 mx-4">
                <h2 className="text-[20px] font-black text-[#172E42] mb-6">
                    {category ? 'Modifier le bail' : 'Nouveau bail'}
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-[12px] font-black text-[#5a7a99] uppercase tracking-wider mb-1.5">Nom *</label>
                        <input
                            required
                            value={form.name}
                            onChange={e => updateName(e.target.value)}
                            className="w-full h-11 px-4 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D]"
                            placeholder="ex: Bail commercial"
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] font-black text-[#5a7a99] uppercase tracking-wider mb-1.5">Slug *</label>
                        <input
                            required
                            value={form.slug}
                            onChange={e => { setSlugTouched(true); setForm(f => ({ ...f, slug: e.target.value })); }}
                            className="w-full h-11 px-4 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D]"
                            placeholder="ex: bail-commercial"
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] font-black text-[#5a7a99] uppercase tracking-wider mb-1.5">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-3 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D] resize-none"
                            placeholder="Description courte..."
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] font-black text-[#5a7a99] uppercase tracking-wider mb-1.5">Couleur</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c} type="button"
                                    onClick={() => setForm(f => ({ ...f, color: c }))}
                                    className="w-8 h-8 rounded-full border-2 transition-all"
                                    style={{
                                        backgroundColor: c,
                                        borderColor: form.color === c ? '#172E42' : 'transparent',
                                        transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                                    }}
                                />
                            ))}
                            <input
                                type="color"
                                value={form.color}
                                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                                className="w-8 h-8 rounded-full cursor-pointer border border-gray-200"
                                title="Couleur personnalisée"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[12px] font-black text-[#5a7a99] uppercase tracking-wider mb-1.5">Ordre</label>
                            <input
                                type="number"
                                value={form.order}
                                onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                className="w-full h-11 px-4 rounded-[12px] border border-gray-200 text-[14px] font-semibold text-[#172E42] outline-none focus:border-[#D27A2D]"
                            />
                        </div>
                        <div className="flex flex-col gap-2 pt-5">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} className="w-4 h-4 accent-[#7C3AED]" />
                                <span className="text-[13px] font-bold text-[#172E42]">Premium</span>
                            </label>
                            {category && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-[#10B981]" />
                                    <span className="text-[13px] font-bold text-[#172E42]">Actif</span>
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 mt-2">
                        <button type="button" onClick={onClose} className="flex-1 h-11 rounded-[12px] border border-gray-200 font-extrabold text-[14px] text-[#172E42] bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                            Annuler
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 h-11 rounded-[12px] border-none font-extrabold text-[14px] text-white cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #D27A2D, #F59E0B)' }}>
                            {saving ? 'Enregistrement...' : category ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CategoryMenu({ category, onEdit, onDelete, onToggle }: {
    category: ICategory;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(o => !o)} className="p-2 text-[#5a7a99] hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <MoreVertical size={20} />
            </button>
            {open && (
                <div className="absolute right-0 top-10 z-20 bg-white rounded-[16px] shadow-xl border border-gray-100 py-1 min-w-[160px]">
                    <button onClick={() => { onEdit(); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-bold text-[#172E42] hover:bg-gray-50 cursor-pointer">
                        <Pencil size={14} /> Modifier
                    </button>
                    <button onClick={() => { onToggle(); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-bold text-[#172E42] hover:bg-gray-50 cursor-pointer">
                        <Power size={14} /> {category.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => { onDelete(); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 cursor-pointer">
                        <Trash2 size={14} /> Supprimer
                    </button>
                </div>
            )}
        </div>
    );
}

export function AdminCategoriesPage() {
    const { categories, isLoading, createCategory, updateCategory, deleteCategory, toggleActive } = useAdminCategories();
    const { toast, show, hide } = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ICategory | null>(null);

    function openCreate() { setEditing(null); setModalOpen(true); }
    function openEdit(cat: ICategory) { setEditing(cat); setModalOpen(true); }

    async function handleSave(data: ICategoryFormData) {
        try {
            if (editing) {
                await updateCategory(editing.id, data);
                show('Bail modifié avec succès', 'success');
            } else {
                await createCategory(data);
                show('Bail créé avec succès', 'success');
            }
        } catch (err: any) {
            show(err.message || 'Une erreur est survenue', 'error');
            throw err;
        }
    }

    async function handleDelete(cat: ICategory) {
        if (!window.confirm(`Supprimer "${cat.name}" ? Cette action est irréversible.`)) return;
        try {
            await deleteCategory(cat.id);
            show('Bail supprimé', 'info');
        } catch (err: any) {
            show(err.message || 'Impossible de supprimer ce bail', 'error');
        }
    }

    async function handleToggle(cat: ICategory) {
        try {
            await toggleActive(cat.id);
            show(`Bail ${cat.isActive ? 'désactivé' : 'activé'}`, 'info');
        } catch (err: any) {
            show(err.message || 'Erreur', 'error');
        }
    }

    return (
        <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[28px] font-black text-[#172E42] mb-1">Types de baux</h1>
                    <p className="text-[14px] font-semibold text-[#5a7a99]">
                        {categories.length} bail{categories.length !== 1 ? 's' : ''} configuré{categories.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="h-[48px] px-6 rounded-[16px] text-white font-black text-[14px] flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] border-none cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #D27A2D, #F59E0B)' }}
                >
                    <Plus size={18} /> Nouveau bail
                </button>
            </div>

            {isLoading && (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!isLoading && categories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(210,122,45,0.1)' }}>
                        <BookOpen size={32} color="#D27A2D" />
                    </div>
                    <h2 className="text-[20px] font-black text-[#172E42] mb-2">Aucun bail configuré</h2>
                    <button onClick={openCreate} className="flex items-center gap-2 h-11 px-6 rounded-[14px] border-none font-extrabold text-[14px] text-white cursor-pointer mt-4"
                        style={{ background: 'linear-gradient(135deg, #D27A2D, #F59E0B)' }}>
                        <Plus size={16} /> Créer un bail
                    </button>
                </div>
            )}

            {!isLoading && categories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white p-6 rounded-[32px] shadow-soft border border-ink-100 flex flex-col hover:shadow-card hover:-translate-y-0.5 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color || '#D27A2D' }}>
                                    <BookOpen size={28} />
                                </div>
                                <CategoryMenu
                                    category={cat}
                                    onEdit={() => openEdit(cat)}
                                    onDelete={() => handleDelete(cat)}
                                    onToggle={() => handleToggle(cat)}
                                />
                            </div>

                            <h3 className="text-[18px] font-black text-[#172E42] mb-2">{cat.name}</h3>
                            <p className="text-[13px] font-semibold text-[#5a7a99] mb-6 line-clamp-2">{cat.description}</p>

                            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${cat.isActive ? 'bg-[#10B981]' : 'bg-red-500'}`} />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">
                                        {cat.isActive ? 'Actif' : 'Désactivé'}
                                    </span>
                                </div>
                                {cat.isPremium && (
                                    <div className="px-2.5 py-1 rounded-lg bg-purple-50 text-[#7C3AED] text-[10px] font-black uppercase">Premium</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CategoryModal
                isOpen={modalOpen}
                category={editing}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
            />

            <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onHide={hide} />
        </div>
    );
}
