-- Inversion de la relation Thème -> Catégories

-- 1) Ajouter theme_id aux catégories
ALTER TABLE "categories" ADD COLUMN "theme_id" TEXT;

-- 2) Backfill: associer chaque catégorie à son premier thème existant
WITH ranked AS (
  SELECT
    t.id,
    t.category_id,
    ROW_NUMBER() OVER (
      PARTITION BY t.category_id
      ORDER BY t."order" ASC, t.created_at ASC, t.id ASC
    ) AS rn
  FROM "themes" t
)
UPDATE "categories" c
SET "theme_id" = r.id
FROM ranked r
WHERE r.category_id = c.id AND r.rn = 1;

-- 3) Ajouter theme_id aux sessions de quiz
ALTER TABLE "quiz_sessions" ADD COLUMN "theme_id" TEXT;

-- 4) Backfill: relier les sessions au thème de leur catégorie
UPDATE "quiz_sessions" qs
SET "theme_id" = c."theme_id"
FROM "categories" c
WHERE qs."category_id" = c.id;

-- 5) Backfill: si une question n'a pas de thème, prendre celui de la catégorie
UPDATE "questions" q
SET "theme_id" = c."theme_id"
FROM "categories" c
WHERE q."category_id" = c.id AND q."theme_id" IS NULL;

-- 6) Supprimer les anciennes contraintes Theme -> Category
ALTER TABLE "themes" DROP CONSTRAINT IF EXISTS "themes_category_id_fkey";
ALTER TABLE "themes" DROP CONSTRAINT IF EXISTS "themes_category_id_slug_key";

-- 7) Supprimer la colonne category_id dans themes
ALTER TABLE "themes" DROP COLUMN "category_id";

-- 8) Assurer l'unicité du slug côté themes
CREATE UNIQUE INDEX IF NOT EXISTS "themes_slug_key" ON "themes"("slug");

-- 9) Rendre theme_id obligatoire pour categories
ALTER TABLE "categories" ALTER COLUMN "theme_id" SET NOT NULL;

-- 10) Ajouter les nouvelles contraintes et index
ALTER TABLE "categories"
  ADD CONSTRAINT "categories_theme_id_fkey"
  FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE CASCADE;

ALTER TABLE "quiz_sessions"
  ADD CONSTRAINT "quiz_sessions_theme_id_fkey"
  FOREIGN KEY ("theme_id") REFERENCES "themes"("id");

CREATE INDEX IF NOT EXISTS "categories_theme_id_idx" ON "categories"("theme_id");
CREATE INDEX IF NOT EXISTS "quiz_sessions_theme_id_idx" ON "quiz_sessions"("theme_id");
