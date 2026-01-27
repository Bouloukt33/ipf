import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthGuard, PermissionsGuard, Permissions, CurrentUser } from './auth';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Page d\'accueil', description: 'Route publique - accessible sans authentification' })
  @ApiResponse({ status: 200, description: 'Message de bienvenue' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Route protégée', description: 'Vérifie que l\'utilisateur est authentifié' })
  @ApiResponse({ status: 200, description: 'Utilisateur authentifié avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token invalide ou manquant' })
  getProtected(@CurrentUser() user: any) {
    return {
      message: 'Vous êtes authentifié!',
      user: user,
    };
  }

  @Get('admin')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('read:admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Route admin', description: 'Accès réservé aux administrateurs avec permission read:admin' })
  @ApiResponse({ status: 200, description: 'Accès admin autorisé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès interdit - Permissions insuffisantes' })
  getAdmin(@CurrentUser() user: any) {
    return {
      message: 'Accès admin autorisé',
      user: user,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil rapide', description: 'Récupère les informations basiques de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Informations du profil retournées' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  getProfile(@CurrentUser() user: any) {
    return {
      userId: user.userId,
      email: user.email,
      permissions: user.permissions,
      roles: user.roles,
    };
  }
}
