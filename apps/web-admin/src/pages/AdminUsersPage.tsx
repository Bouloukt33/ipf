import { useState, type CSSProperties } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { Search, Mail, Zap, UserPlus, UserX, UserCheck, Users as UsersIcon } from 'lucide-react';
import { UserModal } from '../components/admin/UserModal';
import { InfoTip } from '../components/admin/InfoTip';
import { Toast, useToast } from '../components/admin/Toast';
import type { CreateUserPayload } from '../services/users.service';

/** Entrée en scène décalée : l'état 0 % est maintenu pendant le délai. */
const enterAt = (ms: number): CSSProperties => ({
  animationDelay: `${ms}ms`,
  animationFillMode: 'backwards',
});

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
    <div className="flex-1 p-8 bg-cream min-h-screen">
      <div className="flex justify-between items-center mb-8 motion-safe:animate-fade-in-down">
        <div>
          <h1 className="text-[28px] font-black text-text-primary mb-1">Utilisateurs</h1>
          <p className="text-[14px] font-semibold text-steel">Analyse des performances et engagement des joueurs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-[52px] px-8 rounded-[20px] border-none bg-gradient-primary text-white font-black text-[15px]
              flex items-center gap-3 cursor-pointer shadow-primary transition-transform
              motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.97]
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <UserPlus size={20} aria-hidden /> Nouvel utilisateur
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

      <div className="flex flex-wrap items-center gap-4 mb-8 motion-safe:animate-fade-in-up" style={enterAt(80)}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" size={18} aria-hidden />
          <input
            type="text"
            placeholder="Rechercher un utilisateur (nom, email)..."
            aria-label="Rechercher un utilisateur"
            className="w-full h-[52px] pl-12 pr-4 rounded-[18px] border-2 border-transparent bg-white shadow-soft
              focus:border-primary outline-none transition-colors font-semibold"
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div
        className="bg-white rounded-[32px] shadow-soft border border-ink-100 overflow-hidden motion-safe:animate-fade-in-up"
        style={enterAt(160)}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-steel">Utilisateur</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-steel">Statut</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-steel">Niveau / XP</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-steel">Engagement</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-steel">Performance</th>
              <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-wider text-steel">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <SkeletonRows />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-steel">
                    <UsersIcon size={28} aria-hidden />
                    <p className="text-[13px] font-bold">Aucun utilisateur ne correspond à cette recherche.</p>
                  </div>
                </td>
              </tr>
            ) : users.map((user) => (
              <tr
                key={user.id}
                className={`group transition-colors hover:bg-cream/60 ${!user.isActive ? 'opacity-60' : ''}`}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-full bg-gradient-primary text-white flex items-center justify-center
                        font-black ring-2 ring-ink-100 flex-shrink-0
                        transition-transform duration-200 motion-safe:group-hover:scale-110"
                    >
                      {user.profile.displayName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-text-primary">{user.profile.displayName || 'Sans nom'}</p>
                      <p className="text-[12px] font-semibold text-steel flex items-center gap-1">
                        <Mail size={12} aria-hidden /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider
                      ${user.isActive ? 'bg-green-50 text-[#059669]' : 'bg-red-50 text-[#DC2626]'}`}
                  >
                    <span
                      aria-hidden
                      className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-400'}`}
                    />
                    {user.isActive ? 'Actif' : 'Suspendu'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-navy text-white text-[11px] font-black">
                      LVL {user.profile.level}
                    </div>
                    <span className="text-[13px] font-bold text-text-primary tabular-nums">
                      {user.stats.totalXpEarned.toLocaleString()} XP
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-text-primary">
                      <Zap size={14} className="text-orange-500 fill-orange-500" aria-hidden />
                      {user.profile.streakDays} jours de série
                    </div>
                    <p className="text-[12px] font-semibold text-steel">{user.stats.sessionsPlayed} sessions jouées</p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-black text-[#059669]">{user.stats.accuracy}% précision</span>
                    <div className="w-[120px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full origin-left transition-transform duration-500
                          motion-safe:animate-grow-x"
                        style={{ transform: `scaleX(${Math.min(user.stats.accuracy, 100) / 100})` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <button
                    onClick={() => handleToggleActive(user.id, user.email, user.isActive)}
                    disabled={togglingId === user.id}
                    title={user.isActive ? 'Suspendre le compte' : 'Réactiver le compte'}
                    className={`p-2 rounded-xl cursor-pointer border-none transition-all disabled:opacity-50
                      motion-safe:hover:scale-110 motion-safe:active:scale-95 ${
                      user.isActive
                        ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                        : 'bg-green-50 text-[#10B981] hover:bg-[#10B981] hover:text-white'
                    }`}
                  >
                    {user.isActive ? <UserX size={16} aria-hidden /> : <UserCheck size={16} aria-hidden />}
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

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} aria-hidden>
          <td className="px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-ink-100 animate-pulse flex-shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded-lg bg-ink-100 animate-pulse" />
                <div className="h-3 w-44 rounded-lg bg-ink-100 animate-pulse" />
              </div>
            </div>
          </td>
          <td className="px-6 py-5"><div className="h-6 w-20 rounded-full bg-ink-100 animate-pulse" /></td>
          <td className="px-6 py-5"><div className="h-6 w-24 rounded-lg bg-ink-100 animate-pulse" /></td>
          <td className="px-6 py-5"><div className="h-6 w-28 rounded-lg bg-ink-100 animate-pulse" /></td>
          <td className="px-6 py-5"><div className="h-6 w-24 rounded-lg bg-ink-100 animate-pulse" /></td>
          <td className="px-6 py-5"><div className="h-8 w-8 rounded-xl bg-ink-100 animate-pulse" /></td>
        </tr>
      ))}
    </>
  );
}
