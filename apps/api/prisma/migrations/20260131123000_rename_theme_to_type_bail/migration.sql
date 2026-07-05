  -- Rename Theme to TypeBail (tables/columns/constraints/indexes) - idempotent

-- Drop foreign keys referencing themes
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_theme_id_fkey";
ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_theme_id_fkey";
ALTER TABLE "quiz_sessions" DROP CONSTRAINT IF EXISTS "quiz_sessions_theme_id_fkey";
ALTER TABLE "user_masteries" DROP CONSTRAINT IF EXISTS "user_masteries_theme_id_fkey";
ALTER TABLE "ai_recommendations" DROP CONSTRAINT IF EXISTS "ai_recommendations_theme_id_fkey";

-- Drop indexes that reference theme_id
DROP INDEX IF EXISTS "categories_theme_id_idx";
DROP INDEX IF EXISTS "questions_theme_id_idx";
DROP INDEX IF EXISTS "quiz_sessions_theme_id_idx";
DROP INDEX IF EXISTS "user_masteries_theme_id_idx";
DROP INDEX IF EXISTS "ai_recommendations_theme_id_idx";

-- Drop unique constraint using theme_id in user_masteries
ALTER TABLE "user_masteries" DROP CONSTRAINT IF EXISTS "user_masteries_user_id_category_id_theme_id_key";

-- Rename table themes -> type_bails if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'themes')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'type_bails') THEN
    ALTER TABLE "themes" RENAME TO "type_bails";
  END IF;
END $$;

-- Rename columns theme_id -> type_bail_id when present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'theme_id') THEN
    ALTER TABLE "categories" RENAME COLUMN "theme_id" TO "type_bail_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'theme_id') THEN
    ALTER TABLE "questions" RENAME COLUMN "theme_id" TO "type_bail_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_sessions' AND column_name = 'theme_id') THEN
    ALTER TABLE "quiz_sessions" RENAME COLUMN "theme_id" TO "type_bail_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_masteries' AND column_name = 'theme_id') THEN
    ALTER TABLE "user_masteries" RENAME COLUMN "theme_id" TO "type_bail_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_recommendations' AND column_name = 'theme_id') THEN
    ALTER TABLE "ai_recommendations" RENAME COLUMN "theme_id" TO "type_bail_id";
  END IF;
END $$;

-- Rename unique index for slug on themes (if any)
DROP INDEX IF EXISTS "themes_slug_key";

-- Dédupliquer les slugs avant d'ajouter l'unicité
WITH duplicates AS (
  SELECT slug, array_agg(id ORDER BY created_at, id) AS ids
  FROM "type_bails"
  GROUP BY slug
  HAVING COUNT(*) > 1
)
UPDATE "type_bails" t
SET slug = t.slug || '-' || substr(t.id, 1, 8)
FROM duplicates d
WHERE t.slug = d.slug AND t.id <> d.ids[1];

CREATE UNIQUE INDEX IF NOT EXISTS "type_bails_slug_key" ON "type_bails"("slug");

-- Recreate indexes (only if columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'type_bail_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS "categories_type_bail_id_idx" ON "categories"("type_bail_id")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'type_bail_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS "questions_type_bail_id_idx" ON "questions"("type_bail_id")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_sessions' AND column_name = 'type_bail_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS "quiz_sessions_type_bail_id_idx" ON "quiz_sessions"("type_bail_id")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_masteries' AND column_name = 'type_bail_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS "user_masteries_type_bail_id_idx" ON "user_masteries"("type_bail_id")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_recommendations' AND column_name = 'type_bail_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS "ai_recommendations_type_bail_id_idx" ON "ai_recommendations"("type_bail_id")';
  END IF;
END $$;

-- Recreate foreign keys to type_bails (only if columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'type_bail_id') THEN
    EXECUTE 'ALTER TABLE "categories" ADD CONSTRAINT "categories_type_bail_id_fkey" FOREIGN KEY ("type_bail_id") REFERENCES "type_bails"("id") ON DELETE CASCADE';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'type_bail_id') THEN
    EXECUTE 'ALTER TABLE "questions" ADD CONSTRAINT "questions_type_bail_id_fkey" FOREIGN KEY ("type_bail_id") REFERENCES "type_bails"("id")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_sessions' AND column_name = 'type_bail_id') THEN
    EXECUTE 'ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_type_bail_id_fkey" FOREIGN KEY ("type_bail_id") REFERENCES "type_bails"("id")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_masteries' AND column_name = 'type_bail_id') THEN
    EXECUTE 'ALTER TABLE "user_masteries" ADD CONSTRAINT "user_masteries_type_bail_id_fkey" FOREIGN KEY ("type_bail_id") REFERENCES "type_bails"("id")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_recommendations' AND column_name = 'type_bail_id') THEN
    EXECUTE 'ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_type_bail_id_fkey" FOREIGN KEY ("type_bail_id") REFERENCES "type_bails"("id")';
  END IF;
END $$;

-- Recreate unique constraint with type_bail_id when column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_masteries' AND column_name = 'type_bail_id') THEN
    EXECUTE 'ALTER TABLE "user_masteries" ADD CONSTRAINT "user_masteries_user_id_category_id_type_bail_id_key" UNIQUE ("user_id", "category_id", "type_bail_id")';
  END IF;
END $$;
