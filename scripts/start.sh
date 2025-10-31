#!/bin/bash

# ==========================================
# ENCANTAR - Script de Gerenciamento Linux/macOS
# ==========================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parâmetros
CMD="${1:-help}"
MODE="${2:-dev}"

# Mudar para raiz do projeto
cd "$(dirname "$0")/.."

echo -e "\n${CYAN}=== ENCANTAR - Gerenciamento ===${NC}\n"

# Funções auxiliares
check_docker() {
    docker info &>/dev/null
}

check_postgresql() {
    command -v psql &>/dev/null
}

check_postgresql_service() {
    systemctl is-active --quiet postgresql 2>/dev/null || service postgresql status &>/dev/null
}

# Comandos
case "$CMD" in
    help)
        echo -e "${YELLOW}COMANDOS DISPONÍVEIS:${NC}\n"
        echo "  up            Iniciar containers dev"
        echo "  down          Parar containers"
        echo "  logs          Ver logs (Ctrl+C para sair)"
        echo "  restart       Reiniciar containers"
        echo "  build         Rebuild completo"
        echo "  status        Status dos containers"
        echo ""
        echo "  prod-up       Iniciar produção"
        echo "  prod-down     Parar produção"
        echo "  prod-logs     Ver logs produção"
        echo "  prod-build    Rebuild produção"
        echo ""
        echo "  check         Verificar requisitos do sistema"
        echo "  setup         Setup inicial completo"
        echo ""
        ;;
    
    check)
        echo -e "${YELLOW}VERIFICANDO SISTEMA...${NC}\n"
        ALL_OK=true
        
        # Node.js
        if command -v node &>/dev/null; then
            echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
        else
            echo -e "${RED}❌ Node.js não encontrado${NC}"
            echo -e "${YELLOW}   Instale: https://nodejs.org${NC}"
            ALL_OK=false
        fi
        
        # Docker
        if check_docker; then
            echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"
        else
            echo -e "${RED}❌ Docker não está rodando${NC}"
            echo -e "${YELLOW}   Inicie: sudo systemctl start docker${NC}"
            ALL_OK=false
        fi
        
        # Docker Compose
        if command -v docker &>/dev/null && docker compose version &>/dev/null; then
            echo -e "${GREEN}✅ Docker Compose: $(docker compose version)${NC}"
        else
            echo -e "${RED}❌ Docker Compose não encontrado${NC}"
            ALL_OK=false
        fi
        
        # PostgreSQL (opcional para dev local)
        if check_postgresql; then
            echo -e "${GREEN}✅ PostgreSQL instalado${NC}"
            if check_postgresql_service; then
                echo -e "${GREEN}✅ PostgreSQL rodando${NC}"
            else
                echo -e "${YELLOW}⚠️  PostgreSQL parado${NC}"
            fi
        else
            echo -e "${YELLOW}ℹ️  PostgreSQL não encontrado (opcional)${NC}"
        fi
        
        # .env
        if [ -f ".env" ]; then
            echo -e "${GREEN}✅ Arquivo .env configurado${NC}"
        else
            echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
            echo -e "${YELLOW}   Execute: ./scripts/start.sh setup${NC}"
            ALL_OK=false
        fi
        
        echo ""
        if [ "$ALL_OK" = true ]; then
            echo -e "${GREEN}Sistema pronto! Use: ./scripts/start.sh up${NC}\n"
        else
            echo -e "${YELLOW}Configure pendências antes de iniciar${NC}\n"
        fi
        ;;
    
    up)
        echo -e "${CYAN}Iniciando containers (desenvolvimento)...${NC}\n"
        docker compose up -d
        echo -e "\n${GREEN}✅ Containers rodando!${NC}"
        echo -e "${CYAN}Backend:  https://projeto-encantar.sytes.net${NC}"
        echo -e "${CYAN}Frontend: https://projeto-encantar.sytes.net${NC}"
        echo ""
        echo -e "${YELLOW}Ver logs: ./scripts/start.sh logs${NC}\n"
        ;;
    
    down)
        echo -e "${YELLOW}Parando containers...${NC}\n"
        docker compose down
        echo -e "${GREEN}✅ Containers parados${NC}\n"
        ;;
    
    logs)
        echo -e "${CYAN}Logs (Ctrl+C para sair)...${NC}\n"
        docker compose logs -f
        ;;
    
    restart)
        echo -e "${YELLOW}Reiniciando containers...${NC}\n"
        docker compose restart
        echo -e "${GREEN}✅ Containers reiniciados${NC}\n"
        ;;
    
    build)
        echo -e "${CYAN}Rebuild completo...${NC}\n"
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        echo -e "\n${GREEN}✅ Rebuild concluído!${NC}\n"
        ;;
    
    status)
        echo -e "${CYAN}Status dos containers:${NC}\n"
        docker compose ps
        echo ""
        ;;
    
    prod-up)
        echo -e "${CYAN}Iniciando containers (produção)...${NC}\n"
        docker compose -f docker-compose.prod.yml up -d
        echo -e "\n${GREEN}✅ Produção rodando!${NC}\n"
        ;;
    
    prod-down)
        echo -e "${YELLOW}Parando produção...${NC}\n"
        docker compose -f docker-compose.prod.yml down
        echo -e "${GREEN}✅ Produção parada${NC}\n"
        ;;
    
    prod-logs)
        echo -e "${CYAN}Logs produção (Ctrl+C para sair)...${NC}\n"
        docker compose -f docker-compose.prod.yml logs -f
        ;;
    
    prod-build)
        echo -e "${CYAN}Rebuild produção...${NC}\n"
        docker compose -f docker-compose.prod.yml down
        docker compose -f docker-compose.prod.yml build --no-cache
        docker compose -f docker-compose.prod.yml up -d
        echo -e "\n${GREEN}✅ Rebuild produção concluído!${NC}\n"
        ;;
    
    setup)
        echo -e "${CYAN}=== SETUP ENCANTAR ===${NC}\n"
        
        # 1. Verificar requisitos
        echo -e "${YELLOW}[1/5] Verificando requisitos...${NC}"
        
        if ! command -v node &>/dev/null; then
            echo -e "${RED}❌ Node.js não encontrado!${NC}"
            echo -e "${YELLOW}Instale: https://nodejs.org${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
        
        if ! check_docker; then
            echo -e "${RED}❌ Docker não está rodando!${NC}"
            echo -e "${YELLOW}Inicie: sudo systemctl start docker${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"
        
        if ! docker compose version &>/dev/null; then
            echo -e "${RED}❌ Docker Compose não encontrado!${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Docker Compose${NC}"
        
        # 2. Configurar .env
        echo -e "\n${YELLOW}[2/5] Configurando variáveis de ambiente...${NC}"
        
        if [ -f ".env" ]; then
            echo -e "${CYAN}ℹ️  Arquivo .env já existe${NC}"
            read -p "Sobrescrever? (s/N): " OVERWRITE
            if [ "$OVERWRITE" != "s" ] && [ "$OVERWRITE" != "S" ]; then
                echo -e "${YELLOW}⏭️  Mantendo .env atual${NC}"
                SKIP_ENV=true
            fi
        fi
        
        if [ "$SKIP_ENV" != true ]; then
            echo -e "${CYAN}🔐 Gerando secrets...${NC}"
            JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
            JWT_REFRESH=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
            
            # Determinar configuração baseado no modo
            if [ "$MODE" = "prod" ]; then
                read -p "URL do banco (Railway): " DB_URL
                NODE_ENV="production"
                LOG_LEVEL="info"
                ENABLE_SEED="false"
                read -p "URL Frontend: " FRONTEND_URL
                read -p "URL API: " API_URL
            else
                read -p "URL do banco (Railway): " DB_URL
                NODE_ENV="development"
                LOG_LEVEL="debug"
                ENABLE_SEED="false"
                FRONTEND_URL="https://projeto-encantar.sytes.net"
                API_URL="https://projeto-encantar.sytes.net/api"
            fi
            
            cat > .env << EOF
