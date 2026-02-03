import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class TypeBailsService {
  constructor(private prisma: PrismaService) {}

  private async getCategoriesForTypeBail(typeBailId: string) {
    const [categories, counts] = await Promise.all([
      this.prisma.category.findMany({
        where: {
          isActive: true,
          questions: {
            some: { typeBailId },
          },
        },
        orderBy: { order: 'asc' },
      }),
      this.prisma.question.groupBy({
        by: ['categoryId'],
        where: { typeBailId, isActive: true },
        _count: { _all: true },
      }),
    ]);

    const countMap = new Map(
      counts.map((c) => [c.categoryId, c._count._all]),
    );

    return categories.map((category) => ({
      ...category,
      _count: { questions: countMap.get(category.id) || 0 },
    }));
  }

  async findAll(includeInactive = false) {
    const typeBails = await this.prisma.typeBail.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: { select: { questions: true } },
      },
      orderBy: { order: 'asc' },
    });

    return Promise.all(
      typeBails.map(async (typeBail) => {
        const categories = await this.getCategoriesForTypeBail(typeBail.id);
        return {
          ...typeBail,
          categories,
          _count: {
            questions: typeBail._count.questions,
            categories: categories.length,
          },
        };
      }),
    );
  }

  async findOne(id: string) {
    const typeBail = await this.prisma.typeBail.findUnique({
      where: { id },
      include: {
        _count: { select: { questions: true } },
      },
    });

    if (!typeBail) throw new NotFoundException('TypeBail non trouvé');
    const categories = await this.getCategoriesForTypeBail(typeBail.id);
    return {
      ...typeBail,
      categories,
      _count: {
        questions: typeBail._count.questions,
        categories: categories.length,
      },
    };
  }

  async findBySlug(slug: string) {
    const typeBail = await this.prisma.typeBail.findUnique({
      where: { slug },
      include: {
        _count: { select: { questions: true } },
      },
    });

    if (!typeBail) throw new NotFoundException('TypeBail non trouvé');
    const categories = await this.getCategoriesForTypeBail(typeBail.id);
    return {
      ...typeBail,
      categories,
      _count: {
        questions: typeBail._count.questions,
        categories: categories.length,
      },
    };
  }

  async getCategories(typeBailId: string) {
    const typeBail = await this.prisma.typeBail.findUnique({
      where: { id: typeBailId },
    });

    if (!typeBail) throw new NotFoundException('TypeBail non trouvé');
    return this.getCategoriesForTypeBail(typeBailId);
  }
}
