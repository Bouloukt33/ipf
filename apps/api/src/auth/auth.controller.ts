import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

/**
 * Contrôleur d'authentification
 * Note: Avec Auth0, la connexion/déconnexion se fait côté Auth0 (frontend).
 * Ces endpoints servent à synchroniser les utilisateurs avec notre base de données.
 */
@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Synchronise un nouvel utilisateur Auth0 avec notre base de données
   * Appelé après la première connexion Auth0
   */
  @Post('register')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inscription', description: 'Synchronise un nouvel utilisateur Auth0 avec la base de données. Appelé après la première connexion Auth0.' })
  @ApiBody({ schema: { type: 'object', properties: { displayName: { type: 'string', example: 'John Doe', description: 'Nom d\'affichage de l\'utilisateur' } } } })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token Auth0 invalide' })
  @ApiResponse({ status: 409, description: 'Utilisateur déjà existant' })
  async register(
    @CurrentUser() user: any,
    @Body() body: { displayName?: string },
  ) {
    return this.authService.register(user, body.displayName);
  }

  /**
   * POST /api/auth/login
   * Synchronise l'utilisateur Auth0 avec notre base de données
   * Appelé à chaque connexion pour mettre à jour les infos
   */
  @Post('login')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connexion', description: 'Synchronise l\'utilisateur Auth0 avec la base de données. Appelé à chaque connexion pour mettre à jour les informations.' })
  @ApiResponse({ status: 200, description: 'Connexion réussie - Utilisateur synchronisé' })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token Auth0 invalide' })
  async login(@CurrentUser() user: any) {
    return this.authService.syncUser(user);
  }

  /**
   * GET /api/auth/me
   * Récupère les informations de l'utilisateur connecté
   */
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Utilisateur courant', description: 'Récupère les informations complètes de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Informations de l\'utilisateur retournées' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getUser(user.userId);
  }

  /**
   * POST /api/auth/logout
   * Déconnexion - Met à jour la dernière activité
   * Note: La vraie déconnexion se fait côté Auth0
   */
  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion', description: 'Met à jour la dernière activité. Note: La vraie déconnexion se fait côté Auth0.' })
  @ApiResponse({ status: 200, description: 'Déconnexion enregistrée' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.userId);
  }

  /**
   * DELETE /api/auth/account
   * Supprime le compte utilisateur
   */
  @Delete('account')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer le compte', description: 'Supprime définitivement le compte utilisateur et toutes ses données' })
  @ApiResponse({ status: 200, description: 'Compte supprimé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async deleteAccount(@CurrentUser() user: any) {
    return this.authService.deleteAccount(user.userId);
  }

  /**
   * GET /api/auth/check
   * Vérifie si le token est valide
   */
  @Get('check')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier l\'authentification', description: 'Vérifie si le token JWT est valide et retourne les informations basiques' })
  @ApiResponse({ status: 200, description: 'Token valide', schema: { type: 'object', properties: { authenticated: { type: 'boolean' }, userId: { type: 'string' }, email: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: 'Token invalide ou expiré' })
  async checkAuth(@CurrentUser() user: any) {
    return {
      authenticated: true,
      userId: user.userId,
      email: user.email,
    };
  }

  /**
   * POST /api/auth/forgot-password
   * Demande de réinitialisation de mot de passe
   * Endpoint public - pas d'AuthGuard
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mot de passe oublié',
    description: 'Envoie un email de réinitialisation de mot de passe via Auth0. Pour des raisons de sécurité, retourne toujours un succès.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Demande de réinitialisation traitée' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

    /**
   * GET /api/auth/dev-token
   * Récupère un token Auth0 pour les tests (DEV ONLY)
   * ⚠️ NE PAS UTILISER EN PRODUCTION
   */
  @Get('dev-token')
  @ApiOperation({ summary: '🔧 Token de développement', description: '⚠️ DEV ONLY - Récupère un token Auth0 pour les tests. Non disponible en production.' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'test@ipf.local' }, password: { type: 'string', example: 'TestPassword123!' } } } })
  @ApiResponse({ status: 200, description: 'Token généré avec succès' })
  @ApiResponse({ status: 403, description: 'Non disponible en production' })
  async getDevToken(@Body() body: { email?: string; password?: string }) {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Non disponible en production' };
    }

    const email = body.email || 'test@ipf.local';
    const password = body.password || 'TestPassword123!';

    try {
      const response = await fetch('https://ipf-5secondes-dev.eu.auth0.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'password',
          client_id: 'mxSZ7AuUF1ahhsvaRPjgzdJx3kz4E5ik',
          client_secret: 'LEFsaGdKKT-lvvisLS4ROTNDQBhbfulzk7QMmk3cA5IM0S9KlmOKMVvWc4DbuCIA',
          audience: 'https://api.ipf.local',
          username: email,
          password: password,
          scope: 'openid profile email',
        }),
      });

      const data = await response.json();

      if (data.error) {
        return {
          error: data.error,
          error_description: data.error_description,
        };
      }

      return {
        message: '🔐 Token utilisateur pour tests',
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
      };
    } catch (error) {
      return { error: 'Erreur', details: error.message };
    }
  }
}