# Backend
DATABASE_URL="$DB_URL"
JWT_SECRET="$JWT_SECRET"
JWT_REFRESH_SECRET="$JWT_REFRESH"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="$NODE_ENV"
LOG_LEVEL="$LOG_LEVEL"
ENABLE_SEED="$ENABLE_SEED"

# Frontend URLs
FRONTEND_URL="$FRONTEND_URL"
NEXT_PUBLIC_API_URL="$API_URL"
EOF
            
            echo -e "${GREEN}✅ Arquivo .env criado${NC}"
        fi
        
        # 3. Instalar dependências
        echo -e "\n${YELLOW}[3/5] Instalando dependências...${NC}"
        
        echo -e "${CYAN}📦 Backend...${NC}"
        cd backend
        npm install > /dev/null 2>&1
        echo -e "${GREEN}✅ Backend OK${NC}"
        cd ..
        
        echo -e "${CYAN}📦 Frontend...${NC}"
        cd frontend
        npm install > /dev/null 2>&1
        echo -e "${GREEN}✅ Frontend OK${NC}"
        cd ..
        
        # 4. Configurar Prisma
        echo -e "\n${YELLOW}[4/5] Configurando Prisma...${NC}"
        
        cd backend
        echo -e "${CYAN}🔧 Gerando Prisma Client...${NC}"
        npx prisma generate > /dev/null 2>&1
        echo -e "${GREEN}✅ Prisma Client gerado${NC}"
        cd ..
        
        echo -e "${CYAN}🔧 Sincronizando schema com o banco de dados...${NC}"
        npx prisma db push
        echo -e "${GREEN}✅ Banco de dados sincronizado${NC}"

        # 5. Build Docker
        echo -e "\n${YELLOW}[5/5] Construindo imagens Docker...${NC}"
        if [ "$MODE" = "prod" ]; then
            echo -e "${CYAN}🔨 Build produção...${NC}"
            docker compose -f docker-compose.prod.yml build
            echo -e "${GREEN}✅ Imagens de produção prontas${NC}"
        else
            echo -e "${CYAN}🔨 Build desenvolvimento...${NC}"
            docker compose build
            echo -e "${GREEN}✅ Imagens de desenvolvimento prontas${NC}"
        fi
        
        # Finalização
        echo -e "\n${GREEN}╔═══════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║   ✅ Setup Completo!                 ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}\n"
        
        if [ "$MODE" = "prod" ]; then
            echo -e "${CYAN}🚀 Iniciar produção:${NC}"
            echo -e "   ./scripts/start.sh prod-up\n"
            echo -e "${CYAN}📊 Ver logs:${NC}"
            echo -e "   ./scripts/start.sh prod-logs\n"
        else
            echo -e "${CYAN}🚀 Iniciar desenvolvimento:${NC}"
            echo -e "   ./scripts/start.sh up\n"
            echo -e "${CYAN}📊 Ver logs:${NC}"
            echo -e "   ./scripts/start.sh logs\n"
        fi
        
        echo -e "${YELLOW}💡 Ver todos comandos: ./scripts/start.sh help${NC}\n"
        ;;
    
    *)
        echo -e "${RED}❌ Comando desconhecido: $CMD${NC}"
        echo -e "${YELLOW}Use: ./scripts/start.sh help${NC}\n"
        exit 1
        ;;
esac
