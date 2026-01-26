import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';

interface Auth0User {
  userId: string; // auth0Id (sub claim)
  email: string;
  permissions?: string[];
  roles?: string[];
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Enregistre un NOUVEL utilisateur uniquement
   * Si l'utilisateur existe déjà, retourne une erreur 409
   */
  async register(auth0User: Auth0User, displayName?: string) {
    // Vérifie si l'utilisateur existe déjà par auth0Id
    const existingUser = await this.prisma.user.findUnique({
      where: { auth0Id: auth0User.userId },
      include: { profile: true },
    });

    if (existingUser) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Ce compte existe déjà',
        error: 'Conflict',
        user: this.formatUser(existingUser),
        hint: 'Utilisez POST /api/auth/login pour vous connecter',
      });
    }

    // Vérifie si l'email existe déjà (autre compte Auth0 avec même email)
    const emailExists = await this.prisma.user.findUnique({
      where: { email: auth0User.email },
    });

    if (emailExists) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Un compte avec cet email existe déjà',
        error: 'Conflict',
        hint: 'Cet email est associé à un autre compte Auth0',
      });
    }

    // Crée le nouvel utilisateur
    const user = await this.prisma.user.create({
      data: {
        auth0Id: auth0User.userId,
        email: auth0User.email,
        profile: {
          create: {
            displayName: displayName || auth0User.email.split('@')[0],
            xpTotal: 0,
            level: 1,
            streakDays: 0,
            bestStreak: 0,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return {
      message: 'Compte créé avec succès',
      user: this.formatUser(user),
      isNewUser: true,
    };
  }

  /**
   * Synchronise les informations utilisateur Auth0 avec notre base
   * Crée le compte s'il n'existe pas (auto-provisioning)
   */
  async syncUser(auth0User: Auth0User) {
    let user = await this.prisma.user.findUnique({
      where: { auth0Id: auth0User.userId },
      include: { profile: true },
    });

    if (!user) {
      // L'utilisateur n'existe pas, on le crée (auto-provisioning)
      user = await this.prisma.user.create({
        data: {
          auth0Id: auth0User.userId,
          email: auth0User.email,
          profile: {
            create: {
              displayName: auth0User.email.split('@')[0],
              xpTotal: 0,
              level: 1,
              streakDays: 0,
              bestStreak: 0,
            },
          },
        },
        include: { profile: true },
      });

      return {
        message: 'Connexion réussie (nouveau compte créé)',
        user: this.formatUser(user),
        isNewUser: true,
      };
    }

    // Met à jour l'email si changé côté Auth0
    if (user.email !== auth0User.email) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { email: auth0User.email },
        include: { profile: true },
      });
    }

    // Met à jour lastPlayedAt
    if (user.profile) {
      await this.prisma.userProfile.update({
        where: { userId: user.id },
        data: { lastPlayedAt: new Date() },
      });
    }

    return {
      message: 'Connexion réussie',
      user: this.formatUser(user),
      isNewUser: false,
    };
  }

  /**
   * Récupère les informations d'un utilisateur
   */
  async getUser(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.formatUser(user);
  }

  /**
   * Déconnexion - Met à jour la dernière activité
   */
  async logout(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: { profile: true },
    });

    if (user?.profile) {
      await this.prisma.userProfile.update({
        where: { userId: user.id },
        data: { lastPlayedAt: new Date() },
      });
    }

    return {
      message: 'Déconnexion réussie',
      // Note: La vraie déconnexion se fait côté Auth0
      // URL de déconnexion Auth0: https://{domain}/v2/logout?client_id={clientId}&returnTo={returnUrl}
    };
  }

  /**
   * Supprime le compte utilisateur
   */
  async deleteAccount(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Supprime l'utilisateur (cascade sur les relations)
    await this.prisma.user.delete({
      where: { id: user.id },
    });

    return {
      message: 'Compte supprimé avec succès',
      // Note: Il faudrait aussi supprimer le compte Auth0 via l'API Management
    };
  }

  /**
   * Formate les données utilisateur pour la réponse
   */
  private formatUser(user: any) {
    return {
      id: user.id,
      auth0Id: user.auth0Id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            avatarUrl: user.profile.avatarUrl,
            xpTotal: user.profile.xpTotal,
            level: user.profile.level,
            streakDays: user.profile.streakDays,
            bestStreak: user.profile.bestStreak,
            lastPlayedAt: user.profile.lastPlayedAt,
          }
        : null,
      subscription: user.subscription
        ? {
            plan: user.subscription.plan,
            status: user.subscription.status,
            expiresAt: user.subscription.expiresAt,
          }
        : null,
    };
  }
}
