import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { QuizMode, SessionStatus } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async startSession(auth0Id: string, categoryId?: string, mode: QuizMode = 'PRACTICE') {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const session = await this.prisma.quizSession.create({
      data: {
        userId: user.id,
        categoryId,
        mode,
        totalQuestions: 10,
        status: 'IN_PROGRESS',
      },
    });

    const questions = await this.getQuestionsForSession(categoryId, 10);

    return { session, questions };
  }

  async getQuestionsForSession(categoryId?: string, count: number = 10) {
    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;

    return this.prisma.question.findMany({
      where,
      take: count,
      orderBy: { createdAt: 'desc' },
      include: { category: true, theme: true },
    });
  }

  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: string,
    responseTimeMs: number,
  ) {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session non trouvée');
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session terminée');
    }

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { pedagogicalContent: true },
    });

    if (!question) throw new NotFoundException('Question non trouvée');

    const isCorrect = question.correctAnswer === userAnswer;
    const xpEarned = isCorrect ? this.calculateXP(responseTimeMs) : 0;

    const answer = await this.prisma.quizAnswer.create({
      data: {
        sessionId,
        questionId,
        userAnswer,
        isCorrect,
        responseTimeMs,
        xpEarned,
      },
    });

    // Mettre à jour la session
    await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        correctAnswers: { increment: isCorrect ? 1 : 0 },
        xpEarned: { increment: xpEarned },
      },
    });

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      xpEarned,
      pedagogicalContent: question.pedagogicalContent,
    };
  }

  async completeSession(sessionId: string) {
    const session = await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        answers: true,
        user: { include: { profile: true } },
      },
    });

    // Mettre à jour le profil utilisateur
    if (session.user.profile) {
      await this.prisma.userProfile.update({
        where: { userId: session.userId },
        data: {
          xpTotal: { increment: session.xpEarned },
          lastPlayedAt: new Date(),
        },
      });
    }

    return {
      sessionId: session.id,
      score: session.correctAnswers,
      totalQuestions: session.totalQuestions,
      xpEarned: session.xpEarned,
      accuracy: (session.correctAnswers / session.totalQuestions) * 100,
    };
  }

  async getSessionHistory(auth0Id: string, limit: number = 10) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    return this.prisma.quizSession.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: limit,
      include: { answers: true },
    });
  }

  private calculateXP(responseTimeMs: number): number {
    if (responseTimeMs < 2000) return 15;
    if (responseTimeMs < 3500) return 12;
    if (responseTimeMs < 5000) return 10;
    return 8;
  }
}
