-- CreateEnum
CREATE TYPE "PackStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');

-- AlterTable
ALTER TABLE "packs" ADD COLUMN     "status" "PackStatus" NOT NULL DEFAULT 'ACTIVE';

-- Backfill : les packs déjà masqués deviennent DÉSACTIVÉS
UPDATE "packs" SET "status" = 'DISABLED' WHERE NOT "is_active";
