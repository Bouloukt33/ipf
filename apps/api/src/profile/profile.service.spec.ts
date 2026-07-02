import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma';
import { NotFoundException } from '@nestjs/common';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    userProfile: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 'user-1',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        role: 'USER',
        isActive: true,
        profile: {
          id: 'profile-1',
          userId: 'user-1',
          displayName: 'Test User',
          xpTotal: 100,
          level: 5,
        },
        subscription: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('auth0|123');

      expect(result).toEqual({
        displayName: 'Test User',
        email: 'test@example.com',
        avatarUrl: null,
        ageRange: null,
        professionalStatus: null,
        jobProfileId: null,
        level: 5,
        xpTotal: 100,
        streakDays: 0,
        subscription: null,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { auth0Id: 'auth0|123' },
        include: {
          profile: true,
          subscription: { include: { plan: true } },
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('auth0|999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = {
        id: 'user-1',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
      };

      const updateData = {
        displayName: 'Updated Name',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const mockUpdatedProfile = {
        id: 'profile-1',
        userId: 'user-1',
        ...updateData,
        ageRange: null,
        professionalStatus: null,
        jobProfileId: null,
        xpTotal: 100,
        level: 5,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userProfile.upsert.mockResolvedValue(
        mockUpdatedProfile,
      );

      const result = await service.updateProfile('auth0|123', updateData);

      expect(result).toEqual({
        displayName: 'Updated Name',
        avatarUrl: 'https://example.com/avatar.jpg',
        ageRange: null,
        professionalStatus: null,
        jobProfileId: null,
      });
      expect(prisma.userProfile.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: updateData,
        create: {
          userId: 'user-1',
          ...updateData,
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('auth0|999', { displayName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
