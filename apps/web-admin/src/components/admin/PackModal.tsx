import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { IPack, IPackFormData, ICategory, IQuestion } from '../../lib/types';
import { usersService } from '../../services/users.service';
import { questionsService } from '../../services/questions.service';
import { ENV } from '../../lib/env';
import { AUTH0_SCOPE } from '../../lib/auth0';
import { Search, X, Check, User, Target, Clock, BookOpen, Layers } from 'lucide-react';

interface PackModalProps {
    isOpen: boolean;
    pack: IPack | null;
    categories: ICategory[];
    onClose: () => void;
    onSave: (data: IPackFormData) => Promise<void>;
}

export function PackModal({ isOpen, pack, categories, onClose, onSave }: PackModalProps) {
    const { getAccessTokenSilently } = useAuth0();
    const [form, setForm] = useState<IPackFormData>({
        name: '',
        slug: '',
        description: '',
        categoryId: '',
        isActive: true,
        visibility: 'PUBLIC',
        assignedUserId: null,
        durationOverride: null,
        targetQuestionCount: null,
        questionIds: []
    });

    const [userSearch, setUserSearch] = useState('');
    const [userResults, setUserResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    
    const [availableQuestions, setAvailableQuestions] = useState<IQuestion[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initialisation
    useEffect(() => {
        if (isOpen) {
            if (pack) {
                setForm({
                    name: pack.name,
                    slug: pack.slug,
                    description: pack.description || '',
                    categoryId: pack.categoryId,
                    isActive: pack.isActive,
                    visibility: pack.visibility,
                    assignedUserId: pack.assignedUserId || null,
                    durationOverride: pack.durationOverride || null,
                    targetQuestionCount: pack.targetQuestionCount || null,
                    questionIds: pack.questions?.map(q => q.id) || []
                });
                setSelectedUser(pack.assignedUser || null);
            } else {
                setForm({
                    name: '',
                    slug: '',
                    description: '',
                    categoryId: categories[0]?.id || '',
                    isActive: true,
                    visibility: 'PUBLIC',
                    assignedUserId: null,
                    durationOverride: null,
                    targetQuestionCount: null,
                    questionIds: []
                });
                setSelectedUser(null);
            }
        }
    }, [isOpen, pack, categories]);

    // Charger les questions quand la catégorie change
    useEffect(() => {
        async function loadQuestions() {
            if (!form.categoryId || !isOpen) return;
            setIsLoadingQuestions(true);
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: { audience: ENV.auth0Audience, scope: AUTH0_SCOPE }
                });
                const res = await questionsService.getAll(token, { categoryId: form.categoryId }, 1, 200);
                setAvailableQuestions(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingQuestions(false);
            }
        }
        loadQuestions();
    }, [form.categoryId, isOpen, getAccessTokenSilently]);

    // Recherche d'utilisateurs
    const handleUserSearch = useCallback(async (q: string) => {
        setUserSearch(q);
        if (q.length < 2) {
            setUserResults([]);
            return;
        }
        try {
            const token = await getAccessTokenSilently({
                authorizationParams: { audience: ENV.auth0Audience, scope: AUTH0_SCOPE }
            });
            const results = await usersService.search(token, q);
            setUserResults(results);
        } catch (err) {
            console.error(err);
        }
    }, [getAccessTokenSilently]);

    const selectUser = (user: any) => {
        setSelectedUser(user);
        setForm(prev => ({ ...prev, assignedUserId: user.id }));
        setUserResults([]);
        setUserSearch('');
    };

    const [questionSearch, setQuestionSearch] = useState('');
    
    const filteredQuestions = availableQuestions.filter(q => 
        q.text.toLowerCase().includes(questionSearch.toLowerCase()) ||
        (q.codification && q.codification.toLowerCase().includes(questionSearch.toLowerCase()))
    );

    const toggleQuestion = (id: string) => {
        setForm(prev => {
            const current = prev.questionIds || [];
            if (current.includes(id)) {
                return { ...prev, questionIds: current.filter(qid => qid !== id) };
            } else {
                return { ...prev, questionIds: [...current, id] };
            }
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-[22px] font-black text-navy">{pack ? 'Modifier le pack' : 'Nouveau pack custom'}</h2>
                        <p className="text-[13px] font-semibold text-gray-500">Configurez votre pack de coaching sur mesure</p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl bg-white text-gray-400 hover:text-red-500 hover:shadow-soft transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column: Config */}
                    <div className="space-y-8">
                        <section className="space-y-4">
                            <h3 className="text-[15px] font-black text-navy flex items-center gap-2">
                                <Layers size={18} className="text-orange-500" /> Informations de base
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Nom du pack</label>
                                    <input 
                                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none font-bold text-navy"
                                        value={form.name}
                                        onChange={(e) => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Type de bail</label>
                                    <select 
                                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none font-bold text-navy"
                                        value={form.categoryId}
                                        onChange={(e) => setForm({...form, categoryId: e.target.value, questionIds: []})}
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[15px] font-black text-navy flex items-center gap-2">
                                <Target size={18} className="text-orange-500" /> Ciblage & Visibilité
                            </h3>
                            <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit">
                                <button 
                                    className={`px-6 py-2 rounded-xl text-[12px] font-black transition-all ${form.visibility === 'PUBLIC' ? 'bg-white text-navy shadow-sm' : 'text-gray-400'}`}
                                    onClick={() => setForm({...form, visibility: 'PUBLIC', assignedUserId: null})}
                                >
                                    🌍 PUBLIC
                                </button>
                                <button 
                                    className={`px-6 py-2 rounded-xl text-[12px] font-black transition-all ${form.visibility === 'PRIVATE' ? 'bg-white text-navy shadow-sm' : 'text-gray-400'}`}
                                    onClick={() => setForm({...form, visibility: 'PRIVATE'})}
                                >
                                    👤 PRIVÉ (COACHING)
                                </button>
                            </div>

                            {form.visibility === 'PRIVATE' && (
                                <div className="relative space-y-1.5">
                                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Assigner à l'utilisateur</label>
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between p-3 rounded-xl border-2 border-orange-100 bg-orange-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center font-black text-orange-600 text-xs">
                                                    {selectedUser.profile?.displayName?.[0] || selectedUser.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-black text-navy">{selectedUser.profile?.displayName || 'Sans nom'}</p>
                                                    <p className="text-[11px] font-semibold text-gray-500">{selectedUser.email}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => {setSelectedUser(null); setForm({...form, assignedUserId: null})}} className="text-gray-400 hover:text-red-500">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input 
                                                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none font-bold text-navy"
                                                    placeholder="Rechercher par email ou nom..."
                                                    value={userSearch}
                                                    onChange={(e) => handleUserSearch(e.target.value)}
                                                />
                                            </div>
                                            {userResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                                                    {userResults.map(u => (
                                                        <button 
                                                            key={u.id}
                                                            className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                                                            onClick={() => selectUser(u)}
                                                        >
                                                            <User size={16} className="text-gray-400" />
                                                            <div>
                                                                <p className="text-[13px] font-bold text-navy">{u.profile?.displayName || 'Sans nom'}</p>
                                                                <p className="text-[11px] text-gray-500">{u.email}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[15px] font-black text-navy flex items-center gap-2">
                                <Clock size={18} className="text-orange-500" /> Paramètres du Quiz
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Nombre de questions à jouer</label>
                                    <input 
                                        type="number"
                                        placeholder="Ex: 5"
                                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none font-bold text-navy"
                                        value={form.targetQuestionCount || ''}
                                        onChange={(e) => setForm({...form, targetQuestionCount: e.target.value ? parseInt(e.target.value) : null})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Temps par question (s)</label>
                                    <input 
                                        type="number"
                                        placeholder="Ex: 15"
                                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none font-bold text-navy"
                                        value={form.durationOverride || ''}
                                        onChange={(e) => setForm({...form, durationOverride: e.target.value ? parseInt(e.target.value) : null})}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Questions */}
                    <div className="flex flex-col space-y-4 min-h-0">
                        <h3 className="text-[15px] font-black text-navy flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen size={18} className="text-orange-500" /> Sélection des questions
                            </div>
                            <span className="px-3 py-1 rounded-lg bg-orange-100 text-orange-600 text-[11px] font-black">
                                {form.questionIds?.length || 0} sélectionnée(s)
                            </span>
                        </h3>
                        
                        <div className="flex-1 border-2 border-gray-100 rounded-3xl overflow-hidden flex flex-col bg-gray-50/30">
                            <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                                <Search size={16} className="text-gray-400" />
                                <input 
                                    className="flex-1 text-sm font-semibold outline-none" 
                                    placeholder="Chercher dans la catégorie..." 
                                    value={questionSearch}
                                    onChange={(e) => setQuestionSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {isLoadingQuestions ? (
                                    <div className="p-10 text-center text-gray-400 text-sm font-bold">Chargement...</div>
                                ) : filteredQuestions.map(q => (
                                    <div 
                                        key={q.id} 
                                        className={`p-4 border-b border-gray-50 flex items-center gap-4 cursor-pointer hover:bg-white transition-all ${form.questionIds?.includes(q.id) ? 'bg-orange-50/50' : ''}`}
                                        onClick={() => toggleQuestion(q.id)}
                                    >
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.questionIds?.includes(q.id) ? 'bg-orange-500 border-orange-500' : 'border-gray-200 bg-white'}`}>
                                            {form.questionIds?.includes(q.id) && <Check size={12} className="text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[13px] font-bold text-navy line-clamp-2">{q.text}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-orange-500 uppercase">{q.codification}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">LVL {q.level}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
                    <button onClick={onClose} className="px-6 py-3 rounded-2xl font-black text-[14px] text-gray-500 hover:bg-gray-100 transition-all">
                        Annuler
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !form.name || (form.visibility === 'PRIVATE' && !form.assignedUserId)}
                        className="px-10 py-3 rounded-2xl font-black text-[14px] text-white bg-navy hover:bg-black shadow-lg shadow-navy/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                        {pack ? 'Mettre à jour' : 'Créer le pack'}
                    </button>
                </div>
            </div>
        </div>
    );
}
