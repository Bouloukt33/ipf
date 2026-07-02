#!/bin/sh
# Fail-fast : toute commande qui échoue arrête le conteneur.
# Une migration en échec NE DOIT PAS laisser l'API démarrer sur un schéma
# désynchronisé.
set -e

echo "🔄 Running Prisma migrations..."
./node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma

echo "🚀 Starting API..."
exec node dist/src/main.js
