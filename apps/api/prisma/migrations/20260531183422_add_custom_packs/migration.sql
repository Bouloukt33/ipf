-- CreateEnum
CREATE TYPE "public"."PackType" AS ENUM ('STANDARD', 'VISITEUR', 'PREMIUM');

-- CreateEnum
CREATE TYPE "public"."PackVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."QuestionStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."packs" ADD COLUMN     "assigned_user_id" TEXT,
ADD COLUMN     "duration_override" INTEGER,
ADD COLUMN     "is_free" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "target_question_count" INTEGER,
ADD COLUMN     "type" "public"."PackType" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "visibility" "public"."PackVisibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "public"."questions" ADD COLUMN     "codification" TEXT,
ADD COLUMN     "status" "public"."QuestionStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."quiz_sessions" ADD COLUMN     "duration_override" INTEGER,
ADD COLUMN     "pack_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."packs" ADD CONSTRAINT "packs_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_sessions" ADD CONSTRAINT "quiz_sessions_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "public"."packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
