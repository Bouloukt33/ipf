import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';

@ApiTags('Administration')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Dashboard admin', description: 'Récupère les statistiques globales pour le tableau de bord administrateur' })
  @ApiResponse({ status: 200, description: 'Statistiques du dashboard retournées' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante - Accès admin requis' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('activity')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Activité récente', description: 'Récupère les dernières activités sur la plateforme (connexions, parties, etc.)' })
  @ApiResponse({ status: 200, description: 'Liste des activités récentes' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante - Accès admin requis' })
  async getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Get('questions/stats')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Statistiques des questions', description: 'Récupère les statistiques détaillées sur les questions (par catégorie, taux de réussite, etc.)' })
  @ApiResponse({ status: 200, description: 'Statistiques des questions retournées' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante - Accès admin requis' })
  async getQuestionStats() {
    return this.adminService.getQuestionStats();
  }
}
