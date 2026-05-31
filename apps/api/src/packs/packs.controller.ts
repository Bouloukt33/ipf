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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PacksService } from './packs.service';
import { CreatePackDto, UpdatePackDto, AddQuestionsDto } from './dto/packs.dto';
import { AuthGuard, PermissionsGuard, Permissions, CurrentUser } from '../auth';

@ApiTags('Packs')
@Controller('packs')
export class PacksController {
  constructor(private packsService: PacksService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lister les packs', description: 'Route publique — filtrages par catégorie, type, gratuité' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['STANDARD', 'VISITEUR', 'PREMIUM'] })
  @ApiQuery({ name: 'isFree', required: false, type: Boolean })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Liste des packs' })
  async findAll(
    @CurrentUser() user: any,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string,
    @Query('isFree') isFree?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    console.log('[PacksController] User from token:', JSON.stringify(user));
    const roles = user?.roles || [];
    const isAdmin = roles.some((r: string) => r.toLowerCase() === 'admin');
    console.log('[PacksController] isAdmin:', isAdmin, 'userId:', user?.userId);
    
    return this.packsService.findAll({
      categoryId,
      type,
      isFree: isFree !== undefined ? isFree === 'true' : undefined,
      includeInactive: includeInactive === 'true',
      auth0Id: user?.userId,
      isAdmin: isAdmin,
    });
  }

  @Get('slug/:categorySlug/:packSlug')
  @ApiOperation({ summary: 'Obtenir un pack par slug' })
  @ApiParam({ name: 'categorySlug', description: 'Slug de la catégorie (ex: bail-commercial)' })
  @ApiParam({ name: 'packSlug', description: 'Slug du pack (PackID)' })
  @ApiResponse({ status: 200, description: 'Pack trouvé avec ses questions' })
  @ApiResponse({ status: 404, description: 'Pack non trouvé' })
  async findBySlug(
    @Param('categorySlug') categorySlug: string,
    @Param('packSlug') packSlug: string,
  ) {
    return this.packsService.findBySlug(categorySlug, packSlug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un pack par ID' })
  @ApiParam({ name: 'id', description: 'ID du pack' })
  @ApiResponse({ status: 200, description: 'Pack trouvé avec ses questions' })
  @ApiResponse({ status: 404, description: 'Pack non trouvé' })
  async findOne(@Param('id') id: string) {
    return this.packsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('write:questions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un pack (Admin)' })
  @ApiResponse({ status: 201, description: 'Pack créé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission insuffisante' })
  async create(@Body() data: CreatePackDto) {
    return this.packsService.create(data);
  }

  @Put(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('write:questions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un pack (Admin)' })
  @ApiParam({ name: 'id', description: 'ID du pack' })
  @ApiResponse({ status: 200, description: 'Pack mis à jour' })
  @ApiResponse({ status: 404, description: 'Pack non trouvé' })
  async update(@Param('id') id: string, @Body() data: UpdatePackDto) {
    return this.packsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('write:questions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un pack (Admin)' })
  @ApiParam({ name: 'id', description: 'ID du pack' })
  @ApiResponse({ status: 200, description: 'Pack supprimé' })
  @ApiResponse({ status: 404, description: 'Pack non trouvé' })
  async delete(@Param('id') id: string) {
    return this.packsService.delete(id);
  }

  @Post(':id/toggle-active')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('write:questions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activer / Désactiver un pack (Admin)' })
  @ApiParam({ name: 'id', description: 'ID du pack' })
  @ApiResponse({ status: 201, description: 'Statut modifié' })
  async toggleActive(@Param('id') id: string) {
    return this.packsService.toggleActive(id);
  }

  @Post(':id/questions')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('write:questions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Associer des questions à un pack (Admin)' })
  @ApiParam({ name: 'id', description: 'ID du pack' })
  @ApiResponse({ status: 201, description: 'Questions associées, pack retourné complet' })
  async addQuestions(@Param('id') id: string, @Body() data: AddQuestionsDto) {
    return this.packsService.addQuestions(id, data.questionIds);
  }

  @Delete(':id/questions/:questionId')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('write:questions')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retirer une question d'un pack (Admin)" })
  @ApiParam({ name: 'id', description: 'ID du pack' })
  @ApiParam({ name: 'questionId', description: 'ID de la question' })
  @ApiResponse({ status: 200, description: 'Question retirée du pack' })
  async removeQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
  ) {
    return this.packsService.removeQuestion(id, questionId);
  }
}
