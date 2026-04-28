import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

const BADGE_META: Record<string, { gradient: string; levelLabel: string; barColor: string }> = {
  FIRST_SESSION:    { gradient: 'from-amber-400 to-orange-500',   levelLabel: 'Bronze', barColor: 'bg-amber-400' },
  STREAK_DAYS:      { gradient: 'from-blue-400 to-indigo-500',    levelLabel: 'Argent', barColor: 'bg-blue-400' },
  CORRECT_STREAK:   { gradient: 'from-green-400 to-emerald-500',  levelLabel: 'Bronze', barColor: 'bg-green-400' },
  CATEGORY_MASTERY: { gradient: 'from-purple-400 to-violet-500',  levelLabel: 'Or',     barColor: 'bg-purple-400' },
  FAST_ANSWER:      { gradient: 'from-yellow-400 to-amber-500',   levelLabel: 'Bronze', barColor: 'bg-yellow-400' },
  TOP_RANK:         { gradient: 'from-rose-400 to-pink-500',      levelLabel: 'Or',     barColor: 'bg-rose-400' },
  WEEKLY_CHAMPION:  { gradient: 'from-cyan-400 to-sky-500',       levelLabel: 'Or',     barColor: 'bg-cyan-400' },
  TOTAL_XP:         { gradient: 'from-violet-400 to-purple-500',  levelLabel: 'Argent', barColor: 'bg-violet-400' },
  TOTAL_QUESTIONS:  { gradient: 'from-teal-400 to-green-500',     levelLabel: 'Bronze', barColor: 'bg-teal-400' },
  PERFECT_SESSION:  { gradient: 'from-orange-400 to-red-500',     levelLabel: 'Or',     barColor: 'bg-orange-400' },
};

const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

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
        { id: 'sessions', label: 'Sessions jouées',  target: totalSessions },
        { id: 'accuracy', label: 'Taux de réussite', target: avgAccuracy, suffix: '%' },
        { id: 'xp', label: 'XP total',         target: user.profile?.xpTotal ?? 0 },
        { id: 'streak', label: 'Jours de série',   target: user.profile?.streakDays ?? 0, suffix: ' j' },
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
        case 'FIRST_SESSION':   progress = Math.min(completedSessions, badge.conditionValue); break;
        case 'STREAK_DAYS':     progress = Math.min(currentStreak, badge.conditionValue); break;
        case 'TOTAL_XP':        progress = Math.min(totalXp, badge.conditionValue); break;
        case 'TOTAL_QUESTIONS': progress = Math.min(totalQuestions, badge.conditionValue); break;
        case 'PERFECT_SESSION': progress = Math.min(perfectSessions, badge.conditionValue); break;
        default:                progress = unlocked ? badge.conditionValue : 0;
      }

      return {
        slug: badge.slug,
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
