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
