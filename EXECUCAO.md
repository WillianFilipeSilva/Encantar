# 🚀 Guia de Execução e Automação - Sistema Encantar

## 📋 Visão Geral

Este documento apresenta **todas as formas** de executar o projeto Encantar, desde configuração manual até automação completa com um único comando.

## 🎯 Métodos de Execução

### 1. 🚀 **AUTOMAÇÃO COMPLETA (Recomendado)**

#### A. PowerShell Script (Windows)
```powershell
# Configuração inicial (apenas primeira vez)
.\docker.ps1 setup

# Iniciar sistema completo
.\docker.ps1 start

# Outros comandos úteis
.\docker.ps1 status      # Ver status
.\docker.ps1 logs        # Ver logs
.\docker.ps1 stop        # Parar sistema
.\docker.ps1 reset       # Reset completo
```

#### B. Makefile (Multiplataforma)
```bash
# Configuração inicial
make setup

# Iniciar sistema completo
make start

# Outros comandos
make status       # Status dos serviços
make logs         # Ver todos os logs
make dev         # Modo desenvolvimento
make clean       # Limpeza completa
```

#### C. Bash Script (Linux/macOS/Git Bash)
```bash
# Dar permissão de execução
chmod +x encantar.sh

# Configuração inicial
./encantar.sh setup

# Iniciar sistema
./encantar.sh start

# Ver ajuda completa
./encantar.sh help
```

#### D. NPM Scripts (Multiplataforma)
```bash
# Instalar concurrently globalmente
npm install

# Configuração inicial
npm run setup

# Iniciar com Docker
npm run docker:start

# Modo desenvolvimento local
npm run dev

# Ver status
npm run docker:status
```

---

### 2. 🐳 **Docker Compose Manual**

```bash
# Configuração inicial
docker-compose down -v
docker-compose build
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

### 3. 💻 **Desenvolvimento Local (Sem Docker)**

#### Pré-requisitos
- PostgreSQL rodando localmente (porta 5432)
- Node.js 18+
- NPM ou Yarn

#### Configuração
```bash
# 1. Configurar banco local
createdb encantar

# 2. Backend
cd backend
npm install
cp .env.example .env
# Editar .env com dados do banco local
npx prisma migrate deploy
npm run prisma:seed
npm run dev

# 3. Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

---

## 🛠️ Automação Disponível

### 📊 Comparativo dos Métodos

| Método | Configuração | Execução | Manutenção | Recomendado |
|--------|-------------|----------|------------|-------------|
| **PowerShell Script** | `.\docker.ps1 setup` | `.\docker.ps1 start` | Automática | ✅ Windows |
| **Makefile** | `make setup` | `make start` | Automática | ✅ Linux/macOS |
| **Bash Script** | `./encantar.sh setup` | `./encantar.sh start` | Automática | ✅ Multiplataforma |
| **NPM Scripts** | `npm run setup` | `npm run docker:start` | Automática | ✅ Node.js |
| **Docker Compose** | Manual | `docker-compose up -d` | Manual | ⚠️ Intermediário |
| **Local Dev** | Manual | Manual | Manual | 🚫 Só desenvolvimento |

### 🎛️ Comandos de Automação Completos

#### PowerShell (Windows)
```powershell
# Comandos principais
.\docker.ps1 setup      # Configuração inicial
.\docker.ps1 start      # Iniciar tudo
.\docker.ps1 dev        # Modo desenvolvimento
.\docker.ps1 stop       # Parar serviços
.\docker.ps1 restart    # Reiniciar
.\docker.ps1 reset      # Reset completo

# Monitoramento
.\docker.ps1 status     # Status serviços
.\docker.ps1 logs       # Todos os logs
.\docker.ps1 logs -Service backend  # Logs específicos

# Manutenção
.\docker.ps1 clean      # Limpeza completa
.\docker.ps1 update     # Atualizar deps
```

#### Makefile (Linux/macOS/Git Bash)
```bash
# Comandos principais
make setup         # Configuração inicial
make start         # Iniciar sistema
make dev          # Modo desenvolvimento
make stop         # Parar serviços
make restart      # Reiniciar
make reset        # Reset completo

# Monitoramento
make status       # Status serviços
make logs         # Todos os logs
make logs-backend # Logs do backend
make health       # Check de saúde

# Manutenção  
make clean        # Limpeza completa
make update       # Atualizar dependências

# Shells
make shell-backend   # Acessar container backend
make shell-frontend  # Acessar container frontend
make shell-db        # Acessar PostgreSQL
```

