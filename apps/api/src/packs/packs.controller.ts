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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PacksService, PackViewer } from './packs.service';
import { CreatePackDto, UpdatePackDto, AddQuestionsDto } from './dto/packs.dto';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';

@ApiTags('Packs')
@Controller('packs')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PacksController {
  constructor(private packsService: PacksService) {}

  /**
   * L'élévation admin s'appuie sur la permission Auth0 vérifiée côté serveur
   * (la même que les routes d'écriture packs), jamais sur le claim de rôle.
   */
  private getViewer(req: any): PackViewer {
    const permissions: string[] = req.user?.permissions || [];
    return {
      auth0Id: req.user?.userId,
      isAdmin: permissions.includes('write:questions'),
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les packs',
    description:
      'Filtres par catégorie, type, gratuité. User voit public + assigné. ' +
      'Le catalogue complet (packs privés de tous, inactifs inclus) exige ' +
      'scope=admin ET la permission write:questions.',
  })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['STANDARD', 'VISITEUR', 'PREMIUM'],
  })
  @ApiQuery({ name: 'isFree', required: false, type: Boolean })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiQuery({ name: 'scope', required: false, enum: ['admin'] })
  @ApiResponse({ status: 200, description: 'Liste des packs' })
  async findAll(
    @Request() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string,
    @Query('isFree') isFree?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('scope') scope?: string,
  ) {
    const viewer = this.getViewer(req);
    const adminView = scope === 'admin' && viewer.isAdmin;

    return this.packsService.findAll({
      categoryId,
      type,
      isFree: isFree !== undefined ? isFree === 'true' : undefined,
      includeInactive: adminView && includeInactive === 'true',
      auth0Id: viewer.auth0Id,
      isAdmin: adminView,
    });
  }

  @Get('slug/:categorySlug/:packSlug')
  @ApiOperation({ summary: 'Obtenir un pack par slug' })
  @ApiParam({
    name: 'categorySlug',
    description: 'Slug de la catégorie (ex: bail-commercial)',
  })
  @ApiParam({ name: 'packSlug', description: 'Slug du pack (PackID)' })
  @ApiResponse({ status: 200, description: 'Pack trouvé avec ses questions' })
  @ApiResponse({ status: 404, description: 'Pack non trouvé' })
  async findBySlug(
    @Request() req: any,
    @Param('categorySlug') categorySlug: string,
    @Param('packSlug') packSlug: string,
  ) {
    return this.packsService.findBySlug(
      categorySlug,
      packSlug,
      this.getViewer(req),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un pack par ID' })
  @ApiParam({ name: 'id', description: 'ID du pack' })
  @ApiResponse({ status: 200, description: 'Pack trouvé avec ses questions' })
  @ApiResponse({ status: 404, description: 'Pack non trouvé' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.packsService.findOne(id, this.getViewer(req));
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
  @ApiResponse({
    status: 201,
    description: 'Questions associées, pack retourné complet',
  })
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
