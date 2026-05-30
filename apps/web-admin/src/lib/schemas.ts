import { z } from 'zod';

export const questionFormSchema = z.object({
  categoryId: z.string().min(1, 'Type de bail requis'),
  themeId: z.string().optional(),
  packId: z.string().optional(),
  videoId: z.string().optional(),
  text: z.string().min(5, 'Texte trop court'),
  optionA: z.string().min(1, 'Option A requise'),
  optionB: z.string().min(1, 'Option B requise'),
  optionC: z.string().min(1, 'Option C requise'),
  optionD: z.string().min(1, 'Option D requise'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  level: z.number().int().min(1).max(4),
  timeToRead: z.number().int().min(5).max(30),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']),
  isPremium: z.boolean(),
});

export type QuestionFormInput = z.infer<typeof questionFormSchema>;
