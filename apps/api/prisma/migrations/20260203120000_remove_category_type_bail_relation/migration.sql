-- Supprimer la relation directe Category -> TypeBail

-- Drop foreign key if exists
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_type_bail_id_fkey";

-- Drop index if exists
DROP INDEX IF EXISTS "categories_type_bail_id_idx";

-- Drop column if exists
ALTER TABLE "categories" DROP COLUMN IF EXISTS "type_bail_id";
