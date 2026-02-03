import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    typeBail: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return only active categories by default', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Category 1', isActive: true },
        { id: 'cat-2', name: 'Category 2', isActive: true },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });

    it('should return all categories when includeInactive is true', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return category by ID', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Test Category',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('cat-1');

      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      const mockCategory = {
        id: 'cat-1',
        slug: 'test-category',
        name: 'Test Category',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findBySlug('test-category');

      expect(result).toEqual(mockCategory);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-category' },
        include: expect.any(Object),
      });
    });
  });

  describe('getTypeBail', () => {
    it('should return typeBails for a category', async () => {
      const mockCategory = {
        id: 'cat-1',
      };
      const mockTypeBails = [
        { id: 'typebail-1', name: 'TypeBail 1' },
      ];

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.typeBail.findMany.mockResolvedValue(mockTypeBails);

      const result = await service.getTypeBail('cat-1');

      expect(result).toEqual(mockTypeBails);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.getTypeBail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
