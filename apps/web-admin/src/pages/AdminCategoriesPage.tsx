import { useAdminCategories } from '../hooks/useAdminCategories';
import { BookOpen, Plus, MoreVertical } from 'lucide-react';
import { PageHero } from '../components/admin/PageHero';
import { enterAt } from '../lib/utils';

export function AdminCategoriesPage() {
  const { categories, isLoading } = useAdminCategories();

  return (
    <div className="flex-1 p-8 bg-cream min-h-screen">
      <PageHero
        eyebrow="Contenu"
        title="Types de baux"
        subtitle="Gestion des catégories de questions et thématiques"
        actions={
          <button
            className="h-[48px] px-6 rounded-2xl border-none bg-gradient-primary text-white font-black text-[14px]
              flex items-center gap-2 cursor-pointer shadow-primary transition-transform
              motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.97]"
          >
            <Plus size={18} aria-hidden /> Nouveau bail
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-steel font-bold">Chargement...</div>
        ) : categories.map((cat, index) => (
          <div
            key={cat.id}
            className="bg-white p-6 rounded-[32px] shadow-soft border border-ink-100 flex flex-col
              transition-transform duration-200 motion-safe:hover:-translate-y-1 motion-safe:animate-fade-in-up"
            style={enterAt(120 + Math.min(index, 8) * 70)}
          >
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
