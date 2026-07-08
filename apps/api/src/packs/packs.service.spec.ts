import { Test, TestingModule } from '@nestjs/testing';
import { PacksService } from './packs.service';
import { PrismaService } from '../prisma';

describe('PacksService', () => {
  let service: PacksService;
  let prisma: PrismaService;

  const mockPrismaService = {
    pack: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PacksService>(PacksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll — visibilité', () => {
    beforeEach(() => {
      mockPrismaService.pack.findMany.mockResolvedValue([]);
    });

    it('should only return PUBLIC packs for an anonymous request', async () => {
      await service.findAll({});

      expect(prisma.pack.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ visibility: 'PUBLIC' }),
        }),
      );
    });

    it('should return PUBLIC packs + packs assigned to the user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });

      await service.findAll({ auth0Id: 'auth0|abc' });

      expect(prisma.pack.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { visibility: 'PUBLIC' },
              { visibility: 'PRIVATE', assignedUserId: 'user-1' },
            ],
          }),
        }),
      );
    });

    it('should fall back to PUBLIC only when the auth0 user has no DB row', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await service.findAll({ auth0Id: 'auth0|inconnu' });

      expect(prisma.pack.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ visibility: 'PUBLIC' }),
        }),
      );
    });

    it('should not restrict visibility for an admin view', async () => {
      await service.findAll({ isAdmin: true, includeInactive: true });

      const where = mockPrismaService.pack.findMany.mock.calls[0][0].where;
      expect(where.visibility).toBeUndefined();
      expect(where.OR).toBeUndefined();
      expect(where.isActive).toBeUndefined();
    });

    it('should apply type and isFree filters', async () => {
      await service.findAll({ type: 'VISITEUR', isFree: true });

      expect(prisma.pack.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'VISITEUR', isFree: true }),
        }),
      );
    });
  });

  describe('findOne — accès aux packs privés', () => {
    const privatePack = {
      id: 'pack-1',
      visibility: 'PRIVATE',
      assignedUserId: 'user-assigned',
    };

    beforeEach(() => {
      mockPrismaService.pack.findUnique.mockResolvedValue(privatePack);
    });

    it('should throw NotFound for a viewer who is not the assigned user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-other' });

      await expect(
        service.findOne('pack-1', { auth0Id: 'auth0|other', isAdmin: false }),
      ).rejects.toThrow('Pack non trouvé');
    });

    it('should throw NotFound for an anonymous viewer', async () => {
      await expect(
        service.findOne('pack-1', { isAdmin: false }),
      ).rejects.toThrow('Pack non trouvé');
    });

    it('should return the pack to the assigned user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-assigned',
      });

      const result = await service.findOne('pack-1', {
        auth0Id: 'auth0|assigned',
        isAdmin: false,
      });

      expect(result).toEqual(privatePack);
    });

    it('should return the pack to an admin viewer', async () => {
      const result = await service.findOne('pack-1', {
        auth0Id: 'auth0|admin',
        isAdmin: true,
      });

      expect(result).toEqual(privatePack);
    });

    it('should return a PUBLIC pack to any viewer', async () => {
      const publicPack = {
        id: 'pack-2',
        visibility: 'PUBLIC',
        assignedUserId: null,
      };
      mockPrismaService.pack.findUnique.mockResolvedValue(publicPack);

      const result = await service.findOne('pack-2', { isAdmin: false });

      expect(result).toEqual(publicPack);
    });

    it('should keep internal calls (no viewer) unrestricted', async () => {
      const result = await service.findOne('pack-1');

      expect(result).toEqual(privatePack);
    });
  });

  describe('create', () => {
    const baseDto = {
      categoryId: 'cat-1',
      name: 'Pack test',
      slug: 'pack-test',
    };

    it('should default to ACTIVE status with isActive true', async () => {
      mockPrismaService.pack.create.mockResolvedValue({ id: 'pack-1' });

      await service.create(baseDto);

      expect(prisma.pack.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ACTIVE', isActive: true }),
        }),
      );
    });

    it('should derive isActive false from a SUSPENDED status', async () => {
      mockPrismaService.pack.create.mockResolvedValue({ id: 'pack-1' });

      await service.create({ ...baseDto, status: 'SUSPENDED' });

      expect(prisma.pack.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'SUSPENDED',
            isActive: false,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    beforeEach(() => {
      // findOne interne
      mockPrismaService.pack.findUnique.mockResolvedValue({ id: 'pack-1' });
    });

    it('should sync isActive when status changes', async () => {
      mockPrismaService.pack.update.mockResolvedValue({ id: 'pack-1' });

      await service.update('pack-1', { status: 'DISABLED' });

      expect(prisma.pack.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DISABLED',
            isActive: false,
          }),
        }),
      );
    });

    it('should map legacy isActive updates onto status', async () => {
      mockPrismaService.pack.update.mockResolvedValue({ id: 'pack-1' });

      await service.update('pack-1', { isActive: true });

      expect(prisma.pack.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ACTIVE', isActive: true }),
        }),
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle isActive and keep status in sync', async () => {
      mockPrismaService.pack.findUnique.mockResolvedValue({
        id: 'pack-1',
        isActive: true,
      });
      mockPrismaService.pack.update.mockResolvedValue({
        id: 'pack-1',
        isActive: false,
        status: 'DISABLED',
      });

      const result = await service.toggleActive('pack-1');

      expect(result.isActive).toBe(false);
      expect(prisma.pack.update).toHaveBeenCalledWith({
        where: { id: 'pack-1' },
        data: { isActive: false, status: 'DISABLED' },
      });
    });
  });
});
