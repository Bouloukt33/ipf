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
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';

/**
 * Contrôleur d'authentification
 * Note: Avec Auth0, la connexion/déconnexion se fait côté Auth0 (frontend).
 * Ces endpoints servent à synchroniser les utilisateurs avec notre base de données.
 */
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
  async register(
    @CurrentUser() user: any,
    @Body() body: { displayName?: string },
  ) {
    return this.authService.registerOrSync(user, body.displayName);
  }

  /**
   * POST /api/auth/login
   * Synchronise l'utilisateur Auth0 avec notre base de données
   * Appelé à chaque connexion pour mettre à jour les infos
   */
  @Post('login')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@CurrentUser() user: any) {
    return this.authService.syncUser(user);
  }

  /**
   * GET /api/auth/me
   * Récupère les informations de l'utilisateur connecté
   */
  @Get('me')
  @UseGuards(AuthGuard)
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
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.userId);
  }

  /**
   * DELETE /api/auth/account
   * Supprime le compte utilisateur
   */
  @Delete('account')
  @UseGuards(AuthGuard)
  async deleteAccount(@CurrentUser() user: any) {
    return this.authService.deleteAccount(user.userId);
  }

  /**
   * GET /api/auth/check
   * Vérifie si le token est valide
   */
  @Get('check')
  @UseGuards(AuthGuard)
  async checkAuth(@CurrentUser() user: any) {
    return {
      authenticated: true,
      userId: user.userId,
      email: user.email,
    };
  }

    /**
   * GET /api/auth/dev-token
   * Récupère un token Auth0 pour les tests (DEV ONLY)
   * ⚠️ NE PAS UTILISER EN PRODUCTION
   */
  // Remplace la méthode getDevToken() par celle-ci :

  @Get('dev-token')
  async getDevToken() {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Non disponible en production' };
    }

    try {
      const response = await fetch('https://ipf-5secondes-dev.eu.auth0.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'password',
          client_id: 'mxSZ7AuUF1ahhsvaRPjgzdJx3kz4E5ik',
          client_secret: 'LEFsaGdKKT-lvvisLS4ROTNDQBhbfulzk7QMmk3cA5IM0S9KlmOKMVvWc4DbuCIA',
          audience: 'https://api.ipf.local',
          username: 'test@ipf.local',
          password: 'TestPassword123!',
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
