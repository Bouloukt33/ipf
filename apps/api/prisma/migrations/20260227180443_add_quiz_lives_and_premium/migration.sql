-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "quiz_sessions" ADD COLUMN     "combo_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_question_idx" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lives_remaining" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "question_order" JSONB,
ADD COLUMN     "question_served_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "last_level_up_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
