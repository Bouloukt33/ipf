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

  @ApiProperty({ description: 'Slug URL-friendly (ex: decouverte-bail-commercial)' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Description du pack' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ['STANDARD', 'VISITEUR', 'PREMIUM'],
    default: 'STANDARD',
    description: 'VISITEUR = onboarding gratuit, STANDARD = pack normal, PREMIUM = pack payant',
  })
  @IsOptional()
  @IsEnum(['STANDARD', 'VISITEUR', 'PREMIUM'])
  type?: 'STANDARD' | 'VISITEUR' | 'PREMIUM';

  @ApiPropertyOptional({ description: 'Pack accessible gratuitement', default: false })
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
}

// ── Add Questions ────────────────────────────────────────────────────────────

export class AddQuestionsDto {
  @ApiProperty({ description: 'IDs des questions à associer au pack', type: [String] })
  @IsArray()
  @IsString({ each: true })
  questionIds: string[];
}