import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { QuizMode, SessionStatus } from '@prisma/client';

// XP formula constants
const XP_BASE = { 1: 10, 2: 15, 3: 20 } as const;
const SPEED_MULTIPLIERS = [
  { maxMs: 1000, mult: 1.5 },
  { maxMs: 2000, mult: 1.3 },
  { maxMs: 3000, mult: 1.1 },
  { maxMs: 4000, mult: 1.0 },
  { maxMs: 5500, mult: 0.8 },
];
const XP_WRONG = 2;
const XP_SKIP = 0;
const TIMER_LIMIT_MS = 5000;
const TIMER_TOLERANCE_MS = 500;
const MAX_LIVES = 5;
const QUESTIONS_PER_SESSION = 10;

const LEVEL_THRESHOLDS = [0, 50, 100, 200, 350, 500, 700, 1000, 1500, 2000];

export interface StartSessionResult {
  sessionId: string;
  question: QuestionPayload;
  totalQuestions: number;
  lives: number;
  mode: QuizMode;
  categoryName: string;
}

export interface QuestionPayload {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  questionNumber: number;
  totalQuestions: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  xpEarned: number;
  comboCount: number;
  livesRemaining: number;
  isGameOver: boolean;
  isSessionComplete: boolean;
  feedback: {
    keyMessage: string | null;
    essentialPoints: string[] | null;
    example: string | null;
    trap: string | null;
  } | null;
  nextQuestion: QuestionPayload | null;
}

