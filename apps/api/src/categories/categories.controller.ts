import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard, PermissionsGuard, Permissions } from '../auth';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  // Route publique - liste des catégories
  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.categoriesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id/themes')
  async getThemes(@Param('id') id: string) {
    return this.categoriesService.getThemes(id);
  }
}
