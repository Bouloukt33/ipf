import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    question: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    quizSession: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    userProfile: {
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return complete dashboard statistics', async () => {
      // Mock counts
      mockPrismaService.user.count
        .mockResolvedValueOnce(100) // total users
        .mockResolvedValueOnce(95) // active users
        .mockResolvedValueOnce(15); // new users this week

      mockPrismaService.question.count.mockResolvedValue(500);
      mockPrismaService.quizSession.count
        .mockResolvedValueOnce(1000) // total sessions
        .mockResolvedValueOnce(150); // sessions last 7 days

      mockPrismaService.category.count.mockResolvedValue(10);

      // Données des graphiques
      mockPrismaService.quizSession.findMany.mockResolvedValue([
        { startedAt: new Date('2026-06-20T10:00:00Z') },
        { startedAt: new Date('2026-06-20T15:00:00Z') },
        { startedAt: new Date('2026-06-21T09:00:00Z') },
      ]);
      mockPrismaService.userProfile.groupBy.mockResolvedValue([
        { professionalStatus: 'SALARIE', _count: 60 },
        { professionalStatus: null, _count: 40 },
      ]);
      mockPrismaService.question.groupBy.mockResolvedValue([
        { categoryId: 'cat-1', _count: 300 },
      ]);
      mockPrismaService.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Bail commercial', color: '#D27A2D' },
      ]);

      const result = await service.getDashboardStats();

      expect(result.users.total).toBe(100);
      expect(result.users.active).toBe(95);
      expect(result.users.newThisWeek).toBe(15);
      expect(result.questions.total).toBe(500);
      expect(result.sessions.total).toBe(1000);
      expect(result.sessions.last7Days).toBe(150);
      expect(result.categories).toBe(10);
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent sessions and users', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          score: 8,
          user: { email: 'user1@test.com' },
        },
      ];

      const mockUsers = [
        {
          id: 'user-1',
          email: 'newuser@test.com',
        },
      ];

      mockPrismaService.quizSession.findMany.mockResolvedValue(mockSessions);
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getRecentActivity();

      expect(result.recentSessions).toEqual(mockSessions);
      expect(result.recentUsers).toEqual(mockUsers);
    });
  });

  describe('getQuestionStats', () => {
    it('should return questions statistics by category and level', async () => {
      const mockByCategory = [
        { categoryId: 'cat-1', _count: 100 },
        { categoryId: 'cat-2', _count: 150 },
      ];

      const mockByLevel = [
        { level: 1, _count: 80 },
        { level: 2, _count: 120 },
      ];

      const mockCategories = [
        { id: 'cat-1', name: 'Category 1' },
        { id: 'cat-2', name: 'Category 2' },
      ];

      mockPrismaService.question.groupBy
        .mockResolvedValueOnce(mockByCategory)
        .mockResolvedValueOnce(mockByLevel);

      mockPrismaService.question.count.mockResolvedValue(50);
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.getQuestionStats();

      expect(result.byCategory).toHaveLength(2);
      expect(result.byCategory[0].category).toBe('Category 1');
      expect(result.byLevel).toEqual(mockByLevel);
      expect(result.premiumCount).toBe(50);
    });
  });
});
