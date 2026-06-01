import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

export interface CreateQuestionDto {
  categoryId: string;
  themeId?: string;
  packId?: string;
  videoId?: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  level?: number;
  timeToRead?: number;
  isPremium?: boolean;
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  isActive?: boolean;
}

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  private generateCodification(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'Q';
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  async findAll(filters?: {
    categoryId?: string;
    themeId?: string;
    level?: number;
    isPremium?: boolean;
    isActive?: boolean;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.themeId) where.themeId = filters.themeId;
    if (filters?.level) where.level = filters.level;
    if (filters?.isPremium !== undefined) where.isPremium = filters.isPremium;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { text: { contains: filters.search, mode: 'insensitive' } },
        { codification: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: { category: true, theme: true, pack: true, video: true, pedagogicalContent: true },
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
        theme: true,
        pack: true,
        video: true,
        pedagogicalContent: true,
        questionStats: true,
      },
    });

    if (!question) throw new NotFoundException('Question non trouvée');
    return question;
  }

  async create(data: CreateQuestionDto) {
    const codification = this.generateCodification();
    const status = data.status || 'ACTIVE';
    return this.prisma.question.create({
      data: {
        ...data,
        level: data.level || 1,
        isPremium: data.isPremium || false,
        codification,
        status,
        isActive: status === 'ACTIVE',
      },
      include: { category: true, theme: true, pack: true, video: true },
    });
  }

  async update(id: string, data: UpdateQuestionDto) {
    await this.findOne(id);

    return this.prisma.question.update({
      where: { id },
      data,
      include: { category: true, theme: true, pack: true, video: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.question.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const question = await this.findOne(id);
    const newIsActive = !question.isActive;
    const newStatus = newIsActive ? 'ACTIVE' : 'SUSPENDED';
    return this.prisma.question.update({
      where: { id },
      data: { isActive: newIsActive, status: newStatus },
    });
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED') {
    await this.findOne(id);
    return this.prisma.question.update({
      where: { id },
      data: {
        status,
        isActive: status === 'ACTIVE',
      },
    });
  }

  async getStats() {
    const [total, active, suspended, archived, premium] = await Promise.all([
      this.prisma.question.count(),
      this.prisma.question.count({ where: { status: 'ACTIVE' } }),
      this.prisma.question.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.question.count({ where: { status: 'ARCHIVED' } }),
      this.prisma.question.count({ where: { isPremium: true } }),
    ]);
    return { total, active, suspended, archived, premium };
  }
}
