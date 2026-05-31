import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { AuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { QuizMode } from '@prisma/client';

@ApiTags('Quiz')
@ApiBearerAuth()
@Controller('quiz')
@UseGuards(AuthGuard)
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post('start')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({
    summary: 'Démarrer une session',
    description:
      'Crée une session de questions à partir d\'une catégorie ou d\'un pack.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: {
          type: 'string',
          description: 'ID catégorie',
        },
        packId: {
          type: 'string',
          description: 'ID d\'un pack spécifique',
        },
        mode: {
          type: 'string',
          enum: ['PRACTICE', 'DAILY'],
          description: 'Mode de jeu',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Session créée avec première question' })
  async startSession(
    @CurrentUser('userId') userId: string,
    @Body() body: { categoryId?: string; packId?: string; mode?: QuizMode },
  ) {
    return this.quizService.startSession(userId, body.categoryId, body.packId, body.mode);
  }

  @Post('answer')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({
    summary: 'Soumettre une réponse',
    description:
      'Valide la réponse, met à jour vies/combo/XP, retourne feedback + question suivante.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['sessionId', 'questionId', 'answer', 'responseTimeMs'],
      properties: {
        sessionId: { type: 'string' },
        questionId: { type: 'string' },
        answer: { type: 'string', example: 'A', description: 'A/B/C/D ou SKIP' },
        responseTimeMs: { type: 'number', example: 2500 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Réponse validée avec feedback et prochaine question' })
  async submitAnswer(
    @CurrentUser('userId') userId: string,
    @Body()
    body: {
      sessionId: string;
      questionId: string;
      answer: string;
      responseTimeMs: number;
    },
  ) {
    return this.quizService.submitAnswer(
      userId,
      body.sessionId,
      body.questionId,
      body.answer,
      body.responseTimeMs,
    );
  }

  @Post(':sessionId/ready')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({
    summary: 'Signal question prête',
    description:
      'Le frontend signale que la question est affichée. Démarre le timer serveur.',
  })
  @ApiParam({ name: 'sessionId', description: 'ID de la session' })
  @ApiResponse({ status: 201, description: 'Timer démarré' })
  async questionReady(
    @Param('sessionId') sessionId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.quizService.markQuestionReady(sessionId, userId);
  }

  @Post(':sessionId/complete')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({
    summary: 'Terminer une session',
    description:
      'Calcule le score final, XP, level-up, streak et retourne les stats complètes.',
  })
  @ApiParam({ name: 'sessionId', description: 'ID de la session' })
  @ApiResponse({ status: 201, description: 'Stats finales avec XP, level, mascot range' })
  async completeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.quizService.completeSession(sessionId, userId);
  }

  @Get(':sessionId/review')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({
    summary: 'Revoir les réponses',
    description:
      "Retourne toutes les questions/réponses d'une session terminée avec feedback pédagogique.",
  })
  @ApiParam({ name: 'sessionId', description: 'ID de la session' })
  @ApiResponse({ status: 200, description: 'Détail des réponses avec feedback' })
  async reviewSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.quizService.reviewSession(sessionId, userId);
  }

  @Get(':sessionId/current')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({
    summary: 'Question courante',
    description:
      'Retourne la question courante (support reconnexion mid-session).',
  })
  @ApiParam({ name: 'sessionId', description: 'ID de la session' })
  @ApiResponse({ status: 200, description: 'Question courante avec état de la session' })
  async getCurrentQuestion(
    @Param('sessionId') sessionId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.quizService.getCurrentQuestion(sessionId, userId);
  }

  @Get('history')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({
    summary: 'Historique des parties',
    description: "Récupère l'historique des sessions de quiz de l'utilisateur",
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre de résultats (défaut: 10)',
  })
  @ApiResponse({ status: 200, description: 'Liste des sessions retournée' })
  async getHistory(
    @CurrentUser('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.quizService.getSessionHistory(
      userId,
      limit ? parseInt(limit) : 10,
    );
  }
}
