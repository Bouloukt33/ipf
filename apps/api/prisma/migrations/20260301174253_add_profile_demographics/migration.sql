-- CreateEnum
CREATE TYPE "AgeRange" AS ENUM ('AGE_18_25', 'AGE_26_35', 'AGE_36_45', 'AGE_46_55', 'AGE_56_PLUS');

-- CreateEnum
CREATE TYPE "ProfessionalStatus" AS ENUM ('SALARIE', 'INDEPENDANT', 'MANDATAIRE');

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "age_range" "AgeRange",
ADD COLUMN     "job_profile_id" TEXT,
ADD COLUMN     "professional_status" "ProfessionalStatus";

-- CreateTable
CREATE TABLE "job_sectors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_profiles" (
    "id" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_sectors_name_key" ON "job_sectors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_sectors_slug_key" ON "job_sectors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "job_profiles_slug_key" ON "job_profiles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "job_profiles_sector_id_slug_key" ON "job_profiles"("sector_id", "slug");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_job_profile_id_fkey" FOREIGN KEY ("job_profile_id") REFERENCES "job_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_profiles" ADD CONSTRAINT "job_profiles_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "job_sectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
