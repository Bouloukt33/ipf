#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy --schema prisma/schema.prisma 2>&1 || echo "⚠️  Migration skipped or failed"

echo "🚀 Starting API..."
exec node dist/src/main.js
