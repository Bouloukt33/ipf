/**
 * DTOs pour le système de Quiz
 */
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// START QUIZ SESSION
// ============================================================================

export class StartQuizSessionDto {
  @ApiProperty({
    description: 'ID du type de bail pour cette session de quiz',
    example: 'cm5w1x2y3z4a5b6c7d8e9f1h',
  })
  @IsString()
  typeBailId: string;

  @ApiPropertyOptional({
    description: 'ID de la catégorie spécifique (optionnel - pour filtrer dans le type de bail)',
    example: 'cm5w1x2y3z4a5b6c7d8e9f0g',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'ID du pack de questions (optionnel)',
    example: 'cm5w1x2y3z4a5b6c7d8e9f2i',
  })
  @IsString()
  @IsOptional()
  packId?: string;

  @ApiPropertyOptional({
    description: 'Mode de jeu',
    enum: ['PRACTICE', 'RANKED', 'CHALLENGE'],
    default: 'PRACTICE',
    example: 'PRACTICE',
  })
  @IsEnum(['PRACTICE', 'RANKED', 'CHALLENGE'])
  @IsOptional()
  mode?: 'PRACTICE' | 'RANKED' | 'CHALLENGE' = 'PRACTICE';

  @ApiPropertyOptional({
    description: 'Niveau de difficulté (1-5)',
    minimum: 1,
    maximum: 5,
    example: 3,
  })
  @IsNumber()
  @IsOptional()
  difficulty?: number; // 1-5
}

// ============================================================================
// QUESTION
// ============================================================================

export class QuestionDto {
  @ApiProperty({
    description: 'Identifiant unique de la question',
    example: 'cm5w1x2y3z4a5b6c7d8e9f3j',
  })
  questionId: string;

  @ApiProperty({
    description: 'Texte de la question',
    example: 'Quelle est la capitale de la France ?',
  })
  text: string;

  @ApiProperty({
    description: 'Option A',
    example: 'Paris',
  })
  optionA: string;

  @ApiProperty({
    description: 'Option B',
    example: 'Londres',
  })
  optionB: string;

  @ApiProperty({
    description: 'Option C',
    example: 'Berlin',
  })
  optionC: string;

  @ApiProperty({
    description: 'Option D',
    example: 'Madrid',
  })
  optionD: string;

  @ApiProperty({
    description: 'Niveau de difficulté (1-5)',
    example: 2,
  })
  level: number;

  @ApiPropertyOptional({
    description: 'Temps de lecture de la question en ms',
    example: 3000,
  })
  timeToRead?: number;

  @ApiPropertyOptional({
    description: 'URL de l\'image associée à la question',
    example: 'https://example.com/images/question.jpg',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Temps maximum pour répondre en ms',
    example: 5000,
  })
  allowedTimeMs?: number; // 5000 ms par défaut
}

export class CurrentQuestionItemDto {
  @ApiProperty({
    description: 'ID de la question',
    example: 'cm5w1x2y3z4a5b6c7d8e9f3j',
  })
  id: string;

  @ApiProperty({
    description: 'Texte de la question',
    example: 'Quelle est la capitale de la France ?',
  })
  text: string;

  @ApiProperty({
    description: 'Options de réponse (ordre A→D)',
    example: ['Paris', 'Londres', 'Berlin', 'Madrid'],
    type: [String],
  })
  options: string[];

  @ApiProperty({
    description: 'Niveau de difficulté',
    example: 2,
  })
  level: number;
}

export class CurrentQuestionResponseDto {
  @ApiProperty({
    description: 'ID de la session',
    example: 'cm5w1x2y3z4a5b6c7d8e9f4k',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Index de la question dans la session (1-based)',
    example: 1,
  })
  questionIndex: number;

  @ApiProperty({
    description: 'Nombre total de questions dans la session',
    example: 10,
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Question courante',
    type: CurrentQuestionItemDto,
  })
  question: CurrentQuestionItemDto;

  @ApiProperty({
    description: 'Temps maximum pour répondre en ms',
    example: 5000,
  })
  timeLimit: number;
}

// ============================================================================
// SUBMIT ANSWER
// ============================================================================

