# Script PowerShell para automacao do projeto Encantar

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    [string]$Service
)

# Funcao para exibir status com cores
function Write-Status {
    param([string]$Message, [string]$Status = "info")
    
    switch ($Status) {
        "success" { Write-Host "[OK] $Message" -ForegroundColor Green }
        "error" { Write-Host "[ERRO] $Message" -ForegroundColor Red }
        "warning" { Write-Host "[AVISO] $Message" -ForegroundColor Yellow }
        "info" { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
        default { Write-Host "[LOG] $Message" -ForegroundColor White }
    }
}

# Verificar se Docker esta rodando
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Status "Docker nao esta rodando. Inicie o Docker Desktop primeiro." "error"
        return $false
    }
}

switch ($Command) {
    "start" {
        Write-Status "Iniciando Sistema Encantar completo..." "info"
        
        if (-not (Test-DockerRunning)) { exit 1 }
        
        Write-Status "Parando containers antigos..." "info"
        docker-compose down -v 2>$null
        
        Write-Status "Construindo imagens..." "info"
        docker-compose build
        
        Write-Status "Iniciando todos os servicos..." "info"
        docker-compose up -d
        
        Write-Status "Aguardando servicos iniciarem..." "info"
        Start-Sleep 10
        
        Write-Status "Status dos servicos:" "info"
        docker-compose ps
        
        Write-Status "Sistema iniciado com sucesso!" "success"
        Write-Status "Frontend: http://localhost:3000" "info"
        Write-Status "Backend: http://localhost:3001/health" "info"
        Write-Status "Para ver logs: .\docker.ps1 logs" "info"
    }
    
    "stop" {
        Write-Status "Parando todos os servicos..." "warning"
        docker-compose down
        Write-Status "Servicos parados!" "success"
    }
    
    "restart" {
        Write-Status "Reiniciando sistema..." "info"
        docker-compose restart
        Write-Status "Sistema reiniciado!" "success"
    }
    
    "logs" {
        if ([string]::IsNullOrEmpty($Service)) {
            Write-Status "Mostrando logs de todos os servicos..." "info"
            docker-compose logs -f --tail=50
        } else {
            Write-Status "Mostrando logs do servico: $Service" "info"
            docker-compose logs -f --tail=50 $Service
        }
    }
    
    "status" {
        Write-Status "Status do sistema:" "info"
        docker-compose ps
        Write-Status "Uso de volumes:" "info"
        docker volume ls | Select-String "encantar"
    }
    
    "clean" {
        Write-Status "Limpando sistema completo..." "warning"
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Status "Sistema limpo!" "success"
    }
    
    "reset" {
        Write-Status "Reset completo do banco de dados..." "warning"
        docker-compose down -v
        Start-Sleep 2
        docker-compose up -d postgres
        Start-Sleep 10
        docker-compose up -d backend
        Start-Sleep 5
        docker-compose up -d frontend
        Write-Status "Reset completo realizado!" "success"
    }
    
    "dev" {
        Write-Status "Modo desenvolvimento local..." "info"
        
        Write-Status "Parando containers se existirem..." "info"
        docker-compose down 2>$null
        
        Write-Status "Iniciando apenas PostgreSQL..." "info"
        docker-compose up -d postgres
        
        Write-Status "Aguardando PostgreSQL..." "info"
        Start-Sleep 5
        
        Write-Status "Configurando backend..." "info"
        Set-Location "backend"
        npm install
        npx prisma migrate deploy
        npm run prisma:seed
        
        Write-Status "Configurando frontend..." "info"
        Set-Location "..\frontend"
        npm install
        Set-Location ".."
        
        Write-Status "Desenvolvimento configurado!" "success"
        Write-Status "Execute manualmente:" "info"
        Write-Status "Terminal 1: cd backend; npm run dev" "info"
        Write-Status "Terminal 2: cd frontend; npm run dev" "info"
    }
    
    "setup" {
        Write-Status "Configuracao inicial do projeto..." "info"
        
        if (-not (Test-DockerRunning)) { exit 1 }
        
        Write-Status "Instalando dependencias do backend..." "info"
        Set-Location "backend"
        npm install
        
        Write-Status "Instalando dependencias do frontend..." "info"
        Set-Location "..\frontend"
        npm install
        Set-Location ".."
        
        Write-Status "Testando Docker Compose..." "info"
        docker-compose config
        
        Write-Status "Configuracao inicial concluida!" "success"
        Write-Status "Use: .\docker.ps1 start" "info"
    }
    
    "update" {
        Write-Status "Atualizando dependencias..." "info"
        
        Set-Location "backend"
        npm update
        npx prisma generate
        
        Set-Location "..\frontend"
        npm update
        Set-Location ".."
        
        Write-Status "Dependencias atualizadas!" "success"
    }

    default {
        Write-Host "Sistema de Automacao Encantar" -ForegroundColor Cyan
        Write-Host "==============================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "COMANDOS PRINCIPAIS:" -ForegroundColor Green
        Write-Host "  setup     - Configuracao inicial do projeto" -ForegroundColor Gray
        Write-Host "  start     - Inicia todo o sistema (automatico)" -ForegroundColor Gray
        Write-Host "  dev       - Modo desenvolvimento local" -ForegroundColor Gray
        Write-Host "  stop      - Para todos os servicos" -ForegroundColor Gray
        Write-Host "  restart   - Reinicia sistema" -ForegroundColor Gray
        Write-Host "  reset     - Reset completo do banco" -ForegroundColor Gray
        Write-Host ""
        Write-Host "MONITORAMENTO:" -ForegroundColor Green
        Write-Host "  status    - Status dos servicos" -ForegroundColor Gray
        Write-Host "  logs      - Ver logs (-Service nome)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "MANUTENCAO:" -ForegroundColor Green
        Write-Host "  clean     - Limpa containers e volumes" -ForegroundColor Gray
        Write-Host "  update    - Atualiza dependencias" -ForegroundColor Gray
        Write-Host ""
        Write-Host "EXEMPLOS:" -ForegroundColor Yellow
        Write-Host "  .\docker.ps1 setup" -ForegroundColor Gray
        Write-Host "  .\docker.ps1 start" -ForegroundColor Gray
        Write-Host "  .\docker.ps1 logs -Service backend" -ForegroundColor Gray
        Write-Host "  .\docker.ps1 dev" -ForegroundColor Gray
        Write-Host ""
        Write-Host "URLs do Sistema:" -ForegroundColor Yellow
        Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Gray
        Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Gray
        Write-Host "  Health:   http://localhost:3001/health" -ForegroundColor Gray
    }
}