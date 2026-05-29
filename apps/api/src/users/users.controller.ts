import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';
import { UserRole } from '@prisma/client';

@ApiTags('Utilisateurs (Admin)')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Permissions('manage:users')
  @ApiOperation({ summary: 'Lister les utilisateurs', description: 'Récupère la liste des utilisateurs avec filtres et pagination (Admin uniquement)' })
  @ApiQuery({ name: 'role', required: false, enum: ['USER', 'MODERATOR', 'ADMIN'], description: 'Filtrer par rôle' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrer par statut actif' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par nom ou email' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Éléments par page (défaut: 20)' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs avec pagination' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  async findAll(
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findAll({
      role,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('stats')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Statistiques utilisateurs', description: 'Récupère les statistiques globales des utilisateurs' })
  @ApiResponse({ status: 200, description: 'Statistiques retournées' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  async getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @Permissions('manage:users')
  @ApiOperation({ summary: 'Obtenir un utilisateur', description: 'Récupère les détails d\'un utilisateur par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/role')
  @Permissions('manage:users')
  @ApiOperation({ summary: 'Modifier le rôle', description: 'Change le rôle d\'un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiBody({ schema: { type: 'object', properties: { role: { type: 'string', enum: ['USER', 'MODERATOR', 'ADMIN'] } } } })
  @ApiResponse({ status: 200, description: 'Rôle modifié avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  @Post(':id/toggle-active')
  @Permissions('manage:users')
  @ApiOperation({ summary: 'Activer/Désactiver un compte', description: 'Bascule le statut actif d\'un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 201, description: 'Statut modifié avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  @Delete(':id')
  @Permissions('manage:users')
  @ApiOperation({ summary: 'Supprimer un utilisateur', description: 'Supprime définitivement un utilisateur et toutes ses données (cascade)' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Patch(':id/profile')
  @Permissions('manage:users')
  @ApiOperation({ summary: "Modifier le profil d'un utilisateur (admin)", description: 'Permet à un admin de modifier les informations de profil' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiBody({ schema: { type: 'object', properties: {
    displayName:        { type: 'string' },
    ageRange:           { type: 'string', enum: ['AGE_18_25', 'AGE_26_35', 'AGE_36_45', 'AGE_46_55', 'AGE_56_PLUS'] },
    professionalStatus: { type: 'string', enum: ['SALARIE', 'INDEPENDANT', 'MANDATAIRE'] },
  }}})
  @ApiResponse({ status: 200, description: 'Profil mis à jour' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async updateUserProfile(
    @Param('id') id: string,
    @Body() data: { displayName?: string; ageRange?: string; professionalStatus?: string },
  ) {
    return this.usersService.updateUserProfile(id, data);
  }

  @Post(':id/ban')
  @Permissions('manage:users')
  @ApiOperation({ summary: 'Bannir un utilisateur', description: 'Bannit un utilisateur de la plateforme' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur banni avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async ban(@Param('id') id: string) {
    return this.usersService.ban(id);
  }
}
