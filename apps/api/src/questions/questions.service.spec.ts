import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from './questions.service';
import { PrismaService } from '../prisma';
import { NotFoundException } from '@nestjs/common';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    question: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated questions', async () => {
      const mockQuestions = [
        {
          id: 'q1',
          text: 'Question 1',
          level: 1,
          isPremium: false,
        },
        {
          id: 'q2',
          text: 'Question 2',
          level: 2,
          isPremium: true,
        },
      ];

      mockPrismaService.question.findMany.mockResolvedValue(mockQuestions);
      mockPrismaService.question.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockQuestions);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by category', async () => {
      mockPrismaService.question.findMany.mockResolvedValue([]);
      mockPrismaService.question.count.mockResolvedValue(0);

      await service.findAll({ categoryId: 'cat-1' });

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId: 'cat-1' },
        }),
      );
    });

    it('should filter by level', async () => {
      mockPrismaService.question.findMany.mockResolvedValue([]);
      mockPrismaService.question.count.mockResolvedValue(0);

      await service.findAll({ level: 2 });

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { level: 2 },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a question by id', async () => {
      const mockQuestion = {
        id: 'q1',
        text: 'Test Question',
        category: { id: 'cat-1', name: 'Category 1' },
      };

      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);

      const result = await service.findOne('q1');

      expect(result).toEqual(mockQuestion);
    });

    it('should throw NotFoundException when question not found', async () => {
      mockPrismaService.question.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new question', async () => {
      const createDto = {
        categoryId: 'cat-1',
        text: 'New Question',
        optionA: 'A',
        optionB: 'B',
        optionC: 'C',
        optionD: 'D',
        correctAnswer: 'A',
        level: 1,
        isPremium: false,
      };

      const mockCreated = {
        id: 'q-new',
        ...createDto,
      };

      mockPrismaService.question.create.mockResolvedValue(mockCreated);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreated);
      expect(prisma.question.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          level: 1,
          isPremium: false,
        },
        include: { category: true, theme: true },
      });
    });
  });

  describe('update', () => {
    it('should update a question', async () => {
      const mockQuestion = { id: 'q1', text: 'Old Question' };
      const updateDto = { text: 'Updated Question', level: 2 };
      const mockUpdated = { id: 'q1', ...updateDto };

      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      mockPrismaService.question.update.mockResolvedValue(mockUpdated);

      const result = await service.update('q1', updateDto);

      expect(result).toEqual(mockUpdated);
    });
  });

  describe('delete', () => {
    it('should delete a question', async () => {
      const mockQuestion = { id: 'q1', text: 'Question to delete' };

      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      mockPrismaService.question.delete.mockResolvedValue(mockQuestion);

      const result = await service.delete('q1');

      expect(result).toEqual(mockQuestion);
      expect(prisma.question.delete).toHaveBeenCalledWith({ where: { id: 'q1' } });
    });
  });

  describe('toggleActive', () => {
    it('should toggle question active status', async () => {
      const mockQuestion = { id: 'q1', isActive: true };
      const mockToggled = { id: 'q1', isActive: false };

      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      mockPrismaService.question.update.mockResolvedValue(mockToggled);

      const result = await service.toggleActive('q1');

      expect(result).toEqual(mockToggled);
      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: { isActive: false },
      });
    });
  });
});
