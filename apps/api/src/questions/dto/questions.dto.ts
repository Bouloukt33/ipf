import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ description: 'ID de la catégorie', example: 'clxxx123...' })
  categoryId: string;

  @ApiPropertyOptional({ description: 'ID du thème (optionnel)', example: 'clxxx456...' })
  themeId?: string;

  @ApiPropertyOptional({ description: 'ID du pack (optionnel)', example: 'clxxx789...' })
  packId?: string;

  @ApiPropertyOptional({ description: 'ID de la vidéo (optionnel)', example: 'clxxx012...' })
  videoId?: string;

  @ApiProperty({ description: 'Texte de la question', example: 'Quelle est la capitale de la France ?' })
  text: string;

  @ApiProperty({ description: 'Option A', example: 'Paris' })
  optionA: string;

  @ApiProperty({ description: 'Option B', example: 'Lyon' })
  optionB: string;

  @ApiProperty({ description: 'Option C', example: 'Marseille' })
  optionC: string;

  @ApiProperty({ description: 'Option D', example: 'Bordeaux' })
  optionD: string;

  @ApiProperty({ description: 'Réponse correcte (A, B, C ou D)', example: 'A' })
  correctAnswer: string;

  @ApiPropertyOptional({ description: 'Niveau de difficulté (1-5)', example: 2, minimum: 1, maximum: 5 })
  level?: number;

  @ApiPropertyOptional({ description: 'Durée de lecture en secondes', example: 5 })
  timeToRead?: number;

  @ApiPropertyOptional({ description: 'Question premium', example: false, default: false })
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Statut de la question', enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'], example: 'ACTIVE' })
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({ description: 'ID de la catégorie' })
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ID du thème' })
  themeId?: string;

  @ApiPropertyOptional({ description: 'ID du pack' })
  packId?: string;

  @ApiPropertyOptional({ description: 'ID de la vidéo' })
  videoId?: string;

  @ApiPropertyOptional({ description: 'Texte de la question' })
  text?: string;

  @ApiPropertyOptional({ description: 'Option A' })
  optionA?: string;

  @ApiPropertyOptional({ description: 'Option B' })
  optionB?: string;

  @ApiPropertyOptional({ description: 'Option C' })
  optionC?: string;

  @ApiPropertyOptional({ description: 'Option D' })
  optionD?: string;

  @ApiPropertyOptional({ description: 'Réponse correcte (A, B, C ou D)' })
  correctAnswer?: string;

  @ApiPropertyOptional({ description: 'Niveau de difficulté (1-5)', minimum: 1, maximum: 5 })
  level?: number;

  @ApiPropertyOptional({ description: 'Durée de lecture en secondes' })
  timeToRead?: number;

  @ApiPropertyOptional({ description: 'Question premium' })
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Question active' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Statut de la question', enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'] })
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}
