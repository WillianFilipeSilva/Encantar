#!/bin/bash#!/bin/bash

# ==========================================# ==========================================

# ENCANTAR - Script Unificado Linux/Mac# 🚀 Setup Automático - Ubuntu/Debian

# ==========================================# Sistema Encantar

# ==========================================

set -e

set -e  # Parar em caso de erro

# Cores

RED='\033[0;31m'# Cores

GREEN='\033[0;32m'RED='\033[0;31m'

YELLOW='\033[1;33m'GREEN='\033[0;32m'

CYAN='\033[0;36m'YELLOW='\033[1;33m'

NC='\033[0m'CYAN='\033[0;36m'

NC='\033[0m' # No Color

CMD="${1:-help}"

MODE="${2:-dev}"# Parâmetros

MODE="${1:-dev}"  # dev ou prod

echo -e "\n${CYAN}=== ENCANTAR - Gerenciamento ===${NC}"DB_HOST="${2:-localhost}"  # localhost, IP da máquina, ou DNS

SKIP_DB="${3:-false}"  # true para pular instalação do PostgreSQL

# Funcoes auxiliares

check_docker() {echo -e "${CYAN}"

    docker info &>/dev/nullcat << "EOF"

}╔═══════════════════════════════════════╗

║   🚀 Setup Encantar - Ubuntu         ║

check_postgresql() {╚═══════════════════════════════════════╝

    command -v psql &>/dev/nullEOF

}echo -e "${NC}"

echo -e "${CYAN}Modo: $MODE${NC}"

check_postgresql_service() {echo -e "${CYAN}DB Host: $DB_HOST${NC}"

    systemctl is-active --quiet postgresql 2>/dev/null || service postgresql status &>/dev/nullecho ""

}

# ==========================================

# Comandos# 1. Verificar Requisitos

