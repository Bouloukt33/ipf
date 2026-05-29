import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import * as nodemailer from 'nodemailer';

// ── Email templates ────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES = {
  upsell: {
    id:      'upsell',
    name:    'Upsell — Plan Apprenti engagé',
    subject: '🚀 Tu es prêt pour la prochaine étape !',
    description: 'Envoyé aux utilisateurs Apprenti très actifs pour les inciter à passer Compagnon.',
    html: (data: { displayName: string; streakDays: number; sessionsPlayed: number }) => `
<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#172E42">
<h2 style="color:#D27A2D">Bonjour ${data.displayName || 'là'} 👋</h2>
<p>Tu joues depuis <strong>${data.streakDays} jours</strong> consécutifs et tu as déjà réalisé <strong>${data.sessionsPlayed} sessions</strong> — c'est impressionnant !</p>
<p>Avec le plan <strong>Compagnon</strong>, tu débloqueras toutes les catégories de baux, le mode Daily et les vidéos explicatives.</p>
<a href="https://app.ipf.com/profile" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#D27A2D;color:white;border-radius:8px;text-decoration:none;font-weight:700">Passer au plan Compagnon →</a>
<p style="color:#5a7a99;font-size:12px">IPF — 5 Secondes Chrono · Se désabonner</p>
</body></html>`,
  },
  coaching: {
    id:      'coaching',
    name:    'Coaching — Faible précision',
    subject: '💡 Un coup de pouce pour progresser plus vite',
    description: 'Envoyé aux abonnés Compagnon/Réussite avec un taux de réussite inférieur à 55%.',
    html: (data: { displayName: string; accuracy: number }) => `
<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#172E42">
<h2 style="color:#D27A2D">Bonjour ${data.displayName || 'là'} 👋</h2>
<p>Ton taux de réussite actuel est de <strong>${data.accuracy}%</strong>. On a quelques conseils pour t'aider à progresser !</p>
<p>Commencer par les thèmes où tu as le plus de lacunes, et alterner avec des révisions des bases peut faire une vraie différence.</p>
<a href="https://app.ipf.com/dashboard" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#D27A2D;color:white;border-radius:8px;text-decoration:none;font-weight:700">Reprendre l'entraînement →</a>
<p style="color:#5a7a99;font-size:12px">IPF — 5 Secondes Chrono · Se désabonner</p>
</body></html>`,
  },
  welcome: {
    id:      'welcome',
    name:    'Bienvenue',
    subject: '🎉 Bienvenue sur 5 Secondes Chrono !',
    description: "Envoyé à un nouvel utilisateur lors de son inscription.",
    html: (data: { displayName: string }) => `
<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#172E42">
<h2 style="color:#D27A2D">Bienvenue ${data.displayName || ''} 🎉</h2>
<p>Tu viens de rejoindre la plateforme de formation quiz pour les professionnels de l'immobilier.</p>
<p>Commence par <strong>5 questions</strong> sur le bail commercial — c'est gratuit et ça prend 2 minutes !</p>
<a href="https://app.ipf.com/quiz" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#D27A2D;color:white;border-radius:8px;text-decoration:none;font-weight:700">Lancer mon premier quiz →</a>
<p style="color:#5a7a99;font-size:12px">IPF — 5 Secondes Chrono · Se désabonner</p>
</body></html>`,
  },
  reminder: {
    id:      'reminder',
    name:    'Rappel de série',
    subject: '🔥 Ta série est en danger !',
    description: "Envoyé aux utilisateurs qui n'ont pas joué depuis 2+ jours.",
    html: (data: { displayName: string; streakDays: number }) => `
<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#172E42">
<h2 style="color:#D27A2D">Hey ${data.displayName || ''} 🔥</h2>
<p>Ta série de <strong>${data.streakDays} jours</strong> est en danger ! Il ne te reste que quelques heures pour la préserver.</p>
<a href="https://app.ipf.com/quiz" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#D27A2D;color:white;border-radius:8px;text-decoration:none;font-weight:700">Jouer maintenant →</a>
<p style="color:#5a7a99;font-size:12px">IPF — 5 Secondes Chrono · Se désabonner</p>
</body></html>`,
  },
} as const;