export interface CompletionResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  accuracy: number;
  averageTimeMs: number;
  bestCombo: number;
  livesRemaining: number;
  xpTotal: number;
  level: number;
  leveledUp: boolean;
  previousLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  streakDays: number;
  mascotRange: 'sad' | 'moderate' | 'good' | 'great' | 'perfect';
}

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  /**
   * Start a new quiz session.
   * Selects 10 random questions from the category, prioritizing unseen questions.
   * Server stores question order and timestamps each serve.
   */
  async startSession(
    auth0Id: string,
    categoryId?: string,
    mode: QuizMode = 'PRACTICE',
  ): Promise<StartSessionResult> {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    // Free users: force Bail Commercial, no category choice
    if (!categoryId) {
      const defaultCat = await this.prisma.category.findFirst({
        where: { slug: 'bail-commercial' },
      });
      if (defaultCat) categoryId = defaultCat.id;
    }

    // Validate category exists
    const category = categoryId
      ? await this.prisma.category.findUnique({ where: { id: categoryId } })
      : null;
    if (categoryId && !category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    // Select questions: prioritize unseen, randomize
    const questionIds = await this.selectQuestions(
      user.id,
      categoryId,
      QUESTIONS_PER_SESSION,
    );

    if (questionIds.length === 0) {
      throw new BadRequestException(
        'Aucune question disponible pour cette catégorie',
      );
    }

    const session = await this.prisma.quizSession.create({
      data: {
        userId: user.id,
        categoryId,
        mode,
        totalQuestions: questionIds.length,
        livesRemaining: MAX_LIVES,
        comboCount: 0,
        currentQuestionIdx: 0,
        questionOrder: questionIds,
        questionServedAt: new Date(),
        status: 'IN_PROGRESS',
      },
    });

    // Load first question
    const firstQuestion = await this.prisma.question.findUnique({
      where: { id: questionIds[0] },
    });

    return {
      sessionId: session.id,
      question: {
        id: firstQuestion!.id,
        text: firstQuestion!.text,
        optionA: firstQuestion!.optionA,
        optionB: firstQuestion!.optionB,
        optionC: firstQuestion!.optionC,
        optionD: firstQuestion!.optionD,
        questionNumber: 1,
        totalQuestions: questionIds.length,
      },
      totalQuestions: questionIds.length,
      lives: MAX_LIVES,
      mode,
      categoryName: category?.name ?? 'Bail commercial',
    };
  }

  /**
   * Submit an answer to the current question.
   * Validates server-side timer, updates lives/combo, returns feedback + next question.
   */
  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: string,
    responseTimeMs: number,
  ): Promise<AnswerResult> {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session non trouvée');
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session terminée');
    }
    if (session.livesRemaining <= 0) {
      throw new BadRequestException('Plus de vies restantes');
    }

    // Server-side timer validation
    const questionOrder = session.questionOrder as string[];
    const currentIdx = session.currentQuestionIdx;

    if (questionOrder[currentIdx] !== questionId) {
      throw new BadRequestException(
        'Question inattendue — désynchronisation détectée',
      );
    }

    const serverElapsedMs = session.questionServedAt
      ? Date.now() - new Date(session.questionServedAt).getTime()
      : 0;
    const isTimedOut =
      serverElapsedMs > TIMER_LIMIT_MS + TIMER_TOLERANCE_MS;

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { pedagogicalContent: true },
    });
    if (!question) throw new NotFoundException('Question non trouvée');

    // Determine correctness: timed out answers count as wrong
    const isSkip = userAnswer === 'SKIP';
    const isCorrect =
      !isTimedOut && !isSkip && question.correctAnswer === userAnswer;

    // XP calculation
    let xpEarned = 0;
    let newCombo = session.comboCount;
    let newLives = session.livesRemaining;

    if (isCorrect) {
      const level = question.level ?? 1;
      xpEarned = this.calculateXP(
        responseTimeMs,
        level,
        session.comboCount,
      );
      newCombo = session.comboCount + 1;
    } else {
      xpEarned = isSkip ? XP_SKIP : XP_WRONG;
      newCombo = 0;
      newLives = Math.max(0, session.livesRemaining - 1);
    }

    // Create answer record
    await this.prisma.quizAnswer.create({
      data: {
        sessionId,
        questionId,
        userAnswer: isTimedOut ? 'TIMEOUT' : userAnswer,
        isCorrect,
        responseTimeMs: isTimedOut ? serverElapsedMs : responseTimeMs,
        xpEarned,
      },
    });

    // Advance to next question
    const nextIdx = currentIdx + 1;
    const isGameOver = newLives <= 0;
    const isSessionComplete =
      nextIdx >= questionOrder.length || isGameOver;

    // Update session
    const newStatus: SessionStatus = isSessionComplete
      ? 'COMPLETED'
      : 'IN_PROGRESS';

    await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        correctAnswers: { increment: isCorrect ? 1 : 0 },
        xpEarned: { increment: xpEarned },
        comboCount: newCombo,
        livesRemaining: newLives,
        currentQuestionIdx: nextIdx,
        questionServedAt: isSessionComplete ? null : new Date(),
        status: newStatus,
        ...(isSessionComplete ? { completedAt: new Date() } : {}),
      },
    });

    // Build feedback from pedagogical content
    const feedback = question.pedagogicalContent
      ? {
          keyMessage: (question.pedagogicalContent as any).keyMessage ?? null,
          essentialPoints:
            (question.pedagogicalContent as any).essentialPoints ?? null,
          example: (question.pedagogicalContent as any).example ?? null,
          trap: (question.pedagogicalContent as any).trap ?? null,
        }
      : null;

    // Load next question if session continues
    let nextQuestion: QuestionPayload | null = null;
    if (!isSessionComplete && nextIdx < questionOrder.length) {
      const nextQ = await this.prisma.question.findUnique({
        where: { id: questionOrder[nextIdx] },
      });
      if (nextQ) {
        nextQuestion = {
          id: nextQ.id,
          text: nextQ.text,
          optionA: nextQ.optionA,
          optionB: nextQ.optionB,
          optionC: nextQ.optionC,
          optionD: nextQ.optionD,
          questionNumber: nextIdx + 1,
          totalQuestions: questionOrder.length,
        };
      }
    }

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      xpEarned,
      comboCount: newCombo,
      livesRemaining: newLives,
      isGameOver,
      isSessionComplete,
      feedback,
      nextQuestion,
    };
  }

  /**
   * Complete session and calculate final stats + XP/level updates.
   */
  async completeSession(sessionId: string): Promise<CompletionResult> {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: true,
        user: { include: { profile: true } },
      },
    });

    if (!session) throw new NotFoundException('Session non trouvée');

    // If still in progress, mark completed
    if (session.status === 'IN_PROGRESS') {
      await this.prisma.quizSession.update({
        where: { id: sessionId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }

    const answeredCount = session.answers.length;
    const accuracy =
      answeredCount > 0
        ? (session.correctAnswers / answeredCount) * 100
        : 0;
    const totalTimeMs = session.answers.reduce(
      (sum, a) => sum + a.responseTimeMs,
      0,
    );
    const averageTimeMs =
      answeredCount > 0 ? Math.round(totalTimeMs / answeredCount) : 0;
    const bestCombo = this.calculateBestCombo(session.answers);

    // Update user profile: XP, level, streak
    const profile = session.user.profile;
    const previousLevel = profile?.level ?? 1;
    const previousXp = profile?.xpTotal ?? 0;
    const newXpTotal = previousXp + session.xpEarned;
    const newLevel = this.calculateLevel(newXpTotal);
    const leveledUp = newLevel > previousLevel;

    // Streak calculation
    const streakDays = profile
      ? this.calculateStreak(profile.lastPlayedAt, profile.streakDays)
      : 1;

    if (profile) {
      await this.prisma.userProfile.update({
        where: { userId: session.userId },
        data: {
          xpTotal: newXpTotal,
          level: newLevel,
          streakDays,
          bestStreak: Math.max(profile.bestStreak, streakDays),
          lastPlayedAt: new Date(),
          ...(leveledUp ? { lastLevelUpAt: new Date() } : {}),
        },
      });
    }

    // Mascot range based on accuracy
    const mascotRange = this.getMascotRange(accuracy);

    return {
      sessionId: session.id,
      score: session.correctAnswers,
      totalQuestions: session.totalQuestions,
      xpEarned: session.xpEarned,
      accuracy: Math.round(accuracy * 10) / 10,
      averageTimeMs,
      bestCombo,
      livesRemaining: session.livesRemaining,
      xpTotal: newXpTotal,
      level: newLevel,
      leveledUp,
      previousLevel,
      xpForCurrentLevel: LEVEL_THRESHOLDS[newLevel - 1] ?? 0,
      xpForNextLevel: LEVEL_THRESHOLDS[newLevel] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1],
      streakDays,
      mascotRange,
    };
  }

  /**
   * Get session history for user.
   */
  async getSessionHistory(auth0Id: string, limit: number = 10) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    return this.prisma.quizSession.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: limit,
      include: {
        answers: true,
        category: { select: { name: true, slug: true } },
      },
    });
  }

  /**
   * Review answers for a completed session.
   */
  async reviewSession(sessionId: string, auth0Id: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: {
              include: { pedagogicalContent: true },
            },
          },
          orderBy: { answeredAt: 'asc' },
        },
        category: { select: { name: true, slug: true } },
      },
    });

    if (!session) throw new NotFoundException('Session non trouvée');
    if (session.userId !== user.id) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return {
      sessionId: session.id,
      categoryName: session.category?.name ?? null,
      score: session.correctAnswers,
      totalQuestions: session.totalQuestions,
      answers: session.answers.map((a, idx) => ({
        questionNumber: idx + 1,
        questionText: a.question.text,
        optionA: a.question.optionA,
        optionB: a.question.optionB,
        optionC: a.question.optionC,
        optionD: a.question.optionD,
        userAnswer: a.userAnswer,
        correctAnswer: a.question.correctAnswer,
        isCorrect: a.isCorrect,
        responseTimeMs: a.responseTimeMs,
        xpEarned: a.xpEarned,
        feedback: a.question.pedagogicalContent
          ? {
              keyMessage:
                (a.question.pedagogicalContent as any).keyMessage ?? null,
              essentialPoints:
                (a.question.pedagogicalContent as any).essentialPoints ?? null,
              example:
                (a.question.pedagogicalContent as any).example ?? null,
              trap: (a.question.pedagogicalContent as any).trap ?? null,
            }
          : null,
      })),
    };
  }

  /**
   * Get the next question for an in-progress session (reconnection support).
   */
  async getCurrentQuestion(sessionId: string, auth0Id: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: { category: { select: { name: true } } },
    });

    if (!session) throw new NotFoundException('Session non trouvée');
    if (session.userId !== user.id) {
      throw new ForbiddenException('Accès non autorisé');
    }
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session terminée');
    }

    const questionOrder = session.questionOrder as string[];
    const currentIdx = session.currentQuestionIdx;

    if (currentIdx >= questionOrder.length) {
      throw new BadRequestException('Toutes les questions ont été répondues');
    }

    const question = await this.prisma.question.findUnique({
      where: { id: questionOrder[currentIdx] },
    });

    if (!question) throw new NotFoundException('Question non trouvée');

    // Refresh questionServedAt for timer
    await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: { questionServedAt: new Date() },
    });

    return {
      sessionId: session.id,
      lives: session.livesRemaining,
      comboCount: session.comboCount,
      categoryName: session.category?.name ?? null,
      question: {
        id: question.id,
        text: question.text,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        questionNumber: currentIdx + 1,
        totalQuestions: questionOrder.length,
      },
    };
  }

  // ── Private helpers ──

  /**
   * Select questions for a session:
   * 1. Prioritize questions the user hasn't seen
   * 2. Fill with random questions from the category
   * 3. Shuffle the result
   */
  private async selectQuestions(
    userId: string,
    categoryId: string | undefined,
    count: number,
  ): Promise<string[]> {
    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;

    // Get IDs of questions already answered by user
    const answeredQuestionIds = await this.prisma.quizAnswer.findMany({
      where: {
        session: { userId },
        question: where,
      },
      select: { questionId: true },
      distinct: ['questionId'],
    });
    const seenIds = new Set(answeredQuestionIds.map((a) => a.questionId));

    // Fetch all active questions for the category
    const allQuestions = await this.prisma.question.findMany({
      where,
      select: { id: true },
    });

    // Separate unseen from seen
    const unseen = allQuestions.filter((q) => !seenIds.has(q.id));
    const seen = allQuestions.filter((q) => seenIds.has(q.id));

    // Shuffle both pools
    this.shuffle(unseen);
    this.shuffle(seen);

    // Take unseen first, then fill with seen
    const selected = [
      ...unseen.slice(0, count),
      ...seen.slice(0, Math.max(0, count - unseen.length)),
    ].slice(0, count);

    // Final shuffle
    this.shuffle(selected);

    return selected.map((q) => q.id);
  }

  /**
   * XP formula: baseXP × speedMultiplier × comboBonus
   */
  calculateXP(
    responseTimeMs: number,
    level: number = 1,
    comboCount: number = 0,
  ): number {
    const baseXP =
      XP_BASE[level as keyof typeof XP_BASE] ?? XP_BASE[1];

    let speedMult = 0.8;
    for (const { maxMs, mult } of SPEED_MULTIPLIERS) {
      if (responseTimeMs <= maxMs) {
        speedMult = mult;
        break;
      }
    }

    const comboBonus = 1.0 + Math.min(comboCount, 5) * 0.1;

    return Math.round(baseXP * speedMult * comboBonus);
  }

  private calculateLevel(xpTotal: number): number {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xpTotal >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return Math.min(level, LEVEL_THRESHOLDS.length);
  }

  private calculateStreak(
    lastPlayedAt: Date | null,
    currentStreak: number,
  ): number {
    if (!lastPlayedAt) return 1;

    const now = new Date();
    const lastPlayed = new Date(lastPlayedAt);

    // Reset to same day start (UTC)
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const lastDay = new Date(
      lastPlayed.getFullYear(),
      lastPlayed.getMonth(),
      lastPlayed.getDate(),
    );

    const diffDays = Math.floor(
      (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return currentStreak; // Same day
    if (diffDays === 1) return currentStreak + 1; // Consecutive day
    return 1; // Streak broken
  }

  private calculateBestCombo(
    answers: Array<{ isCorrect: boolean }>,
  ): number {
    let best = 0;
    let current = 0;
    for (const a of answers) {
      if (a.isCorrect) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    return best;
  }

  private getMascotRange(
    accuracy: number,
  ): 'sad' | 'moderate' | 'good' | 'great' | 'perfect' {
    if (accuracy >= 90) return 'perfect';
    if (accuracy >= 75) return 'great';
    if (accuracy >= 50) return 'good';
    if (accuracy >= 25) return 'moderate';
    return 'sad';
  }

  private shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
