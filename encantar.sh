#!/bin/bash
# Script Bash para automação completa do projeto Encantar

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para exibir status com cores
status() {
    case $2 in
        "success") echo -e "${GREEN}✅ $1${NC}" ;;
        "error") echo -e "${RED}❌ $1${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️ $1${NC}" ;;
        "info") echo -e "${CYAN}ℹ️ $1${NC}" ;;
        *) echo -e "${BLUE}📋 $1${NC}" ;;
    esac
}

# Verificar se Docker está rodando
check_docker() {
    if ! docker info &>/dev/null; then
        status "Docker não está rodando. Inicie o Docker primeiro." "error"
        exit 1
    fi
}

# Função para mostrar ajuda
show_help() {
    echo -e "${CYAN}🚀 Sistema de Automação Encantar${NC}"
    echo "=================================="
    echo ""
    echo -e "${GREEN}COMANDOS PRINCIPAIS:${NC}"
    echo "  setup     - Configuração inicial do projeto"
    echo "  start     - Inicia todo o sistema (automático)"
    echo "  dev       - Modo desenvolvimento local"
    echo "  stop      - Para todos os serviços"
    echo "  restart   - Reinicia sistema"
    echo "  reset     - Reset completo do banco"
    echo ""
    echo -e "${GREEN}MONITORAMENTO:${NC}"
    echo "  status    - Status dos serviços"
    echo "  logs      - Ver logs [serviço]"
    echo "  health    - Verifica saúde dos serviços"
    echo ""
    echo -e "${GREEN}MANUTENÇÃO:${NC}"
    echo "  clean     - Limpa containers e volumes"
    echo "  update    - Atualiza dependências"
    echo "  shell     - Acessa shell do container [serviço]"
    echo ""
    echo -e "${YELLOW}EXEMPLOS:${NC}"
    echo "  ./encantar.sh setup"
    echo "  ./encantar.sh start"
    echo "  ./encantar.sh logs backend"
    echo "  ./encantar.sh shell backend"
    echo ""
    echo -e "${YELLOW}URLs do Sistema:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001"
    echo "  Health:   http://localhost:3001/health"
}

case "${1:-help}" in
    setup)
        status "⚙️ Configuração inicial do projeto..." "info"
        check_docker
        
        status "📦 Instalando dependências do backend..." "info"
        cd backend && npm install
        
        status "📦 Instalando dependências do frontend..." "info"
        cd ../frontend && npm install && cd ..
        
        status "🐳 Testando Docker Compose..." "info"
        docker-compose config > /dev/null
        
        status "Configuração inicial concluída!" "success"
        status "Use: ./encantar.sh start" "info"
        ;;
        
    start)
        status "🚀 Iniciando Sistema Encantar completo..." "info"
        check_docker
        
        status "📦 Parando containers antigos..." "info"
        docker-compose down -v &>/dev/null || true
        
        status "🔨 Construindo imagens..." "info"
        docker-compose build
        
        status "🌟 Iniciando todos os serviços..." "info"
        docker-compose up -d
        
        status "⏳ Aguardando serviços iniciarem..." "info"
        sleep 10
        
        status "📊 Status dos serviços:" "info"
        docker-compose ps
        
        status "Sistema iniciado com sucesso!" "success"
        status "Frontend: http://localhost:3000" "info"
        status "Backend: http://localhost:3001/health" "info"
        ;;
        
    dev)
        status "💻 Modo desenvolvimento local..." "info"
        check_docker
        
        status "🔄 Parando containers se existirem..." "info"
        docker-compose down &>/dev/null || true
        
        status "🗄️ Iniciando apenas PostgreSQL..." "info"
        docker-compose up -d postgres
        
        status "⏳ Aguardando PostgreSQL..." "info"
        sleep 5
        
        status "🔧 Configurando backend..." "info"
        cd backend
        npm install
        npx prisma migrate deploy
        npm run prisma:seed
        
        status "🔧 Configurando frontend..." "info"
        cd ../frontend
        npm install
        cd ..
        
        status "Desenvolvimento configurado!" "success"
        status "Execute manualmente:" "info"
        status "Terminal 1: cd backend && npm run dev" "info"
        status "Terminal 2: cd frontend && npm run dev" "info"
        ;;
        
    stop)
        status "🛑 Parando todos os serviços..." "warning"
        docker-compose down
        status "Serviços parados!" "success"
        ;;
        
    restart)
        status "🔄 Reiniciando sistema..." "info"
        docker-compose restart
        status "Sistema reiniciado!" "success"
        ;;
        
    reset)
        status "🔄 Reset completo do banco de dados..." "warning"
        docker-compose down -v
        sleep 2
        docker-compose up -d postgres
        sleep 10
        docker-compose up -d backend
        sleep 5
        docker-compose up -d frontend
        status "Reset completo realizado!" "success"
        ;;
        
    clean)
        status "🧹 Limpando sistema completo..." "warning"
        docker-compose down -v --remove-orphans
        docker system prune -f
        status "Sistema limpo!" "success"
        ;;
        
    status)
        status "📊 Status do sistema:" "info"
        docker-compose ps
        echo ""
        status "💾 Uso de volumes:" "info"
        docker volume ls | grep encantar || echo "Nenhum volume encontrado"
        ;;
        
    logs)
        service=${2:-""}
        if [[ -z "$service" ]]; then
            status "📋 Mostrando logs de todos os serviços..." "info"
            docker-compose logs -f --tail=50
        else
            status "📋 Mostrando logs do serviço: $service" "info"
            docker-compose logs -f --tail=50 "$service"
        fi
        ;;
        
    health)
        status "🏥 Verificando saúde dos serviços:" "info"
        echo "Backend Health:"
        curl -s http://localhost:3001/health 2>/dev/null || echo "❌ Backend indisponível"
        echo ""
        echo "Frontend:"
        curl -s -I http://localhost:3000 2>/dev/null | head -1 || echo "❌ Frontend indisponível"
        ;;
        
    shell)
        service=${2:-""}
        if [[ -z "$service" ]]; then
            status "❌ Especifique o serviço: backend, frontend ou postgres" "error"
            exit 1
        fi
        status "🐚 Abrindo shell no container: $service" "info"
        docker-compose exec "$service" sh
        ;;
        
    update)
        status "🔄 Atualizando dependências..." "info"
        
        cd backend
        npm update
        npx prisma generate
        
        cd ../frontend
        npm update
        cd ..
        
        status "Dependências atualizadas!" "success"
        ;;
        
    help|*)
        show_help
        ;;
esac