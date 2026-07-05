import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma';

type StripeInstance = InstanceType<typeof Stripe>;

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: StripeInstance | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    const isSimulation = this.config.get<string>('STRIPE_SIMULATION_MODE') === 'true';

    if (!isSimulation && secretKey && secretKey !== 'sk_PLACEHOLDER') {
      this.stripe = new Stripe(secretKey, { apiVersion: '2026-06-24.dahlia' });
    }
  }

  get isSimulationMode(): boolean {
    return (
      this.config.get<string>('STRIPE_SIMULATION_MODE') === 'true' ||
      !this.stripe
    );
  }

  // ─────────────────────────────────────────────
  // CHECKOUT : initier un paiement
  // ─────────────────────────────────────────────
  async createCheckoutSession(auth0Id: string, planSlug: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: { subscription: true },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const plan = await this.prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan || !plan.isActive) throw new NotFoundException('Plan non disponible');

    // ── MODE SIMULATION ──────────────────────────
    if (this.isSimulationMode) {
      return this.simulateCheckout(user.id, plan);
    }

    // ── MODE STRIPE RÉEL ─────────────────────────
    const successUrl = `${this.config.get('FRONTEND_URL')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${this.config.get('FRONTEND_URL')}/subscription/cancel`;

    let customerId = user.subscription?.stripeCustomerId ?? undefined;

    if (!customerId) {
      const customer = await this.stripe!.customers.create({
        email: user.email,
        metadata: { auth0Id, userId: user.id },
      });
      customerId = customer.id;
    }

    const priceId = this.getPriceIdForPlan(planSlug);

    const session = await this.stripe!.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { auth0Id, planSlug, userId: user.id },
    });

    return {
      simulationMode: false,
      checkoutUrl: session.url,
    };
  }

  // ─────────────────────────────────────────────
  // WEBHOOK STRIPE (mode réel uniquement)
  // ─────────────────────────────────────────────
  async handleWebhook(rawBody: Buffer, signature: string) {
    if (this.isSimulationMode) return { received: true };

    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;

    try {
      event = this.stripe!.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook invalide : ${(err as Error).message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        await this.activateSubscriptionFromSession(event.data.object);
        break;
      }
      case 'customer.subscription.updated': {
        await this.syncSubscriptionFromStripe(event.data.object);
        break;
      }
      case 'customer.subscription.deleted': {
        await this.cancelSubscriptionByStripeId(event.data.object.id as string);
        break;
      }
      default:
        this.logger.log(`Événement Stripe ignoré : ${event.type}`);
    }

    return { received: true };
  }

  // ─────────────────────────────────────────────
  // ANNULER UN ABONNEMENT
  // ─────────────────────────────────────────────
  async cancelSubscription(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: { subscription: true },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (!user.subscription) throw new NotFoundException('Aucun abonnement actif');

    if (!this.isSimulationMode && user.subscription.stripeSubscriptionId) {
      await this.stripe!.subscriptions.update(user.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    await this.prisma.subscription.update({
      where: { userId: user.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    return { success: true, message: 'Abonnement annulé à la fin de la période en cours' };
  }

  // ─────────────────────────────────────────────
  // PORTAIL CLIENT STRIPE (mode réel uniquement)
  // ─────────────────────────────────────────────
  async createPortalSession(auth0Id: string) {
    if (this.isSimulationMode) {
      return { simulationMode: true, portalUrl: null };
    }

    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: { subscription: true },
    });
    if (!user?.subscription?.stripeCustomerId) {
      throw new NotFoundException('Aucun client Stripe associé');
    }

    const session = await this.stripe!.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${this.config.get('FRONTEND_URL')}/subscription`,
    });

    return { simulationMode: false, portalUrl: session.url };
  }

  // ─────────────────────────────────────────────
  // MÉTHODES PRIVÉES
  // ─────────────────────────────────────────────
  private async simulateCheckout(userId: string, plan: { id: string; name: string; slug: string; intervalMonths: number }) {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + plan.intervalMonths);

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
      create: {
        userId,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    this.logger.log(`[SIMULATION] Abonnement activé pour userId=${userId}, plan=${plan.slug}`);

    return {
      simulationMode: true,
      success: true,
      plan: { name: plan.name, slug: plan.slug },
      subscription: { startDate: now, endDate: periodEnd, status: 'ACTIVE' },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async activateSubscriptionFromSession(session: any) {
    const { userId, planSlug } = session.metadata ?? {};
    if (!userId || !planSlug) return;

    const plan = await this.prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan) return;

    const stripeSubscription = session.subscription as string;
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + plan.intervalMonths);

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        stripeSubscriptionId: stripeSubscription,
        stripeCustomerId: session.customer as string,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
      create: {
        userId,
        planId: plan.id,
        status: 'ACTIVE',
        stripeSubscriptionId: stripeSubscription,
        stripeCustomerId: session.customer as string,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async syncSubscriptionFromStripe(stripeSub: any) {
    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (!sub) return;

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: stripeSub.status === 'active' ? 'ACTIVE' : 'CANCELED',
        currentPeriodStart: new Date((stripeSub as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    });
  }

  private async cancelSubscriptionByStripeId(stripeSubId: string) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSubId },
      data: { status: 'CANCELED', canceledAt: new Date() },
    });
  }

  private getPriceIdForPlan(planSlug: string): string {
    const priceIds: Record<string, string> = {
      apprenti:  this.config.get<string>('STRIPE_PRICE_ID_APPRENTI')  ?? '',
      compagnon: this.config.get<string>('STRIPE_PRICE_ID_COMPAGNON') ?? '',
      reussite:  this.config.get<string>('STRIPE_PRICE_ID_REUSSITE')  ?? '',
    };
    const priceId = priceIds[planSlug];
    if (!priceId) throw new BadRequestException(`Prix Stripe non configuré pour le plan : ${planSlug}`);
    return priceId;
  }
}
