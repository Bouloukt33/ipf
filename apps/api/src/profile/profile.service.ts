import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: {
        profile: true,
        ranking: true,
        subscription: { include: { plan: true } },
        userBadges: { include: { badge: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async updateProfile(auth0Id: string, data: { displayName?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.prisma.userProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
    });
  }

  async getStats(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: {
        profile: true,
        ranking: true,
        quizSessions: {
          where: { status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
        userMasteries: {
          include: { category: true, theme: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      xpTotal: user.profile?.xpTotal || 0,
      level: user.profile?.level || 1,
      streakDays: user.profile?.streakDays || 0,
      bestStreak: user.profile?.bestStreak || 0,
      eloScore: user.ranking?.eloScore || 1200,
      globalRank: user.ranking?.globalRank,
      totalGames: user.ranking?.totalGames || 0,
      recentSessions: user.quizSessions,
      masteries: user.userMasteries,
    };
  }
}
