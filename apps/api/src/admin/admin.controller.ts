import { Controller, Get, Put, Post, Delete, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdminService, EmailTemplateId } from './admin.service';
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
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    }

    @Get('users/search')
    @Permissions('read:admin')
    @ApiOperation({ summary: 'Recherche utilisateur', description: 'Recherche rapide d\'un utilisateur par email ou nom pour assignation de pack' })
    @ApiQuery({ name: 'q', required: true })
    @ApiResponse({ status: 200 })
    async searchUsers(@Query('q') query: string) {
    return this.adminService.searchUsers(query);
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

  // ── Subscriptions ──────────────────────────────────────────────────────────

  @Get('subscriptions')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Liste des abonnements' })
  @ApiQuery({ name: 'planSlug', required: false, enum: ['apprenti', 'compagnon', 'reussite'] })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID', 'TRIALING'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSubscriptions(
    @Query('planSlug') planSlug?: string,
    @Query('status')   status?: string,
    @Query('search')   search?: string,
    @Query('page')     page?: string,
    @Query('limit')    limit?: string,
  ) {
    return this.adminService.getSubscriptions({
      planSlug, status, search,
      page:  page  ? parseInt(page)  : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Post('subscriptions/:id/cancel')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Annuler un abonnement (Admin override)' })
  @ApiParam({ name: 'id' })
  async cancelSubscription(@Param('id') id: string) {
    return this.adminService.cancelSubscription(id);
  }

  @Patch('subscriptions/:id/plan')
  @Permissions('write:questions')
  @ApiOperation({ summary: "Changer le plan d'un abonnement (Admin override)" })
  @ApiParam({ name: 'id' })
  async changeSubscriptionPlan(
    @Param('id') id: string,
    @Body('planId') planId: string,
  ) {
    return this.adminService.changeSubscriptionPlan(id, planId);
  }

  @Get('subscriptions/prospects')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Prospects — upsell et coaching' })
  async getProspects() {
    return this.adminService.getProspects();
  }

  // ── Plans ───────────────────────────────────────────────────────────────────

  @Get('plans')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Liste des plans tarifaires' })
  async getAdminPlans() {
    return this.adminService.getAdminPlans();
  }

  @Post('plans')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Créer un plan (Admin)' })
  async createAdminPlan(
    @Body() data: {
      name: string; slug: string; description?: string;
      price: number; currency?: string; intervalMonths?: number;
      features?: string[]; stripePriceId?: string; isActive?: boolean; order?: number;
    },
  ) {
    return this.adminService.createAdminPlan(data);
  }

  @Delete('plans/:id')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Supprimer un plan (Admin)' })
  @ApiParam({ name: 'id' })
  async deleteAdminPlan(@Param('id') id: string) {
    return this.adminService.deleteAdminPlan(id);
  }

  @Put('plans/:id')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Modifier un plan (Admin)' })
  @ApiParam({ name: 'id' })
  async updateAdminPlan(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      description?: string;
      price?: number;
      features?: string[];
      isActive?: boolean;
      order?: number;
    },
  ) {
    return this.adminService.updateAdminPlan(id, data);
  }

  // ── Email ───────────────────────────────────────────────────────────────────

  @Get('email/templates')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Liste des templates email' })
  async getEmailTemplates() {
    return this.adminService.getEmailTemplates();
  }

  @Get('email/templates/:id/preview')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Prévisualisation HTML d\'un template' })
  @ApiParam({ name: 'id' })
  async previewEmailTemplate(@Param('id') id: string) {
    return this.adminService.getEmailTemplatePreview(id as EmailTemplateId);
  }

  @Post('email/send/user/:userId')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Envoyer un email à un utilisateur' })
  @ApiParam({ name: 'userId' })
  async sendEmailToUser(
    @Param('userId') userId: string,
    @Body('templateId') templateId: string,
  ) {
    return this.adminService.sendEmailToUser(userId, templateId as EmailTemplateId);
  }

  @Post('email/send/segment')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Envoyer un email à un segment (upsell ou coaching)' })
  async sendEmailToSegment(
    @Body('segment')    segment:    'upsell' | 'coaching',
    @Body('templateId') templateId: string,
  ) {
    return this.adminService.sendEmailToSegment(segment, templateId as EmailTemplateId);
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  @Get('categories')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Liste tous les types de baux (admin)' })
  async getAdminCategories() {
    return this.adminService.getAdminCategories();
  }

  @Post('categories')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Créer un type de bail (Admin)' })
  async createCategory(
    @Body() data: {
      name: string; slug: string; description?: string;
      color?: string; iconUrl?: string; order?: number; isPremium?: boolean;
    },
  ) {
    return this.adminService.createCategory(data);
  }

  @Put('categories/:id')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Modifier un type de bail (Admin)' })
  @ApiParam({ name: 'id' })
  async updateCategory(
    @Param('id') id: string,
    @Body() data: {
      name?: string; slug?: string; description?: string;
      color?: string; iconUrl?: string; order?: number;
      isPremium?: boolean; isActive?: boolean;
    },
  ) {
    return this.adminService.updateCategory(id, data);
  }

  @Post('categories/:id/toggle-active')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Activer / Désactiver un type de bail (Admin)' })
  @ApiParam({ name: 'id' })
  async toggleCategoryActive(@Param('id') id: string) {
    return this.adminService.toggleCategoryActive(id);
  }

  @Delete('categories/:id')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Supprimer un type de bail (Admin)' })
  @ApiParam({ name: 'id' })
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
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
