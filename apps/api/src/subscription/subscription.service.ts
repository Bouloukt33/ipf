import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

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
