import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QuestionStatus } from '@prisma/client';
import { AdminGuard, AuthGuard, Permissions, PermissionsGuard } from '../auth';
import { AdminQuestionsService } from './admin-questions.service';
import {
  CreateAdminQuestionSchema,
  QuestionStatusSchema,
  UpdateAdminQuestionSchema,
  UpdateQuestionStatusSchema,
} from './question-admin.schema';

@ApiTags('Admin Questions')
@ApiBearerAuth()
@Controller('admin/questions')
@UseGuards(AuthGuard, PermissionsGuard, AdminGuard)
export class AdminQuestionsController {
  constructor(private adminQuestionsService: AdminQuestionsService) {}

  @Get('meta')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Meta questions admin' })
  @ApiResponse({ status: 200, description: 'Meta retourne' })
  async getMeta() {
    return this.adminQuestionsService.getMeta();
  }

  @Get()
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Lister les questions (admin)' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'themeId', required: false })
  @ApiQuery({ name: 'level', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Liste admin' })
  async list(
    @Query('categoryId') categoryId?: string,
    @Query('themeId') themeId?: string,
    @Query('level') level?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLevel = level ? Number(level) : undefined;
    if (level && Number.isNaN(parsedLevel)) {
      throw new BadRequestException('Niveau invalide');
    }

    let parsedStatus: QuestionStatus | undefined;
    if (status) {
      const statusResult = QuestionStatusSchema.safeParse(status);
      if (!statusResult.success) {
        throw new BadRequestException('Status invalide');
      }
      parsedStatus = statusResult.data as QuestionStatus;
    }

    return this.adminQuestionsService.listQuestions({
      categoryId,
      themeId,
      level: parsedLevel,
      status: parsedStatus,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  @Permissions('read:admin')
  @ApiOperation({ summary: 'Obtenir une question (admin)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Question trouvee' })
  async getOne(@Param('id') id: string) {
    return this.adminQuestionsService.getQuestion(id);
  }

  @Post()
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Creer une question (admin)' })
  @ApiResponse({ status: 201, description: 'Question creee' })
  async create(@Body() body: unknown) {
    const parsed = CreateAdminQuestionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminQuestionsService.createQuestion(parsed.data);
  }

  @Put(':id')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Mettre a jour une question (admin)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Question mise a jour' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const parsed = UpdateAdminQuestionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminQuestionsService.updateQuestion(id, parsed.data);
  }

  @Patch(':id/status')
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Changer le status (admin)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Status mis a jour' })
  async updateStatus(@Param('id') id: string, @Body() body: unknown) {
    const parsed = UpdateQuestionStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminQuestionsService.updateStatus(id, parsed.data.status);
  }
}
