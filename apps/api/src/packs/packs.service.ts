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
    auth0Id?: string;
    isAdmin?: boolean;
  }) {
    const where: Record<string, any> = {};
    if (!filters?.includeInactive) where.isActive = true;
    if (filters?.categoryId) where.categoryId = filters.categoryId;

    // Logique de visibilité
    if (!filters?.isAdmin) {
      if (filters?.auth0Id) {
        const user = await this.prisma.user.findUnique({
          where: { auth0Id: filters.auth0Id },
        });
        if (user) {
          where.OR = [
            { visibility: 'PUBLIC' },
            { visibility: 'PRIVATE', assignedUserId: user.id },
          ];
        } else {
          where.visibility = 'PUBLIC';
        }
      } else {
        where.visibility = 'PUBLIC';
      }
    }

    return this.prisma.pack.findMany({
      where,
      select: {
        id: true,
        categoryId: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        isFree: true,
        price: true,
        isActive: true,
        order: true,
        visibility: true,
        assignedUserId: true,
        durationOverride: true,
        targetQuestionCount: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        assignedUser: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
        _count: { select: { questions: true } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const pack = await this.prisma.pack.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        isFree: true,
        price: true,
        isActive: true,
        order: true,
        visibility: true,
        assignedUserId: true,
        durationOverride: true,
        targetQuestionCount: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        assignedUser: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
        questions: {
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
      select: {
        id: true,
        categoryId: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        isFree: true,
        price: true,
        isActive: true,
        order: true,
        visibility: true,
        assignedUserId: true,
        durationOverride: true,
        targetQuestionCount: true,
        createdAt: true,
        updatedAt: true,
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
    const { questionIds, ...packData } = data;
    console.log(
      '[PacksService] Creating pack with questions:',
      questionIds?.length,
    );

    return this.prisma.pack.create({
      data: {
        categoryId: packData.categoryId,
        name: packData.name,
        slug: packData.slug,
        description: packData.description,
        type: packData.type ?? 'STANDARD',
        isFree: packData.isFree ?? false,
        price: packData.price ? packData.price : null,
        order: packData.order ?? 0,
        visibility: packData.visibility ?? 'PUBLIC',
        assignedUserId: packData.assignedUserId ?? null,
        durationOverride: packData.durationOverride ?? null,
        targetQuestionCount: packData.targetQuestionCount ?? null,
        questions:
          questionIds && questionIds.length > 0
            ? {
                connect: questionIds.map((id) => ({ id })),
              }
            : undefined,
      },
      include: { category: true, _count: { select: { questions: true } } },
    });
  }

  async update(id: string, data: UpdatePackDto) {
    const { questionIds, ...updateData } = data;
    await this.findOne(id);

    console.log(
      '[PacksService] Updating pack questions, count:',
      questionIds?.length,
    );

    const payload: Record<string, any> = {};
    if (updateData.name !== undefined) payload.name = updateData.name;
    if (updateData.slug !== undefined) payload.slug = updateData.slug;
    if (updateData.description !== undefined)
      payload.description = updateData.description;
    if (updateData.type !== undefined) payload.type = updateData.type;
    if (updateData.isFree !== undefined) payload.isFree = updateData.isFree;
    if (updateData.price !== undefined) payload.price = updateData.price;
    if (updateData.order !== undefined) payload.order = updateData.order;
    if (updateData.isActive !== undefined)
      payload.isActive = updateData.isActive;
    if (updateData.categoryId !== undefined)
      payload.categoryId = updateData.categoryId;
    if (updateData.visibility !== undefined)
      payload.visibility = updateData.visibility;
    if (updateData.assignedUserId !== undefined)
      payload.assignedUserId = updateData.assignedUserId;
    if (updateData.durationOverride !== undefined)
      payload.durationOverride = updateData.durationOverride;
    if (updateData.targetQuestionCount !== undefined)
      payload.targetQuestionCount = updateData.targetQuestionCount;

    // Gestion des questions via relation set (écrase les anciennes)
    if (questionIds !== undefined) {
      payload.questions = {
        set: questionIds.map((qid) => ({ id: qid })),
      };
    }

    return this.prisma.pack.update({
      where: { id },
      data: payload,
      include: { category: true, _count: { select: { questions: true } } },
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
    return this.prisma.pack.update({
      where: { id: packId },
      data: {
        questions: {
          connect: questionIds.map((id) => ({ id })),
        },
      },
      include: { _count: { select: { questions: true } } },
    });
  }

  async removeQuestion(packId: string, questionId: string) {
    await this.findOne(packId);
    return this.prisma.pack.update({
      where: { id: packId },
      data: {
        questions: {
          disconnect: { id: questionId },
        },
      },
    });
  }
}
