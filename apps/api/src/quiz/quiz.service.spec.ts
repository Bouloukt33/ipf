import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('QuizService', () => {
  let service: QuizService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    typeBail: {
      findUnique: jest.fn(),
    },
    category: {
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
    },
    userProfile: {
      upsert: jest.fn(),
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

  describe('startQuizSession', () => {
    it('should create a new quiz session', async () => {
      const mockUser = { id: 'user-1', auth0Id: 'auth0|123' };
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        mode: 'PRACTICE',
        totalQuestions: 10,
        startedAt: new Date('2026-01-31T10:00:00Z'),
      };
      const mockQuestions = [
        { id: 'q1', text: 'Question 1', optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D', level: 1 },
        { id: 'q2', text: 'Question 2', optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D', level: 2 },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.typeBail.findUnique.mockResolvedValue({ id: 'typebail-1' });
      mockPrismaService.category.findUnique.mockResolvedValue({ id: 'cat-1' });
      mockPrismaService.quizSession.create.mockResolvedValue(mockSession);
      mockPrismaService.question.findMany.mockResolvedValue(mockQuestions);

      const result = await service.startQuizSession('auth0|123', {
        typeBailId: 'typebail-1',
        categoryId: 'cat-1',
        mode: 'PRACTICE',
      });

      expect(result).toEqual(
        expect.objectContaining({
          sessionId: mockSession.id,
          totalQuestions: mockQuestions.length,
          status: 'ready',
        }),
      );
      expect(prisma.quizSession.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          categoryId: 'cat-1',
          typeBailId: 'typebail-1',
          mode: 'PRACTICE',
          status: 'IN_PROGRESS',
          totalQuestions: mockQuestions.length,
          score: 0,
          correctAnswers: 0,
          xpEarned: 0,
        },
      });
    });

    it('should throw BadRequestException when type de bail not found', async () => {
      mockPrismaService.typeBail.findUnique.mockResolvedValue(null);

      await expect(
        service.startQuizSession('auth0|999', { typeBailId: 'typebail-x' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitAnswer', () => {
    it('should submit correct answer and award XP', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        status: 'IN_PROGRESS',
        correctAnswers: 0,
        score: 0,
        xpEarned: 0,
        totalQuestions: 10,
      };
      const mockQuestion = {
        id: 'q1',
        correctAnswer: 'A',
        pedagogicalContent: { keyMessage: 'Test message' },
      };

      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      mockPrismaService.quizAnswer.create.mockResolvedValue({});
      mockPrismaService.quizSession.update.mockResolvedValue({
        ...mockSession,
        correctAnswers: 1,
        score: 1,
        xpEarned: 10,
      });
      mockPrismaService.userProfile.upsert.mockResolvedValue({});

      const result = await service.submitAnswer('session-1', {
        questionId: 'q1',
        selectedOption: 'A',
        responseTimeMs: 2000,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.xpEarned).toBeGreaterThan(0);
      expect(result.correctAnswer).toBe('A');
    });

    it('should submit wrong answer and award no XP', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        status: 'IN_PROGRESS',
        correctAnswers: 0,
        score: 0,
        xpEarned: 0,
        totalQuestions: 10,
      };
      const mockQuestion = {
        id: 'q1',
        correctAnswer: 'A',
        pedagogicalContent: null,
      };

      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.question.findUnique.mockResolvedValue(mockQuestion);
      mockPrismaService.quizAnswer.create.mockResolvedValue({});
      mockPrismaService.quizSession.update.mockResolvedValue({
        ...mockSession,
        correctAnswers: 0,
        score: 0,
        xpEarned: 0,
      });
      mockPrismaService.userProfile.upsert.mockResolvedValue({});

      const result = await service.submitAnswer('session-1', {
        questionId: 'q1',
        selectedOption: 'B',
        responseTimeMs: 3000,
      });

      expect(result.isCorrect).toBe(false);
      expect(result.xpEarned).toBe(0);
    });

    it('should throw BadRequestException when session is completed', async () => {
      const mockSession = { id: 'session-1', status: 'COMPLETED' };

      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);

      await expect(
        service.submitAnswer('session-1', {
          questionId: 'q1',
          selectedOption: 'A',
          responseTimeMs: 2000,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeSession', () => {
    it('should complete session and update user XP', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        correctAnswers: 8,
        totalQuestions: 10,
        xpEarned: 100,
        user: {
          profile: { id: 'profile-1', userId: 'user-1' },
        },
        answers: [],
      };

      mockPrismaService.quizSession.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.quizSession.update.mockResolvedValue(mockSession);

      const result = await service.completeSession('session-1');

      expect(result.score.correct).toBe(8);
      expect(result.score.total).toBe(10);
    });
  });

  describe('calculateXP', () => {
    it('should award max XP for very fast answers (<2s)', () => {
      const xp = service['calculateXP'](true, 1500);
      expect(xp).toBe(15);
    });

    it('should award medium XP for medium speed (2-3.5s)', () => {
      const xp = service['calculateXP'](true, 3000);
      expect(xp).toBe(12);
    });

    it('should award low XP for slower answers (3.5-5s)', () => {
      const xp = service['calculateXP'](true, 4500);
      expect(xp).toBe(10);
    });

    it('should award minimum XP for very slow answers (>5s)', () => {
      const xp = service['calculateXP'](true, 6000);
      expect(xp).toBe(8);
    });

    it('should award 0 XP for incorrect answers', () => {
      const xp = service['calculateXP'](false, 1500);
      expect(xp).toBe(0);
    });
  });
});
