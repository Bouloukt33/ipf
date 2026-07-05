import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Création d'un compte par un admin (point client n°8).
   *
   * Le compte est d'abord créé côté Auth0 (endpoint public dbconnections/signup,
   * même pattern que forgotPassword dans AuthService) avec un mot de passe
   * aléatoire jamais communiqué, puis provisionné en base avec le vrai auth0Id.
   * Un email Auth0 « définir votre mot de passe » est envoyé à l'utilisateur.
   */
  async createUser(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const domain = this.configService.get<string>('AUTH0_DOMAIN');
    const clientId = this.configService.get<string>('AUTH0_CLIENT_ID');
    const connection =
      this.configService.get<string>('AUTH0_CONNECTION') ||
      'Username-Password-Authentication';

    if (!domain || !clientId) {
      throw new BadRequestException('Configuration Auth0 manquante');
    }

    // Mot de passe temporaire fort, jamais communiqué : l'utilisateur en
    // définira un via l'email de réinitialisation envoyé juste après.
    const temporaryPassword = `Aa1!${randomBytes(24).toString('base64url')}`;

    const signupResponse = await fetch(
      `https://${domain}/dbconnections/signup`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          connection,
          email,
          password: temporaryPassword,
          name: dto.displayName || email.split('@')[0],
        }),
      },
    );

    if (!signupResponse.ok) {
      const errorBody = (await signupResponse.json().catch(() => ({}))) as {
        code?: string;
        description?: string;
      };
      this.logger.error(
        `Auth0 signup error: ${signupResponse.status} - ${JSON.stringify(errorBody)}`,
      );
      if (errorBody.code === 'invalid_signup') {
        throw new ConflictException(
          'Un compte Auth0 existe déjà avec cet email',
        );
      }
      throw new BadRequestException(
        'La création du compte Auth0 a échoué, réessayez plus tard',
      );
    }

    const auth0User = (await signupResponse.json()) as { _id?: string };
    if (!auth0User._id) {
      throw new BadRequestException('Réponse Auth0 inattendue');
    }

    const user = await this.prisma.user.create({
      data: {
        auth0Id: `auth0|${auth0User._id}`,
        email,
        role: (dto.role as UserRole) ?? 'USER',
        profile: {
          create: {
            displayName: dto.displayName || email.split('@')[0],
            xpTotal: 0,
            level: 1,
            streakDays: 0,
            bestStreak: 0,
          },
        },
      },
      include: { profile: true },
    });

    // Email « définir votre mot de passe » — best effort, le compte existe déjà.
    try {
      await fetch(`https://${domain}/dbconnections/change_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, email, connection }),
      });
    } catch (error) {
      this.logger.warn(
        `Envoi de l'email de définition de mot de passe impossible pour ${email}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return {
      message:
        'Compte créé. Un email a été envoyé à l’utilisateur pour définir son mot de passe.',
      user,
    };
  }

  async findAll(filters?: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        {
          profile: {
            displayName: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: true,
          ranking: true,
          subscription: { include: { plan: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        ranking: true,
        subscription: { include: { plan: true } },
        userBadges: { include: { badge: true } },
        quizSessions: {
          take: 10,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async updateRole(id: string, role: UserRole) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { role },
      include: { profile: true },
    });
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  async ban(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async deleteUser(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true, id };
  }

  async updateUserProfile(
    id: string,
    data: {
      displayName?: string;
      ageRange?: string;
      professionalStatus?: string;
    },
  ) {
    await this.findOne(id);
    return this.prisma.userProfile.update({
      where: { userId: id },
      data: {
        ...(data.displayName !== undefined && {
          displayName: data.displayName,
        }),
        ...(data.ageRange !== undefined && { ageRange: data.ageRange as any }),
        ...(data.professionalStatus !== undefined && {
          professionalStatus: data.professionalStatus as any,
        }),
      },
    });
  }

  async getStats() {
    const [totalUsers, activeUsers, admins, moderators] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'MODERATOR' } }),
    ]);

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { profile: true },
    });

    return {
      totalUsers,
      activeUsers,
      admins,
      moderators,
      recentUsers,
    };
  }
}
