import type { ReactNode } from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { InfoTip } from '../components/admin/InfoTip';
import { PageHero } from '../components/admin/PageHero';
import { enterAt } from '../lib/utils';
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
      <PageHero
        eyebrow="Dashboard"
        title="Vue d'ensemble"
        subtitle="Statistiques globales et activité de la plateforme"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassKpi
            title="Utilisateurs"
            value={stats?.users.total || 0}
            subValue={`+${stats?.users.newThisWeek} cette semaine`}
            icon={<Users size={20} className="text-[#34D399]" />}
            help="Nombre total de comptes créés, actifs ou suspendus."
            delay={80}
          />
          <GlassKpi
            title="Questions"
            value={stats?.questions.total || 0}
            subValue="Toutes catégories"
            icon={<CircleGauge size={20} className="text-primary-light" />}
            help="Questions en base, tous statuts confondus (actives, suspendues, archivées)."
            delay={160}
          />
          <GlassKpi
            title="Sessions"
            value={stats?.sessions.total || 0}
            subValue={`${stats?.sessions.last7Days} derniers 7j`}
            icon={<Zap size={20} className="text-[#A78BFA]" />}
            help="Parties de quiz lancées par les joueurs depuis le lancement."
            delay={240}
          />
          <GlassKpi
            title="Conversion"
            value="12.4%"
            subValue="+2.1% vs mois dernier"
            icon={<TrendingUp size={20} className="text-[#38BDF8]" />}
            trend="up"
            help="Part des utilisateurs gratuits passés à un abonnement payant."
            delay={320}
          />
        </div>
      </PageHero>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <section
          className="bg-white p-8 rounded-[32px] shadow-soft border border-ink-100 motion-safe:animate-fade-in-up"
          style={enterAt(400)}
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
          style={enterAt(480)}
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
        style={enterAt(560)}
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
                style={enterAt(640 + Math.min(index, 8) * 60)}
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

interface GlassKpiProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: ReactNode;
  trend?: 'up' | 'down';
  help?: string;
  delay?: number;
}

/** Tuile KPI « verre dépoli » posée sur le bandeau héros. */
function GlassKpi({ title, value, subValue, icon, trend, help, delay = 0 }: GlassKpiProps) {
  return (
    <div
      className="group rounded-3xl bg-white/10 border border-white/15 backdrop-blur p-5
        transition-all duration-200 hover:bg-white/15 motion-safe:hover:-translate-y-0.5
        motion-safe:animate-fade-in-up"
      style={enterAt(delay)}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          aria-hidden
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10
            transition-transform duration-200 motion-safe:group-hover:scale-110"
        >
          {icon}
        </span>
        {trend && (
          <span
            className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[11px] font-black bg-white/10
              ${trend === 'up' ? 'text-[#34D399]' : 'text-[#F87171]'}`}
          >
            {trend === 'up' ? <ArrowUpRight size={13} aria-hidden /> : <ArrowDownRight size={13} aria-hidden />}
            <span className="sr-only">{trend === 'up' ? 'en hausse' : 'en baisse'}</span>
          </span>
        )}
      </div>
      <p className="text-[26px] font-black tabular-nums leading-none mb-1.5">{value}</p>
      <p className="text-[12px] font-bold text-white/60 flex items-center gap-1">
        {title}
        {help && <InfoTip content={help} label={`À propos de « ${title} »`} iconSize={12} onDark />}
      </p>
      {subValue && <p className="text-[11px] font-semibold text-white/40 mt-0.5">{subValue}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 p-8 bg-cream min-h-screen" aria-busy="true" aria-label="Chargement du dashboard">
      <div className="rounded-[32px] bg-gradient-hero p-8 lg:p-10 mb-8">
        <div className="h-7 w-56 rounded-xl bg-white/10 animate-pulse mb-2" />
        <div className="h-4 w-80 rounded-lg bg-white/10 animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-white/10 p-5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 animate-pulse mb-3" />
              <div className="h-7 w-16 rounded-lg bg-white/10 animate-pulse mb-2" />
              <div className="h-3 w-24 rounded-lg bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
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
