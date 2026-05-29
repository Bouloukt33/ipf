import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const sevenDaysAgo  = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      totalQuestions,
      totalSessions,
      totalCategories,
      recentSessions,
      newUsersThisWeek,
      sessionDates,
      proStatusGroups,
      questionsByCategory,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.question.count(),
      this.prisma.quizSession.count({ where: { status: 'COMPLETED' } }),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.quizSession.count({ where: { status: 'COMPLETED', completedAt: { gte: sevenDaysAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      // Sessions des 30 derniers jours pour le graphique
      this.prisma.quizSession.findMany({
        where: { status: 'COMPLETED', completedAt: { gte: thirtyDaysAgo } },
        select: { completedAt: true },
      }),
      // Répartition par statut professionnel
      this.prisma.userProfile.groupBy({
        by: ['professionalStatus'],
        _count: { id: true },
        where: { professionalStatus: { not: null } },
      }),
      // Questions par catégorie
      this.prisma.question.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      }),
    ]);

    // Calendrier sessions (30j) — grouper par date
    const dayMap = new Map<string, number>();
    for (const s of sessionDates) {
      if (!s.completedAt) continue;
      const key = s.completedAt.toISOString().slice(0, 10);
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
    const sessionsByDay = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i + 1);
      const key = d.toISOString().slice(0, 10);
      return { date: key, sessions: dayMap.get(key) ?? 0 };
    });

    // Statut pro labels
    const proStatusLabels: Record<string, string> = {
      SALARIE:     'Salarié',
      INDEPENDANT: 'Indépendant',
      MANDATAIRE:  'Mandataire',
    };
    const usersByProStatus = proStatusGroups.map((g) => ({
      status: g.professionalStatus ?? 'Inconnu',
      label:  proStatusLabels[g.professionalStatus ?? ''] ?? g.professionalStatus ?? 'Inconnu',
      count:  g._count.id,
    }));

    // Questions par catégorie — résoudre les noms
    const catIds = questionsByCategory.map((q) => q.categoryId);
    const categories = catIds.length
      ? await this.prisma.category.findMany({
          where: { id: { in: catIds } },
          select: { id: true, name: true, color: true },
        })
      : [];
    const catMap = new Map(categories.map((c) => [c.id, c]));
    const questionsBycat = questionsByCategory
      .map((q) => ({
        category: catMap.get(q.categoryId)?.name ?? 'Inconnue',
        color:    catMap.get(q.categoryId)?.color ?? '#D27A2D',
        count:    q._count.id,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      users: { total: totalUsers, active: activeUsers, newThisWeek: newUsersThisWeek },
      questions: { total: totalQuestions },
      sessions: { total: totalSessions, last7Days: recentSessions },
      categories: totalCategories,
      charts: {
        sessionsByDay,
        usersByProStatus,
        questionsByCategory: questionsBycat,
      },
    };
  }

  async getRecentActivity() {
    const [recentSessions, recentUsers] = await Promise.all([
      this.prisma.quizSession.findMany({
        take: 10,
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        include: {
          user: { include: { profile: true } },
        },
      }),
      this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { profile: true },
      }),
    ]);

    return {
      recentSessions,
      recentUsers,
    };
  }

  async getAnalyticsUsers(filters?: {
    search?: string;
    professionalStatus?: string;
    ageRange?: string;
    page?: number;
    limit?: number;
  }) {
    const page  = filters?.page  || 1;
    const limit = filters?.limit || 20;
    const skip  = (page - 1) * limit;

    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { profile: { displayName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    if (filters?.professionalStatus) {
      where.profile = { ...where.profile, professionalStatus: filters.professionalStatus };
    }
    if (filters?.ageRange) {
      where.profile = { ...where.profile, ageRange: filters.ageRange };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: { include: { jobProfile: { include: { sector: true } } } },
          ranking: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const userIds = users.map((u) => u.id);

    const sessionAggs = await this.prisma.quizSession.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, status: 'COMPLETED' },
      _count: { id: true },
      _sum:   { correctAnswers: true, totalQuestions: true, xpEarned: true, durationMs: true },
    });

    const aggMap = new Map(sessionAggs.map((a) => [a.userId, a]));

    const data = users.map((u) => {
      const agg = aggMap.get(u.id);
      const totalQ   = agg?._sum.totalQuestions  ?? 0;
      const totalOk  = agg?._sum.correctAnswers  ?? 0;
      const accuracy = totalQ > 0 ? Math.round((totalOk / totalQ) * 100) : 0;

      return {
        id:        u.id,
        email:     u.email,
        role:      u.role,
        isActive:  u.isActive,
        createdAt: u.createdAt,
        profile: {
          displayName:        u.profile?.displayName       ?? null,
          avatarUrl:          u.profile?.avatarUrl         ?? null,
          ageRange:           u.profile?.ageRange          ?? null,
          professionalStatus: u.profile?.professionalStatus ?? null,
          jobProfile:         u.profile?.jobProfile        ?? null,
          xpTotal:            u.profile?.xpTotal           ?? 0,
          level:              u.profile?.level             ?? 1,
          streakDays:         u.profile?.streakDays        ?? 0,
          bestStreak:         u.profile?.bestStreak        ?? 0,
          lastPlayedAt:       u.profile?.lastPlayedAt      ?? null,
        },
        ranking: u.ranking
          ? { eloScore: u.ranking.eloScore, globalRank: u.ranking.globalRank }
          : null,
        stats: {
          sessionsPlayed:        agg?._count.id           ?? 0,
          totalQuestionsAnswered: totalQ,
          totalCorrectAnswers:   totalOk,
          accuracy,
          totalXpEarned:         agg?._sum.xpEarned       ?? 0,
          totalDurationMs:       agg?._sum.durationMs     ?? 0,
        },
      };
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAnalyticsUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: { include: { jobProfile: { include: { sector: true } } } },
        ranking: true,
        userBadges: { include: { badge: true }, take: 10 },
      },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentSessions, categoryAgg, activityAgg, globalAgg] = await Promise.all([
      // 20 dernières sessions
      this.prisma.quizSession.findMany({
        where: { userId: id, status: 'COMPLETED' },
        take: 20,
        orderBy: { completedAt: 'desc' },
        include: { category: { select: { name: true, slug: true, color: true } } },
      }),
      // Répartition par catégorie
      this.prisma.quizSession.groupBy({
        by: ['categoryId'],
        where: { userId: id, status: 'COMPLETED' },
        _count: { id: true },
        _sum:   { correctAnswers: true, totalQuestions: true },
      }),
      // Calendrier d'activité (30 jours) — sessions groupées par date
      this.prisma.quizSession.findMany({
        where: { userId: id, status: 'COMPLETED', startedAt: { gte: thirtyDaysAgo } },
        select: { startedAt: true },
        orderBy: { startedAt: 'asc' },
      }),
      // Stats globales
      this.prisma.quizSession.aggregate({
        where: { userId: id, status: 'COMPLETED' },
        _count: { id: true },
        _sum:   { correctAnswers: true, totalQuestions: true, xpEarned: true, durationMs: true },
        _avg:   { durationMs: true },
      }),
    ]);

    // Résoudre les noms de catégories
    const catIds = categoryAgg.map((a) => a.categoryId).filter(Boolean) as string[];
    const categories = catIds.length
      ? await this.prisma.category.findMany({
          where: { id: { in: catIds } },
          select: { id: true, name: true, color: true },
        })
      : [];
    const catMap = new Map(categories.map((c) => [c.id, c]));

    // Calendrier : grouper par date YYYY-MM-DD
    const calMap = new Map<string, number>();
    for (const s of activityAgg) {
      const key = s.startedAt.toISOString().slice(0, 10);
      calMap.set(key, (calMap.get(key) ?? 0) + 1);
    }
    const activityCalendar = Array.from(calMap.entries()).map(([date, count]) => ({ date, count }));

    const totalQ  = globalAgg._sum.totalQuestions  ?? 0;
    const totalOk = globalAgg._sum.correctAnswers   ?? 0;

    return {
      id:        user.id,
      email:     user.email,
      role:      user.role,
      isActive:  user.isActive,
      createdAt: user.createdAt,
      profile: {
        displayName:        user.profile?.displayName       ?? null,
        avatarUrl:          user.profile?.avatarUrl         ?? null,
        ageRange:           user.profile?.ageRange          ?? null,
        professionalStatus: user.profile?.professionalStatus ?? null,
        jobProfile:         user.profile?.jobProfile        ?? null,
        xpTotal:            user.profile?.xpTotal           ?? 0,
        level:              user.profile?.level             ?? 1,
        streakDays:         user.profile?.streakDays        ?? 0,
        bestStreak:         user.profile?.bestStreak        ?? 0,
        lastPlayedAt:       user.profile?.lastPlayedAt      ?? null,
      },
      ranking: user.ranking
        ? { eloScore: user.ranking.eloScore, globalRank: user.ranking.globalRank,
            weeklyRank: user.ranking.weeklyRank, monthlyRank: user.ranking.monthlyRank }
        : null,
      badges: user.userBadges.map((ub) => ({
        name: ub.badge.name, slug: ub.badge.slug, unlockedAt: ub.unlockedAt,
      })),
      stats: {
        sessionsPlayed:         globalAgg._count.id         ?? 0,
        totalQuestionsAnswered: totalQ,
        totalCorrectAnswers:    totalOk,
        accuracy: totalQ > 0 ? Math.round((totalOk / totalQ) * 100) : 0,
        totalXpEarned:          globalAgg._sum.xpEarned     ?? 0,
        totalDurationMs:        globalAgg._sum.durationMs   ?? 0,
        avgSessionDurationMs:   Math.round(globalAgg._avg.durationMs ?? 0),
      },
      recentSessions: recentSessions.map((s) => ({
        id:              s.id,
        mode:            s.mode,
        score:           s.score,
        correctAnswers:  s.correctAnswers,
        totalQuestions:  s.totalQuestions,
        accuracy:        s.totalQuestions > 0
          ? Math.round((s.correctAnswers / s.totalQuestions) * 100) : 0,
        xpEarned:        s.xpEarned,
        durationMs:      s.durationMs,
        completedAt:     s.completedAt,
        category:        s.category,
      })),
      categoryBreakdown: categoryAgg.map((a) => {
        const tq  = a._sum.totalQuestions ?? 0;
        const tok = a._sum.correctAnswers  ?? 0;
        const cat = a.categoryId ? catMap.get(a.categoryId) : null;
        return {
          categoryId:   a.categoryId,
          categoryName: cat?.name  ?? 'Inconnue',
          color:        cat?.color ?? '#999',
          sessionsCount: a._count.id,
          accuracy: tq > 0 ? Math.round((tok / tq) * 100) : 0,
        };
      }).sort((a, b) => b.sessionsCount - a.sessionsCount),
      activityCalendar,
    };
  }

  async getQuestionStats() {
    const [byCategory, byLevel, premiumCount] = await Promise.all([
      this.prisma.question.groupBy({
        by: ['categoryId'],
        _count: true,
      }),
      this.prisma.question.groupBy({
        by: ['level'],
        _count: true,
      }),
      this.prisma.question.count({ where: { isPremium: true } }),
    ]);

    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return {
      byCategory: byCategory.map((item) => ({
        category: categoryMap.get(item.categoryId) || 'Unknown',
        count: item._count,
      })),
      byLevel,
      premiumCount,
    };
  }
}
