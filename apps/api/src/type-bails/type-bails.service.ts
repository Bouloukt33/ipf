import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class TypeBailsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    return this.prisma.typeBail.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        categories: { where: { isActive: true }, orderBy: { order: 'asc' } },
        _count: { select: { questions: true, categories: true } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const typeBail = await this.prisma.typeBail.findUnique({
      where: { id },
      include: {
        categories: { where: { isActive: true }, orderBy: { order: 'asc' } },
        _count: { select: { questions: true, categories: true } },
      },
    });

    if (!typeBail) throw new NotFoundException('TypeBail non trouvé');
    return typeBail;
  }

  async findBySlug(slug: string) {
    const typeBail = await this.prisma.typeBail.findUnique({
      where: { slug },
      include: {
        categories: { where: { isActive: true }, orderBy: { order: 'asc' } },
        _count: { select: { questions: true, categories: true } },
      },
    });

    if (!typeBail) throw new NotFoundException('TypeBail non trouvé');
    return typeBail;
  }

  async getCategories(typeBailId: string) {
    const typeBail = await this.prisma.typeBail.findUnique({
      where: { id: typeBailId },
    });

    if (!typeBail) throw new NotFoundException('TypeBail non trouvé');

    return this.prisma.category.findMany({
      where: { typeBailId, isActive: true },
      include: { _count: { select: { questions: true } } },
      orderBy: { order: 'asc' },
    });
  }
}
