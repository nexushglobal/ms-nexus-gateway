# dev-docker.ps1 - Script para desarrollo con Docker en Windows
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("build", "up", "down", "logs", "rebuild", "clean", "status", "test", "help")]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [string]$Service
)

# Configuración de colores
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-DockerRunning {
    try {
        $null = docker info 2>$null
        return $true
    }
    catch {
        return $false
    }
}

function Test-PnpmInstalled {
    try {
        $null = Get-Command pnpm -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Show-Help {
    Write-Host "Uso: .\dev-docker.ps1 -Command <comando> [-Service <servicio>]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor Cyan
    Write-Host "  build    - Construir imágenes Docker"
    Write-Host "  up       - Iniciar todos los servicios"
    Write-Host "  down     - Detener todos los servicios"
    Write-Host "  logs     - Mostrar logs (opcional: especificar servicio)"
    Write-Host "  rebuild  - Reconstruir y reiniciar servicios"
    Write-Host "  clean    - Limpiar recursos Docker"
    Write-Host "  status   - Mostrar estado de servicios"
    Write-Host "  test     - Ejecutar health checks"
    Write-Host "  help     - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Cyan
    Write-Host "  .\dev-docker.ps1 -Command up"
    Write-Host "  .\dev-docker.ps1 -Command logs -Service gateway"
    Write-Host "  .\dev-docker.ps1 -Command rebuild"
}

# Verificar que Docker esté ejecutándose
if (-not (Test-DockerRunning)) {
    Write-Error "Docker no está ejecutándose. Por favor, inicia Docker Desktop primero."
    exit 1
}

# Verificar si pnpm está instalado
if (-not (Test-PnpmInstalled)) {
    Write-Warning "pnpm no está instalado. Instalando via npm..."
    try {
        npm install -g pnpm
        Write-Success "pnpm instalado correctamente!"
    }
    catch {
        Write-Error "Error al instalar pnpm: $($_.Exception.Message)"
        exit 1
    }
}

# Ejecutar comandos según el parámetro
switch ($Command) {
    "build" {
        Write-Info "Construyendo imágenes Docker para desarrollo..."
        try {
            docker-compose -f docker-compose.dev.yml build --parallel
            Write-Success "¡Imágenes construidas exitosamente!"
        }
        catch {
            Write-Error "Error al construir imágenes: $($_.Exception.Message)"
            exit 1
        }
    }
    "up" {
        Write-Info "Iniciando todos los servicios..."
        try {
            docker-compose -f docker-compose.dev.yml up -d
            Write-Success "¡Servicios iniciados!"
            Write-Info "Gateway: http://localhost:8000"
            Write-Info "NATS Monitor: http://localhost:8222"
        }
        catch {
            Write-Error "Error al iniciar servicios: $($_.Exception.Message)"
            exit 1
        }
    }
    "down" {
        Write-Info "Deteniendo todos los servicios..."
        try {
            docker-compose -f docker-compose.dev.yml down
            Write-Success "¡Servicios detenidos!"
        }
        catch {
            Write-Error "Error al detener servicios: $($_.Exception.Message)"
            exit 1
        }
    }
    "logs" {
        if ($Service) {
            Write-Info "Mostrando logs para $Service..."
            docker-compose -f docker-compose.dev.yml logs -f $Service
        }
        else {
            Write-Info "Mostrando logs para todos los servicios..."
            docker-compose -f docker-compose.dev.yml logs -f
        }
    }
    "rebuild" {
        Write-Info "Reconstruyendo y reiniciando servicios..."
        try {
            docker-compose -f docker-compose.dev.yml down
            docker-compose -f docker-compose.dev.yml build --no-cache
            docker-compose -f docker-compose.dev.yml up -d
            Write-Success "¡Servicios reconstruidos e iniciados!"
        }
        catch {
            Write-Error "Error al reconstruir servicios: $($_.Exception.Message)"
            exit 1
        }
    }
    "clean" {
        Write-Info "Limpiando recursos Docker..."
        try {
            docker-compose -f docker-compose.dev.yml down -v
            docker system prune -f
            Write-Success "¡Limpieza completada!"
        }
        catch {
            Write-Error "Error al limpiar recursos: $($_.Exception.Message)"
            exit 1
        }
    }
    "status" {
        Write-Info "Estado de los servicios:"
        docker-compose -f docker-compose.dev.yml ps
    }
    "test" {
        Write-Info "Ejecutando health checks..."
        # Esperar a que los servicios estén listos
        Start-Sleep -Seconds 10
        # Test NATS
        try {
            $natsResponse = Invoke-WebRequest -Uri "http://localhost:8222/healthz" -UseBasicParsing -TimeoutSec 5
            if ($natsResponse.StatusCode -eq 200) {
                Write-Success "NATS está funcionando correctamente"
            }
        }
        catch {
            Write-Error "NATS no está respondiendo"
        }
        # Test Gateway
        try {
            $gatewayResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/health" -UseBasicParsing -TimeoutSec 5
            if ($gatewayResponse.StatusCode -eq 200) {
                Write-Success "Gateway está funcionando correctamente"
            }
        }
        catch {
            Write-Error "Gateway no está respondiendo"
        }
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Comando no reconocido: $Command"
        Show-Help
        exit 1
    }
}