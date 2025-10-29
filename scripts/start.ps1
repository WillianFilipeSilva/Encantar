# ========================================== 
# ENCANTAR - Script Unificado Windows
# ==========================================

param(
    [string]$cmd = "help",
    [string]$mode = "dev"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== ENCANTAR - Gerenciamento ===" -ForegroundColor Cyan

# Funcoes auxiliares
function Test-Docker {
    try { docker info 2>&1 | Out-Null; return $true } catch { return $false }
}

function Test-PostgreSQL {
    return (Get-Command psql -ErrorAction SilentlyContinue) -ne $null
}

function Test-PostgreSQLService {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    return ($pgService -and $pgService.Status -eq "Running")
}

# Comandos
switch ($cmd) {
    "help" {
        Write-Host "`nCOMANDOS DISPONIVEIS:" -ForegroundColor Yellow
        Write-Host "  setup         Setup inicial completo" -ForegroundColor White
        Write-Host "  check         Verificar requisitos" -ForegroundColor White
        Write-Host "  up            Iniciar containers dev" -ForegroundColor White
        Write-Host "  down          Parar containers" -ForegroundColor White
        Write-Host "  logs          Ver logs" -ForegroundColor White
        Write-Host "  restart       Reiniciar" -ForegroundColor White
        Write-Host "  build         Rebuild completo" -ForegroundColor White
        Write-Host "  status        Status containers" -ForegroundColor White
        Write-Host "  prod-up       Iniciar producao" -ForegroundColor White
        Write-Host "  prod-down     Parar producao" -ForegroundColor White
        Write-Host "  prod-logs     Ver logs producao" -ForegroundColor White
        Write-Host "  prod-build    Rebuild producao`n" -ForegroundColor White
        exit 0
    }
    
    "check" {
        Write-Host "`nVERIFICANDO SISTEMA...`n" -ForegroundColor Yellow
        $allOk = $true
        
        if (Get-Command node -ErrorAction SilentlyContinue) {
            Write-Host "  [OK] Node.js: $(node --version)" -ForegroundColor Green
        } else {
            Write-Host "  [ERRO] Node.js nao encontrado" -ForegroundColor Red
            $allOk = $false
        }
        
        if (Test-Docker) {
            Write-Host "  [OK] Docker: $(docker --version)" -ForegroundColor Green
        } else {
            Write-Host "  [ERRO] Docker nao esta rodando" -ForegroundColor Red
            $allOk = $false
        }
        
        if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
            Write-Host "  [OK] Docker Compose: $(docker-compose --version)" -ForegroundColor Green
        } else {
            Write-Host "  [ERRO] Docker Compose nao encontrado" -ForegroundColor Red
            $allOk = $false
        }
        
        if (Test-PostgreSQL) {
            Write-Host "  [OK] PostgreSQL instalado" -ForegroundColor Green
            if (Test-PostgreSQLService) {
                Write-Host "  [OK] PostgreSQL rodando" -ForegroundColor Green
            } else {
                Write-Host "  [AVISO] PostgreSQL parado" -ForegroundColor Yellow
                $allOk = $false
            }
        } else {
            Write-Host "  [ERRO] PostgreSQL nao encontrado" -ForegroundColor Red
            $allOk = $false
        }
        
        if (Test-Path "../.env") {
            Write-Host "  [OK] Arquivo .env configurado`n" -ForegroundColor Green
        } else {
            Write-Host "  [AVISO] Arquivo .env nao encontrado`n" -ForegroundColor Yellow
            $allOk = $false
        }
        
        if ($allOk) {
            Write-Host "Sistema pronto! Use: .\start.ps1 up`n" -ForegroundColor Green
        } else {
            Write-Host "Configure pendencias antes de iniciar`n" -ForegroundColor Yellow
        }
        exit 0
    }
    
    "up" {
        Write-Host "`nIniciando containers...`n" -ForegroundColor Cyan
        Set-Location ..
        docker-compose up -d
        Write-Host "`nContainers rodando!" -ForegroundColor Green
        Write-Host "Backend:  http://localhost:3001" -ForegroundColor White
        Write-Host "Frontend: http://localhost:3000`n" -ForegroundColor White
        exit 0
    }
    
    "down" {
        Write-Host "`nParando containers...`n" -ForegroundColor Yellow
        Set-Location ..
        docker-compose down
        Write-Host "Containers parados`n" -ForegroundColor Green
        exit 0
    }
    
    "logs" {
        Write-Host "`nLogs (Ctrl+C para sair)...`n" -ForegroundColor Cyan
        Set-Location ..
        docker-compose logs -f
        exit 0
    }
    
    "restart" {
        Write-Host "`nReiniciando...`n" -ForegroundColor Yellow
        Set-Location ..
        docker-compose restart
        Write-Host "Containers reiniciados`n" -ForegroundColor Green
        exit 0
    }
    
    "build" {
        Write-Host "`nRebuild completo...`n" -ForegroundColor Cyan
        Set-Location ..
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        Write-Host "`nRebuild concluido!`n" -ForegroundColor Green
        exit 0
    }
    
    "status" {
        Write-Host "`nStatus:`n" -ForegroundColor Cyan
        Set-Location ..
        docker-compose ps
        Write-Host ""
        exit 0
    }
    
    "prod-up" {
        Write-Host "`nIniciando PRODUCAO...`n" -ForegroundColor Cyan
        Set-Location ..
        docker-compose -f docker-compose.prod.yml up -d
        Write-Host "`nProducao rodando!`n" -ForegroundColor Green
        exit 0
    }
    
    "prod-down" {
        Write-Host "`nParando producao...`n" -ForegroundColor Yellow
        Set-Location ..
        docker-compose -f docker-compose.prod.yml down
        Write-Host "Producao parada`n" -ForegroundColor Green
        exit 0
    }
    
    "prod-logs" {
        Write-Host "`nLogs producao (Ctrl+C para sair)...`n" -ForegroundColor Cyan
        Set-Location ..
        docker-compose -f docker-compose.prod.yml logs -f
        exit 0
    }
    
    "prod-build" {
        Write-Host "`nRebuild producao...`n" -ForegroundColor Cyan
        Set-Location ..
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml build --no-cache
        docker-compose -f docker-compose.prod.yml up -d
        Write-Host "`nRebuild producao concluido!`n" -ForegroundColor Green
        exit 0
    }
    
    "setup" {
        Write-Host "`nSETUP COMPLETO`n" -ForegroundColor Cyan
        Set-Location ..
        
        # 1. Verificar requisitos
        Write-Host "[1/6] Verificando requisitos..." -ForegroundColor Yellow
        
        try {
            $nodeVersion = node --version
            Write-Host "  [OK] Node.js: $nodeVersion" -ForegroundColor Green
        } catch {
            Write-Host "  [ERRO] Node.js nao encontrado!" -ForegroundColor Red
            exit 1
        }
        
        try {
            docker info 2>&1 | Out-Null
            $dockerVersion = docker --version
            Write-Host "  [OK] Docker: $dockerVersion" -ForegroundColor Green
        } catch {
            Write-Host "  [ERRO] Docker nao encontrado!" -ForegroundColor Red
            exit 1
        }
        
        try {
            docker-compose version 2>&1 | Out-Null
            $composeVersion = docker-compose --version
            Write-Host "  [OK] Docker Compose: $composeVersion" -ForegroundColor Green
        } catch {
            Write-Host "  [ERRO] Docker Compose nao encontrado!" -ForegroundColor Red
            exit 1
        }
        
        # 2. PostgreSQL
        Write-Host "`n[2/6] Verificando PostgreSQL..." -ForegroundColor Yellow
        
        $pgInstalled = Get-Command psql -ErrorAction SilentlyContinue
        
        if ($pgInstalled) {
            Write-Host "  [OK] PostgreSQL instalado" -ForegroundColor Green
            $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
            if ($pgService -and $pgService.Status -eq "Running") {
                Write-Host "  [OK] PostgreSQL rodando" -ForegroundColor Green
            } else {
                Write-Host "  [AVISO] PostgreSQL parado (inicie: services.msc)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  [AVISO] PostgreSQL nao encontrado!`n" -ForegroundColor Yellow
            Write-Host "  OPCOES:" -ForegroundColor Cyan
            Write-Host "  1. https://www.postgresql.org/download/windows/" -ForegroundColor White
            Write-Host "  2. choco install postgresql" -ForegroundColor White
            Write-Host "  3. scoop install postgresql`n" -ForegroundColor White
            
            $choice = Read-Host "  Instalar via Chocolatey? (s/N)"
            if ($choice -eq "s" -or $choice -eq "S") {
                if (Get-Command choco -ErrorAction SilentlyContinue) {
                    Write-Host "`n  Instalando PostgreSQL..." -ForegroundColor Cyan
                    choco install postgresql -y
                    Write-Host "  Instalado! Reinicie o PowerShell" -ForegroundColor Green
                    exit 0
                } else {
                    Write-Host "  Chocolatey nao encontrado" -ForegroundColor Red
                }
            }
            
            $continue = Read-Host "`n  Continuar sem PostgreSQL? (s/N)"
            if ($continue -ne "s" -and $continue -ne "S") {
                exit 1
            }
        }
        
        # 3. Configurar .env
        Write-Host "`n[3/6] Configurando variaveis..." -ForegroundColor Yellow
        
        $envPath = ".env"
        
        if (Test-Path $envPath) {
            Write-Host "  .env ja existe" -ForegroundColor Cyan
            $overwrite = Read-Host "  Sobrescrever? (s/N)"
            if ($overwrite -ne "s" -and $overwrite -ne "S") {
                Write-Host "  Mantendo .env existente" -ForegroundColor Yellow
                goto SkipEnv
            }
        }
        
        Write-Host "  Gerando secrets..." -ForegroundColor Cyan
        $jwtSecret = node -e "console.log(require(``'crypto``').randomBytes(32).toString(``'hex``'))"
        $jwtRefresh = node -e "console.log(require(``'crypto``').randomBytes(32).toString(``'hex``'))"
        
        if ($mode -eq "prod") {
            $dbHost = Read-Host "  Host PostgreSQL"
            $nodeEnv = "production"
            $logLevel = "info"
            $enableSeed = "false"
            $frontendUrl = Read-Host "  URL Frontend"
            $apiUrl = Read-Host "  URL API"
        } else {
            $dbHost = "localhost"
            $nodeEnv = "development"
            $logLevel = "debug"
            $enableSeed = "true"
            $frontendUrl = "http://localhost:3000"
            $apiUrl = "http://localhost:3001/api"
        }
        
        $envContent = @"
# BANCO DE DADOS
DATABASE_URL="postgresql://postgres:postgres@${dbHost}:5432/encantar"

# JWT
JWT_SECRET="$jwtSecret"
JWT_REFRESH_SECRET="$jwtRefresh"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# SERVIDOR
PORT=3001
NODE_ENV="$nodeEnv"
LOG_LEVEL="$logLevel"

# FRONTEND
FRONTEND_URL="$frontendUrl"
NEXT_PUBLIC_API_URL="$apiUrl"

# SEEDING
ENABLE_SEED="$enableSeed"
"@
        
        Set-Content -Path $envPath -Value $envContent
        Write-Host "  .env criado" -ForegroundColor Green
        
        :SkipEnv
        
        # 4. Instalar dependencias
        Write-Host "`n[4/6] Instalando dependencias..." -ForegroundColor Yellow
        
        Write-Host "  Backend..." -ForegroundColor Cyan
        Set-Location backend
        npm install | Out-Null
        Write-Host "  Backend OK" -ForegroundColor Green
        Set-Location ..
        
        Write-Host "  Frontend..." -ForegroundColor Cyan
        Set-Location frontend
        npm install | Out-Null
        Write-Host "  Frontend OK" -ForegroundColor Green
        Set-Location ..
        
        # 5. Configurar banco
        Write-Host "`n[5/6] Configurando banco..." -ForegroundColor Yellow
        
        if ($pgInstalled) {
            Set-Location backend
            
            Write-Host "  Prisma generate..." -ForegroundColor Cyan
            npx prisma generate | Out-Null
            
            Write-Host "  Migrations..." -ForegroundColor Cyan
            npx prisma migrate deploy
            
            if ($enableSeed -eq "true") {
                Write-Host "  Seed..." -ForegroundColor Cyan
                npm run prisma:seed
            }
            
            Write-Host "  Banco configurado" -ForegroundColor Green
            Set-Location ..
        } else {
            Write-Host "  PostgreSQL indisponivel, pulando" -ForegroundColor Yellow
        }
        
        # 6. Build Docker
        Write-Host "`n[6/6] Build Docker..." -ForegroundColor Yellow
        
        if ($mode -eq "prod") {
            Write-Host "  Producao..." -ForegroundColor Cyan
            docker-compose -f docker-compose.prod.yml build
            Write-Host "  Imagens producao prontas" -ForegroundColor Green
        } else {
            Write-Host "  Desenvolvimento..." -ForegroundColor Cyan
            docker-compose build
            Write-Host "  Imagens dev prontas" -ForegroundColor Green
        }
        
        # Finalizacao
        Write-Host "`n=== SETUP COMPLETO! ===" -ForegroundColor Green
        
        if ($mode -eq "prod") {
            Write-Host "`nIniciar: .\scripts\start.ps1 prod-up" -ForegroundColor Cyan
            Write-Host "Logs:    .\scripts\start.ps1 prod-logs`n" -ForegroundColor Cyan
        } else {
            Write-Host "`nIniciar: .\scripts\start.ps1 up" -ForegroundColor Cyan
            Write-Host "Logs:    .\scripts\start.ps1 logs`n" -ForegroundColor Cyan
        }
        
        Write-Host "Ver comandos: .\scripts\start.ps1 help`n" -ForegroundColor Gray
        exit 0
    }
    
    default {
        Write-Host "`nComando desconhecido: $cmd" -ForegroundColor Red
        Write-Host "Use: .\scripts\start.ps1 help`n" -ForegroundColor Yellow
        exit 1
    }
}
