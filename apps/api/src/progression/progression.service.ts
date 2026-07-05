import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ProgressionService {
  constructor(private prisma: PrismaService) {}

  async getAll(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const sessions = await this.prisma.quizSession.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      select: { completedAt: true, categoryId: true },
      orderBy: { completedAt: 'desc' },
    });

    // Group session category IDs by month
    const monthCategoryMap = new Map<string, Set<string>>();
    for (const s of sessions) {
      if (!s.completedAt || !s.categoryId) continue;
      const d = new Date(s.completedAt);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthCategoryMap.has(month)) monthCategoryMap.set(month, new Set());
      monthCategoryMap.get(month)!.add(s.categoryId);
    }

    const masteries = await this.prisma.userMastery.findMany({
      where: { userId: user.id },
      include: { theme: true, category: true },
    });

    return Array.from(monthCategoryMap.entries()).map(
      ([month, categoryIds]) => {
        const themes = masteries
          .filter((m) => m.categoryId && categoryIds.has(m.categoryId))
          .map((m) => this.formatTheme(m));

        return { id: month, month, themes };
      },
    );
  }

  async getByMonth(month: string, auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const parts = month.split('-').map(Number);
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      throw new BadRequestException(
        'Format de mois invalide — attendu : YYYY-MM',
      );
    }
    const [year, monthNum] = parts;
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);

    const sessions = await this.prisma.quizSession.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        completedAt: { gte: start, lt: end },
      },
      select: { categoryId: true },
    });

    const categoryIds = [
      ...new Set(sessions.map((s) => s.categoryId).filter(Boolean)),
    ] as string[];

    const masteries = await this.prisma.userMastery.findMany({
      where: { userId: user.id, categoryId: { in: categoryIds } },
      include: { theme: true, category: true },
    });

    return {
      id: month,
      month,
      themes: masteries.map((m) => this.formatTheme(m)),
    };
  }

  private formatTheme(m: any) {
    const pct =
      m.questionsSeen > 0
        ? Math.round((m.correctCount / m.questionsSeen) * 100)
        : 0;
    return {
      name: m.theme?.name ?? m.category.name,
      count: `${m.questionsSeen} questions`,
      pct,
      stars: Math.min(5, Math.round(m.masteryLevel * 5)),
      icBg: '',
      icSvg: null,
    };
  }

  async getThemes(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const masteries = await this.prisma.userMastery.findMany({
      where: { userId: user.id },
      include: { theme: true, category: true },
      orderBy: { masteryLevel: 'desc' },
    });

    return masteries.map((m) => {
      const pct =
        m.questionsSeen > 0
          ? Math.round((m.correctCount / m.questionsSeen) * 100)
          : 0;

      return {
        name: m.theme?.name ?? m.category.name,
        count: `${m.questionsSeen} questions · ${m.correctCount} réussies`,
        pct,
        stars: Math.min(5, Math.round(m.masteryLevel * 5)),
      };
    });
  }
}
