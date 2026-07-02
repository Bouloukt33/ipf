import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma';
import { UserRole } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          role: 'USER' as UserRole,
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          role: 'ADMIN' as UserRole,
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by role', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.findAll({ role: 'ADMIN' as UserRole });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: 'ADMIN' },
        }),
      );
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER' as UserRole,
      };

      const mockUpdated = { ...mockUser, role: 'MODERATOR' as UserRole };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUpdated);

      const result = await service.updateRole('user-1', 'MODERATOR');

      expect(result.role).toBe('MODERATOR');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'MODERATOR' },
        include: { profile: true },
      });
    });
  });

  describe('ban', () => {
    it('should ban a user (set isActive to false)', async () => {
      const mockUser = {
        id: 'user-1',
        isActive: true,
      };

      const mockBanned = { ...mockUser, isActive: false };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockBanned);

      const result = await service.ban('user-1');

      expect(result.isActive).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(95) // active
        .mockResolvedValueOnce(5) // admins
        .mockResolvedValueOnce(10); // moderators

      mockPrismaService.user.findMany.mockResolvedValue([
        { id: 'user-1', email: 'recent1@test.com' },
      ]);

      const result = await service.getStats();

      expect(result.totalUsers).toBe(100);
      expect(result.activeUsers).toBe(95);
      expect(result.admins).toBe(5);
      expect(result.moderators).toBe(10);
    });
  });
});
