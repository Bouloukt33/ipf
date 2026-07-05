import type { CSSProperties, ReactNode } from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { InfoTip } from '../components/admin/InfoTip';
import {
  Users,
  CircleGauge,
  Zap,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  BarChart3,
  Inbox,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

/** Entrée en scène décalée : l'état 0 % est maintenu pendant le délai. */
const enterAt = (ms: number): CSSProperties => ({
  animationDelay: `${ms}ms`,
  animationFillMode: 'backwards',
});

const CHART_TOOLTIP_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 10px 30px rgba(23, 46, 66, 0.15)',
  fontFamily: 'Nunito, sans-serif',
  fontWeight: 700,
  fontSize: '12px',
} as const;

export function AdminDashboardPage() {
  const { stats, activity, isLoading, error } = useAdminDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex-1 p-8 bg-cream min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[28px] shadow-soft border border-ink-100 p-8 text-center motion-safe:animate-scale-in">
          <span aria-hidden className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-[#EF4444] mb-4">
            <Activity size={24} />
          </span>
          <h1 className="text-[18px] font-black text-text-primary mb-1">Impossible de charger le dashboard</h1>
          <p className="text-[13px] font-semibold text-steel">{error}</p>
        </div>
      </div>
    );
  }

  const sessions = activity?.recentSessions ?? [];

  return (
    <div className="flex-1 p-8 bg-cream min-h-screen">
      <header className="mb-8 motion-safe:animate-fade-in-down">
        <h1 className="text-[28px] font-black text-text-primary mb-1">Vue d'ensemble</h1>
        <p className="text-[14px] font-semibold text-steel">Statistiques globales et activité de la plateforme</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard
          title="Utilisateurs"
          value={stats?.users.total || 0}
          subValue={`+${stats?.users.newThisWeek} cette semaine`}
          icon={<Users className="text-[#10B981]" size={24} />}
          iconBg="bg-green-50"
          help="Nombre total de comptes créés, actifs ou suspendus."
          delay={0}
        />
        <KPICard
          title="Questions"
          value={stats?.questions.total || 0}
          subValue="Toutes catégories"
          icon={<CircleGauge className="text-primary" size={24} />}
          iconBg="bg-orange-50"
          help="Questions en base, tous statuts confondus (actives, suspendues, archivées)."
          delay={80}
        />
        <KPICard
          title="Sessions"
          value={stats?.sessions.total || 0}
          subValue={`${stats?.sessions.last7Days} derniers 7j`}
          icon={<Zap size={24} className="text-[#7C3AED]" />}
          iconBg="bg-purple-50"
          help="Parties de quiz lancées par les joueurs depuis le lancement."
          delay={160}
        />
        <KPICard
          title="Conversion"
          value="12.4%"
          subValue="+2.1% vs mois dernier"
          icon={<TrendingUp className="text-[#1CB0F6]" size={24} />}
          iconBg="bg-blue-50"
          trend="up"
          help="Part des utilisateurs gratuits passés à un abonnement payant."
          delay={240}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <section
          className="bg-white p-8 rounded-[32px] shadow-soft border border-ink-100 motion-safe:animate-fade-in-up"
          style={enterAt(320)}
        >
          <ChartHeader icon={<Activity size={17} />} title="Activité (30 derniers jours)" />
          <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.charts.sessionsByDay}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D27A2D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D27A2D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(23,46,66,0.06)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#5a7a99', fontSize: 10}}
                  tickFormatter={(val: string) => val.split('-').slice(1).reverse().join('/')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#5a7a99', fontSize: 12}} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  cursor={{ stroke: 'rgba(23,46,66,0.15)', strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#D27A2D" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section
          className="bg-white p-8 rounded-[32px] shadow-soft border border-ink-100 overflow-hidden motion-safe:animate-fade-in-up"
          style={enterAt(400)}
        >
          <ChartHeader icon={<BarChart3 size={17} />} title="Répartition par Type de bail" />
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts.questionsByCategory} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(23,46,66,0.06)" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#172E42', fontWeight: 700, fontSize: 12}}
                  width={140}
                />
                <Tooltip
                  cursor={{fill: 'rgba(23,46,66,0.03)'}}
                  contentStyle={CHART_TOOLTIP_STYLE}
                />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={24}>
                  {stats?.charts.questionsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Recent Activity */}
      <section
        className="bg-white p-8 rounded-[32px] shadow-soft border border-ink-100 motion-safe:animate-fade-in-up"
        style={enterAt(480)}
      >
        <ChartHeader icon={<Clock size={17} />} title="Activité récente" />
        {sessions.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-steel">
            <Inbox size={28} aria-hidden />
            <p className="text-[13px] font-bold">Aucune session récente pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between px-3 py-3 rounded-2xl transition-colors hover:bg-cream/70
                  motion-safe:animate-fade-in-up"
                style={enterAt(560 + Math.min(index, 8) * 60)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary text-white flex-shrink-0 overflow-hidden ring-2 ring-ink-100">
                    {session.user.profile?.avatarUrl ? (
                      <img src={session.user.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black">
                        {session.user.profile?.displayName?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-text-primary truncate">
                      {session.user.profile?.displayName || 'Utilisateur'}
                      <span className="font-semibold text-steel ml-1">
                        {session.pack ? `a joué le pack ${session.pack.name}` : 'a terminé un quiz'}
                      </span>
                    </p>
                    <p className="text-[12px] font-bold text-primary">Score: {session.score}% • {session.xpEarned} XP</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-steel flex-shrink-0 ml-4">
                  <Clock size={14} aria-hidden />
                  <span className="text-[12px] font-bold">
                    {new Date(session.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ChartHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span aria-hidden className="flex items-center justify-center w-9 h-9 rounded-xl bg-cream text-primary">
        {icon}
      </span>
      <h3 className="text-[18px] font-black text-text-primary">{title}</h3>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: ReactNode;
  iconBg: string;
  trend?: 'up' | 'down';
  help?: string;
  delay?: number;
}

function KPICard({ title, value, subValue, icon, iconBg, trend, help, delay = 0 }: KPICardProps) {
  return (
    <div
      className="group relative bg-white p-6 rounded-[28px] shadow-soft border border-ink-100 flex flex-col overflow-hidden
        transition-transform duration-200 motion-safe:hover:-translate-y-1
        motion-safe:animate-fade-in-up"
      style={enterAt(delay)}
    >
      {/* Halo au survol — animé en opacité uniquement */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-primary blur-2xl
          opacity-0 transition-opacity duration-300 group-hover:opacity-20"
      />
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center
            transition-transform duration-200 motion-safe:group-hover:scale-110`}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-black
              ${trend === 'up' ? 'text-[#10B981] bg-green-50' : 'text-[#EF4444] bg-red-50'}`}
          >
            {trend === 'up' ? <ArrowUpRight size={13} aria-hidden /> : <ArrowDownRight size={13} aria-hidden />}
            <span className="sr-only">{trend === 'up' ? 'en hausse' : 'en baisse'}</span>
          </div>
        )}
      </div>
      <h4 className="text-[14px] font-bold text-steel mb-1 flex items-center gap-1">
        {title}
        {help && <InfoTip content={help} label={`À propos de « ${title} »`} iconSize={13} />}
      </h4>
      <p className="text-[30px] font-black text-text-primary mb-1 tabular-nums">{value}</p>
      {subValue && <p className="text-[12px] font-bold text-steel opacity-70">{subValue}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 p-8 bg-cream min-h-screen" aria-busy="true" aria-label="Chargement du dashboard">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-56 rounded-xl bg-ink-100 animate-pulse" />
        <div className="h-4 w-80 rounded-lg bg-ink-100 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] shadow-soft border border-ink-100">
            <div className="w-12 h-12 rounded-2xl bg-ink-100 animate-pulse mb-4" />
            <div className="h-4 w-24 rounded-lg bg-ink-100 animate-pulse mb-2" />
            <div className="h-8 w-20 rounded-lg bg-ink-100 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] shadow-soft border border-ink-100">
            <div className="h-5 w-48 rounded-lg bg-ink-100 animate-pulse mb-6" />
            <div className="h-[280px] rounded-2xl bg-ink-100/60 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
