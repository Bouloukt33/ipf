'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyticsService } from '@/services/analytics.service';
import { IAdminDashboardStats } from '@/lib/user.analytics.types';
import { useAuthStore } from '@/store/auth.store';
import { Users, BookOpen, Zap, Package, CircleGauge } from 'lucide-react';
import { SessionsBarChart } from '@/components/admin/charts/SessionsBarChart';
import { ProStatusDonut } from '@/components/admin/charts/ProStatusDonut';
import { CategoryHBarChart } from '@/components/admin/charts/CategoryHBarChart';

// ── Sub-components ─────────────────────────────────────────────────────────────
function KpiCard({
    label, value, sub, icon: Icon, color, onClick,
}: {
    label:    string;
    value:    string | number;
    sub?:     string;
    icon:     React.ElementType;
    color:    string;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-[18px] border border-[rgba(210,122,45,0.12)] p-6 flex items-start gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        >
            <div className="w-12 h-12 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: color }}>
                <Icon size={22} strokeWidth={2.2} className="text-white" />
            </div>
            <div>
                <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-0.5">{label}</p>
                <p className="text-[28px] font-black text-[#172E42] leading-none">{value}</p>
                {sub && <p className="text-[12px] font-semibold text-[#5a7a99] mt-1">{sub}</p>}
            </div>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-[18px] border border-[rgba(210,122,45,0.12)] p-6">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-5">{title}</h3>
            {children}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
    const router                  = useRouter();
    const [stats, setStats]       = useState<IAdminDashboardStats | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const authLoading = useAuthStore((s) => s.isLoading);
    const accessToken = useAuthStore((s) => s.accessToken);

    useEffect(() => {
        if (authLoading || !accessToken) return;
        setLoading(true);
        analyticsService.getDashboard()
            .then(setStats)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [authLoading, accessToken]);

    const now = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8F5F1]">
            <div className="mb-8">
                <h1 className="text-[24px] font-black text-[#172E42] mb-0.5">Tableau de bord</h1>
                <p className="text-[14px] font-semibold text-[#5a7a99] capitalize">{now}</p>
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl
                    text-[13px] font-bold text-[#EF4444] flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : stats && (
                <>
                    {/* KPI grid */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                        <KpiCard
                            label="Utilisateurs"
                            value={stats.users.total}
                            sub={`${stats.users.active} actifs · +${stats.users.newThisWeek} cette semaine`}
                            icon={Users}
                            color="#1e3a5f"
                            onClick={() => router.push('/admin/users')}
                        />
                        <KpiCard
                            label="Questions"
                            value={stats.questions.total}
                            icon={CircleGauge}
                            color="#D27A2D"
                            onClick={() => router.push('/admin/questions')}
                        />
                        <KpiCard
                            label="Sessions complétées"
                            value={stats.sessions.total.toLocaleString('fr-FR')}
                            sub={`${stats.sessions.last7Days} ces 7 derniers jours`}
                            icon={Zap}
                            color="#10B981"
                        />
                        <KpiCard
                            label="Catégories actives"
                            value={stats.categories}
                            icon={BookOpen}
                            color="#7C3AED"
                        />
                    </div>

                    {/* Charts row 1 */}
                    <div className="grid grid-cols-3 gap-5 mb-5">
                        {/* Sessions 30j — large */}
                        <div className="col-span-2">
                            <ChartCard title="Sessions par jour — 30 derniers jours">
                                <SessionsBarChart data={stats.charts.sessionsByDay} />
                            </ChartCard>
                        </div>

                        {/* Répartition statut pro */}
                        <ChartCard title="Répartition statut professionnel">
                            {stats.charts.usersByProStatus.length === 0 ? (
                                <p className="text-[13px] font-semibold text-[#5a7a99]">Aucune donnée</p>
                            ) : (
                                <ProStatusDonut data={stats.charts.usersByProStatus} />
                            )}
                        </ChartCard>
                    </div>

                    {/* Charts row 2 — Questions par catégorie */}
                    <div className="mb-6">
                        <ChartCard title="Questions par type de bail">
                            <CategoryHBarChart
                                data={stats.charts.questionsByCategory}
                                dataKey="count"
                                label="Questions"
                            />
                        </ChartCard>
                    </div>

                    {/* Quick links */}
                    <h2 className="text-[14px] font-extrabold uppercase tracking-widest text-[#5a7a99] mb-4">
                        Navigation rapide
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Gérer les questions',       href: '/admin/questions', icon: CircleGauge, desc: 'Créer, modifier, archiver' },
                            { label: 'Gérer les packs',           href: '/admin/packs',     icon: Package,     desc: 'Organiser les packs par bail' },
                            { label: 'Analyser les utilisateurs', href: '/admin/users',     icon: Users,       desc: 'Profil, performance, engagement' },
                        ].map(({ label, href, icon: Icon, desc }) => (
                            <button
                                key={href}
                                onClick={() => router.push(href)}
                                className="bg-white rounded-[16px] border border-[rgba(210,122,45,0.12)] p-5 text-left
                    hover:shadow-md hover:border-[rgba(210,122,45,0.3)] transition-all cursor-pointer border-none"
                            >
                                <Icon size={20} strokeWidth={2.2} className="text-[#D27A2D] mb-3" />
                                <p className="text-[14px] font-extrabold text-[#172E42] mb-0.5">{label}</p>
                                <p className="text-[12px] font-semibold text-[#5a7a99]">{desc}</p>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
