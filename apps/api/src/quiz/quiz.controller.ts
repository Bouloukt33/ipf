import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';
import { QuizMode } from '@prisma/client';

@Controller('quiz')
@UseGuards(AuthGuard)
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post('start')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  async startSession(
    @CurrentUser('userId') userId: string,
    @Body() body: { categoryId?: string; mode?: QuizMode },
  ) {
    return this.quizService.startSession(userId, body.categoryId, body.mode);
  }

  @Post('answer')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
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
  async completeSession(@Param('sessionId') sessionId: string) {
    return this.quizService.completeSession(sessionId);
  }

  @Get('history')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  async getHistory(
    @CurrentUser('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.quizService.getSessionHistory(userId, limit ? parseInt(limit) : 10);
  }
}
