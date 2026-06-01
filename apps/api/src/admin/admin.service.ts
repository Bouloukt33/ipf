import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getPlans() {
    return this.prisma.plan.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { subscriptions: true } } },
    });
  }

  async createPlan(data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    currency?: string;
    intervalMonths?: number;
    features?: string[];
    isActive?: boolean;
    order?: number;
  }) {
    return this.prisma.plan.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        currency: data.currency ?? 'EUR',
        intervalMonths: data.intervalMonths ?? 1,
        features: data.features ?? [],
        isActive: data.isActive ?? true,
        order: data.order ?? 0,
      },
      include: { _count: { select: { subscriptions: true } } },
    });
  }

  async updatePlan(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      currency?: string;
      intervalMonths?: number;
      features?: string[];
      isActive?: boolean;
      order?: number;
    },
  ) {
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.intervalMonths !== undefined) updateData.intervalMonths = data.intervalMonths;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.order !== undefined) updateData.order = data.order;

    return this.prisma.plan.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { subscriptions: true } } },
    });
  }

  async deletePlan(id: string) {
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
    return this.prisma.plan.delete({ where: { id } });
  }
}
