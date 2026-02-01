import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  StartQuizSessionDto,
  SubmitAnswerDto,
} from './dto/quiz-response.dto';
import { SessionStatus, QuizMode } from '@prisma/client';

@Injectable()
export class QuizService {
  private readonly QUESTION_TIME_LIMIT_MS = 5000; // 5 secondes

  constructor(private prisma: PrismaService) {}

  /**
   * Démarrer une nouvelle session de quiz
   */
  async startQuizSession(userId: string, dto: StartQuizSessionDto) {
    // Valider que le type de bail existe
    const typeBail = await this.prisma.typeBail.findUnique({
      where: { id: dto.typeBailId },
    });

    if (!typeBail) {
      throw new BadRequestException('Type de bail non trouvé');
    }

    // Valider la catégorie si fournie
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        select: { id: true, typeBailId: true },
      });

      if (!category) {
        throw new BadRequestException('Catégorie non trouvée');
      }

      if (category.typeBailId !== dto.typeBailId) {
        throw new BadRequestException(
          'La catégorie ne correspond pas au type de bail sélectionné',
        );
      }
    }

    // Construire le filtre des questions
    const questionFilter: any = {
      isActive: true,
    };

    questionFilter.typeBailId = dto.typeBailId;
    if (dto.categoryId) questionFilter.categoryId = dto.categoryId;

    if (dto.packId) {
      questionFilter.packId = dto.packId;
    }

    if (dto.difficulty) {
      questionFilter.level = dto.difficulty;
    }

    // Récupérer 10 questions disponibles
    const questions = await this.prisma.question.findMany({
      where: questionFilter,
      select: {
        id: true,
        text: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        level: true,
        categoryId: true,
        typeBailId: true,
        packId: true,
        videoId: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (questions.length === 0) {
      throw new BadRequestException(
        'Aucune question trouvée pour cette sélection',
      );
    }

    // Vérifier/créer l'utilisateur de test si nécessaire
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: userId,
          auth0Id: `auth0_${userId}`,
          email: `${userId}@test.local`,
          role: 'USER',
        },
      });
    }

    // Créer la session
    const session = await this.prisma.quizSession.create({
      data: {
        userId: user.id,
        categoryId: dto.categoryId || null,
        typeBailId: dto.typeBailId,
        mode: (dto.mode || 'PRACTICE') as QuizMode,
        status: SessionStatus.IN_PROGRESS,
        totalQuestions: questions.length,
        score: 0,
        correctAnswers: 0,
        xpEarned: 0,
      },
    });

    return {
      sessionId: session.id,
      totalQuestions: questions.length,
      questions: questions.map((q, idx) => ({
        index: idx + 1,
        id: q.id,
        text: q.text,
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        level: q.level,
      })),
      startedAt: session.startedAt,
      status: 'ready',
    };
  }

  /**
   * Récupérer la question actuelle d'une session
   */
  async getCurrentQuestion(sessionId: string) {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          select: { id: true, questionId: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session non trouvée');
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new BadRequestException('Cette session est terminée');
    }

    // L'index de la question actuelle = nombre de réponses déjà soumises
    const currentQuestionIndex = session.answers.length;

    if (currentQuestionIndex >= session.totalQuestions) {
      throw new BadRequestException('Toutes les questions sont répondues');
    }

    // Récupérer les questions de la session (elles doivent être stockées quelque part)
    // Pour l'instant, on va les récupérer en fonction de la catégorie
    const questionWhere: any = { isActive: true };
    if (session.categoryId) {
      questionWhere.categoryId = session.categoryId;
    } else if (session.typeBailId) {
      questionWhere.typeBailId = session.typeBailId;
    }

    const allQuestions = await this.prisma.question.findMany({
      where: questionWhere,
      select: {
        id: true,
        text: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        level: true,
      },
      orderBy: { createdAt: 'desc' },
      take: session.totalQuestions,
    });

    const currentQuestion = allQuestions[currentQuestionIndex];

    if (!currentQuestion) {
      throw new NotFoundException('Question non trouvée');
    }

    return {
      sessionId,
      questionIndex: currentQuestionIndex + 1,
      totalQuestions: session.totalQuestions,
      question: {
        id: currentQuestion.id,
        text: currentQuestion.text,
        options: [
          currentQuestion.optionA,
          currentQuestion.optionB,
          currentQuestion.optionC,
          currentQuestion.optionD,
        ],
        level: currentQuestion.level,
      },
      timeLimit: this.QUESTION_TIME_LIMIT_MS,
    };
  }

  /**
   * Soumettre une réponse à une question
   */
  async submitAnswer(sessionId: string, dto: SubmitAnswerDto) {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        answers: { select: { id: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Session non trouvée');
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new BadRequestException('Cette session est terminée');
    }

    // Valider que le temps de réponse est < 5 secondes
    const responseTime = dto.responseTimeMs || 0;
    if (responseTime > this.QUESTION_TIME_LIMIT_MS) {
      throw new BadRequestException(
        `Réponse trop lente (${responseTime}ms > ${this.QUESTION_TIME_LIMIT_MS}ms)`,
      );
    }

    // Récupérer la question
    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
      include: {
        pedagogicalContent: true,
        video: true,
      },
    });

    if (!question) {
      throw new NotFoundException('Question non trouvée');
    }

    // Vérifier si la réponse est correcte
    const isCorrect = dto.selectedOption === question.correctAnswer;
    const xpEarned = this.calculateXP(isCorrect, responseTime);

    // Enregistrer la réponse
    const quizAnswer = await this.prisma.quizAnswer.create({
      data: {
        sessionId,
        questionId: dto.questionId,
        userAnswer: dto.selectedOption,
        isCorrect,
        responseTimeMs: responseTime,
        xpEarned,
      },
    });

    // Mettre à jour la session
    const updatedSession = await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
        score: session.score + (isCorrect ? 1 : 0),
        xpEarned: session.xpEarned + xpEarned,
      },
    });

    // Mettre à jour le profil de l'utilisateur (XP total)
    // Utiliser upsert pour créer le profil s'il n'existe pas
    await this.prisma.userProfile.upsert({
      where: { userId: session.userId },
      update: {
        xpTotal: {
          increment: xpEarned,
        },
      },
      create: {
        userId: session.userId,
        xpTotal: xpEarned,
        level: 1,
        displayName: `User ${session.userId.slice(0, 8)}`,
      },
    });

    return {
      questionId: question.id,
      userAnswer: dto.selectedOption,
      correctAnswer: question.correctAnswer,
      isCorrect,
      xpEarned,
      explanation: question.pedagogicalContent
        ? {
            subject: question.pedagogicalContent.subject,
            keyMessage: question.pedagogicalContent.keyMessage || undefined,
            essentialPoints: question.pedagogicalContent.essentialPoints || [],
            examples: question.pedagogicalContent.examples || [],
            trapToAvoid:
              question.pedagogicalContent.trapToAvoid || undefined,
            practicalAdvice:
              question.pedagogicalContent.practicalAdvice || undefined,
            synthesis:
              question.pedagogicalContent.synthesis || undefined,
          }
        : undefined,
      videoUrl: question.video?.url,
      sessionStats: {
        correct: updatedSession.correctAnswers,
        total: updatedSession.totalQuestions,
        percentage: Math.round(
          (updatedSession.correctAnswers / updatedSession.totalQuestions) * 100,
        ),
        xpEarned: updatedSession.xpEarned,
      },
      feedbackMessage: isCorrect
        ? `Bravo ! ${xpEarned} XP gagnés !`
        : `Incorrect. Regarde la vidéo pour en savoir plus.`,
    };
  }

  /**
   * Récupérer l'explication d'une question
   */
  async getQuestionExplanation(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        pedagogicalContent: true,
        video: true,
      },
    });

    if (!question) {
      throw new NotFoundException('Question non trouvée');
    }

    return {
      questionId: question.id,
      questionText: question.text,
      correctAnswer: question.correctAnswer,
      video: question.video
        ? {
            id: question.video.id,
            title: question.video.title,
            url: question.video.url,
            durationSeconds: question.video.durationSeconds,
            thumbnailUrl: question.video.thumbnailUrl,
          }
        : null,
      pedagogicalContent: question.pedagogicalContent
        ? {
            subject: question.pedagogicalContent.subject,
            keyMessage: question.pedagogicalContent.keyMessage,
            essentialPoints: question.pedagogicalContent.essentialPoints || [],
            examples: question.pedagogicalContent.examples || [],
            trapToAvoid: question.pedagogicalContent.trapToAvoid,
            practicalAdvice: question.pedagogicalContent.practicalAdvice,
            synthesis: question.pedagogicalContent.synthesis,
          }
        : null,
    };
  }

  /**
   * Terminer une session
   */
  async completeSession(sessionId: string) {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session non trouvée');
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new BadRequestException('Session déjà terminée');
    }

    // Calculer les statistiques finales
    const durationMs = Date.now() - session.startedAt.getTime();
    const percentage = Math.round(
      (session.correctAnswers / session.totalQuestions) * 100,
    );

    // Mettre à jour la session
    const completedSession = await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        completedAt: new Date(),
        durationMs,
      },
    });

    // Générer le message de feedback personnalisé
    let feedbackMessage = '';
    if (percentage === 100) {
      feedbackMessage = '🎉 Parfait ! Tu as réussi 100% !';
    } else if (percentage >= 80) {
      feedbackMessage = '👏 Excellent ! Tu maîtrises ce sujet !';
    } else if (percentage >= 60) {
      feedbackMessage = '😊 Bon travail ! Continue tes efforts !';
    } else {
      feedbackMessage =
        '💪 À revoir. Regarde les vidéos et réessaye demain !';
    }

    return {
      sessionId: completedSession.id,
      score: {
        correct: completedSession.correctAnswers,
        total: completedSession.totalQuestions,
        percentage,
      },
      xpEarned: completedSession.xpEarned,
      durationMs: completedSession.durationMs,
      completedAt: completedSession.completedAt,
      feedbackMessage,
    };
  }

  /**
   * Récupérer l'historique des réponses (paginated)
   */
  async getUserQuizHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [answers, total] = await Promise.all([
      this.prisma.quizAnswer.findMany({
        where: {
          session: {
            userId,
          },
        },
        include: {
          question: {
            select: {
              id: true,
              text: true,
              categoryId: true,
              typeBailId: true,
              level: true,
              correctAnswer: true,
            },
          },
          session: {
            select: {
              id: true,
              startedAt: true,
              completedAt: true,
              status: true,
            },
          },
        },
        orderBy: { answeredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.quizAnswer.count({
        where: {
          session: {
            userId,
          },
        },
      }),
    ]);

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: answers.map((answer) => ({
        id: answer.id,
        sessionId: answer.sessionId,
        questionId: answer.questionId,
        questionText: answer.question.text,
        userAnswer: answer.userAnswer,
        correctAnswer: answer.question.correctAnswer,
        isCorrect: answer.isCorrect,
        responseTimeMs: answer.responseTimeMs,
        xpEarned: answer.xpEarned,
        level: answer.question.level,
        sessionStartedAt: answer.session.startedAt,
        sessionCompletedAt: answer.session.completedAt,
      })),
    };
  }

  /**
   * Récupérer les statistiques d'une session
   */
  async getSessionStats(sessionId: string) {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session non trouvée');
    }

    const percentage = Math.round(
      (session.correctAnswers / session.totalQuestions) * 100,
    );

    return {
      sessionId: session.id,
      status: session.status,
      score: {
        correct: session.correctAnswers,
        total: session.totalQuestions,
        percentage,
      },
      xpEarned: session.xpEarned,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      durationMs: session.durationMs,
      answers: session.answers.map((a) => ({
        questionId: a.question.id,
        isCorrect: a.isCorrect,
        responseTimeMs: a.responseTimeMs,
        xpEarned: a.xpEarned,
        level: a.question.level,
      })),
    };
  }

  /**
   * Calculer les points XP (avec bonus de temps)
   * Base: 10 XP, bonus: ≤2s: +50%, ≤3s: +30%, ≤5s: +10%
   */
  private calculateXP(isCorrect: boolean, responseTimeMs: number): number {
    if (!isCorrect) {
      return 0; // 0 XP si incorrect
    }

    let baseXP = 10;
    let bonus = 1;

    if (responseTimeMs <= 2000) {
      bonus = 1.5; // +50% pour réponse très rapide
    } else if (responseTimeMs <= 3000) {
      bonus = 1.3; // +30% pour réponse rapide
    } else if (responseTimeMs <= 5000) {
      bonus = 1.1; // +10% pour réponse dans le délai
    }

    return Math.round(baseXP * bonus);
  }
}
