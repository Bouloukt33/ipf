import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('QuizService', () => {
  let service: QuizService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    quizSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    question: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    quizAnswer: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    userProfile: {
      update: jest.fn(),
    },
    pack: {
      findUnique: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    leaderboard: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    leaderboardEntry: {
      upsert: jest.fn(),
    },
    userMastery: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startSession', () => {
    it('should create a new quiz session', async () => {
      const mockUser = {
        id: 'user-1',
        auth0Id: 'auth0|123',
        profile: null,
        subscription: null,
      };
      const mockCategory = {
        id: 'cat-1',
        name: 'Bail commercial',
        slug: 'bail-commercial',
        isPremium: false,
      };
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        mode: 'PRACTICE',
        totalQuestions: 2,
      };
      const mockQuestions = [{ id: 'q1' }, { id: 'q2' }];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.quizAnswer.findMany.mockResolvedValue([]);
      mockPrismaService.question.findMany.mockResolvedValue(mockQuestions);
      mockPrismaService.quizSession.create.mockResolvedValue(mockSession);
      mockPrismaService.question.findUnique.mockResolvedValue({
        id: 'q1',
        text: 'Question 1',
        optionA: 'A',
        optionB: 'B',
        optionC: 'C',
        optionD: 'D',
      });

      const result = await service.startSession(
        'auth0|123',
        undefined,
        undefined,
        'PRACTICE',
      );

      expect(result.sessionId).toBe('session-1');
      expect(result.totalQuestions).toBe(2);
      expect(result.categoryName).toBe('Bail commercial');
      expect(result.question.questionNumber).toBe(1);
      expect(prisma.quizSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          categoryId: 'cat-1',
          mode: 'PRACTICE',
          totalQuestions: 2,
          status: 'IN_PROGRESS',
        }),
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.startSession('auth0|999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitAnswer', () => {
    const mockUser = { id: 'user-1' };

    it('should submit correct answer and award XP', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        status: 'IN_PROGRESS',
        livesRemaining: 5,
        comboCount: 0,
        currentQuestionIdx: 0,
        questionOrder: ['q1'],
        questionServedAt: new Date(),
      };
      const mockQuestion = {
        id: 'q1',
        correctAnswer: 'A',
        level: 1,
        pedagogicalContent: { keyMessage: 'Test message' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      mockPrismaService.quizAnswer.create.mockResolvedValue({});
      mockPrismaService.quizSession.update.mockResolvedValue({});

      const result = await service.submitAnswer(
        'auth0|123',
        'session-1',
        'q1',
        'A',
        2000,
      );

      expect(result.isCorrect).toBe(true);
      expect(result.xpEarned).toBeGreaterThan(0);
      expect(result.correctAnswer).toBe('A');
    });

    it('should submit wrong answer and deduct life', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        status: 'IN_PROGRESS',
        livesRemaining: 5,
        comboCount: 0,
        currentQuestionIdx: 0,
        questionOrder: ['q1'],
        questionServedAt: new Date(),
      };
      const mockQuestion = {
        id: 'q1',
        correctAnswer: 'A',
        level: 1,
        pedagogicalContent: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      mockPrismaService.quizAnswer.create.mockResolvedValue({});
      mockPrismaService.quizSession.update.mockResolvedValue({});

      const result = await service.submitAnswer(
        'auth0|123',
        'session-1',
        'q1',
        'B',
        3000,
      );

      expect(result.isCorrect).toBe(false);
      expect(result.livesRemaining).toBe(4);
    });

    it('should throw BadRequestException when session is completed', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        status: 'COMPLETED',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);

      await expect(
        service.submitAnswer('auth0|123', 'session-1', 'q1', 'A', 2000),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when session belongs to another user', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'other-user',
        status: 'IN_PROGRESS',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);

      await expect(
        service.submitAnswer('auth0|123', 'session-1', 'q1', 'A', 2000),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('completeSession', () => {
    it('should complete session and update user XP', async () => {
      const mockUser = { id: 'user-1' };
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        categoryId: null,
        correctAnswers: 8,
        totalQuestions: 10,
        xpEarned: 100,
        livesRemaining: 3,
        status: 'IN_PROGRESS',
        user: {
          profile: {
            id: 'profile-1',
            userId: 'user-1',
            xpTotal: 0,
            level: 1,
            streakDays: 0,
            bestStreak: 0,
            lastPlayedAt: null,
          },
        },
        answers: [
          ...Array.from({ length: 8 }, () => ({
            isCorrect: true,
            responseTimeMs: 2000,
          })),
          { isCorrect: false, responseTimeMs: 3000 },
          { isCorrect: false, responseTimeMs: 3000 },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.quizSession.update.mockResolvedValue(mockSession);
      mockPrismaService.userProfile.update.mockResolvedValue({});
      mockPrismaService.leaderboard.findFirst.mockResolvedValue({
        id: 'lb-1',
        type: 'GLOBAL',
        isActive: true,
      });
      mockPrismaService.leaderboardEntry.upsert.mockResolvedValue({});

      const result = await service.completeSession('session-1', 'auth0|123');

      expect(result.score).toBe(8);
      expect(result.accuracy).toBe(80);
      expect(prisma.userProfile.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when session belongs to another user', async () => {
      const mockUser = { id: 'user-1' };
      const mockSession = { id: 'session-1', userId: 'other-user' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);

      await expect(
        service.completeSession('session-1', 'auth0|123'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('calculateXP', () => {
    // Barème réel : XP_BASE niveau 1 = 10, multiplicateurs de vitesse :
    // ≤1s ×1.5, ≤2s ×1.3, ≤3s ×1.1, ≤4s ×1.0, ≤5.5s ×0.8, au-delà ×0.8

    it('should award max XP for very fast answers (<=1s)', () => {
      const xp = service['calculateXP'](800);
      expect(xp).toBe(15); // 10 × 1.5
    });

    it('should award high XP for fast answers (1-2s)', () => {
      const xp = service['calculateXP'](1500);
      expect(xp).toBe(13); // 10 × 1.3
    });

    it('should award medium XP for medium speed (2-3s)', () => {
      const xp = service['calculateXP'](3000);
      expect(xp).toBe(11); // 10 × 1.1
    });

    it('should award low XP for slower answers (4-5.5s)', () => {
      const xp = service['calculateXP'](4500);
      expect(xp).toBe(8); // 10 × 0.8
    });

    it('should award minimum XP for very slow answers (>5.5s)', () => {
      const xp = service['calculateXP'](6000);
      expect(xp).toBe(8); // 10 × 0.8
    });

    it('should scale XP with question level and combo bonus', () => {
      // niveau 3 (base 20), réponse ≤1s (×1.5), combo 5 (×1.5) → 45
      const xp = service['calculateXP'](900, 3, 5);
      expect(xp).toBe(45);
    });
  });
});
