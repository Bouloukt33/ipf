import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { AuthGuard, CurrentUser } from '../auth';

@ApiTags('Subscription')
@ApiBearerAuth()
@Controller('subscription')
@UseGuards(AuthGuard)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({
    summary: 'Liste des plans',
    description: 'Retourne tous les plans d\'abonnement disponibles',
  })
  @ApiResponse({ status: 200, description: 'Liste des plans' })
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get('status')
  @ApiOperation({
    summary: 'Statut abonnement',
    description: 'Retourne le statut d\'abonnement de l\'utilisateur connecté',
  })
  @ApiResponse({ status: 200, description: 'Statut de l\'abonnement' })
  async getStatus(@CurrentUser('userId') userId: string) {
    return this.subscriptionService.getStatus(userId);
  }

  @Post('subscribe')
  @ApiOperation({
    summary: 'Souscrire à un plan',
    description: 'Souscrit l\'utilisateur au plan spécifié (paiement simulé)',
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
  @ApiResponse({ status: 201, description: 'Abonnement activé' })
  @ApiResponse({ status: 400, description: 'Plan invalide' })
  @ApiResponse({ status: 404, description: 'Utilisateur ou plan non trouvé' })
  async subscribe(
    @CurrentUser('userId') userId: string,
    @Body() body: { planSlug: string },
  ) {
    return this.subscriptionService.subscribe(userId, body.planSlug);
  }
}
