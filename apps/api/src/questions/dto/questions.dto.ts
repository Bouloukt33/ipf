import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, Max } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ description: 'ID de la catégorie', example: 'clxxx123...' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ description: 'ID du thème (optionnel)', example: 'clxxx456...' })
  @IsOptional()
  @IsString()
  themeId?: string;

  @ApiPropertyOptional({ description: 'ID du pack (optionnel)', example: 'clxxx789...' })
  @IsOptional()
  @IsString()
  packId?: string;

  @ApiPropertyOptional({ description: 'ID de la vidéo (optionnel)', example: 'clxxx012...' })
  @IsOptional()
  @IsString()
  videoId?: string;

  @ApiProperty({ description: 'Texte de la question', example: 'Quelle est la capitale de la France ?' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Option A', example: 'Paris' })
  @IsString()
  optionA: string;

  @ApiProperty({ description: 'Option B', example: 'Lyon' })
  @IsString()
  optionB: string;

  @ApiProperty({ description: 'Option C', example: 'Marseille' })
  @IsString()
  optionC: string;

  @ApiProperty({ description: 'Option D', example: 'Bordeaux' })
  @IsString()
  optionD: string;

  @ApiProperty({ description: 'Réponse correcte (A, B, C ou D)', example: 'A' })
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional({ description: 'Niveau de difficulté (1-4)', example: 2, minimum: 1, maximum: 4 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  level?: number;

  @ApiPropertyOptional({ description: 'Durée de lecture en secondes', example: 5 })
  @IsOptional()
  @IsNumber()
  timeToRead?: number;

  @ApiPropertyOptional({ description: 'Question premium', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Statut de la question', enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'], example: 'ACTIVE' })
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
  themeId?: string;

  @ApiPropertyOptional({ description: 'ID du pack' })
  @IsOptional()
  @IsString()
  packId?: string;

  @ApiPropertyOptional({ description: 'ID de la vidéo' })
  @IsOptional()
  @IsString()
  videoId?: string;

  @ApiPropertyOptional({ description: 'Texte de la question' })
  @IsOptional()
  @IsString()
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
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ description: 'Niveau de difficulté (1-4)', minimum: 1, maximum: 4 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  level?: number;

  @ApiPropertyOptional({ description: 'Durée de lecture en secondes' })
  @IsOptional()
  @IsNumber()
  timeToRead?: number;

  @ApiPropertyOptional({ description: 'Question premium' })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Question active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Régénérer la codification' })
  @IsOptional()
  @IsBoolean()
  regenerateCodification?: boolean;

  @ApiPropertyOptional({ description: 'Statut de la question', enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}

export class UpdateStatusDto {
  @ApiProperty({ description: 'Nouveau statut', enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'] })
  @IsEnum(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}
