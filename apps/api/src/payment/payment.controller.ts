import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import { AuthGuard, CurrentUser } from '../auth';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // ─────────────────────────────────────────────
  // Créer une session de paiement (ou simuler)
  // ─────────────────────────────────────────────
  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Initier un paiement',
    description:
      'En mode simulation : active directement l\'abonnement. ' +
      'En mode Stripe réel : retourne une URL de checkout Stripe.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['planSlug'],
      properties: {
        planSlug: {
          type: 'string',
          enum: ['apprenti', 'compagnon', 'reussite'],
          description: 'Slug du plan choisi',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Session créée ou abonnement activé (simulation)' })
  @ApiResponse({ status: 404, description: 'Utilisateur ou plan non trouvé' })
  async createCheckout(
    @CurrentUser('userId') userId: string,
    @Body() body: { planSlug: string },
  ) {
    return this.paymentService.createCheckoutSession(userId, body.planSlug);
  }

  // ─────────────────────────────────────────────
  // Webhook Stripe (ne pas mettre AuthGuard ici)
  // ─────────────────────────────────────────────
  @Post('webhook')
  @ApiExcludeEndpoint()
  async stripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(
      (req as any).rawBody ?? Buffer.from(JSON.stringify(req.body)),
      signature,
    );
  }

  // ─────────────────────────────────────────────
  // Annuler son abonnement
  // ─────────────────────────────────────────────
  @Post('cancel')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Annuler l\'abonnement',
    description: 'Annule l\'abonnement à la fin de la période en cours.',
  })
  @ApiResponse({ status: 201, description: 'Abonnement annulé' })
  @ApiResponse({ status: 404, description: 'Aucun abonnement actif' })
  async cancelSubscription(@CurrentUser('userId') userId: string) {
    return this.paymentService.cancelSubscription(userId);
  }

  // ─────────────────────────────────────────────
  // Portail client Stripe (gérer sa carte, factures)
  // ─────────────────────────────────────────────
  @Get('portal')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Portail client Stripe',
    description:
      'Retourne l\'URL du portail Stripe pour gérer sa carte et ses factures. ' +
      'En mode simulation, retourne simulationMode: true.',
  })
  @ApiResponse({ status: 200, description: 'URL du portail ou mode simulation' })
  async getPortal(@CurrentUser('userId') userId: string) {
    return this.paymentService.createPortalSession(userId);
  }

  // ─────────────────────────────────────────────
  // Statut du mode (debug / info)
  // ─────────────────────────────────────────────
  @Get('mode')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Mode paiement actif',
    description: 'Indique si le système tourne en mode simulation ou en mode Stripe réel.',
  })
  @ApiResponse({ status: 200 })
  getMode() {
    return { simulationMode: this.paymentService.isSimulationMode };
  }
}
