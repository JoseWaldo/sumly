#!/bin/sh
set -e

echo "→ Aplicando migraciones..."
bunx prisma migrate deploy

echo "→ Iniciando servidor..."
exec bun run src/index.ts