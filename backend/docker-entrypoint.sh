#!/bin/sh
set -e

if [ -n "$ENABLE_SEED" ] && [ "$ENABLE_SEED" = "true" ]; then
  echo "ENABLE_SEED=true detectado em producao. Seeds nao serao executados automaticamente."
fi

echo "Executando migrations Prisma..."
npx prisma migrate deploy

echo "Iniciando servidor Express"
exec node dist/index.js