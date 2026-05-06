import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

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
                { profile: { displayName: { contains: filters.search, mode: 'insensitive' } } },
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
