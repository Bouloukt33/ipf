import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from './questions.service';
import { PrismaService } from '../prisma';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    question: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
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
      expect(prisma.question.delete).toHaveBeenCalledWith({
        where: { id: 'q1' },
      });
    });
  });

  describe('toggleActive', () => {
    it('should toggle question active status and keep status in sync', async () => {
      const mockQuestion = { id: 'q1', isActive: true };
      const mockToggled = { id: 'q1', isActive: false, status: 'SUSPENDED' };

      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      mockPrismaService.question.update.mockResolvedValue(mockToggled);

      const result = await service.toggleActive('q1');

      expect(result).toEqual(mockToggled);
      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        // isActive true → false ⇒ statut SUSPENDED (seul ACTIVE est jouable)
        data: { isActive: false, status: 'SUSPENDED' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should set status and derive isActive', async () => {
      const mockQuestion = { id: 'q1', isActive: true, status: 'ACTIVE' };
      const mockUpdated = { id: 'q1', isActive: false, status: 'ARCHIVED' };

      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      mockPrismaService.question.update.mockResolvedValue(mockUpdated);

      const result = await service.updateStatus('q1', 'ARCHIVED');

      expect(result).toEqual(mockUpdated);
      expect(prisma.question.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'q1' },
          data: { status: 'ARCHIVED', isActive: false },
        }),
      );
    });

    it('should throw NotFoundException when question not found', async () => {
      mockPrismaService.question.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('missing', 'ACTIVE')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('importCsv', () => {
    const header =
      'categorie;niveau;question;optionA;optionB;optionC;optionD;bonneReponse;premium';

    beforeEach(() => {
      mockPrismaService.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Bail commercial', slug: 'bail-commercial' },
      ]);
    });

    it('should import valid rows and report line errors', async () => {
      mockPrismaService.question.createMany.mockResolvedValue({ count: 1 });

      const csv = [
        header,
        'bail-commercial;2;Durée minimale ?;9 ans;3 ans;6 ans;1 an;a;oui',
        'bail-inconnu;1;Q ?;A;B;C;D;A;non', // catégorie inconnue → erreur
        'bail-commercial;9;Q ?;A;B;C;D;A;non', // niveau invalide → erreur
      ].join('\n');

      const report = await service.importCsv(csv);

      expect(report).toEqual({
        imported: 1,
        total: 3,
        errors: [
          { line: 3, message: expect.stringContaining('Catégorie inconnue') },
          { line: 4, message: expect.stringContaining('Niveau invalide') },
        ],
      });
      expect(prisma.question.createMany).toHaveBeenCalledWith({
        data: [
          {
            categoryId: 'cat-1',
            text: 'Durée minimale ?',
            optionA: '9 ans',
            optionB: '3 ans',
            optionC: '6 ans',
            optionD: '1 an',
            correctAnswer: 'A', // normalisé en majuscule
            level: 2,
            isPremium: true, // « oui »
          },
        ],
      });
    });

    it('should resolve category by name and accept comma delimiter and quotes', async () => {
      mockPrismaService.question.createMany.mockResolvedValue({ count: 1 });

      const csv =
        'categorie,niveau,question,optionA,optionB,optionC,optionD,bonneReponse,premium\n' +
        'Bail Commercial,1,"Question, avec virgule ?",A,B,C,D,B,non\n';

      const report = await service.importCsv(csv);

      expect(report.imported).toBe(1);
      expect(report.errors).toEqual([]);
      expect(prisma.question.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            categoryId: 'cat-1',
            text: 'Question, avec virgule ?',
            correctAnswer: 'B',
            isPremium: false,
          }),
        ],
      });
    });

    it('should reject a CSV with a missing header column', async () => {
      const csv = 'categorie;niveau;question\nbail-commercial;1;Q ?';

      await expect(service.importCsv(csv)).rejects.toThrow(BadRequestException);
      expect(prisma.question.createMany).not.toHaveBeenCalled();
    });

    it('should reject an empty CSV', async () => {
      await expect(service.importCsv(header)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not call createMany when no row is valid', async () => {
      const csv = `${header}\nbail-commercial;1;Q ?;A;B;;D;A;non`; // optionC vide

      const report = await service.importCsv(csv);

      expect(report.imported).toBe(0);
      expect(report.errors).toHaveLength(1);
      expect(prisma.question.createMany).not.toHaveBeenCalled();
    });
  });
});
