import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Démarrer une session', description: 'Démarre une nouvelle session de quiz avec les paramètres spécifiés' })
  @ApiBody({ schema: { type: 'object', properties: { categoryId: { type: 'string', description: 'ID de la catégorie (optionnel)' }, mode: { type: 'string', enum: ['CLASSIC', 'SPEED', 'SURVIVAL'], description: 'Mode de jeu' } } } })
  @ApiResponse({ status: 201, description: 'Session de quiz créée avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  async startSession(
    @CurrentUser('userId') userId: string,
    @Body() body: { categoryId?: string; mode?: QuizMode },
  ) {
    return this.quizService.startSession(userId, body.categoryId, body.mode);
  }

  @Post('answer')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({ summary: 'Soumettre une réponse', description: 'Envoie la réponse à une question du quiz en cours' })
  @ApiBody({ schema: { type: 'object', required: ['sessionId', 'questionId', 'answer', 'responseTimeMs'], properties: { sessionId: { type: 'string' }, questionId: { type: 'string' }, answer: { type: 'string', example: 'A' }, responseTimeMs: { type: 'number', example: 2500 } } } })
  @ApiResponse({ status: 201, description: 'Réponse enregistrée - Retourne si la réponse est correcte' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Session ou question non trouvée' })
  async submitAnswer(
    @Body() body: {
      sessionId: string;
      questionId: string;
      answer: string;
      responseTimeMs: number;
    },
  ) {
    return this.quizService.submitAnswer(
      body.sessionId,
      body.questionId,
      body.answer,
      body.responseTimeMs,
    );
  }

  @Post(':sessionId/complete')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({ summary: 'Terminer une session', description: 'Termine la session de quiz et calcule le score final' })
  @ApiParam({ name: 'sessionId', description: 'ID de la session de quiz' })
  @ApiResponse({ status: 201, description: 'Session terminée - Retourne le score final et les statistiques' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  async completeSession(@Param('sessionId') sessionId: string) {
    return this.quizService.completeSession(sessionId);
  }

  @Get('history')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({ summary: 'Historique des parties', description: 'Récupère l\'historique des sessions de quiz de l\'utilisateur' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de résultats (défaut: 10)' })
  @ApiResponse({ status: 200, description: 'Liste des sessions retournée' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getHistory(
    @CurrentUser('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.quizService.getSessionHistory(userId, limit ? parseInt(limit) : 10);
  }
}
