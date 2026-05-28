import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreatePackDto, UpdatePackDto } from './dto/packs.dto';

@Injectable()
export class PacksService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    categoryId?: string;
    type?: string;
    isFree?: boolean;
    includeInactive?: boolean;
  }) {
    const where: Record<string, unknown> = {};
    if (!filters?.includeInactive) where.isActive = true;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.type) where.type = filters.type;
    if (filters?.isFree !== undefined) where.isFree = filters.isFree;

    return this.prisma.pack.findMany({
      where,
      include: {
        category: true,
        _count: { select: { questions: true } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const pack = await this.prisma.pack.findUnique({
      where: { id },
      include: {
        category: true,
        questions: {
          where: { isActive: true },
          include: { theme: true },
          orderBy: { level: 'asc' },
        },
        _count: { select: { questions: true } },
      },
    });

    if (!pack) throw new NotFoundException('Pack non trouvé');
    return pack;
  }

  async findBySlug(categorySlug: string, packSlug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (!category) throw new NotFoundException('Catégorie non trouvée');

    const pack = await this.prisma.pack.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug: packSlug } },
      include: {
        category: true,
        questions: {
          where: { isActive: true },
          include: { theme: true },
          orderBy: { level: 'asc' },
        },
        _count: { select: { questions: true } },
      },
    });

    if (!pack) throw new NotFoundException('Pack non trouvé');
    return pack;
  }

  async create(data: CreatePackDto) {
    return this.prisma.pack.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type ?? 'STANDARD',
        isFree: data.isFree ?? false,
        price: data.price ? data.price : null,
        order: data.order ?? 0,
      },
      include: { category: true },
    });
  }

  async update(id: string, data: UpdatePackDto) {
    await this.findOne(id);
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.type !== undefined) payload.type = data.type;
    if (data.isFree !== undefined) payload.isFree = data.isFree;
    if (data.price !== undefined) payload.price = data.price;
    if (data.order !== undefined) payload.order = data.order;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    if (data.categoryId !== undefined) payload.categoryId = data.categoryId;

    return this.prisma.pack.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: payload as any,
      include: { category: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.pack.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const pack = await this.findOne(id);
    return this.prisma.pack.update({
      where: { id },
      data: { isActive: !pack.isActive },
    });
  }

  async addQuestions(packId: string, questionIds: string[]) {
    await this.findOne(packId);
    await this.prisma.question.updateMany({
      where: { id: { in: questionIds } },
      data: { packId },
    });
    return this.findOne(packId);
  }

  async removeQuestion(packId: string, questionId: string) {
    await this.findOne(packId);
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question non trouvée');

    await this.prisma.question.update({
      where: { id: questionId },
      data: { packId: null },
    });
    return { success: true };
  }
}
