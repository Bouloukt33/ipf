import { useAdminSubscriptions } from '../hooks/useAdminSubscriptions';
import { Calendar } from 'lucide-react';

export function AdminSubscriptionsPage() {
  const { subscriptions, isLoading } = useAdminSubscriptions();

  return (
    <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-[#172E42] mb-1">Abonnements</h1>
        <p className="text-[14px] font-semibold text-[#5a7a99]">Suivi des paiements et gestion des accès premium</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-[32px] shadow-soft border border-ink-100 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Abonné</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Plan</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Statut</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Usage</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Fin période</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-[#5a7a99] font-bold">Chargement...</td></tr>
                ) : subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-[14px] font-black text-[#172E42]">{sub.profile.displayName || 'Sans nom'}</p>
                      <p className="text-[12px] font-semibold text-[#5a7a99]">{sub.email}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[#D27A2D] text-[11px] font-black uppercase">
                        {sub.subscription.plan.name}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[12px] font-black ${sub.subscription.status === 'ACTIVE' ? 'text-[#10B981]' : 'text-red-500'}`}>
                        {sub.subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[13px] font-bold text-[#172E42]">{sub.usage.sessionsPlayed} sess.</p>
                      <p className="text-[11px] font-semibold text-[#5a7a99]">{sub.usage.totalHours}h de jeu</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#172E42]">
                        <Calendar size={14} className="text-[#5a7a99]" />
                        {new Date(sub.subscription.currentPeriodEnd).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar side info or quick stats could go here */}
        <div className="space-y-6">
          <div className="bg-navy p-8 rounded-[32px] text-white shadow-card">
            <h3 className="text-[18px] font-black mb-4">Revenus récurrents</h3>
            <p className="text-[36px] font-black mb-2">1,240 €</p>
            <p className="text-[13px] font-bold text-white/60 mb-6">MRR Estimé (Mois en cours)</p>
            <div className="h-px bg-white/10 mb-6" />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-white/70">Abonnés actifs</span>
                <span className="text-[15px] font-black">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-white/70">Taux de churn</span>
                <span className="text-[15px] font-black text-red-400">4.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
