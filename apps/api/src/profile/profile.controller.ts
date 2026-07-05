import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { AuthGuard, CurrentUser } from '../auth';

@ApiTags('Profil')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtenir le profil',
    description: "Récupère le profil complet de l'utilisateur connecté",
  })
  @ApiResponse({ status: 200, description: 'Profil retourné avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Profil non trouvé' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Mettre à jour le profil',
    description: 'Met à jour les informations du profil',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        displayName: { type: 'string', example: 'John Doe' },
        avatarUrl: {
          type: 'string',
          example: 'https://example.com/avatar.jpg',
        },
        ageRange: {
          type: 'string',
          enum: [
            'AGE_18_25',
            'AGE_26_35',
            'AGE_36_45',
            'AGE_46_55',
            'AGE_56_PLUS',
          ],
        },
        professionalStatus: {
          type: 'string',
          enum: ['SALARIE', 'INDEPENDANT', 'MANDATAIRE'],
        },
        jobProfileId: { type: 'string', example: 'cuid...' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body()
    data: {
      displayName?: string;
      avatarUrl?: string;
      ageRange?: string;
      professionalStatus?: string;
      jobProfileId?: string;
    },
  ) {
    return this.profileService.updateProfile(userId, data);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques du profil',
    description: "Récupère les statistiques de jeu de l'utilisateur",
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques retournées avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getStats(@CurrentUser('userId') userId: string) {
    return this.profileService.getStats(userId);
  }

  @Get('payment-method')
  @ApiOperation({
    summary: 'Moyen de paiement',
    description: "Récupère le moyen de paiement actif de l'utilisateur",
  })
  @ApiResponse({
    status: 200,
    description: 'Moyen de paiement retourné (null si aucun)',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getPaymentMethod(@CurrentUser('userId') userId: string) {
    return this.profileService.getPaymentMethod(userId);
  }

  @Get('plans')
  @ApiOperation({
    summary: 'Plans disponibles',
    description:
      "Récupère tous les plans d'abonnement avec le plan actuel de l'utilisateur",
  })
  @ApiResponse({ status: 200, description: 'Plans retournés avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getPlans(@CurrentUser('userId') userId: string) {
    return this.profileService.getPlans(userId);
  }

  @Post('plans/choose')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Choisir un plan',
    description: "Change le plan d'abonnement de l'utilisateur",
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['slug'],
      properties: {
        slug: { type: 'string', example: 'compagnon' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Plan changé avec succès' })
  @ApiResponse({ status: 404, description: 'Plan introuvable' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async choosePlan(
    @CurrentUser('userId') userId: string,
    @Body() body: { slug: string },
  ) {
    return this.profileService.choosePlan(userId, body.slug);
  }

  @Post('subscription/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Résilier l'abonnement",
    description: "Résilie l'abonnement à la fin de la période en cours",
  })
  @ApiResponse({ status: 200, description: 'Abonnement résilié avec succès' })
  @ApiResponse({ status: 400, description: 'Aucun abonnement actif' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async cancelSubscription(@CurrentUser('userId') userId: string) {
    return this.profileService.cancelSubscription(userId);
  }
}
