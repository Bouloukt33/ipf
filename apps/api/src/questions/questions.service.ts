import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/questions.dto';

export interface ImportRowError {
  line: number;
  message: string;
}

export interface ImportReport {
  imported: number;
  total: number;
  errors: ImportRowError[];
}

/** Colonnes attendues dans le CSV d'import (voir docs/import-questions-csv.md). */
const CSV_COLUMNS = [
  'categorie',
  'niveau',
  'question',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'bonneReponse',
  'premium',
] as const;

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  /** ACTIVE ↔ isActive doivent rester cohérents : seul ACTIVE est jouable. */
  private syncStatus(status?: string, isActive?: boolean) {
    if (status !== undefined) {
      return {
        status: status as QuestionStatus,
        isActive: status === 'ACTIVE',
      };
    }
    if (isActive !== undefined) {
      return {
        status: (isActive ? 'ACTIVE' : 'SUSPENDED') as QuestionStatus,
        isActive,
      };
    }
    return {};
  }

  async findAll(filters?: {
    categoryId?: string;
    themeId?: string;
    level?: number;
    isPremium?: boolean;
    isActive?: boolean;
    status?: string;
    search?: string;
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
        include: { category: true, theme: true, pedagogicalContent: true },
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
        pedagogicalContent: true,
        questionStats: true,
      },
    });

    if (!question) throw new NotFoundException('Question non trouvée');
    return question;
  }

  async create(data: CreateQuestionDto) {
    const { status, ...rest } = data;
    return this.prisma.question.create({
      data: {
        ...rest,
        level: data.level || 1,
        isPremium: data.isPremium || false,
        ...this.syncStatus(status),
      },
      include: { category: true, theme: true },
    });
  }

  async update(id: string, data: UpdateQuestionDto) {
    await this.findOne(id);

    const { status, isActive, regenerateCodification, ...rest } = data;
    void regenerateCodification; // envoyé par le web-admin, sans effet côté API
    return this.prisma.question.update({
      where: { id },
      data: { ...rest, ...this.syncStatus(status, isActive) },
      include: { category: true, theme: true },
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
      data: this.syncStatus(undefined, !question.isActive),
    });
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED') {
    await this.findOne(id);
    return this.prisma.question.update({
      where: { id },
      data: this.syncStatus(status),
      include: { category: true, theme: true },
    });
  }

  /**
   * Import CSV (point client n°8). Format documenté dans
   * docs/import-questions-csv.md : en-tête obligatoire
   * `categorie;niveau;question;optionA;optionB;optionC;optionD;bonneReponse;premium`,
   * séparateur `;` ou `,` (auto-détecté), catégorie par slug ou nom.
   * Les lignes valides sont importées, les lignes en erreur sont
   * rapportées avec leur numéro — l'import n'est pas tout-ou-rien.
   */
  async importCsv(csv: string): Promise<ImportReport> {
    const rows = this.parseCsv(csv);
    if (rows.length < 2) {
      throw new BadRequestException(
        'CSV vide : il faut une ligne d’en-tête et au moins une question',
      );
    }

    const header = rows[0].map((h) => h.trim());
    const missing = CSV_COLUMNS.filter(
      (col) => col !== 'premium' && !header.includes(col),
    );
    if (missing.length > 0) {
      throw new BadRequestException(
        `En-tête CSV invalide : colonne(s) manquante(s) ${missing.join(', ')}. ` +
          `Colonnes attendues : ${CSV_COLUMNS.join(';')}`,
      );
    }
    const col = (name: string) => header.indexOf(name);

    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true, slug: true },
    });
    const categoryByKey = new Map<string, string>();
    for (const c of categories) {
      categoryByKey.set(c.slug.toLowerCase(), c.id);
      categoryByKey.set(c.name.toLowerCase(), c.id);
    }

    const errors: ImportRowError[] = [];
    const toCreate: {
      categoryId: string;
      text: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
      level: number;
      isPremium: boolean;
    }[] = [];

    for (let i = 1; i < rows.length; i++) {
      const line = i + 1; // numéro humain (1 = en-tête)
      const row = rows[i];
      if (row.length === 1 && row[0].trim() === '') continue; // ligne vide

      const cell = (name: string) => (row[col(name)] ?? '').trim();

      const categoryKey = cell('categorie').toLowerCase();
      const categoryId = categoryByKey.get(categoryKey);
      if (!categoryId) {
        errors.push({
          line,
          message: `Catégorie inconnue « ${cell('categorie')} » (utiliser le slug ou le nom exact)`,
        });
        continue;
      }

      const level = parseInt(cell('niveau'), 10);
      if (isNaN(level) || level < 1 || level > 4) {
        errors.push({
          line,
          message: `Niveau invalide « ${cell('niveau')} » (attendu : 1 à 4)`,
        });
        continue;
      }

      const text = cell('question');
      const options = {
        optionA: cell('optionA'),
        optionB: cell('optionB'),
        optionC: cell('optionC'),
        optionD: cell('optionD'),
      };
      if (!text || Object.values(options).some((o) => !o)) {
        errors.push({
          line,
          message: 'Question ou option vide (les 4 options sont obligatoires)',
        });
        continue;
      }

      const correctAnswer = cell('bonneReponse').toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        errors.push({
          line,
          message: `Bonne réponse invalide « ${cell('bonneReponse')} » (attendu : A, B, C ou D)`,
        });
        continue;
      }

      const premiumRaw =
        col('premium') >= 0 ? cell('premium').toLowerCase() : '';
      const isPremium = ['oui', 'true', '1', 'x'].includes(premiumRaw);

      toCreate.push({
        categoryId,
        text,
        ...options,
        correctAnswer,
        level,
        isPremium,
      });
    }

    if (toCreate.length > 0) {
      await this.prisma.question.createMany({ data: toCreate });
    }

    return {
      imported: toCreate.length,
      total: rows.length - 1,
      errors,
    };
  }

  /**
   * Parseur CSV minimal : gère les champs entre guillemets (avec `""`
   * échappé), les fins de ligne \n ou \r\n, et détecte le séparateur
   * (`;` ou `,`) sur la ligne d'en-tête. Suffisant pour des fichiers
   * de questions — pas de dépendance externe.
   */
  private parseCsv(text: string): string[][] {
    const content = text.replace(/^\uFEFF/, ''); // BOM Excel
    const firstLine = content.split(/\r?\n/, 1)[0] ?? '';
    const delimiter =
      (firstLine.match(/;/g)?.length ?? 0) >=
      (firstLine.match(/,/g)?.length ?? 0)
        ? ';'
        : ',';

    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      if (inQuotes) {
        if (char === '"') {
          if (content[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        row.push(field);
        field = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && content[i + 1] === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }
    if (field !== '' || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }
}
