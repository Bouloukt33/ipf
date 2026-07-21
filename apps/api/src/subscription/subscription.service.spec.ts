import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../prisma';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
    plan: { findMany: jest.fn(), findUnique: jest.fn() },
    subscription: { upsert: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlans', () => {
    it('parse le JSON de features et convertit le prix Decimal en Number', async () => {
      mockPrismaService.plan.findMany.mockResolvedValue([
        {
          id: 'plan-1',
          name: 'Apprenti',
          slug: 'apprenti',
          description: 'Accès gratuit',
          price: { toString: () => '0' }, // Decimal-like
          features: JSON.stringify(['Bail commercial', 'Mode Practice']),
        },
      ]);

      const result = await service.getPlans();

      expect(mockPrismaService.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } }),
      );
      expect(result).toEqual([
        {
          id: 'plan-1',
          name: 'Apprenti',
          slug: 'apprenti',
          description: 'Accès gratuit',
          price: 0,
          features: ['Bail commercial', 'Mode Practice'],
        },
      ]);
    });

    it('renvoie un tableau vide de features si le JSON est invalide ou absent', async () => {
      mockPrismaService.plan.findMany.mockResolvedValue([
        {
          id: 'plan-2',
          name: 'Compagnon',
          slug: 'compagnon',
          description: null,
          price: 9.99,
          features: null,
        },
      ]);

      const [result] = await service.getPlans();

      expect(result.features).toEqual([]);
    });
  });

  describe('subscribe', () => {
    it('rejette un slug de plan invalide', async () => {
      await expect(service.subscribe('auth0|1', 'inexistant')).rejects.toThrow(
        BadRequestException,
      );
    });

    it("lève NotFoundException si l'utilisateur est introuvable", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.subscribe('auth0|1', 'apprenti')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatus', () => {
    it("lève NotFoundException si l'utilisateur est introuvable", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getStatus('auth0|1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retourne isPremium=false si aucun abonnement actif', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscription: null,
      });

      const result = await service.getStatus('auth0|1');

      expect(result).toEqual({ isPremium: false, subscription: null });
    });
  });
});