export type EmailTemplateId = keyof typeof EMAIL_TEMPLATES;

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

  // ── Subscriptions ─────────────────────────────────────────────────────────────

  async getSubscriptions(filters?: {
    planSlug?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page  = filters?.page  || 1;
    const limit = filters?.limit || 20;
    const skip  = (page - 1) * limit;

    const where: any = { subscription: { isNot: null } };

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { profile: { displayName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    if (filters?.planSlug) {
      where.subscription = { ...where.subscription, plan: { slug: filters.planSlug } };
    }
    if (filters?.status) {
      where.subscription = { ...where.subscription, status: filters.status };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          subscription: { include: { plan: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Durée sessions en heures pour chaque user
    const userIds = users.map((u) => u.id);
    const durationAgg = await this.prisma.quizSession.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, status: 'COMPLETED' },
      _sum: { durationMs: true },
      _count: { id: true },
    });
    const durationMap = new Map(durationAgg.map((a) => [a.userId, a]));

    const data = users.map((u) => {
      const agg  = durationMap.get(u.id);
      const msTotal = Number(agg?._sum.durationMs ?? 0);
      return {
        id:       u.id,
        email:    u.email,
        isActive: u.isActive,
        profile: {
          displayName: u.profile?.displayName ?? null,
          avatarUrl:   u.profile?.avatarUrl   ?? null,
          streakDays:  u.profile?.streakDays  ?? 0,
          level:       u.profile?.level       ?? 1,
          lastPlayedAt: u.profile?.lastPlayedAt ?? null,
        },
        subscription: {
          id:                 u.subscription!.id,
          status:             u.subscription!.status,
          cancelAtPeriodEnd:  u.subscription!.cancelAtPeriodEnd,
          currentPeriodStart: u.subscription!.currentPeriodStart,
          currentPeriodEnd:   u.subscription!.currentPeriodEnd,
          createdAt:          u.subscription!.createdAt,
          plan: {
            slug:  u.subscription!.plan.slug,
            name:  u.subscription!.plan.name,
            price: Number(u.subscription!.plan.price),
          },
        },
        usage: {
          sessionsPlayed:   agg?._count.id ?? 0,
          totalHours:       Math.round(msTotal / 3_600_000 * 10) / 10,
        },
      };
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Prospects ─────────────────────────────────────────────────────────────────

  async getProspects() {
    // 1. UPSELL : Apprenti très engagés (streak > 5 OU sessions > 8)
    const apprentiUsers = await this.prisma.user.findMany({
      where: {
        subscription: { plan: { slug: 'apprenti' } },
        isActive: true,
      },
      include: {
        profile: true,
        subscription: { include: { plan: true } },
      },
    });

    const apprentiIds = apprentiUsers.map((u) => u.id);
    const apprentiSessions = await this.prisma.quizSession.groupBy({
      by: ['userId'],
      where: { userId: { in: apprentiIds }, status: 'COMPLETED' },
      _count: { id: true },
      _sum: { correctAnswers: true, totalQuestions: true },
    });
    const sessMap = new Map(apprentiSessions.map((a) => [a.userId, a]));

    const upsell = apprentiUsers
      .map((u) => {
        const agg       = sessMap.get(u.id);
        const sessions  = agg?._count.id ?? 0;
        const streak    = u.profile?.streakDays ?? 0;
        const tq        = Number(agg?._sum.totalQuestions ?? 0);
        const tok       = Number(agg?._sum.correctAnswers ?? 0);
        const accuracy  = tq > 0 ? Math.round((tok / tq) * 100) : 0;
        return {
          id: u.id, email: u.email,
          displayName: u.profile?.displayName ?? null,
          avatarUrl:   u.profile?.avatarUrl   ?? null,
          planName: u.subscription?.plan.name ?? 'Apprenti',
          streakDays: streak, sessions, accuracy,
          engagementScore: streak * 2 + sessions,
        };
      })
      .filter((u) => u.streakDays > 5 || u.sessions > 8)
      .sort((a, b) => b.engagementScore - a.engagementScore);

    // 2. COACHING : Compagnon/Réussite avec accuracy < 55%
    const premiumUsers = await this.prisma.user.findMany({
      where: {
        subscription: { plan: { slug: { in: ['compagnon', 'reussite'] } } },
        isActive: true,
      },
      include: {
        profile: true,
        subscription: { include: { plan: true } },
      },
    });

    const premiumIds = premiumUsers.map((u) => u.id);
    const premiumSessions = await this.prisma.quizSession.groupBy({
      by: ['userId'],
      where: { userId: { in: premiumIds }, status: 'COMPLETED' },
      _count: { id: true },
      _sum: { correctAnswers: true, totalQuestions: true },
    });
    const premMap = new Map(premiumSessions.map((a) => [a.userId, a]));

    const coaching = premiumUsers
      .map((u) => {
        const agg      = premMap.get(u.id);
        const sessions = agg?._count.id ?? 0;
        const tq       = Number(agg?._sum.totalQuestions ?? 0);
        const tok      = Number(agg?._sum.correctAnswers ?? 0);
        const accuracy = tq > 0 ? Math.round((tok / tq) * 100) : 0;
        return {
          id: u.id, email: u.email,
          displayName: u.profile?.displayName ?? null,
          avatarUrl:   u.profile?.avatarUrl   ?? null,
          planName: u.subscription?.plan.name ?? '',
          planSlug: u.subscription?.plan.slug ?? '',
          streakDays: u.profile?.streakDays ?? 0,
          sessions, accuracy,
        };
      })
      .filter((u) => u.sessions >= 3 && u.accuracy < 55)
      .sort((a, b) => a.accuracy - b.accuracy);

    return { upsell, coaching };
  }

  // ── Plans (admin CRUD) ────────────────────────────────────────────────────────

  async getAdminPlans() {
    return this.prisma.plan.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { subscriptions: true } } },
    });
  }

  async updateAdminPlan(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      features?: string[];
      isActive?: boolean;
      order?: number;
    },
  ) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan introuvable');

    return this.prisma.plan.update({
      where: { id },
      data: {
        ...(data.name        !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price       !== undefined && { price: data.price }),
        ...(data.features    !== undefined && { features: JSON.stringify(data.features) }),
        ...(data.isActive    !== undefined && { isActive: data.isActive }),
        ...(data.order       !== undefined && { order: data.order }),
      },
    });
  }

  // ── Email ─────────────────────────────────────────────────────────────────────

  private readonly logger = new Logger('AdminService.Email');

  private createTransport() {
    const host = process.env.MAILER_HOST;
    const user = process.env.MAILER_USER;
    const pass = process.env.MAILER_PASS;

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
      host,
      port: parseInt(process.env.MAILER_PORT || '587'),
      secure: process.env.MAILER_SECURE === 'true',
      auth: { user, pass },
    });
  }

  getEmailTemplates() {
    return Object.values(EMAIL_TEMPLATES).map(({ id, name, subject, description }) => ({
      id, name, subject, description,
    }));
  }

  getEmailTemplatePreview(templateId: EmailTemplateId) {
    const tpl = EMAIL_TEMPLATES[templateId];
    if (!tpl) throw new NotFoundException(`Template "${templateId}" introuvable`);

    const sampleData: any = {
      displayName: 'Marie Laurent',
      streakDays:  12,
      sessionsPlayed: 24,
      accuracy:    48,
    };
    return { id: tpl.id, name: tpl.name, subject: tpl.subject, html: tpl.html(sampleData) };
  }

  async sendEmailToUser(userId: string, templateId: EmailTemplateId) {
    const tpl = EMAIL_TEMPLATES[templateId];
    if (!tpl) throw new NotFoundException(`Template "${templateId}" introuvable`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscription: { include: { plan: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const sessionAgg = await this.prisma.quizSession.aggregate({
      where: { userId: user.id, status: 'COMPLETED' },
      _count: { id: true },
      _sum:   { correctAnswers: true, totalQuestions: true },
    });

    const tq  = Number(sessionAgg._sum.totalQuestions ?? 0);
    const tok = Number(sessionAgg._sum.correctAnswers  ?? 0);
    const templateData = {
      displayName:    user.profile?.displayName ?? user.email.split('@')[0],
      streakDays:     user.profile?.streakDays  ?? 0,
      sessionsPlayed: sessionAgg._count.id      ?? 0,
      accuracy:       tq > 0 ? Math.round((tok / tq) * 100) : 0,
    };

    const html = tpl.html(templateData);

    const transport = this.createTransport();
    if (!transport) {
      this.logger.warn(`[MAILER NOT CONFIGURED] Would send "${tpl.subject}" to ${user.email}`);
      this.logger.log(`Preview:\n${html.slice(0, 200)}…`);
      return { sent: false, reason: 'MAILER_NOT_CONFIGURED', to: user.email, subject: tpl.subject };
    }

    await transport.sendMail({
      from: process.env.MAILER_FROM || 'noreply@ipf.com',
      to:   user.email,
      subject: tpl.subject,
      html,
    });

    return { sent: true, to: user.email, subject: tpl.subject };
  }

  async sendEmailToSegment(segment: 'upsell' | 'coaching', templateId: EmailTemplateId) {
    const prospects = await this.getProspects();
    const targets   = segment === 'upsell' ? prospects.upsell : prospects.coaching;

    const results: { sent: boolean; to: string; subject: string; reason?: string }[] = [];
    for (const t of targets) {
      const r = await this.sendEmailToUser(t.id, templateId);
      results.push(r);
    }

    return {
      segment,
      templateId,
      total:  targets.length,
      sent:   results.filter((r) => r.sent).length,
      results,
    };
  }
}
