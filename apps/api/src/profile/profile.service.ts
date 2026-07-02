import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers

  private async findUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id: userId },
      include: {
        profile: true,
        subscription: { include: { plan: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  // ── Profile

  async getProfile(userId: string) {
    const user = await this.findUser(userId);

    return {
      displayName: user.profile?.displayName ?? null,
      email: user.email,
      avatarUrl: user.profile?.avatarUrl ?? null,
      ageRange: user.profile?.ageRange ?? null,
      professionalStatus: user.profile?.professionalStatus ?? null,
      jobProfileId: user.profile?.jobProfileId ?? null,
      level: user.profile?.level ?? 1,
      xpTotal: user.profile?.xpTotal ?? 0,
      streakDays: user.profile?.streakDays ?? 0,
      subscription: user.subscription
        ? {
            plan: user.subscription.plan.slug,
            status: user.subscription.status,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
          }
        : null,
    };
  }

  async getJobProfiles() {
    const sectors = await this.prisma.jobSector.findMany({
      orderBy: { order: 'asc' },
      include: {
        jobProfiles: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return sectors.map((s) => ({
      sector: s.name,
      slug: s.slug,
      profiles: s.jobProfiles,
    }));
  }

  async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      avatarUrl?: string;
      ageRange?: string;
      professionalStatus?: string;
      jobProfileId?: string;
    },
  ) {
    const user = await this.findUser(userId);

    const updated = await this.prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
        ...(data.ageRange && { ageRange: data.ageRange as any }),
        ...(data.professionalStatus && {
          professionalStatus: data.professionalStatus as any,
        }),
        ...(data.jobProfileId && { jobProfileId: data.jobProfileId }),
      },
      create: {
        userId: user.id,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        ageRange: data.ageRange as any,
        professionalStatus: data.professionalStatus as any,
        jobProfileId: data.jobProfileId,
      },
    });

    return {
      displayName: updated.displayName,
      avatarUrl: updated.avatarUrl,
      ageRange: updated.ageRange,
      professionalStatus: updated.professionalStatus,
      jobProfileId: updated.jobProfileId,
    };
  }

  // ── Stats (existant)

  async getStats(userId: string) {
    const user = await this.findUser(userId);

    const sessions = await this.prisma.quizSession.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
    });

    const totalSessions = sessions.length;
    const totalCorrect = sessions.reduce((s, q) => s + q.correctAnswers, 0);
    const totalAnswered = sessions.reduce((s, q) => s + q.totalQuestions, 0);
    const avgAccuracy =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return {
      totalSessions,
      avgAccuracy,
      xpTotal: user.profile?.xpTotal ?? 0,
      streakDays: user.profile?.streakDays ?? 0,
      level: user.profile?.level ?? 1,
      bestStreak: user.profile?.bestStreak ?? 0,
    };
  }

  // ── Payment

  async getPaymentMethod(userId: string) {
    await this.findUser(userId); // valide l'existence de l'utilisateur

    // Placeholder — à remplacer par un appel Stripe quand intégré
    // const customer = await stripe.customers.retrieve(user.subscription?.stripeCustomerId);
    //if (!user.subscription?.stripeCustomerId) return null;

    return {
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
    };
  }

  // ── Plans ──

  async getPlans(userId: string) {
    const user = await this.findUser(userId);
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const currentPlanId = user.subscription?.planId ?? null;

    return plans.map((plan) => ({
      slug: plan.slug,
      name: plan.name,
      price: Number(plan.price),
      yearlyPrice: Math.round(Number(plan.price) * 12 * 0.8),
      description: plan.description ?? '',
      savePct: plan.slug === 'reussite' ? 20 : null,
      isActive: plan.id === currentPlanId,
      nextBilling:
        plan.id === currentPlanId && user.subscription?.currentPeriodEnd
          ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString(
              'fr-FR',
              {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              },
            )
          : null,
      subscription: user.subscription
        ? {
            plan: user.subscription.plan.slug,
            status: user.subscription.status,
          }
        : null,
    }));
  }

  async choosePlan(userId: string, slug: string) {
    const user = await this.findUser(userId);

    const plan = await this.prisma.plan.findUnique({ where: { slug } });
    if (!plan) throw new NotFoundException(`Plan "${slug}" introuvable`);

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (plan.intervalMonths ?? 1));

    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
      create: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    return { success: true };
  }

  async cancelSubscription(userId: string) {
    const user = await this.findUser(userId);

    if (!user.subscription || user.subscription.status !== 'ACTIVE') {
      throw new BadRequestException('Aucun abonnement actif à résilier');
    }

    await this.prisma.subscription.update({
      where: { userId: user.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    return { success: true };
  }
}
