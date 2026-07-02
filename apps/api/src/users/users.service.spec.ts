import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma';
import { UserRole } from '@prisma/client';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    // AUTH0_DOMAIN / AUTH0_CLIENT_ID / AUTH0_CONNECTION
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        AUTH0_DOMAIN: 'test.eu.auth0.com',
        AUTH0_CLIENT_ID: 'client-123',
      };
      return values[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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

  describe('createUser', () => {
    const mockFetch = (responses: Array<{ ok: boolean; body?: unknown }>) => {
      const fn = jest.fn();
      for (const r of responses) {
        fn.mockResolvedValueOnce({
          ok: r.ok,
          status: r.ok ? 200 : 400,
          json: () => Promise.resolve(r.body ?? {}),
        });
      }
      jest.spyOn(global, 'fetch').mockImplementation(fn);
      return fn;
    };

    it('should create the Auth0 account then provision the local user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const fetchMock = mockFetch([
        { ok: true, body: { _id: 'abc123' } }, // signup
        { ok: true }, // change_password (email mot de passe)
      ]);
      const mockCreated = {
        id: 'user-1',
        auth0Id: 'auth0|abc123',
        email: 'new@test.com',
        role: 'USER' as UserRole,
        profile: { displayName: 'Nouveau' },
      };
      mockPrismaService.user.create.mockResolvedValue(mockCreated);

      const result = await service.createUser({
        email: 'New@Test.com',
        displayName: 'Nouveau',
      });

      expect(result.user).toEqual(mockCreated);
      // email normalisé en minuscules
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            auth0Id: 'auth0|abc123',
            email: 'new@test.com',
            role: 'USER',
          }),
        }),
      );
      // signup Auth0 + email « définir votre mot de passe »
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][0]).toContain('/dbconnections/signup');
      expect(fetchMock.mock.calls[1][0]).toContain(
        '/dbconnections/change_password',
      );
    });

    it('should throw ConflictException when email already exists locally', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });

      await expect(
        service.createUser({ email: 'taken@test.com' }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when Auth0 already knows the email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockFetch([{ ok: false, body: { code: 'invalid_signup' } }]);

      await expect(
        service.createUser({ email: 'auth0@test.com' }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException on other Auth0 signup failures', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockFetch([{ ok: false, body: { code: 'server_error' } }]);

      await expect(
        service.createUser({ email: 'fail@test.com' }),
      ).rejects.toThrow(BadRequestException);
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