export class SubmitAnswerDto {
  @ApiProperty({
    description: 'ID de la question à laquelle on répond',
    example: 'cm5w1x2y3z4a5b6c7d8e9f3j',
  })
  @IsString()
  questionId: string;

  @ApiProperty({
    description: 'Option sélectionnée par l\'utilisateur',
    enum: ['A', 'B', 'C', 'D'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C', 'D'])
  selectedOption: 'A' | 'B' | 'C' | 'D';

  @ApiPropertyOptional({
    description: 'Temps de réponse en millisecondes (utilisé pour calculer le bonus XP)',
    example: 2500,
  })
  @IsNumber()
  @IsOptional()
  responseTimeMs?: number; // en millisecondes
}

export class ExplanationDto {
  @ApiPropertyOptional({
    description: 'Titre de l\'explication',
    example: 'La capitale de la France',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Résumé de l\'explication',
    example: 'Paris est la capitale et la plus grande ville de France.',
  })
  summary?: string;

  @ApiPropertyOptional({
    description: 'Message clé à retenir',
    example: 'Paris est le centre politique, économique et culturel de la France.',
  })
  keyMessage?: string;

  @ApiPropertyOptional({
    description: 'Points essentiels à retenir',
    example: ['Centre politique', 'Centre économique', 'Centre culturel'],
    type: [String],
  })
  essentialPoints?: string[];

  @ApiPropertyOptional({
    description: 'Exemples concrets',
    example: ['Tour Eiffel', 'Louvre', 'Arc de Triomphe'],
    type: [String],
  })
  examples?: string[];

  @ApiPropertyOptional({
    description: 'Piège à éviter',
    example: 'Ne pas confondre avec Lyon qui est la deuxième plus grande ville.',
  })
  trapToAvoid?: string;

  @ApiPropertyOptional({
    description: 'Conseil pratique',
    example: 'Mémoriser les grandes capitales européennes ensemble.',
  })
  practicalAdvice?: string;

  @ApiPropertyOptional({
    description: 'Synthèse finale',
    example: 'Paris, capitale de France depuis 987, est une ville majeure en Europe.',
  })
  synthesis?: string;
}

export class AnswerFeedbackDto {
  @ApiProperty({
    description: 'ID de la question',
    example: 'cm5w1x2y3z4a5b6c7d8e9f3j',
  })
  questionId: string;

  @ApiProperty({
    description: 'Réponse donnée par l\'utilisateur',
    enum: ['A', 'B', 'C', 'D'],
    example: 'A',
  })
  userAnswer: 'A' | 'B' | 'C' | 'D';

  @ApiProperty({
    description: 'Bonne réponse',
    enum: ['A', 'B', 'C', 'D'],
    example: 'A',
  })
  correctAnswer: 'A' | 'B' | 'C' | 'D';

  @ApiProperty({
    description: 'Indique si la réponse est correcte',
    example: true,
  })
  isCorrect: boolean;

  @ApiProperty({
    description: 'XP gagnés pour cette question (avec bonus de vitesse)',
    example: 15,
  })
  xpEarned: number;

  @ApiPropertyOptional({
    description: 'Explication détaillée de la réponse',
  })
  explanation?: ExplanationDto;

  @ApiProperty({
    description: 'URL de la vidéo associée (si disponible)',
    example: 'https://example.com/videos/explanation.mp4',
  })
  videoUrl?: string;

  @ApiProperty({
    description: 'Statistiques actuelles de la session',
    example: {
      correct: 1,
      total: 10,
      percentage: 10,
      xpEarned: 15,
    },
  })
  sessionStats: {
    correct: number;
    total: number;
    percentage: number;
    xpEarned: number;
  };

  @ApiProperty({
    description: 'Message de feedback court',
    example: 'Bravo ! 15 XP gagnés !',
  })
  feedbackMessage: string;
}

// ============================================================================
// QUIZ SESSION
// ============================================================================

export class SessionQuestionDto {
  @ApiProperty({
    description: 'Index dans la session (1-based)',
    example: 1,
  })
  index: number;

  @ApiProperty({
    description: 'ID de la question',
    example: 'cm5w1x2y3z4a5b6c7d8e9f3j',
  })
  id: string;

  @ApiProperty({
    description: 'Texte de la question',
    example: 'Quelle est la capitale de la France ?',
  })
  text: string;

  @ApiProperty({
    description: 'Options de réponse (ordre A→D)',
    example: ['Paris', 'Londres', 'Berlin', 'Madrid'],
    type: [String],
  })
  options: string[];

  @ApiProperty({
    description: 'Niveau de difficulté',
    example: 2,
  })
  level: number;
}

export class QuizSessionResponseDto {
  @ApiProperty({
    description: 'ID de la session de quiz',
    example: 'cm5w1x2y3z4a5b6c7d8e9f4k',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Nombre total de questions',
    example: 10,
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Liste des questions pré-chargées',
    type: [SessionQuestionDto],
  })
  questions: SessionQuestionDto[];

  @ApiProperty({
    description: 'Date de début de la session',
    example: '2025-01-27T10:00:00Z',
  })
  startedAt: Date;

  @ApiProperty({
    description: 'Statut de la session',
    example: 'ready',
  })
  status: string;
}

export class QuizSessionStatsDto {
  @ApiProperty({
    description: 'ID de la session',
    example: 'cm5w1x2y3z4a5b6c7d8e9f4k',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Statut de la session',
    enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
    example: 'COMPLETED',
  })
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

  @ApiProperty({
    description: 'Score détaillé',
    example: { correct: 8, total: 10, percentage: 80 },
  })
  score: {
    correct: number;
    total: number;
    percentage: number;
  };

  @ApiProperty({
    description: 'XP total gagné',
    example: 120,
  })
  xpEarned: number;

  @ApiProperty({
    description: 'Date de début de la session',
    example: '2025-01-27T10:00:00Z',
  })
  startedAt: Date;

  @ApiPropertyOptional({
    description: 'Date de fin de la session',
    example: '2025-01-27T10:15:00Z',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Durée totale en ms',
    example: 900000,
  })
  durationMs?: number;

  @ApiProperty({
    description: 'Détails des réponses',
    example: [
      {
        questionId: 'cm5w1x2y3z4a5b6c7d8e9f3j',
        isCorrect: true,
        responseTimeMs: 2500,
        xpEarned: 13,
        level: 2,
      },
    ],
  })
  answers: {
    questionId: string;
    isCorrect: boolean;
    responseTimeMs: number;
    xpEarned: number;
    level: number;
  }[];
}

export class CompleteSessionDto {
  @ApiProperty({
    description: 'ID de la session',
    example: 'cm5w1x2y3z4a5b6c7d8e9f4k',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Score détaillé',
    example: { correct: 8, total: 10, percentage: 80 },
  })
  score: {
    correct: number;
    total: number;
    percentage: number;
  };

  @ApiProperty({
    description: 'XP total gagné',
    example: 120,
  })
  xpEarned: number;

  @ApiProperty({
    description: 'Durée totale en ms',
    example: 900000,
  })
  durationMs: number;

  @ApiProperty({
    description: 'Date de complétion',
    example: '2025-01-27T10:15:00Z',
  })
  completedAt: Date;

  @ApiProperty({
    description: 'Message de feedback final',
    example: '👏 Excellent ! Tu maîtrises ce sujet !',
  })
  feedbackMessage: string;
}

// ============================================================================
// CATEGORIES / TYPE-BAILS / PACKS (PUBLIC)
// ============================================================================

export class TypeBailDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export class PackDto {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  isActive: boolean;
  order: number;
  questionCount?: number;
}

export class CategoryDetailDto {
  id: string;
  typeBailId: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  order: number;
  isActive: boolean;
  typeBail?: TypeBailDto;
  packs: PackDto[];
}

export class CategoryListDto {
  id: string;
  typeBailId: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  order: number;
  isActive: boolean;
}

// ============================================================================
// HISTORY
// ============================================================================

export class QuizAnswerHistoryDto {
  answerId: string;
  sessionId: string;
  questionId: string;
  question: string;
  userAnswer: 'A' | 'B' | 'C' | 'D';
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  responseTimeMs: number;
  xpEarned: number;
  answeredAt: Date;
  category: string;
  typeBail?: string;
  level: number;
}

export class QuizHistoryResponseDto {
  data: QuizAnswerHistoryDto[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
