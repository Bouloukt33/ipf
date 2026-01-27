import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';

@ApiTags('Catégories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les catégories', description: 'Récupère la liste de toutes les catégories (route publique)' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Inclure les catégories inactives' })
  @ApiResponse({ status: 200, description: 'Liste des catégories' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.categoriesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une catégorie', description: 'Récupère une catégorie par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie trouvée' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtenir une catégorie par slug', description: 'Récupère une catégorie par son slug URL-friendly' })
  @ApiParam({ name: 'slug', description: 'Slug de la catégorie (ex: culture-generale)' })
  @ApiResponse({ status: 200, description: 'Catégorie trouvée' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id/themes')
  @ApiOperation({ summary: 'Thèmes d\'une catégorie', description: 'Récupère tous les thèmes associés à une catégorie' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({ status: 200, description: 'Liste des thèmes de la catégorie' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async getThemes(@Param('id') id: string) {
    return this.categoriesService.getThemes(id);
  }
}