case "$CMD" in# ==========================================

    help)echo -e "${YELLOW}[1/6] Verificando requisitos...${NC}"

        echo -e "\n${YELLOW}COMANDOS DISPONIVEIS:${NC}"

        echo "  setup         Setup inicial completo"# Verificar se está rodando como root

        echo "  check         Verificar requisitos"if [ "$EUID" -eq 0 ]; then

        echo "  up            Iniciar containers dev"    echo -e "${RED}  ❌ Não execute este script como root (sudo)${NC}"

        echo "  down          Parar containers"    echo -e "${YELLOW}     Execute como usuário normal: ./setup-ubuntu.sh${NC}"

        echo "  logs          Ver logs"    exit 1

        echo "  restart       Reiniciar"fi

        echo "  build         Rebuild completo"

        echo "  status        Status containers"# Verificar Node.js

        echo "  prod-up       Iniciar producao"if command -v node &> /dev/null; then

        echo "  prod-down     Parar producao"    NODE_VERSION=$(node --version)

        echo "  prod-logs     Ver logs producao"    echo -e "${GREEN}  ✅ Node.js instalado: $NODE_VERSION${NC}"

        echo "  prod-build    Rebuild producao"else

        echo ""    echo -e "${RED}  ❌ Node.js não encontrado!${NC}"

        ;;    echo -e "${YELLOW}     Instalando Node.js 18...${NC}"

        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

    check)    sudo apt-get install -y nodejs

        echo -e "\n${YELLOW}VERIFICANDO SISTEMA...${NC}\n"    echo -e "${GREEN}  ✅ Node.js instalado${NC}"

        ALL_OK=truefi

        

        # Node.js# Verificar Docker

        if command -v node &>/dev/null; thenif command -v docker &> /dev/null; then

            echo -e "${GREEN}  [OK] Node.js: $(node --version)${NC}"    DOCKER_VERSION=$(docker --version)

        else    echo -e "${GREEN}  ✅ Docker instalado: $DOCKER_VERSION${NC}"

            echo -e "${RED}  [ERRO] Node.js nao encontrado${NC}"else

            ALL_OK=false    echo -e "${RED}  ❌ Docker não encontrado!${NC}"

        fi    echo -e "${YELLOW}     Instalando Docker...${NC}"

            curl -fsSL https://get.docker.com -o get-docker.sh

        # Docker    sudo sh get-docker.sh

        if check_docker; then    sudo usermod -aG docker $USER

            echo -e "${GREEN}  [OK] Docker: $(docker --version)${NC}"    rm get-docker.sh

        else    echo -e "${GREEN}  ✅ Docker instalado${NC}"

            echo -e "${RED}  [ERRO] Docker nao esta rodando${NC}"    echo -e "${YELLOW}  ⚠️  IMPORTANTE: Faça logout e login novamente para usar o Docker${NC}"

            ALL_OK=falsefi

        fi

        # Verificar Docker Compose

        # Docker Composeif command -v docker-compose &> /dev/null; then

        if command -v docker-compose &>/dev/null; then    COMPOSE_VERSION=$(docker-compose --version)

            echo -e "${GREEN}  [OK] Docker Compose: $(docker-compose --version)${NC}"    echo -e "${GREEN}  ✅ Docker Compose: $COMPOSE_VERSION${NC}"

        elseelse

            echo -e "${RED}  [ERRO] Docker Compose nao encontrado${NC}"    echo -e "${RED}  ❌ Docker Compose não encontrado!${NC}"

            ALL_OK=false    echo -e "${YELLOW}     Instalando Docker Compose...${NC}"

        fi    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

            sudo chmod +x /usr/local/bin/docker-compose

        # PostgreSQL    echo -e "${GREEN}  ✅ Docker Compose instalado${NC}"

        if check_postgresql; thenfi

            echo -e "${GREEN}  [OK] PostgreSQL instalado${NC}"

            if check_postgresql_service; then# ==========================================

                echo -e "${GREEN}  [OK] PostgreSQL rodando${NC}"# 2. Instalar/Verificar PostgreSQL

            else# ==========================================

                echo -e "${YELLOW}  [AVISO] PostgreSQL parado${NC}"echo -e "\n${YELLOW}[2/6] Configurando PostgreSQL...${NC}"

                ALL_OK=false

            fiif [ "$SKIP_DB" = "true" ]; then

        else    echo -e "${YELLOW}  ⏭️  Pulando instalação do PostgreSQL${NC}"

            echo -e "${RED}  [ERRO] PostgreSQL nao encontrado${NC}"else

            ALL_OK=false    if command -v psql &> /dev/null; then

        fi        echo -e "${GREEN}  ✅ PostgreSQL já instalado${NC}"

                

        # .env        # Verificar se está rodando

        if [ -f "../.env" ]; then        if sudo systemctl is-active --quiet postgresql; then

            echo -e "${GREEN}  [OK] Arquivo .env configurado${NC}"            echo -e "${GREEN}  ✅ PostgreSQL rodando${NC}"

        else        else

            echo -e "${YELLOW}  [AVISO] Arquivo .env nao encontrado${NC}"            echo -e "${YELLOW}  ⚠️  Iniciando PostgreSQL...${NC}"

            ALL_OK=false            sudo systemctl start postgresql

        fi            sudo systemctl enable postgresql

                    echo -e "${GREEN}  ✅ PostgreSQL iniciado${NC}"

        echo ""        fi

        if [ "$ALL_OK" = true ]; then    else

            echo -e "${GREEN}Sistema pronto! Use: ./start.sh up${NC}\n"        echo -e "${YELLOW}  📥 Instalando PostgreSQL...${NC}"

        else        sudo apt-get update

            echo -e "${YELLOW}Configure pendencias antes de iniciar${NC}\n"        sudo apt-get install -y postgresql postgresql-contrib

        fi        sudo systemctl start postgresql

        ;;        sudo systemctl enable postgresql

            echo -e "${GREEN}  ✅ PostgreSQL instalado${NC}"

    up)        

        echo -e "\n${CYAN}Iniciando containers...${NC}\n"        # Configurar senha do postgres

        cd ..        echo -e "${CYAN}  🔧 Configurando senha do usuário postgres...${NC}"

        docker-compose up -d        sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

        echo -e "\n${GREEN}Containers rodando!${NC}"        

        echo "Backend:  http://localhost:3001"        # Permitir conexões locais

        echo "Frontend: http://localhost:3000"        PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)

        echo ""        PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

        ;;        

            if [ -f "$PG_HBA" ]; then

    down)            sudo sed -i 's/peer/trust/g' "$PG_HBA"

        echo -e "\n${YELLOW}Parando containers...${NC}\n"            sudo sed -i 's/ident/md5/g' "$PG_HBA"

        cd ..            sudo systemctl restart postgresql

        docker-compose down            echo -e "${GREEN}  ✅ PostgreSQL configurado${NC}"

        echo -e "${GREEN}Containers parados${NC}\n"        fi

        ;;    fi

        

    logs)    # Criar database

        echo -e "\n${CYAN}Logs (Ctrl+C para sair)...${NC}\n"    echo -e "${CYAN}  🔧 Criando database...${NC}"

        cd ..    export PGPASSWORD=postgres

        docker-compose logs -f    if psql -U postgres -h $DB_HOST -lqt | cut -d \| -f 1 | grep -qw encantar; then

        ;;        echo -e "${CYAN}  ℹ️  Database 'encantar' já existe${NC}"

        else

    restart)        psql -U postgres -h $DB_HOST -c "CREATE DATABASE encantar;"

        echo -e "\n${YELLOW}Reiniciando...${NC}\n"        echo -e "${GREEN}  ✅ Database 'encantar' criada${NC}"

        cd ..    fi

        docker-compose restartfi

        echo -e "${GREEN}Containers reiniciados${NC}\n"

        ;;# ==========================================

    # 3. Configurar .env

    build)# ==========================================

        echo -e "\n${CYAN}Rebuild completo...${NC}\n"echo -e "\n${YELLOW}[3/6] Configurando variáveis de ambiente...${NC}"

        cd ..

        docker-compose downENV_PATH=".env"

        docker-compose build --no-cache

        docker-compose up -dif [ -f "$ENV_PATH" ]; then

        echo -e "\n${GREEN}Rebuild concluido!${NC}\n"    echo -e "${CYAN}  ℹ️  Arquivo .env já existe${NC}"

        ;;    read -p "  Sobrescrever? (s/N): " OVERWRITE

        if [ "$OVERWRITE" != "s" ] && [ "$OVERWRITE" != "S" ]; then

    status)        echo -e "${YELLOW}  ⏭️  Mantendo .env atual${NC}"

        echo -e "\n${CYAN}Status:${NC}\n"        goto_skip_env=true

        cd ..    fi

        docker-compose psfi

        echo ""

        ;;if [ -z "$goto_skip_env" ]; then

        # Gerar secrets

    prod-up)    echo -e "${CYAN}  🔐 Gerando secrets...${NC}"

        echo -e "\n${CYAN}Iniciando PRODUCAO...${NC}\n"    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

        cd ..    JWT_REFRESH=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

        docker-compose -f docker-compose.prod.yml up -d    

        echo -e "\n${GREEN}Producao rodando!${NC}\n"    # Determinar configuração baseado no modo

        ;;    if [ "$MODE" = "prod" ]; then

            NODE_ENV="production"

    prod-down)        LOG_LEVEL="info"

        echo -e "\n${YELLOW}Parando producao...${NC}\n"        ENABLE_SEED="false"

        cd ..        FRONTEND_URL="http://${DB_HOST}:3000"

        docker-compose -f docker-compose.prod.yml down        API_URL="http://${DB_HOST}:3001/api"

        echo -e "${GREEN}Producao parada${NC}\n"    else

        ;;        NODE_ENV="development"

            LOG_LEVEL="debug"

    prod-logs)        ENABLE_SEED="true"

        echo -e "\n${CYAN}Logs producao (Ctrl+C para sair)...${NC}\n"        FRONTEND_URL="http://localhost:3000"

        cd ..        API_URL="http://localhost:3001/api"

        docker-compose -f docker-compose.prod.yml logs -f    fi

        ;;    

        # Criar .env

    prod-build)    cat > $ENV_PATH << EOF

        echo -e "\n${CYAN}Rebuild producao...${NC}\n"# ==================== BANCO DE DADOS ====================

        cd ..# PostgreSQL na máquina host (não em Docker)

        docker-compose -f docker-compose.prod.yml downDATABASE_URL="postgresql://postgres:postgres@${DB_HOST}:5432/encantar"

        docker-compose -f docker-compose.prod.yml build --no-cacheDB_USER="postgres"

        docker-compose -f docker-compose.prod.yml up -dDB_PASSWORD="postgres"

        echo -e "\n${GREEN}Rebuild producao concluido!${NC}\n"

        ;;# ==================== JWT ====================

    JWT_SECRET="$JWT_SECRET"

    setup)JWT_REFRESH_SECRET="$JWT_REFRESH"

        echo -e "\n${CYAN}SETUP COMPLETO${NC}\n"JWT_EXPIRES_IN="15m"

        cd ..JWT_REFRESH_EXPIRES_IN="7d"

        

        # 1. Verificar requisitos# ==================== SERVIDOR ====================

        echo -e "${YELLOW}[1/6] Verificando requisitos...${NC}"PORT=3001

        NODE_ENV="$NODE_ENV"

        # Node.jsLOG_LEVEL="$LOG_LEVEL"

        if command -v node &>/dev/null; then

            echo -e "${GREEN}  [OK] Node.js: $(node --version)${NC}"# ==================== FRONTEND ====================

        elseFRONTEND_URL="$FRONTEND_URL"

            echo -e "${RED}  [ERRO] Node.js nao encontrado!${NC}"NEXT_PUBLIC_API_URL="$API_URL"

            echo -e "${YELLOW}  Instale: https://nodejs.org${NC}"

            exit 1# ==================== SEEDING ====================

        fiENABLE_SEED="$ENABLE_SEED"

        EOF

        # Docker    

        if check_docker; then    echo -e "${GREEN}  ✅ Arquivo .env criado${NC}"

            echo -e "${GREEN}  [OK] Docker: $(docker --version)${NC}"fi

        else

            echo -e "${RED}  [ERRO] Docker nao encontrado!${NC}"# ==========================================

            echo -e "${YELLOW}  Instale: https://docs.docker.com/engine/install/${NC}"# 4. Instalar Dependências

            exit 1# ==========================================

        fiecho -e "\n${YELLOW}[4/6] Instalando dependências...${NC}"

        

        # Docker Composeecho -e "${CYAN}  📦 Backend...${NC}"

        if command -v docker-compose &>/dev/null; thencd backend

            echo -e "${GREEN}  [OK] Docker Compose: $(docker-compose --version)${NC}"npm install

        elseecho -e "${GREEN}  ✅ Backend OK${NC}"

            echo -e "${RED}  [ERRO] Docker Compose nao encontrado!${NC}"cd ..

            exit 1

        fiecho -e "${CYAN}  📦 Frontend...${NC}"

        cd frontend

        # 2. PostgreSQLnpm install

        echo -e "\n${YELLOW}[2/6] Verificando PostgreSQL...${NC}"echo -e "${GREEN}  ✅ Frontend OK${NC}"

        cd ..

        PG_INSTALLED=false

        if check_postgresql; then# ==========================================

            PG_INSTALLED=true# 5. Configurar Banco de Dados

            echo -e "${GREEN}  [OK] PostgreSQL instalado${NC}"# ==========================================

            echo -e "\n${YELLOW}[5/6] Configurando banco de dados...${NC}"

            if check_postgresql_service; then

                echo -e "${GREEN}  [OK] PostgreSQL rodando${NC}"if command -v psql &> /dev/null; then

            else    cd backend

                echo -e "${YELLOW}  [AVISO] PostgreSQL parado${NC}"    

                echo -e "${CYAN}  Iniciando: sudo systemctl start postgresql${NC}"    echo -e "${CYAN}  🔧 Gerando Prisma Client...${NC}"

            fi    npx prisma generate

        else    

            echo -e "${YELLOW}  [AVISO] PostgreSQL nao encontrado!${NC}"    echo -e "${CYAN}  🔄 Executando migrations...${NC}"

            echo -e "\n${CYAN}  OPCOES:${NC}"    npx prisma migrate deploy

            echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"    

            echo "  CentOS/RHEL:   sudo yum install postgresql-server"    if [ "$ENABLE_SEED" = "true" ]; then

            echo "  macOS:         brew install postgresql"        echo -e "${CYAN}  🌱 Populando banco...${NC}"

            echo ""        npm run prisma:seed || true

                fi

            read -p "  Instalar PostgreSQL agora? (s/N) " -n 1 -r    

            echo ""    echo -e "${GREEN}  ✅ Banco configurado${NC}"

            if [[ $REPLY =~ ^[Ss]$ ]]; then    cd ..

                if command -v apt &>/dev/null; thenelse

                    echo -e "${CYAN}  Instalando PostgreSQL...${NC}"    echo -e "${YELLOW}  ⏭️  PostgreSQL não disponível, pulando configuração${NC}"

                    sudo apt updatefi

                    sudo apt install -y postgresql postgresql-contrib

                    sudo systemctl start postgresql# ==========================================

                    echo -e "${GREEN}  Instalado!${NC}"# 6. Build Docker

                    PG_INSTALLED=true# ==========================================

                elseecho -e "\n${YELLOW}[6/6] Construindo imagens Docker...${NC}"

                    echo -e "${RED}  Sistema nao suportado para instalacao automatica${NC}"

                fiif [ "$MODE" = "prod" ]; then

            fi    echo -e "${CYAN}  🔨 Build produção...${NC}"

                docker-compose -f docker-compose.prod.yml build

            if [ "$PG_INSTALLED" = false ]; then    echo -e "${GREEN}  ✅ Imagens de produção prontas${NC}"

                read -p "  Continuar sem PostgreSQL? (s/N) " -n 1 -relse

                echo ""    echo -e "${CYAN}  🔨 Build desenvolvimento...${NC}"

                if [[ ! $REPLY =~ ^[Ss]$ ]]; then    docker-compose build

                    exit 1    echo -e "${GREEN}  ✅ Imagens de desenvolvimento prontas${NC}"

                fifi

            fi

        fi# ==========================================

        # Finalização

        # 3. Configurar .env# ==========================================

        echo -e "\n${YELLOW}[3/6] Configurando variaveis...${NC}"echo ""

        echo -e "${GREEN}"

        if [ -f ".env" ]; thencat << "EOF"

            echo -e "${CYAN}  .env ja existe${NC}"╔═══════════════════════════════════════╗

            read -p "  Sobrescrever? (s/N) " -n 1 -r║   ✅ Setup Completo!                 ║

            echo ""╚═══════════════════════════════════════╝

            if [[ ! $REPLY =~ ^[Ss]$ ]]; thenEOF

                echo -e "${YELLOW}  Mantendo .env existente${NC}"echo -e "${NC}"

                ENV_SKIP=true

            fiecho -e "${GREEN}📋 Próximos passos:\n${NC}"

        fi

        if [ "$MODE" = "prod" ]; then

        if [ "$ENV_SKIP" != true ]; then    echo -e "${CYAN}🚀 Iniciar produção:${NC}"

            echo -e "${CYAN}  Gerando secrets...${NC}"    echo -e "   docker-compose -f docker-compose.prod.yml up -d\n"

            JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")    echo -e "${CYAN}📊 Ver logs:${NC}"

            JWT_REFRESH=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")    echo -e "   docker-compose -f docker-compose.prod.yml logs -f\n"

            else

            if [ "$MODE" = "prod" ]; then    echo -e "${CYAN}🚀 Iniciar desenvolvimento:${NC}"

                read -p "  Host PostgreSQL: " DB_HOST    echo -e "   docker-compose up -d\n"

                NODE_ENV="production"    echo -e "${CYAN}📊 Ver logs:${NC}"

                LOG_LEVEL="info"    echo -e "   docker-compose logs -f\n"

                ENABLE_SEED="false"fi

                read -p "  URL Frontend: " FRONTEND_URL

                read -p "  URL API: " API_URLecho -e "${CYAN}🌐 Acessar aplicação:${NC}"

            elseecho -e "   Frontend: $FRONTEND_URL"

                DB_HOST="localhost"echo -e "   Backend:  $API_URL\n"

                NODE_ENV="development"

                LOG_LEVEL="debug"echo -e "${YELLOW}💡 Dica: Use ./scripts/start.sh para gerenciar os containers${NC}"

                ENABLE_SEED="true"
                FRONTEND_URL="http://localhost:3000"
                API_URL="http://localhost:3001/api"
            fi
            
            cat > .env << EOF
