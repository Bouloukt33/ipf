import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

export interface CreateQuestionDto {
  categoryId: string;
  typeBailId?: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  level?: number;
  isPremium?: boolean;
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  isActive?: boolean;
}

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    categoryId?: string;
    typeBailId?: string;
    level?: number;
    isPremium?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.typeBailId) {
      where.OR = [
        { typeBailId: filters.typeBailId },
        { category: { typeBailId: filters.typeBailId } },
      ];
    }
    if (filters?.level) where.level = filters.level;
    if (filters?.isPremium !== undefined) where.isPremium = filters.isPremium;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: { category: true, typeBail: true, pedagogicalContent: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      data: questions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        category: true,
        typeBail: true,
        pedagogicalContent: true,
        questionStats: true,
      },
    });

    if (!question) throw new NotFoundException('Question non trouvée');
    return question;
  }

  async create(data: CreateQuestionDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true, typeBailId: true },
    });

    if (!category) throw new NotFoundException('Catégorie non trouvée');

    if (data.typeBailId && data.typeBailId !== category.typeBailId) {
      throw new NotFoundException(
        'Le type de bail ne correspond pas à la catégorie sélectionnée',
      );
    }

    const typeBailId = data.typeBailId || category.typeBailId;

    return this.prisma.question.create({
      data: {
        ...data,
        typeBailId,
        level: data.level || 1,
        isPremium: data.isPremium || false,
      },
      include: { category: true, typeBail: true },
    });
  }

  async update(id: string, data: UpdateQuestionDto) {
    await this.findOne(id);

    if (data.categoryId || data.typeBailId) {
      const categoryId = data.categoryId;
      const typeBailId = data.typeBailId;

      if (categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: categoryId },
          select: { typeBailId: true },
        });

        if (!category) throw new NotFoundException('Catégorie non trouvée');

        if (typeBailId && typeBailId !== category.typeBailId) {
          throw new NotFoundException(
            'Le type de bail ne correspond pas à la catégorie sélectionnée',
          );
        }

        if (!typeBailId) {
          data.typeBailId = category.typeBailId;
        }
      }
    }

    return this.prisma.question.update({
      where: { id },
      data,
      include: { category: true, typeBail: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.question.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const question = await this.findOne(id);
    return this.prisma.question.update({
      where: { id },
      data: { isActive: !question.isActive },
    });
  }
}
