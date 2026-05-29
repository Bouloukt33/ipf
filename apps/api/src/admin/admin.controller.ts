import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
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

  @Get('users')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Analytics utilisateurs', description: 'Liste des utilisateurs avec stats de performance et engagement' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'professionalStatus', required: false, enum: ['SALARIE', 'INDEPENDANT', 'MANDATAIRE'] })
  @ApiQuery({ name: 'ageRange', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async getAnalyticsUsers(
    @Query('search') search?: string,
    @Query('professionalStatus') professionalStatus?: string,
    @Query('ageRange') ageRange?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAnalyticsUsers({
      search,
      professionalStatus,
      ageRange,
      page:  page  ? parseInt(page)  : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('users/:id')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Détail analytique utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async getAnalyticsUserDetail(@Param('id') id: string) {
    return this.adminService.getAnalyticsUserDetail(id);
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
