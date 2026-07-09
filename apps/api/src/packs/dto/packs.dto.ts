import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsPositive,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Create ──────────────────────────────────────────────────────────────────

export class CreatePackDto {
  @ApiProperty({ description: 'ID de la catégorie (type de bail)' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Nom du pack' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Slug URL-friendly (ex: decouverte-bail-commercial)',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Description du pack' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ['STANDARD', 'VISITEUR', 'PREMIUM'],
    default: 'STANDARD',
    description:
      'VISITEUR = onboarding gratuit, STANDARD = pack normal, PREMIUM = pack payant',
  })
  @IsOptional()
  @IsEnum(['STANDARD', 'VISITEUR', 'PREMIUM'])
  type?: 'STANDARD' | 'VISITEUR' | 'PREMIUM';

  @ApiPropertyOptional({
    description: 'Pack accessible gratuitement',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ description: 'Prix du pack (null si gratuit)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ description: "Ordre d'affichage", default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({ description: 'Pack actif ou non', default: true }) // ✅ ajouté
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'SUSPENDED', 'DISABLED'],
    default: 'ACTIVE',
    description:
      'Statut du pack : ACTIVE = visible et jouable, SUSPENDED = suspendu temporairement, DISABLED = désactivé',
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'DISABLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' })
  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility?: 'PUBLIC' | 'PRIVATE';

  @ApiPropertyOptional({
    description: "ID de l'utilisateur assigné (pour packs privés)",
  })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({
    description: 'Temps imposé par question (en secondes)',
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Type(() => Number)
  durationOverride?: number;

  @ApiPropertyOptional({
    description: 'Nombre de questions à jouer dans une session',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  targetQuestionCount?: number;

  @ApiPropertyOptional({
    description: 'IDs des questions à associer',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questionIds?: string[];
}

// ── Update ──────────────────────────────────────────────────────────────────

export class UpdatePackDto {
  @ApiPropertyOptional({ description: 'ID de la catégorie' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Nom du pack' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Slug URL-friendly' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Description du pack' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['STANDARD', 'VISITEUR', 'PREMIUM'] })
  @IsOptional()
  @IsEnum(['STANDARD', 'VISITEUR', 'PREMIUM'])
  type?: 'STANDARD' | 'VISITEUR' | 'PREMIUM';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({ description: 'Pack actif ou non', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'SUSPENDED', 'DISABLED'],
    description:
      'Statut du pack : ACTIVE = visible et jouable, SUSPENDED = suspendu temporairement, DISABLED = désactivé',
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'DISABLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'] })
  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility?: 'PUBLIC' | 'PRIVATE';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Type(() => Number)
  durationOverride?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  targetQuestionCount?: number;

  @ApiPropertyOptional({
    description: 'IDs des questions à associer',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questionIds?: string[];
}

// ── Add Questions ────────────────────────────────────────────────────────────

export class AddQuestionsDto {
  @ApiProperty({
    description: 'IDs des questions à associer au pack',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  questionIds: string[];
}
