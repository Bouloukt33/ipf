export class CreateQuestionDto {
  categoryId: string;
  themeId?: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  level?: number;
  isPremium?: boolean;
}

export class UpdateQuestionDto {
  categoryId?: string;
  themeId?: string;
  text?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  level?: number;
  isPremium?: boolean;
  isActive?: boolean;
}
