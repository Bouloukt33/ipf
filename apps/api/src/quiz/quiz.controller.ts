import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { 
  StartQuizSessionDto, 
  SubmitAnswerDto,
  QuizSessionResponseDto,
  CurrentQuestionResponseDto,
  AnswerFeedbackDto,
  CompleteSessionDto,
  QuizSessionStatsDto,
} from './dto/quiz-response.dto';

@ApiTags('🎮 Quiz')
@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  /**
   * POST /api/quiz/start-session
   * Démarre une nouvelle session de quiz
   */
  @Post('start-session')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '🎮 Démarrer une session',
    description:
      'Crée une nouvelle session de quiz et pré-charge les questions selon les critères spécifiés (type de bail, catégorie, mode, difficulté)',
  })
  @ApiResponse({
    status: 201,
    description: 'Session créée avec succès avec les questions pré-chargées',
    type: QuizSessionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Paramètres invalides (categoryId manquant ou invalide)',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé - Token JWT invalide ou manquant',
  })
  async startQuizSession(
    @CurrentUser() user: any,
    @Body() dto: StartQuizSessionDto,
  ) {
    if (!user?.userId) {
      throw new UnauthorizedException('Non autorisé');
    }
    const userId = user.userId;
    return this.quizService.startQuizSession(userId, dto);
  }

  /**
   * GET /api/quiz/sessions/{sessionId}/current-question
   * Récupère la question actuelle
   */
  @Get('sessions/:sessionId/current-question')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '📝 Récupérer la question actuelle',
    description: 'Retourne la question actuelle avec les 4 options de réponse et les métadonnées (temps, niveau, image)',
  })
  @ApiResponse({
    status: 200,
    description: 'Question retournée avec succès',
    type: CurrentQuestionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session non trouvée ou aucune question disponible',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async getCurrentQuestion(@Param('sessionId') sessionId: string) {
    return this.quizService.getCurrentQuestion(sessionId);
  }

  /**
   * POST /api/quiz/sessions/{sessionId}/answer
   * Soumet une réponse
   */
  @Post('sessions/:sessionId/answer')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '✅ Soumettre une réponse',
    description:
      'Enregistre la réponse de l\'utilisateur et retourne le feedback immédiat (correct/incorrect, XP gagnés, explication, vidéo). Le XP est calculé avec bonus de vitesse : ≤2s: +50%, ≤3s: +30%, ≤5s: +10%',
  })
  @ApiResponse({
    status: 200,
    description: 'Réponse enregistrée avec succès - Feedback retourné',
    type: AnswerFeedbackDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides (questionId ou selectedOption manquant)',
  })
  @ApiResponse({
    status: 404,
    description: 'Session ou question non trouvée',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async submitAnswer(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.quizService.submitAnswer(sessionId, dto);
  }

  /**
   * GET /api/quiz/questions/{questionId}/explanation
   * Récupère l'explication vidéo d'une question
   */
  @Get('questions/:questionId/explanation')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '📚 Récupérer l\'explication',
    description:
      'Récupère la vidéo explicative et les notes pédagogiques détaillées (titre, résumé, points clés, exemples, pièges à éviter)',
  })
  @ApiResponse({
    status: 200,
    description: 'Explication retournée avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Question non trouvée',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async getQuestionExplanation(
    @Param('questionId') questionId: string,
  ) {
    return this.quizService.getQuestionExplanation(questionId);
  }

  /**
   * POST /api/quiz/sessions/{sessionId}/complete
   * Termine une session
   */
  @Post('sessions/:sessionId/complete')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🏁 Terminer la session',
    description: 'Termine la session et calcule les statistiques finales (score, XP total, temps, feedback personnalisé)',
  })
  @ApiResponse({
    status: 200,
    description: 'Session terminée avec succès - Statistiques finales retournées',
    type: CompleteSessionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session non trouvée',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async completeSession(
    @Param('sessionId') sessionId: string,
  ) {
    return this.quizService.completeSession(sessionId);
  }

  /**
   * GET /api/quiz/sessions
   * Lister les sessions de l'utilisateur
   */
  @Get('sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lister mes sessions',
    description: 'Retourne l\'historique des sessions de l\'utilisateur',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions retournées',
  })
  async getUserSessions(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    // À implémenter : récupérer les sessions de l'utilisateur
    return {
      message: 'À implémenter : list sessions',
    };
  }

  /**
   * GET /api/quiz/sessions/{sessionId}
   * Récupérer les stats d'une session
   */
  @Get('sessions/:sessionId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '📊 Statistiques de session',
    description: 'Retourne le détail complet des statistiques d\'une session (score, réponses, XP, temps)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques retournées avec succès',
    type: QuizSessionStatsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session non trouvée',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async getSessionStats(
    @Param('sessionId') sessionId: string,
  ) {
    return this.quizService.getSessionStats(sessionId);
  }

  /**
   * GET /api/quiz/history
   * Récupérer l'historique des réponses
   */
  @Get('history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '📜 Historique des réponses',
    description:
      'Retourne l\'historique complet de toutes les réponses de l\'utilisateur avec pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Historique retourné avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async getQuizHistory(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    if (!user?.userId) {
      throw new UnauthorizedException('Non autorisé');
    }
    const userId = user.userId;
    return this.quizService.getUserQuizHistory(
      userId,
      page,
      limit,
    );
  }
}