#### NPM Scripts
```bash
# Comandos principais
npm run setup           # Configuração inicial
npm run docker:start    # Iniciar com Docker
npm run dev            # Desenvolvimento local
npm run docker:stop     # Parar Docker

# Monitoramento
npm run docker:status   # Status containers
npm run docker:logs     # Ver logs
npm run health         # Check endpoints

# Manutenção
npm run docker:clean    # Limpeza Docker
npm run update:all     # Atualizar deps

# Build
npm run build          # Build completo
npm run lint           # Lint completo
npm run test           # Testes completos
```

---

## ⚡ Quick Start (1 Comando)

### Windows (PowerShell)
```powershell
# Execução completa em 1 comando
.\docker.ps1 setup; .\docker.ps1 start
```

### Linux/macOS
```bash
# Execução completa em 1 comando
make setup && make start
```

### Multiplataforma (NPM)
```bash
# Execução completa em 1 comando
npm run setup && npm run docker:start
```

---

## 🔄 Fluxos de Trabalho

### 🚀 **Primeira Execução**
```bash
# 1. Clone do repositório
git clone <repo-url>
cd Encantar

# 2. Escolha seu método (exemplo: Makefile)
make setup     # Instala dependências + valida Docker
make start     # Inicia sistema completo

# 3. Acesse as URLs
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Health: http://localhost:3001/health
```

### 💻 **Desenvolvimento Diário**
```bash
# Opção 1: Docker completo (recomendado)
make start

# Opção 2: Desenvolvimento local
make dev       # Só PostgreSQL no Docker
# Depois rodar manualmente backend e frontend

# Opção 3: Reset quando necessário
make reset     # Reset completo do banco
```

### 🛠️ **Manutenção**
```bash
# Ver status
make status

# Ver logs
make logs
make logs-backend

# Limpeza
make clean

# Atualização
make update
```

---

## 🎯 **Recomendações por Plataforma**

### 🪟 **Windows**
1. **PowerShell Script** (`.\docker.ps1`) - Nativo e otimizado
2. **Makefile** com Git Bash - Compatível
3. **NPM Scripts** - Multiplataforma

### 🐧 **Linux**
1. **Makefile** - Padrão Unix
2. **Bash Script** (`./encantar.sh`) - Nativo
3. **NPM Scripts** - Multiplataforma

### 🍎 **macOS**
1. **Makefile** - Padrão Unix
2. **Bash Script** (`./encantar.sh`) - Nativo
3. **NPM Scripts** - Multiplataforma

---

## 🚨 **Troubleshooting**

### Problemas Comuns

1. **Docker não está rodando**
   ```bash
   # Verificar
   docker info
   
   # Solução: Iniciar Docker Desktop
   ```

2. **Porta já em uso**
   ```bash
   # Verificar processo
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   
   # Parar containers
   make stop
   ```

3. **Banco com dados antigos**
   ```bash
   # Reset completo
   make reset
   ```

4. **Dependências desatualizadas**
   ```bash
   # Atualizar
   make update
   ```

---

## 📈 **Níveis de Automação**

### 🥉 **Básico** - Docker Compose Manual
- Comando: `docker-compose up -d`
- Automação: 30%
- Configuração manual necessária

### 🥈 **Intermediário** - NPM Scripts
- Comando: `npm run docker:start`
- Automação: 70%
- Alguns passos manuais

### 🥇 **Avançado** - Scripts Dedicados
- Comando: `make start` ou `.\docker.ps1 start`
- Automação: 95%
- Quase zero configuração manual

### 🏆 **Expert** - One-Liner
- Comando: `make setup && make start`
- Automação: 100%
- Zero intervenção manual

---

## 🎉 **Conclusão**

O projeto oferece **máxima flexibilidade** de execução:

- ✅ **1 comando** para execução completa
- ✅ **Automação total** da configuração
- ✅ **Multiplataforma** (Windows/Linux/macOS)
- ✅ **Zero configuração manual** necessária
- ✅ **Monitoramento automatizado**
- ✅ **Manutenção simplificada**

**Escolha o método que melhor se adapta ao seu ambiente e fluxo de trabalho!**