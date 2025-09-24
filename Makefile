# Makefile para automação do projeto Encantar
# Compatible with Windows (Git Bash/MSYS2), Linux and macOS

.PHONY: help setup start stop restart reset clean dev logs status health install

# Colors for output
CYAN    = \033[36m
GREEN   = \033[32m
YELLOW  = \033[33m
RED     = \033[31m
RESET   = \033[0m

# Default target
help: ## 📋 Mostra esta ajuda
	@echo "$(CYAN)🚀 Sistema de Automação Encantar$(RESET)"
	@echo "=================================="
	@echo ""
	@echo "$(GREEN)COMANDOS PRINCIPAIS:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(CYAN)%-12s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST) | grep -E "(setup|start|dev|stop)"
	@echo ""
	@echo "$(GREEN)MONITORAMENTO:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(CYAN)%-12s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST) | grep -E "(status|logs|health)"
	@echo ""
	@echo "$(GREEN)MANUTENÇÃO:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(CYAN)%-12s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST) | grep -E "(restart|reset|clean|install)"
	@echo ""
	@echo "$(YELLOW)URLs do Sistema:$(RESET)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:3001"
	@echo "  Health:   http://localhost:3001/health"

setup: ## ⚙️ Configuração inicial completa
	@echo "$(GREEN)⚙️ Configuração inicial do projeto...$(RESET)"
	@if ! docker info >/dev/null 2>&1; then \
		echo "$(RED)❌ Docker não está rodando!$(RESET)"; \
		exit 1; \
	fi
	@echo "📦 Instalando dependências do backend..."
	@cd backend && npm install
	@echo "📦 Instalando dependências do frontend..."
	@cd frontend && npm install
	@echo "🐳 Validando configuração Docker..."
	@docker-compose config >/dev/null
	@echo "$(GREEN)✅ Configuração inicial concluída!$(RESET)"

start: ## 🚀 Inicia todo o sistema (automático)
	@echo "$(GREEN)🚀 Iniciando Sistema Encantar completo...$(RESET)"
	@docker-compose down -v >/dev/null 2>&1 || true
	@echo "🔨 Construindo imagens..."
	@docker-compose build
	@echo "🌟 Iniciando todos os serviços..."
	@docker-compose up -d
	@echo "⏳ Aguardando serviços iniciarem..."
	@sleep 10
	@echo "$(GREEN)✅ Sistema iniciado com sucesso!$(RESET)"
	@make status

dev: ## 💻 Modo desenvolvimento local
	@echo "$(YELLOW)💻 Configurando modo desenvolvimento...$(RESET)"
	@docker-compose down >/dev/null 2>&1 || true
	@echo "🗄️ Iniciando apenas PostgreSQL..."
	@docker-compose up -d postgres
	@echo "⏳ Aguardando PostgreSQL..."
	@sleep 5
	@echo "🔧 Configurando backend..."
	@cd backend && npm install && npx prisma migrate deploy && npm run prisma:seed
	@echo "🔧 Configurando frontend..."
	@cd frontend && npm install
	@echo "$(GREEN)✅ Desenvolvimento configurado!$(RESET)"
	@echo "$(YELLOW)Execute manualmente:$(RESET)"
	@echo "  Terminal 1: cd backend && npm run dev"
	@echo "  Terminal 2: cd frontend && npm run dev"

stop: ## 🛑 Para todos os serviços
	@echo "$(YELLOW)🛑 Parando todos os serviços...$(RESET)"
	@docker-compose down
	@echo "$(GREEN)✅ Serviços parados!$(RESET)"

restart: ## 🔄 Reinicia sistema
	@echo "$(YELLOW)🔄 Reiniciando sistema...$(RESET)"
	@docker-compose restart
	@echo "$(GREEN)✅ Sistema reiniciado!$(RESET)"

reset: ## 🔄 Reset completo do banco
	@echo "$(RED)🔄 Reset completo do banco de dados...$(RESET)"
	@docker-compose down -v
	@sleep 2
	@docker-compose up -d postgres
	@sleep 10
	@docker-compose up -d backend
	@sleep 5
	@docker-compose up -d frontend
	@echo "$(GREEN)✅ Reset completo realizado!$(RESET)"

clean: ## 🧹 Limpa containers e volumes
	@echo "$(RED)🧹 Limpando sistema completo...$(RESET)"
	@docker-compose down -v --remove-orphans
	@docker system prune -f
	@echo "$(GREEN)✅ Sistema limpo!$(RESET)"

status: ## 📊 Status dos serviços
	@echo "$(CYAN)📊 Status do sistema:$(RESET)"
	@docker-compose ps
	@echo ""
	@echo "$(CYAN)💾 Volumes:$(RESET)"
	@docker volume ls | grep encantar || echo "Nenhum volume encontrado"

logs: ## 📋 Ver logs de todos serviços
	@echo "$(CYAN)📋 Logs do sistema:$(RESET)"
	@docker-compose logs -f --tail=50

logs-backend: ## 📋 Ver logs do backend
	@docker-compose logs -f --tail=50 backend

logs-frontend: ## 📋 Ver logs do frontend
	@docker-compose logs -f --tail=50 frontend

logs-db: ## 📋 Ver logs do banco
	@docker-compose logs -f --tail=50 postgres

health: ## 🏥 Verifica saúde dos serviços
	@echo "$(CYAN)🏥 Verificando saúde dos serviços:$(RESET)"
	@echo "Backend Health:"
	@curl -s http://localhost:3001/health 2>/dev/null || echo "❌ Backend indisponível"
	@echo ""
	@echo "Frontend:"
	@curl -s -I http://localhost:3000 2>/dev/null | head -1 || echo "❌ Frontend indisponível"

install: ## 📦 Instala dependências
	@echo "$(CYAN)📦 Instalando dependências...$(RESET)"
	@cd backend && npm install
	@cd frontend && npm install
	@echo "$(GREEN)✅ Dependências instaladas!$(RESET)"

update: ## 🔄 Atualiza dependências
	@echo "$(CYAN)🔄 Atualizando dependências...$(RESET)"
	@cd backend && npm update && npx prisma generate
	@cd frontend && npm update
	@echo "$(GREEN)✅ Dependências atualizadas!$(RESET)"

# Shortcuts
up: start ## 🚀 Alias para start
down: stop ## 🛑 Alias para stop
build: ## 🔨 Reconstrói imagens
	@docker-compose build

shell-backend: ## 🐚 Shell no container backend
	@docker-compose exec backend sh

shell-frontend: ## 🐚 Shell no container frontend
	@docker-compose exec frontend sh

shell-db: ## 🐚 Shell no container PostgreSQL
	@docker-compose exec postgres psql -U postgres -d encantar