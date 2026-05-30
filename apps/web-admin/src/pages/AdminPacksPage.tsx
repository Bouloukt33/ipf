import { useAdminPacks } from '../hooks/useAdminPacks';
import { Package, Plus } from 'lucide-react';

export function AdminPacksPage() {
  const { packs, isLoading } = useAdminPacks();

  return (
    <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#172E42] mb-1">Packs Premium</h1>
          <p className="text-[14px] font-semibold text-[#5a7a99]">Gestion des packs de questions thématiques</p>
        </div>
        <button className="h-[48px] px-6 rounded-[16px] bg-[#172E42] text-white font-black text-[14px] flex items-center gap-2 hover:bg-black transition-all">
          <Plus size={18} /> Nouveau pack
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-soft border border-ink-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Pack</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Bail associé</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Statut</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={4} className="p-20 text-center text-[#5a7a99] font-bold">Chargement...</td></tr>
            ) : packs.map((pack) => (
              <tr key={pack.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a5f] flex items-center justify-center">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-[#172E42]">{pack.name}</p>
                      <p className="text-[12px] font-semibold text-[#5a7a99]">{pack.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1.5 rounded-lg bg-orange-50 text-[#D27A2D] text-[12px] font-bold">
                    {pack.category?.name || 'Non associé'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${pack.isActive ? 'bg-[#10B981]' : 'bg-red-500'}`} />
                    <span className="text-[12px] font-bold text-[#172E42]">{pack.isActive ? 'En ligne' : 'Désactivé'}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <button className="text-[13px] font-black text-[#D27A2D] hover:underline transition-all">
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
