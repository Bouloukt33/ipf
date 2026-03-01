import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { AuthGuard, CurrentUser } from '../auth';

@ApiTags('Profil')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir le profil', description: 'Récupère le profil complet de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil retourné avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Profil non trouvé' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Mettre à jour le profil', description: 'Met à jour les informations du profil (nom, avatar, tranche d\'âge, statut pro, métier)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        displayName: { type: 'string', example: 'John Doe' },
        avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
        ageRange: { type: 'string', enum: ['AGE_18_25', 'AGE_26_35', 'AGE_36_45', 'AGE_46_55', 'AGE_56_PLUS'], example: 'AGE_26_35' },
        professionalStatus: { type: 'string', enum: ['SALARIE', 'INDEPENDANT', 'MANDATAIRE'], example: 'INDEPENDANT' },
        jobProfileId: { type: 'string', example: 'cuid...' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() data: {
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
  @ApiOperation({ summary: 'Statistiques du profil', description: 'Récupère les statistiques de jeu de l\'utilisateur (parties jouées, score, etc.)' })
  @ApiResponse({ status: 200, description: 'Statistiques retournées avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getStats(@CurrentUser('userId') userId: string) {
    return this.profileService.getStats(userId);
  }
}
