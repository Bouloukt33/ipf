import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TypeBailsService } from './type-bails.service';

@ApiTags('TypeBail')
@Controller('type-bails')
export class TypeBailsController {
  constructor(private typeBailsService: TypeBailsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les types de bail', description: 'Récupère la liste de tous les types de bail (route publique)' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Inclure les types de bail inactifs' })
  @ApiResponse({ status: 200, description: 'Liste des types de bail' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.typeBailsService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un type de bail', description: 'Récupère un type de bail par son ID' })
  @ApiParam({ name: 'id', description: 'ID du type de bail' })
  @ApiResponse({ status: 200, description: 'Type de bail trouvé' })
  @ApiResponse({ status: 404, description: 'Type de bail non trouvé' })
  async findOne(@Param('id') id: string) {
    return this.typeBailsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtenir un type de bail par slug', description: 'Récupère un type de bail par son slug URL-friendly' })
  @ApiParam({ name: 'slug', description: 'Slug du type de bail (ex: bail-habitation)' })
  @ApiResponse({ status: 200, description: 'Type de bail trouvé' })
  @ApiResponse({ status: 404, description: 'Type de bail non trouvé' })
  async findBySlug(@Param('slug') slug: string) {
    return this.typeBailsService.findBySlug(slug);
  }

  @Get(':id/categories')
  @ApiOperation({ summary: 'Catégories d\'un type de bail', description: 'Récupère les catégories associées à un type de bail via les questions' })
  @ApiParam({ name: 'id', description: 'ID du type de bail' })
  @ApiResponse({ status: 200, description: 'Liste des catégories du type de bail' })
  @ApiResponse({ status: 404, description: 'Type de bail non trouvé' })
  async getCategories(@Param('id') id: string) {
    return this.typeBailsService.getCategories(id);
  }
}
