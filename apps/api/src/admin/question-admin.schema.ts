import { z } from 'zod';

export const QuestionStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']);

export const CreateAdminQuestionSchema = z.object({
  categoryId: z.string().min(1),
  themeId: z.string().min(1).optional().nullable(),
  packId: z.string().min(1).optional().nullable(),
  videoId: z.string().min(1).optional().nullable(),
  text: z.string().min(1),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  level: z.number().int().min(1).max(4).optional(),
  timeToRead: z.number().int().min(5).max(30).optional().nullable(),
  status: QuestionStatusSchema.optional(),
  isPremium: z.boolean().optional(),
});

export const UpdateAdminQuestionSchema = CreateAdminQuestionSchema.partial().extend({
  regenerateCodification: z.boolean().optional(),
});

export const UpdateQuestionStatusSchema = z.object({
  status: QuestionStatusSchema,
});

export type CreateAdminQuestionInput = z.infer<typeof CreateAdminQuestionSchema>;
export type UpdateAdminQuestionInput = z.infer<typeof UpdateAdminQuestionSchema>;
export type UpdateQuestionStatusInput = z.infer<typeof UpdateQuestionStatusSchema>;
