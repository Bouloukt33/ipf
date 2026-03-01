import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { AgeRange, ProfessionalStatus } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: {
        profile: {
          include: {
            jobProfile: { include: { sector: true } },
          },
        },
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

  async updateProfile(
    auth0Id: string,
    data: {
      displayName?: string;
      avatarUrl?: string;
      ageRange?: string;
      professionalStatus?: string;
      jobProfileId?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Validate jobProfileId if provided
    if (data.jobProfileId) {
      const jobProfile = await this.prisma.jobProfile.findUnique({
        where: { id: data.jobProfileId },
      });
      if (!jobProfile) {
        throw new NotFoundException('Profil métier non trouvé');
      }
    }

    const profileData = {
      ...(data.displayName !== undefined && { displayName: data.displayName }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      ...(data.ageRange !== undefined && { ageRange: data.ageRange as AgeRange }),
      ...(data.professionalStatus !== undefined && { professionalStatus: data.professionalStatus as ProfessionalStatus }),
      ...(data.jobProfileId !== undefined && { jobProfileId: data.jobProfileId }),
    };

    return this.prisma.userProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
      },
      include: {
        jobProfile: { include: { sector: true } },
      },
    });
  }

  async getJobProfiles() {
    return this.prisma.jobSector.findMany({
      orderBy: { order: 'asc' },
      include: {
        jobProfiles: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
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