# BANCO DE DADOS
DATABASE_URL="postgresql://postgres:postgres@${DB_HOST}:5432/encantar"

# JWT
JWT_SECRET="$JWT_SECRET"
JWT_REFRESH_SECRET="$JWT_REFRESH"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# SERVIDOR
PORT=3001
NODE_ENV="$NODE_ENV"
LOG_LEVEL="$LOG_LEVEL"

# FRONTEND
FRONTEND_URL="$FRONTEND_URL"
NEXT_PUBLIC_API_URL="$API_URL"

# SEEDING
ENABLE_SEED="$ENABLE_SEED"
EOF
            
            echo -e "${GREEN}  .env criado${NC}"
        fi
        
        # 4. Instalar dependencias
        echo -e "\n${YELLOW}[4/6] Instalando dependencias...${NC}"
        
        echo -e "${CYAN}  Backend...${NC}"
        cd backend
        npm install > /dev/null 2>&1
        echo -e "${GREEN}  Backend OK${NC}"
        cd ..
        
        echo -e "${CYAN}  Frontend...${NC}"
        cd frontend
        npm install > /dev/null 2>&1
        echo -e "${GREEN}  Frontend OK${NC}"
        cd ..
        
        # 5. Configurar banco
        echo -e "\n${YELLOW}[5/6] Configurando banco...${NC}"
        
        if [ "$PG_INSTALLED" = true ]; then
            cd backend
            
            echo -e "${CYAN}  Prisma generate...${NC}"
            npx prisma generate > /dev/null 2>&1
            
            echo -e "${CYAN}  Migrations...${NC}"
            npx prisma migrate deploy
            
            if [ "$ENABLE_SEED" = "true" ]; then
                echo -e "${CYAN}  Seed...${NC}"
                npm run prisma:seed
            fi
            
            echo -e "${GREEN}  Banco configurado${NC}"
            cd ..
        else
            echo -e "${YELLOW}  PostgreSQL indisponivel, pulando${NC}"
        fi
        
        # 6. Build Docker
        echo -e "\n${YELLOW}[6/6] Build Docker...${NC}"
        
        if [ "$MODE" = "prod" ]; then
            echo -e "${CYAN}  Producao...${NC}"
            docker-compose -f docker-compose.prod.yml build
            echo -e "${GREEN}  Imagens producao prontas${NC}"
        else
            echo -e "${CYAN}  Desenvolvimento...${NC}"
            docker-compose build
            echo -e "${GREEN}  Imagens dev prontas${NC}"
        fi
        
        # Finalizacao
        echo -e "\n${GREEN}=== SETUP COMPLETO! ===${NC}\n"
        
        if [ "$MODE" = "prod" ]; then
            echo -e "${CYAN}Iniciar: ./scripts/start.sh prod-up${NC}"
            echo -e "${CYAN}Logs:    ./scripts/start.sh prod-logs${NC}"
        else
            echo -e "${CYAN}Iniciar: ./scripts/start.sh up${NC}"
            echo -e "${CYAN}Logs:    ./scripts/start.sh logs${NC}"
        fi
        
        echo -e "\nVer comandos: ./scripts/start.sh help\n"
        ;;
    
    *)
        echo -e "\n${RED}Comando desconhecido: $CMD${NC}"
        echo -e "${YELLOW}Use: ./scripts/start.sh help${NC}\n"
        exit 1
        ;;
esac
