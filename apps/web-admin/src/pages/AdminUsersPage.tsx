import { useAdminUsers } from '../hooks/useAdminUsers';
import { Search, Mail, Zap } from 'lucide-react';

export function AdminUsersPage() {
  const { users, isLoading, setFilters, filters } = useAdminUsers();

  return (
    <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-[#172E42] mb-1">Utilisateurs</h1>
        <p className="text-[14px] font-semibold text-[#5a7a99]">Analyse des performances et engagement des joueurs</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a7a99]" size={18} />
          <input 
            type="text"
            placeholder="Rechercher un utilisateur (nom, email)..."
            className="w-full h-[52px] pl-12 pr-4 rounded-[18px] border-2 border-transparent bg-white shadow-soft focus:border-[#D27A2D] outline-none transition-all font-semibold"
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-soft border border-ink-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Utilisateur</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Niveau / XP</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Engagement</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Performance</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="p-20 text-center text-[#5a7a99] font-bold">Chargement...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center font-black text-[#D27A2D]">
                      {user.profile.displayName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-[#172E42]">{user.profile.displayName || 'Sans nom'}</p>
                      <p className="text-[12px] font-semibold text-[#5a7a99] flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-navy text-white text-[11px] font-black">
                      LVL {user.profile.level}
                    </div>
                    <span className="text-[13px] font-bold text-[#172E42]">{user.stats.totalXpEarned.toLocaleString()} XP</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#172E42]">
                      <Zap size={14} className="text-orange-500 fill-orange-500" />
                      {user.profile.streakDays} jours de série
                    </div>
                    <p className="text-[12px] font-semibold text-[#5a7a99]">{user.stats.sessionsPlayed} sessions jouées</p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between max-w-[120px]">
                      <span className="text-[12px] font-black text-[#10B981]">{user.stats.accuracy}% précision</span>
                    </div>
                    <div className="w-[120px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#10B981] transition-all" 
                        style={{ width: `${user.stats.accuracy}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <button className="p-2 rounded-xl bg-gray-100 text-[#172E42] hover:bg-[#172E42] hover:text-white transition-all">
                    <Search size={16} />
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
