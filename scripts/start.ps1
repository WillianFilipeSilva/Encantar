# ==========================================
# ENCANTAR - Script de Gerenciamento
# Sistema: Windows (PowerShell)
# ==========================================

param(
    [string]$cmd = "help",
    [string]$mode = "dev"
)

$ErrorActionPreference = "Stop"

# Mudar para raiz do projeto
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "`n=== ENCANTAR - Gerenciamento ===`n" -ForegroundColor Cyan

# Funcoes auxiliares
function Test-Docker {
    try {
        docker info 2>&1 | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Comandos
switch ($cmd) {
    "help" {
        Write-Host "COMANDOS DISPONIVEIS:`n" -ForegroundColor Yellow
        Write-Host "  up            Iniciar containers dev"
        Write-Host "  down          Parar containers"
        Write-Host "  logs          Ver logs"
        Write-Host "  restart       Reiniciar containers"
        Write-Host "  build         Rebuild completo"
        Write-Host "  status        Status dos containers"
        Write-Host ""
        Write-Host "  check         Verificar requisitos"
        Write-Host ""
        exit 0
    }
    
    "up" {
        Write-Host "Iniciando containers...`n" -ForegroundColor Cyan
        docker compose up -d
        Write-Host "`nContainers rodando!" -ForegroundColor Green
        Write-Host "Backend:  http://localhost:3001"
        Write-Host "Frontend: http://localhost:3000`n"
        exit 0
    }
    
    "down" {
        Write-Host "Parando containers...`n" -ForegroundColor Yellow
        docker compose down
        Write-Host "Containers parados`n" -ForegroundColor Green
        exit 0
    }
    
    "logs" {
        Write-Host "Logs (Ctrl+C para sair)...`n" -ForegroundColor Cyan
        docker compose logs -f
        exit 0
    }
    
    "restart" {
        Write-Host "Reiniciando...`n" -ForegroundColor Yellow
        docker compose restart
        Write-Host "Containers reiniciados`n" -ForegroundColor Green
        exit 0
    }
    
    "build" {
        Write-Host "Rebuild completo...`n" -ForegroundColor Cyan
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        Write-Host "`nRebuild concluido!`n" -ForegroundColor Green
        exit 0
    }
    
    "status" {
        Write-Host "Status:`n" -ForegroundColor Cyan
        docker compose ps
        Write-Host ""
        exit 0
    }
    
    "check" {
        Write-Host "VERIFICANDO SISTEMA...`n" -ForegroundColor Yellow
        
        if (Get-Command node -ErrorAction SilentlyContinue) {
            Write-Host " Node.js: $(node --version)" -ForegroundColor Green
        } else {
            Write-Host " Node.js não encontrado" -ForegroundColor Red
        }
        
        if (Test-Docker) {
            Write-Host " Docker: $(docker --version)" -ForegroundColor Green
        } else {
            Write-Host " Docker não está rodando" -ForegroundColor Red
        }
        
        if (Test-Path ".env") {
            Write-Host " Arquivo .env configurado`n" -ForegroundColor Green
        } else {
            Write-Host "  Arquivo .env não encontrado`n" -ForegroundColor Yellow
        }
        exit 0
    }
    
    default {
        Write-Host "Comando desconhecido: $cmd" -ForegroundColor Red
        Write-Host "Use: .\scripts\start.ps1 help`n" -ForegroundColor Yellow
        exit 1
    }
}
