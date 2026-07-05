import { useState } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { Search, Mail, Zap, UserPlus, UserX, UserCheck } from 'lucide-react';
import { UserModal } from '../components/admin/UserModal';
import { InfoTip } from '../components/admin/InfoTip';
import { Toast, useToast } from '../components/admin/Toast';
import type { CreateUserPayload } from '../services/users.service';

export function AdminUsersPage() {
  const { users, isLoading, setFilters, filters, createUser, toggleUserActive } = useAdminUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { toast, show: showToast, hide: hideToast } = useToast();

  const handleCreate = async (data: CreateUserPayload) => {
    try {
      const result = await createUser(data);
      showToast(result.message || 'Compte créé avec succès !', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la création', 'error');
      throw err; // garde le modal ouvert
    }
  };

  const handleToggleActive = async (id: string, email: string, isActive: boolean) => {
    if (isActive && !confirm(`Suspendre le compte de ${email} ? Il ne pourra plus se connecter.`)) return;
    setTogglingId(id);
    try {
      await toggleUserActive(id);
      showToast(isActive ? 'Compte suspendu.' : 'Compte réactivé.', isActive ? 'info' : 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors du changement de statut', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#172E42] mb-1">Utilisateurs</h1>
          <p className="text-[14px] font-semibold text-[#5a7a99]">Analyse des performances et engagement des joueurs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-[52px] px-8 rounded-[20px] bg-navy text-white font-black text-[15px] flex items-center gap-3 hover:bg-black shadow-lg shadow-navy/20 transition-all active:scale-95"
          >
            <UserPlus size={20} /> Nouvel utilisateur
          </button>
          <InfoTip
            label="Aide sur la gestion des comptes"
            side="left"
            widthClass="w-72"
            content={
              <>
                <p className="mb-1"><b>Créer</b> : le compte est ouvert (Auth0 + base) et
                l'utilisateur reçoit un email pour définir son mot de passe.</p>
                <p><b>Suspendre</b> : bloque la connexion sans rien supprimer —
                réactivable à tout moment depuis la liste.</p>
              </>
            }
          />
        </div>
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
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Statut</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Niveau / XP</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Engagement</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Performance</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#5a7a99]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="p-20 text-center text-[#5a7a99] font-bold">Chargement...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50/30 transition-colors ${!user.isActive ? 'opacity-60' : ''}`}>
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
                    <span className={`w-2.5 h-2.5 rounded-full ${user.isActive ? 'bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-400'}`} />
                    <span className="text-[12px] font-black text-[#172E42] uppercase tracking-wider">{user.isActive ? 'Actif' : 'Suspendu'}</span>
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
                  <button
                    onClick={() => handleToggleActive(user.id, user.email, user.isActive)}
                    disabled={togglingId === user.id}
                    title={user.isActive ? 'Suspendre le compte' : 'Réactiver le compte'}
                    className={`p-2 rounded-xl transition-all disabled:opacity-50 ${
                      user.isActive
                        ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                        : 'bg-green-50 text-[#10B981] hover:bg-[#10B981] hover:text-white'
                    }`}
                  >
                    {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreate}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onHide={hideToast}
      />
    </div>
  );
}
