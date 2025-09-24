#!/bin/bash

# Script para facilitar o desenvolvimento com Docker

case "$1" in
  "up")
    echo "🚀 Iniciando todos os serviços..."
    docker-compose up -d
    ;;
  "down")
    echo "🛑 Parando todos os serviços..."
    docker-compose down
    ;;
  "build")
    echo "🔨 Construindo imagens Docker..."
    docker-compose build
    ;;
  "logs")
    if [ -z "$2" ]; then
      echo "📋 Mostrando logs de todos os serviços..."
      docker-compose logs -f
    else
      echo "📋 Mostrando logs do serviço: $2"
      docker-compose logs -f "$2"
    fi
    ;;
  "shell")
    if [ -z "$2" ]; then
      echo "❌ Especifique o serviço: backend ou frontend"
      exit 1
    fi
    echo "🐚 Abrindo shell no container: $2"
    docker-compose exec "$2" sh
    ;;
  "migrate")
    echo "🗄️ Executando migrations..."
    docker-compose exec backend npx prisma migrate deploy
    ;;
  "seed")
    echo "🌱 Populando banco de dados..."
    docker-compose exec backend npm run prisma:seed
    ;;
  "reset")
    echo "🔄 Resetando tudo..."
    docker-compose down -v
    docker-compose up -d postgres
    sleep 5
    docker-compose exec backend npx prisma migrate deploy
    docker-compose exec backend npm run prisma:seed
    docker-compose up -d
    ;;
  *)
    echo "🐳 Script de desenvolvimento Docker - Sistema Encantar"
    echo ""
    echo "Comandos disponíveis:"
    echo "  up      - Inicia todos os serviços"
    echo "  down    - Para todos os serviços"
    echo "  build   - Reconstrói as imagens"
    echo "  logs    - Mostra logs (opcional: especificar serviço)"
    echo "  shell   - Acessa shell do container (backend|frontend)"
    echo "  migrate - Executa migrations do banco"
    echo "  seed    - Popula banco com dados de exemplo"
    echo "  reset   - Reseta tudo (banco + containers)"
    echo ""
    echo "Exemplos:"
    echo "  ./docker.sh up"
    echo "  ./docker.sh logs backend"
    echo "  ./docker.sh shell backend"
    ;;
esac