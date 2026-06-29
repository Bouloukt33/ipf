import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, UpdateStatusDto } from './dto/questions.dto';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('questions')
@UseGuards(AuthGuard)
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({ summary: 'Lister les questions', description: 'Récupère la liste des questions avec filtres et pagination' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filtrer par catégorie' })
  @ApiQuery({ name: 'themeId', required: false, description: 'Filtrer par thème' })
  @ApiQuery({ name: 'level', required: false, type: Number, description: 'Filtrer par niveau (1-5)' })
  @ApiQuery({ name: 'isPremium', required: false, type: Boolean, description: 'Filtrer par statut premium' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrer par statut actif' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche textuelle (texte ou codification)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrer par statut (ACTIVE, SUSPENDED, ARCHIVED)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Éléments par page (défaut: 20)' })
  @ApiResponse({ status: 200, description: 'Liste des questions avec pagination' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('themeId') themeId?: string,
    @Query('level') level?: string,
    @Query('isPremium') isPremium?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.questionsService.findAll({
      categoryId,
      themeId,
      level: level ? parseInt(level) : undefined,
      isPremium: isPremium ? isPremium === 'true' : undefined,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('read:quiz')
  @ApiOperation({ summary: 'Obtenir une question', description: 'Récupère une question par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la question' })
  @ApiResponse({ status: 200, description: 'Question trouvée' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Question non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Créer une question', description: 'Crée une nouvelle question (Admin uniquement)' })
  @ApiResponse({ status: 201, description: 'Question créée avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() data: CreateQuestionDto) {
    return this.questionsService.create(data);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Modifier une question', description: 'Met à jour une question existante (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la question' })
  @ApiResponse({ status: 200, description: 'Question mise à jour' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  @ApiResponse({ status: 404, description: 'Question non trouvée' })
  async update(@Param('id') id: string, @Body() data: UpdateQuestionDto) {
    return this.questionsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Supprimer une question', description: 'Supprime définitivement une question (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la question' })
  @ApiResponse({ status: 200, description: 'Question supprimée' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  @ApiResponse({ status: 404, description: 'Question non trouvée' })
  async delete(@Param('id') id: string) {
    return this.questionsService.delete(id);
  }

  @Post(':id/toggle-active')
  @UseGuards(PermissionsGuard)
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Activer/Désactiver une question', description: 'Bascule le statut actif d\'une question (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la question' })
  @ApiResponse({ status: 201, description: 'Statut modifié avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  @ApiResponse({ status: 404, description: 'Question non trouvée' })
  async toggleActive(@Param('id') id: string) {
    return this.questionsService.toggleActive(id);
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @Permissions('write:questions')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une question', description: 'Change le statut (ACTIVE/SUSPENDED/ARCHIVED) d\'une question (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la question' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  @ApiResponse({ status: 404, description: 'Question non trouvée' })
  async updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.questionsService.updateStatus(id, body.status);
  }
}
