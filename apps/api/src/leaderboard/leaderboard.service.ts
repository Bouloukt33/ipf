import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

const PODIUM_BG: Record<number, string> = {
  1: 'from-yellow-400 to-amber-500',
  2: 'from-slate-300 to-slate-400',
  3: 'from-amber-600 to-amber-700',
};

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
];

function avatarBg(id: string): string {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(
  displayName: string | null | undefined,
  email: string,
): string {
  return (displayName ?? email ?? '?').charAt(0).toUpperCase();
}

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateLeaderboard(
    type: 'GLOBAL' | 'CATEGORY',
    categoryId?: string,
  ) {
    const where: any = { type, isActive: true };
    if (categoryId) where.categoryId = categoryId;

    let lb = await this.prisma.leaderboard.findFirst({ where });
    if (!lb) {
      lb = await this.prisma.leaderboard.create({
        data: { type, isActive: true, ...(categoryId ? { categoryId } : {}) },
      });
    }
    return lb;
  }

  private formatEntries(entries: any[], currentUserId: string) {
    const ranked = entries.map((e, i) => ({ ...e, computedRank: i + 1 }));

    const podium = ranked.slice(0, 3).map((e) => ({
      rank: e.computedRank as 1 | 2 | 3,
      initial: getInitial(e.user.profile?.displayName, e.user.email),
      name: e.user.profile?.displayName ?? e.user.email,
      score: `${e.score} XP`,
      bg: PODIUM_BG[e.computedRank],
    }));

    const rows = ranked.slice(3).map((e) => ({
      rk: String(e.computedRank),
      hi: false,
      initial: getInitial(e.user.profile?.displayName, e.user.email),
      name: e.user.profile?.displayName ?? e.user.email,
      handle: `@${(e.user.profile?.displayName ?? e.user.email).replace(/\s+/g, '').toLowerCase()}`,
      trend: 'eq' as const,
      trendVal: '',
      score: `${e.score} XP`,
      bg: avatarBg(e.userId),
      me: e.userId === currentUserId,
    }));

    return { podium, rows };
  }

  async getGlobal(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      select: { id: true },
    });
    const lb = await this.getOrCreateLeaderboard('GLOBAL');

    const entries = await this.prisma.leaderboardEntry.findMany({
      where: { leaderboardId: lb.id },
      orderBy: { score: 'desc' },
      include: { user: { include: { profile: true } } },
    });

    return this.formatEntries(entries, user?.id ?? '');
  }

  async getPodium() {
    const lb = await this.getOrCreateLeaderboard('GLOBAL');

    const entries = await this.prisma.leaderboardEntry.findMany({
      where: { leaderboardId: lb.id },
      orderBy: { score: 'desc' },
      take: 3,
      include: { user: { include: { profile: true } } },
    });

    return entries.map((e, i) => ({
      rank: (i + 1) as 1 | 2 | 3,
      initial: getInitial(e.user.profile?.displayName, e.user.email),
      name: e.user.profile?.displayName ?? e.user.email,
      score: `${e.score} XP`,
      bg: PODIUM_BG[i + 1],
    }));
  }

  async getBySlug(slug: string, auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      select: { id: true },
    });

    // Try as category slug first, then theme slug
    let category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) {
      const theme = await this.prisma.theme.findFirst({
        where: { slug },
        include: { category: true },
      });
      category = theme?.category ?? null;
    }

    if (!category) return { podium: [], rows: [] };

    const lb = await this.getOrCreateLeaderboard('CATEGORY', category.id);

    const entries = await this.prisma.leaderboardEntry.findMany({
      where: { leaderboardId: lb.id },
      orderBy: { score: 'desc' },
      include: { user: { include: { profile: true } } },
    });

    return this.formatEntries(entries, user?.id ?? '');
  }
}
