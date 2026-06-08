import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

const BADGE_META: Record<string, { gradient: string; levelLabel: string; barColor: string }> = {
    FIRST_SESSION: { gradient: 'linear-gradient(135deg,#fbbf24,#f97316)', levelLabel: 'Bronze', barColor: '#fbbf24' },
    STREAK_DAYS: { gradient: 'linear-gradient(135deg,#60a5fa,#6366f1)', levelLabel: 'Argent', barColor: '#60a5fa' },
    CORRECT_STREAK: { gradient: 'linear-gradient(135deg,#4ade80,#10b981)', levelLabel: 'Bronze', barColor: '#4ade80' },
    CATEGORY_MASTERY: { gradient: 'linear-gradient(135deg,#c084fc,#7c3aed)', levelLabel: 'Or', barColor: '#c084fc' },
    FAST_ANSWER: { gradient: 'linear-gradient(135deg,#facc15,#f59e0b)', levelLabel: 'Bronze', barColor: '#facc15' },
    TOP_RANK: { gradient: 'linear-gradient(135deg,#fb7185,#ec4899)', levelLabel: 'Or', barColor: '#fb7185' },
    WEEKLY_CHAMPION: { gradient: 'linear-gradient(135deg,#22d3ee,#0ea5e9)', levelLabel: 'Or', barColor: '#22d3ee' },
    TOTAL_XP: { gradient: 'linear-gradient(135deg,#a78bfa,#7c3aed)', levelLabel: 'Argent', barColor: '#a78bfa' },
    TOTAL_QUESTIONS: { gradient: 'linear-gradient(135deg,#2dd4bf,#22c55e)', levelLabel: 'Bronze', barColor: '#2dd4bf' },
    PERFECT_SESSION: { gradient: 'linear-gradient(135deg,#fb923c,#ef4444)', levelLabel: 'Or', barColor: '#fb923c' },
};
const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats(auth0Id: string) {
        const user = await this.prisma.user.findUnique({
            where: { auth0Id },
            include: { profile: true },
        });
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        const sessions = await this.prisma.quizSession.findMany({
            where: { userId: user.id, status: 'COMPLETED' },
        });

        const totalSessions = sessions.length;
        const totalCorrect = sessions.reduce((s, q) => s + q.correctAnswers, 0);
        const totalAnswered = sessions.reduce((s, q) => s + q.totalQuestions, 0);
        const avgAccuracy = totalAnswered > 0
            ? Math.round((totalCorrect / totalAnswered) * 100)
            : 0;

        return [
            { id: 'sessions', label: 'Sessions jouées', target: totalSessions },
            { id: 'accuracy', label: 'Taux de réussite', target: avgAccuracy, suffix: '%' },
            { id: 'xp', label: 'XP total', target: user.profile?.xpTotal ?? 0 },
            { id: 'streak', label: 'Jours de série', target: user.profile?.streakDays ?? 0, suffix: ' j' },
        ];
    }

    async getAchievements(auth0Id: string) {
        const user = await this.prisma.user.findUnique({
            where: { auth0Id },
            include: {
                profile: true,
                userBadges: { include: { badge: true } },
                quizSessions: {
                    where: { status: 'COMPLETED' },
                    select: { correctAnswers: true, totalQuestions: true },
                },
            },
        });
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        const allBadges = await this.prisma.badge.findMany({ orderBy: { order: 'asc' } });
        const unlockedIds = new Set(user.userBadges.map((ub) => ub.badgeId));

        const completedSessions = user.quizSessions.length;
        const currentStreak = user.profile?.streakDays ?? 0;
        const totalXp = user.profile?.xpTotal ?? 0;
        const totalQuestions = user.quizSessions.reduce((s, q) => s + q.totalQuestions, 0);
        const perfectSessions = user.quizSessions.filter(
            (s) => s.correctAnswers === s.totalQuestions && s.totalQuestions > 0,
        ).length;

        return allBadges.map((badge) => {
            const unlocked = unlockedIds.has(badge.id);
            const meta = BADGE_META[badge.conditionType] ?? {
                gradient: 'from-gray-400 to-slate-500',
                levelLabel: 'Bronze',
                barColor: 'bg-gray-400',
            };

            let progress = 0;
            switch (badge.conditionType) {
                case 'FIRST_SESSION': progress = Math.min(completedSessions, badge.conditionValue); break;
                case 'STREAK_DAYS': progress = Math.min(currentStreak, badge.conditionValue); break;
                case 'TOTAL_XP': progress = Math.min(totalXp, badge.conditionValue); break;
                case 'TOTAL_QUESTIONS': progress = Math.min(totalQuestions, badge.conditionValue); break;
                case 'PERFECT_SESSION': progress = Math.min(perfectSessions, badge.conditionValue); break;
                default: progress = unlocked ? badge.conditionValue : 0;
            }

            return {
                slug: badge.slug,
                conditionType: badge.conditionType,  
                gradient: meta.gradient,
                levelLabel: meta.levelLabel,
                title: badge.name,
                progress,
                progressMax: badge.conditionValue,
                description: badge.description,
                barColor: meta.barColor,
                locked: !unlocked,
                };
        });
    }

    async getStreak(auth0Id: string) {
        const user = await this.prisma.user.findUnique({
            where: { auth0Id },
            include: { profile: true },
        });
        if (!user) throw new NotFoundException('Utilisateur non trouvé');

        const now = new Date();
        const sixDaysAgo = new Date(now);
        sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
        sixDaysAgo.setHours(0, 0, 0, 0);

        const sessions = await this.prisma.quizSession.findMany({
            where: {
                userId: user.id,
                status: 'COMPLETED',
                completedAt: { gte: sixDaysAgo },
            },
            select: { completedAt: true },
        });

        const playedDays = new Set(
            sessions
                .filter((s) => s.completedAt)
                .map((s) => {
                    const d = new Date(s.completedAt!);
                    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                }),
        );

        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (6 - i));
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const isToday = i === 6;
            let status: 'done' | 'today' | 'none';
            if (isToday) {
                status = playedDays.has(key) ? 'done' : 'today';
            } else {
                status = playedDays.has(key) ? 'done' : 'none';
            }
            return { label: DAY_LABELS[d.getDay()], status };
        });

        return {
            currentStreak: user.profile?.streakDays ?? 0,
            weekDays,
        };
    }
}
