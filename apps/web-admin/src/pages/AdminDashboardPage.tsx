import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { 
  Users, 
  CircleGauge, 
  Zap, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock
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
  Cell
} from 'recharts';

export function AdminDashboardPage() {
  const { stats, activity, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 text-red-500 font-bold">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-[#F8F5F1] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-[#172E42] mb-1">Vue d'ensemble</h1>
        <p className="text-[14px] font-semibold text-[#5a7a99]">Statistiques globales et activité de la plateforme</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard 
          title="Utilisateurs" 
          value={stats?.users.total || 0} 
          subValue={`+${stats?.users.newThisWeek} cette semaine`}
          icon={<Users className="text-[#10B981]" size={24} />}
          color="bg-green-50"
        />
        <KPICard 
          title="Questions" 
          value={stats?.questions.total || 0} 
          subValue="Toutes catégories"
          icon={<CircleGauge className="text-[#D27A2D]" size={24} />}
          color="bg-orange-50"
        />
        <KPICard 
          title="Sessions" 
          value={stats?.sessions.total || 0} 
          subValue={`${stats?.sessions.last7Days} derniers 7j`}
          icon={<Zap className="text-[#7C3AED]" size={24} />}
          color="bg-purple-50"
        />
        <KPICard 
          title="Conversion" 
          value="12.4%" 
          subValue="+2.1% vs mois dernier"
          icon={<TrendingUp className="text-[#1CB0F6]" size={24} />}
          color="bg-blue-50"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-[32px] shadow-soft border border-ink-100">
          <h3 className="text-[18px] font-black text-[#172E42] mb-6">Activité (30 derniers jours)</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.charts.sessionsByDay}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D27A2D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D27A2D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#5a7a99', fontSize: 10}}
                  tickFormatter={(val: string) => val.split('-').slice(1).reverse().join('/')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#5a7a99', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#D27A2D" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-soft border border-ink-100 overflow-hidden">
          <h3 className="text-[18px] font-black text-[#172E42] mb-6">Répartition par Type de bail</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts.questionsByCategory} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>

                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
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
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={24}>
                  {stats?.charts.questionsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-[32px] shadow-soft border border-ink-100">
        <h3 className="text-[18px] font-black text-[#172E42] mb-6">Activité récente</h3>
        <div className="space-y-6">
          {activity?.recentSessions.map((session: any) => (
            <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                  {session.user.profile?.avatarUrl ? (
                    <img src={session.user.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[#5a7a99]">
                      {session.user.profile?.displayName?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#172E42]">
                    {session.user.profile?.displayName || 'Utilisateur'} 
                    <span className="font-semibold text-[#5a7a99] ml-1">
                      {session.pack ? `a joué le pack ${session.pack.name}` : 'a terminé un quiz'}
                    </span>
                  </p>
                  <p className="text-[12px] font-bold text-[#D27A2D]">Score: {session.score}% • {session.xpEarned} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#5a7a99]">
                <Clock size={14} />
                <span className="text-[12px] font-bold">
                  {new Date(session.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, subValue, icon, color, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-[28px] shadow-soft border border-ink-100 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-black ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </div>
        )}
      </div>
      <h4 className="text-[14px] font-bold text-[#5a7a99] mb-1">{title}</h4>
      <p className="text-[28px] font-black text-[#172E42] mb-1">{value}</p>
      <p className="text-[12px] font-bold text-[#5a7a99] opacity-70">{subValue}</p>
    </div>
  );
}
