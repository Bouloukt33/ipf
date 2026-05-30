import { useAdminPlans } from '../hooks/useAdminMarketing';
import { CreditCard, Check, Settings } from 'lucide-react';

export function AdminPlansPage() {
  const { plans, isLoading } = useAdminPlans();

  return (
    <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-[#172E42] mb-1">Plans tarifaires</h1>
        <p className="text-[14px] font-semibold text-[#5a7a99]">Configuration des offres et tarifs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-[#5a7a99] font-bold">Chargement...</div>
        ) : plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[32px] shadow-soft border border-ink-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#172E42] text-white flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <button className="p-2 text-[#5a7a99] hover:bg-white rounded-xl transition-all">
                  <Settings size={20} />
                </button>
              </div>
              <h3 className="text-[20px] font-black text-[#172E42] mb-1">{plan.name}</h3>
              <p className="text-[32px] font-black text-[#D27A2D]">{plan.price}€<span className="text-[14px] text-[#5a7a99] font-bold">/mois</span></p>
            </div>
            
            <div className="p-8 flex-1">
              <p className="text-[13px] font-bold text-[#5a7a99] uppercase tracking-wider mb-4">Fonctionnalités</p>
              <ul className="space-y-3">
                {JSON.parse(plan.features || '[]').map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-[14px] font-semibold text-[#172E42]">
                    <Check size={18} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 mt-auto border-t border-gray-50 flex items-center justify-between">
              <span className="text-[12px] font-black text-[#5a7a99]">{plan._count.subscriptions} abonnés</span>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${plan.isActive ? 'bg-green-50 text-[#10B981]' : 'bg-red-50 text-red-500'}`}>
                {plan.isActive ? 'Actif' : 'Masqué'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
