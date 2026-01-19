import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/questions.dto';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';

@Controller('questions')
@UseGuards(AuthGuard)
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('themeId') themeId?: string,
    @Query('level') level?: string,
    @Query('isPremium') isPremium?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.questionsService.findAll({
      categoryId,
      themeId,
      level: level ? parseInt(level) : undefined,
      isPremium: isPremium ? isPremium === 'true' : undefined,
      isActive: isActive ? isActive === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('write:questions')
  async create(@Body() data: CreateQuestionDto) {
    return this.questionsService.create(data);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('write:questions')
  async update(@Param('id') id: string, @Body() data: UpdateQuestionDto) {
    return this.questionsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('write:questions')
  async delete(@Param('id') id: string) {
    return this.questionsService.delete(id);
  }

  @Post(':id/toggle-active')
  @UseGuards(PermissionsGuard)
  @Permissions('write:questions')
  async toggleActive(@Param('id') id: string) {
    return this.questionsService.toggleActive(id);
  }
}
