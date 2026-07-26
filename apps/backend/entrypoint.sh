#!/bin/sh
set -e

echo "→ Aplicando migraciones..."
DATABASE_URL="${MIGRATION_DATABASE_URL}" bunx prisma migrate deploy

echo "→ Iniciando servidor..."
exec bun run src/index.ts