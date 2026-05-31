import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAdminPacks } from '../hooks/useAdminPacks';
import { Package, Plus, Edit2, Trash2, Globe, Lock, User, Clock } from 'lucide-react';
import { PackModal } from '../components/admin/PackModal';
import { packsService } from '../services/packs.service';
import { ENV } from '../lib/env';
import { AUTH0_SCOPE } from '../lib/auth0';
import type { IPack, IPackFormData } from '../lib/types';

export function AdminPacksPage() {
  const { getAccessTokenSilently } = useAuth0();
  const { packs, categories, isLoading, createPack, updatePack, deletePack } = useAdminPacks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<IPack | null>(null);

  const handleCreate = () => {
    setEditingPack(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (pack: IPack) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: ENV.auth0Audience,
          scope: AUTH0_SCOPE,
        },
      });
      const fullPack = await packsService.getById(token, pack.id);
      setEditingPack(fullPack);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to load pack details:', err);
    }
  };

  const handleSave = async (data: IPackFormData) => {
    if (editingPack) {
      await updatePack(editingPack.id, data);
    } else {
      await createPack(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) {
      await deletePack(id);
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#172E42] mb-1">Catalogue des Packs</h1>
          <p className="text-[14px] font-semibold text-[#5a7a99]">Créez des parcours publics ou du coaching sur mesure</p>
        </div>
        <button 
          onClick={handleCreate}
          className="h-[52px] px-8 rounded-[20px] bg-navy text-white font-black text-[15px] flex items-center gap-3 hover:bg-black shadow-lg shadow-navy/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Nouveau pack custom
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-soft border border-ink-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Identité du Pack</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Ciblage / Visibilité</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Config Quiz</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Statut</th>
              <th className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="p-20 text-center text-[#5a7a99] font-bold">Chargement du catalogue...</td></tr>
            ) : packs.length === 0 ? (
              <tr><td colSpan={5} className="p-20 text-center text-[#5a7a99] font-bold">Aucun pack créé pour le moment.</td></tr>
            ) : packs.map((pack) => (
              <tr key={pack.id} className="hover:bg-gray-50/30 transition-all group cursor-pointer" onClick={() => handleEdit(pack)}>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#D27A2D] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-[#172E42]">{pack.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-black text-orange-500 uppercase">{pack.category?.name || 'Sans bail'}</span>
                        <span className="text-[11px] font-bold text-gray-300">•</span>
                        <span className="text-[11px] font-bold text-gray-400">{pack._count?.questions || 0} questions</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {pack.visibility === 'PUBLIC' ? (
                    <div className="flex items-center gap-2 text-[#10B981]">
                      <Globe size={16} />
                      <span className="text-[13px] font-bold uppercase tracking-tight">Catalogue Public</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-orange-600">
                        <Lock size={14} />
                        <span className="text-[13px] font-black uppercase tracking-tight">Privé / Coaching</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                        <User size={12} /> {pack.assignedUser?.profile?.displayName || pack.assignedUser?.email || 'Non assigné'}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-navy">
                      <Edit2 size={14} className="text-gray-300" /> 
                      {pack.targetQuestionCount ? `Série de ${pack.targetQuestionCount} questions` : 'Toutes les questions'}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-navy">
                      <Clock size={14} className="text-gray-300" />
                      {pack.durationOverride ? `Timer forcé : ${pack.durationOverride}s` : 'Timer par défaut'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${pack.isActive ? 'bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-400'}`} />
                    <span className="text-[12px] font-black text-navy uppercase tracking-wider">{pack.isActive ? 'Actif' : 'Masqué'}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(pack); }}
                      className="p-2.5 rounded-xl bg-gray-100 text-navy hover:bg-navy hover:text-white transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(pack.id); }}
                      className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PackModal 
        isOpen={isModalOpen}
        pack={editingPack}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
