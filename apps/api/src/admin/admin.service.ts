import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalQuestions,
      totalSessions,
      totalCategories,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.question.count(),
      this.prisma.quizSession.count({ where: { status: 'COMPLETED' } }),
      this.prisma.category.count({ where: { isActive: true } }),
    ]);

    // Sessions des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = await this.prisma.quizSession.count({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: sevenDaysAgo },
      },
    });

    // Nouveaux utilisateurs cette semaine
    const newUsersThisWeek = await this.prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisWeek: newUsersThisWeek,
      },
      questions: {
        total: totalQuestions,
      },
      sessions: {
        total: totalSessions,
        last7Days: recentSessions,
      },
      categories: totalCategories,
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

  async getQuestionStats() {
    const [total, active, suspended, archived, premium] = await Promise.all([
      this.prisma.question.count(),
      this.prisma.question.count({ where: { status: 'ACTIVE' } }),
      this.prisma.question.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.question.count({ where: { status: 'ARCHIVED' } }),
      this.prisma.question.count({ where: { isPremium: true } }),
    ]);
    return { total, active, suspended, archived, premium };
  }
}
