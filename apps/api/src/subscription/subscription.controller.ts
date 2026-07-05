import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
}
