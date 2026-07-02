import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @ApiProperty({ description: 'ID de la catégorie', example: 'clxxx123...' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'ID du thème (optionnel)',
    example: 'clxxx456...',
  })
  @IsOptional()
  @IsString()
  themeId?: string | null;

  @ApiPropertyOptional({ description: 'ID du pack (optionnel)' })
  @IsOptional()
  @IsString()
  packId?: string | null;

  @ApiPropertyOptional({ description: 'ID de la vidéo (optionnel)' })
  @IsOptional()
  @IsString()
  videoId?: string | null;

  @ApiProperty({
    description: 'Texte de la question',
    example: 'Quelle est la capitale de la France ?',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ description: 'Option A', example: 'Paris' })
  @IsString()
  @IsNotEmpty()
  optionA: string;

  @ApiProperty({ description: 'Option B', example: 'Lyon' })
  @IsString()
  @IsNotEmpty()
  optionB: string;

  @ApiProperty({ description: 'Option C', example: 'Marseille' })
  @IsString()
  @IsNotEmpty()
  optionC: string;

  @ApiProperty({ description: 'Option D', example: 'Bordeaux' })
  @IsString()
  @IsNotEmpty()
  optionD: string;

  @ApiProperty({ description: 'Réponse correcte (A, B, C ou D)', example: 'A' })
  @IsIn(['A', 'B', 'C', 'D'])
  correctAnswer: string;

  @ApiPropertyOptional({
    description: 'Niveau de difficulté (1-4)',
    example: 2,
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  level?: number;

  @ApiPropertyOptional({ description: 'Temps de lecture (secondes)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  timeToRead?: number | null;

  @ApiPropertyOptional({
    description: 'Question premium',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'],
    default: 'ACTIVE',
    description: 'Statut de la question',
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({ description: 'ID de la catégorie' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ID du thème' })
  @IsOptional()
  @IsString()
  themeId?: string | null;

  @ApiPropertyOptional({ description: 'ID du pack' })
  @IsOptional()
  @IsString()
  packId?: string | null;

  @ApiPropertyOptional({ description: 'ID de la vidéo' })
  @IsOptional()
  @IsString()
  videoId?: string | null;

  @ApiPropertyOptional({ description: 'Texte de la question' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  text?: string;

  @ApiPropertyOptional({ description: 'Option A' })
  @IsOptional()
  @IsString()
  optionA?: string;

  @ApiPropertyOptional({ description: 'Option B' })
  @IsOptional()
  @IsString()
  optionB?: string;

  @ApiPropertyOptional({ description: 'Option C' })
  @IsOptional()
  @IsString()
  optionC?: string;

  @ApiPropertyOptional({ description: 'Option D' })
  @IsOptional()
  @IsString()
  optionD?: string;

  @ApiPropertyOptional({ description: 'Réponse correcte (A, B, C ou D)' })
  @IsOptional()
  @IsIn(['A', 'B', 'C', 'D'])
  correctAnswer?: string;

  @ApiPropertyOptional({
    description: 'Niveau de difficulté (1-4)',
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  level?: number;

  @ApiPropertyOptional({ description: 'Temps de lecture (secondes)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  timeToRead?: number | null;

  @ApiPropertyOptional({ description: 'Question premium' })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Question active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

  @ApiPropertyOptional({
    description: 'Régénérer la codification (envoyé par le web-admin, ignoré)',
  })
  @IsOptional()
  @IsBoolean()
  regenerateCodification?: boolean;
}

export class UpdateQuestionStatusDto {
  @ApiProperty({
    enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'],
    description: 'Nouveau statut de la question',
  })
  @IsEnum(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}

export class ImportQuestionsDto {
  @ApiProperty({
    description:
      'Contenu du fichier CSV (UTF-8, séparateur `;` ou `,`, voir docs/import-questions-csv.md)',
  })
  @IsString()
  @IsNotEmpty()
  csv: string;
}
