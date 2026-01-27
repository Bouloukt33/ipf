import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { AuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';

@ApiTags('Profil')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('read:profile')
  @ApiOperation({ summary: 'Obtenir le profil', description: 'Récupère le profil complet de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil retourné avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Profil non trouvé' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @UseGuards(PermissionsGuard)
  @Permissions('write:profile')
  @ApiOperation({ summary: 'Mettre à jour le profil', description: 'Met à jour les informations du profil (nom d\'affichage, avatar)' })
  @ApiBody({ schema: { type: 'object', properties: { displayName: { type: 'string', example: 'John Doe' }, avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' } } } })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() data: { displayName?: string; avatarUrl?: string },
  ) {
    return this.profileService.updateProfile(userId, data);
  }

  @Get('stats')
  @UseGuards(PermissionsGuard)
  @Permissions('read:profile')
  @ApiOperation({ summary: 'Statistiques du profil', description: 'Récupère les statistiques de jeu de l\'utilisateur (parties jouées, score, etc.)' })
  @ApiResponse({ status: 200, description: 'Statistiques retournées avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getStats(@CurrentUser('userId') userId: string) {
    return this.profileService.getStats(userId);
  }
}
