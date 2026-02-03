import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: { select: { questions: true } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        packs: { where: { isActive: true } },
        _count: { select: { questions: true } },
      },
    });

    if (!category) throw new NotFoundException('Catégorie non trouvée');
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { questions: true } },
      },
    });

    if (!category) throw new NotFoundException('Catégorie non trouvée');
    return category;
  }

  async getTypeBail(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) throw new NotFoundException('Catégorie non trouvée');

    return this.prisma.typeBail.findMany({
      where: {
        isActive: true,
        questions: {
          some: { categoryId },
        },
      },
      orderBy: { order: 'asc' },
    });
  }
}
