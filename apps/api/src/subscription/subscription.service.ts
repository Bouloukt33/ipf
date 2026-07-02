import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';

// Plan slugs matching the seed data
const VALID_PLAN_SLUGS = ['apprenti', 'compagnon', 'reussite'];

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Subscribe user to a plan (simulated payment)
   * In production, this would integrate with Stripe/PayPal
   */
  async subscribe(auth0Id: string, planSlug: string) {
    if (!VALID_PLAN_SLUGS.includes(planSlug)) {
      throw new BadRequestException('Plan invalide');
    }

    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan non disponible');
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + plan.intervalMonths);

    // Create or update subscription (upsert based on userId)
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

    return {
      success: true,
      plan: {
        name: plan.name,
        slug: plan.slug,
      },
      subscription: {
        startDate: now,
        endDate: periodEnd,
        status: 'ACTIVE',
      },
    };
  }

  /**
   * Get available subscription plans
   */
  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        features: true,
      },
    });
  }

  /**
   * Get user's current subscription status
   * isPremium is derived from having an active subscription
   */
  async getStatus(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // User is premium if they have an active subscription that hasn't expired
    const isPremium = user.subscription
      ? user.subscription.status === 'ACTIVE' &&
        user.subscription.currentPeriodEnd > new Date()
      : false;

    return {
      isPremium,
      subscription: user.subscription
        ? {
            plan: user.subscription.plan.name,
            status: user.subscription.status,
            endDate: user.subscription.currentPeriodEnd,
          }
        : null,
    };
  }
}
