import { useEffect, useState } from 'react';
import { X, Check, UserPlus, Mail } from 'lucide-react';
import type { CreateUserPayload } from '../../services/users.service';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateUserPayload) => Promise<void>;
}

const ROLE_OPTIONS: { value: NonNullable<CreateUserPayload['role']>; label: string }[] = [
    { value: 'USER', label: 'Utilisateur' },
    { value: 'MODERATOR', label: 'Modérateur' },
    { value: 'ADMIN', label: 'Administrateur' },
];

export function UserModal({ isOpen, onClose, onSave }: UserModalProps) {
    const [form, setForm] = useState<CreateUserPayload>({ email: '', displayName: '', role: 'USER' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) setForm({ email: '', displayName: '', role: 'USER' });
    }, [isOpen]);

    const isFormValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

    const handleSave = async () => {
        if (!isFormValid || isSaving) return;
        setIsSaving(true);
        try {
            await onSave({
                email: form.email.trim(),
                displayName: form.displayName?.trim() || undefined,
                role: form.role,
            });
            onClose();
        } catch {
            // erreur déjà notifiée par la page (toast) — le modal reste ouvert
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-[22px] font-black text-navy flex items-center gap-2">
                            <UserPlus size={22} className="text-orange-500" /> Nouvel utilisateur
                        </h2>
                        <p className="text-[13px] font-semibold text-gray-500">
                            Un email lui sera envoyé pour définir son mot de passe
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl bg-white text-gray-400 hover:text-red-500 hover:shadow-soft transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Email *</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="email"
                                className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none font-bold text-navy"
                                placeholder="agent@lecarrepro.fr"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Nom affiché</label>
                        <input
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none font-bold text-navy"
                            placeholder="Marie Dupont"
                            value={form.displayName}
                            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Rôle</label>
                        <select
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none font-bold text-navy"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value as CreateUserPayload['role'] })}
                        >
                            {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="p-8 pt-0 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-2xl font-black text-[14px] text-gray-500 hover:bg-gray-100 transition-all">
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !isFormValid}
                        className={`px-10 py-3 rounded-2xl font-black text-[14px] text-white transition-all flex items-center gap-2 shadow-lg ${
                            isFormValid
                                ? 'bg-navy hover:bg-black shadow-navy/20 active:scale-95'
                                : 'bg-gray-300 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                        Créer le compte
                    </button>
                </div>
            </div>
        </div>
    );
}
