import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma';
import {
  CreateAdminQuestionInput,
  UpdateAdminQuestionInput,
} from './question-admin.schema';

const LEVEL_CODE_MAP: Record<number, string> = {
  1: 'F',
  2: 'M',
  3: 'D',
  4: 'E',
};

@Injectable()
export class AdminQuestionsService {
  constructor(private prisma: PrismaService) {}

  async listQuestions(filters?: {
    categoryId?: string;
    themeId?: string;
    level?: number;
    status?: QuestionStatus;
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
    if (filters?.status) where.status = filters.status;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          theme: true,
          pack: true,
          video: true,
        },
        orderBy: { updatedAt: 'desc' },
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

  async getQuestion(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        category: true,
        theme: true,
        pack: true,
        video: true,
        pedagogicalContent: true,
      },
    });

    if (!question) throw new NotFoundException('Question non trouvee');
    return question;
  }

  async createQuestion(input: CreateAdminQuestionInput) {
    const status = input.status ?? QuestionStatus.ACTIVE;
    const level = input.level ?? 1;
    const categoryId = input.categoryId;
    const themeId = this.normalizeOptionalId(input.themeId);

    const codification = await this.generateCodification({
      categoryId,
      themeId,
      level,
    });

    return this.prisma.question.create({
      data: {
        categoryId,
        themeId,
        packId: this.normalizeOptionalId(input.packId),
        videoId: this.normalizeOptionalId(input.videoId),
        text: input.text,
        optionA: input.optionA,
        optionB: input.optionB,
        optionC: input.optionC,
        optionD: input.optionD,
        correctAnswer: input.correctAnswer,
        level,
        timeToRead: this.normalizeOptionalNumber(input.timeToRead),
        isPremium: input.isPremium ?? false,
        status,
        isActive: status === QuestionStatus.ACTIVE,
        codification,
      },
      include: {
        category: true,
        theme: true,
        pack: true,
        video: true,
      },
    });
  }

  async updateQuestion(id: string, input: UpdateAdminQuestionInput) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Question non trouvee');

    const hasTheme = Object.prototype.hasOwnProperty.call(input, 'themeId');
    const hasPack = Object.prototype.hasOwnProperty.call(input, 'packId');
    const hasVideo = Object.prototype.hasOwnProperty.call(input, 'videoId');
    const hasTimeToRead = Object.prototype.hasOwnProperty.call(
      input,
      'timeToRead',
    );

    const nextCategoryId = input.categoryId ?? question.categoryId;
    const nextThemeId = hasTheme
      ? this.normalizeOptionalId(input.themeId)
      : question.themeId;
    const nextLevel = input.level ?? question.level;

    const shouldRegenerate =
      input.regenerateCodification ||
      input.categoryId !== undefined ||
      hasTheme ||
      input.level !== undefined ||
      !question.codification;

    const codification = shouldRegenerate
      ? await this.generateCodification({
          categoryId: nextCategoryId,
          themeId: nextThemeId,
          level: nextLevel,
        })
      : question.codification;

    const nextStatus = input.status ?? question.status;

    const data: any = {
      categoryId: nextCategoryId,
      level: nextLevel,
      codification,
      status: nextStatus,
    };

    if (input.text !== undefined) data.text = input.text;
    if (input.optionA !== undefined) data.optionA = input.optionA;
    if (input.optionB !== undefined) data.optionB = input.optionB;
    if (input.optionC !== undefined) data.optionC = input.optionC;
    if (input.optionD !== undefined) data.optionD = input.optionD;
    if (input.correctAnswer !== undefined) data.correctAnswer = input.correctAnswer;
    if (input.isPremium !== undefined) data.isPremium = input.isPremium;
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;
    if (hasTheme) data.themeId = this.normalizeOptionalId(input.themeId);
    if (hasPack) data.packId = this.normalizeOptionalId(input.packId);
    if (hasVideo) data.videoId = this.normalizeOptionalId(input.videoId);
    if (hasTimeToRead) {
      data.timeToRead = this.normalizeOptionalNumber(input.timeToRead);
    }

    if (input.status !== undefined) {
      data.isActive = input.status === QuestionStatus.ACTIVE;
    }

    return this.prisma.question.update({
      where: { id },
      data,
      include: {
        category: true,
        theme: true,
        pack: true,
        video: true,
      },
    });
  }

  async updateStatus(id: string, status: QuestionStatus) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Question non trouvee');

    return this.prisma.question.update({
      where: { id },
      data: {
        status,
        isActive: status === QuestionStatus.ACTIVE,
      },
    });
  }

  async getMeta() {
    const [categories, packs, videos] = await Promise.all([
      this.prisma.category.findMany({
        include: { themes: true },
        orderBy: { order: 'asc' },
      }),
      this.prisma.pack.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.video.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      categories,
      packs,
      videos,
    };
  }

  private normalizeOptionalId(value?: string | null) {
    if (!value) return null;
    return value;
  }

  private normalizeOptionalNumber(value?: number | null) {
    if (value === null || value === undefined) return null;
    return value;
  }

  private async generateCodification(params: {
    categoryId: string;
    themeId?: string | null;
    level?: number | null;
  }) {
    const [category, theme] = await Promise.all([
      this.prisma.category.findUnique({ where: { id: params.categoryId } }),
      params.themeId
        ? this.prisma.theme.findUnique({ where: { id: params.themeId } })
        : Promise.resolve(null),
    ]);

    if (!category) {
      throw new BadRequestException('Categorie introuvable');
    }

    if (params.themeId && !theme) {
      throw new BadRequestException('Theme introuvable');
    }

    const typeCode = this.toCode3(category.slug || category.name);
    const themeCode = theme ? this.toCode3(theme.slug || theme.name) : 'COM';
    const levelCode = this.levelToCode(params.level ?? 1);
    const prefix = `${typeCode}${themeCode}${levelCode}`;

    const last = await this.prisma.question.findFirst({
      where: {
        codification: {
          startsWith: prefix,
        },
      },
      orderBy: { codification: 'desc' },
      select: { codification: true },
    });

    const nextNumber = this.nextSequenceNumber(last?.codification, prefix);
    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  }

  private nextSequenceNumber(lastCode: string | null | undefined, prefix: string) {
    if (!lastCode || !lastCode.startsWith(prefix)) return 1;
    const suffix = lastCode.slice(prefix.length);
    const parsed = Number.parseInt(suffix, 10);
    if (Number.isNaN(parsed)) return 1;
    return parsed + 1;
  }

  private levelToCode(level: number) {
    return LEVEL_CODE_MAP[level] ?? 'F';
  }

  private toCode3(value: string) {
    const cleaned = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    return cleaned.padEnd(3, 'X').slice(0, 3);
  }
}
