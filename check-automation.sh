#!/bin/bash
# Script de verificação da automação do projeto Encantar

echo "🔍 Verificando automação do Sistema Encantar..."
echo "=============================================="

# Verificar arquivos de automação
echo ""
echo "📁 Arquivos de automação encontrados:"

if [ -f "docker.ps1" ]; then
    echo "✅ docker.ps1 (PowerShell) - $(wc -l < docker.ps1) linhas"
else
    echo "❌ docker.ps1 (PowerShell)"
fi

if [ -f "Makefile" ]; then
    echo "✅ Makefile - $(wc -l < Makefile) linhas"
else
    echo "❌ Makefile"
fi

if [ -f "encantar.sh" ]; then
    echo "✅ encantar.sh (Bash) - $(wc -l < encantar.sh) linhas"
else
    echo "❌ encantar.sh (Bash)"
fi

if [ -f "package.json" ]; then
    echo "✅ package.json (NPM Scripts)"
    scripts_count=$(grep -c '".*":' package.json || echo "0")
    echo "   📋 $scripts_count scripts NPM disponíveis"
else
    echo "❌ package.json (NPM Scripts)"
fi

if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml"
    services_count=$(grep -c 'services:\|^  [a-zA-Z]' docker-compose.yml | head -1)
    echo "   🐳 Configuração Docker Compose pronta"
else
    echo "❌ docker-compose.yml"
fi

if [ -f "EXECUCAO.md" ]; then
    echo "✅ EXECUCAO.md (Documentação)"
    lines_count=$(wc -l < EXECUCAO.md)
    echo "   📖 $lines_count linhas de documentação"
else
    echo "❌ EXECUCAO.md (Documentação)"
fi

# Verificar Docker
echo ""
echo "🐳 Verificando Docker:"
if docker info &>/dev/null; then
    echo "✅ Docker está rodando"
    docker_version=$(docker --version)
    echo "   🔧 $docker_version"
    
    if docker-compose --version &>/dev/null; then
        compose_version=$(docker-compose --version)
        echo "   🔧 $compose_version"
    fi
else
    echo "❌ Docker não está rodando"
fi

# Verificar dependências Node.js
echo ""
echo "📦 Verificando dependências:"

if [ -d "backend/node_modules" ]; then
    echo "✅ Backend - dependências instaladas"
else
    echo "⚠️ Backend - dependências não instaladas"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend - dependências instaladas"
else
    echo "⚠️ Frontend - dependências não instaladas"
fi

if [ -f "node_modules/.package-lock.json" ] || [ -d "node_modules" ]; then
    echo "✅ Root - dependências instaladas"
else
    echo "⚠️ Root - dependências não instaladas (npm install)"
fi

# Verificar estrutura do projeto
echo ""
echo "🏗️ Estrutura do projeto:"

required_dirs=("backend" "frontend" "backend/src" "frontend/src" "backend/prisma")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/"
    else
        echo "❌ $dir/"
    fi
done

# Mostrar comandos disponíveis
echo ""
echo "🚀 Comandos de automação disponíveis:"
echo ""
echo "PowerShell (Windows):"
echo "  .\docker.ps1 setup      # Configuração inicial"
echo "  .\docker.ps1 start      # Iniciar sistema"
echo "  .\docker.ps1 status     # Ver status"
echo ""
echo "Makefile (Linux/macOS/Git Bash):"
echo "  make setup              # Configuração inicial"
echo "  make start              # Iniciar sistema"
echo "  make status             # Ver status"
echo ""
echo "NPM Scripts (Multiplataforma):"
echo "  npm run setup           # Configuração inicial"
echo "  npm run docker:start    # Iniciar sistema"
echo "  npm run docker:status   # Ver status"
echo ""
echo "🌐 URLs do sistema:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/health"

echo ""
echo "🎯 Para executar agora:"
echo "================================"
echo "1. make setup && make start"
echo "2. .\docker.ps1 setup; .\docker.ps1 start"
echo "3. npm run setup && npm run docker:start"
echo "================================"