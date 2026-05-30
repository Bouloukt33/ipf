import { useAdminCategories } from '../hooks/useAdminCategories';
import { BookOpen, Plus, MoreVertical } from 'lucide-react';

export function AdminCategoriesPage() {
  const { categories, isLoading } = useAdminCategories();

  return (
    <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#172E42] mb-1">Types de baux</h1>
          <p className="text-[14px] font-semibold text-[#5a7a99]">Gestion des catégories de questions et thématiques</p>
        </div>
        <button className="h-[48px] px-6 rounded-[16px] bg-[#172E42] text-white font-black text-[14px] flex items-center gap-2 hover:bg-black transition-all">
          <Plus size={18} /> Nouveau bail
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-[#5a7a99] font-bold">Chargement...</div>
        ) : categories.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-[32px] shadow-soft border border-ink-100 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                style={{ backgroundColor: cat.color || '#D27A2D' }}
              >
                <BookOpen size={28} />
              </div>
              <button className="p-2 text-[#5a7a99] hover:bg-gray-50 rounded-xl transition-all">
                <MoreVertical size={20} />
              </button>
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
                <div className="px-2.5 py-1 rounded-lg bg-purple-50 text-[#7C3AED] text-[10px] font-black uppercase">
                  Premium
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
