# Script para ejecutar tests de Cypress en Evently
# Uso: .\run-tests.ps1 [opcion]
# Opciones: open, run, login, register, flow

param(
    [string]$Action = "open"
)

Write-Host "🧪 Evently - Test Runner de Cypress" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules no encontrado. Ejecutando npm install..." -ForegroundColor Yellow
    npm install
}

# Verificar si la app está corriendo
Write-Host "🔍 Verificando si la aplicación está corriendo..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue

if (-not $port8080) {
    Write-Host "⚠️  La aplicación no está corriendo en el puerto 8080" -ForegroundColor Yellow
    Write-Host "💡 Por favor, ejecuta 'npm run dev' en otra terminal antes de correr los tests" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "¿Deseas continuar de todos modos? (s/n)"
    if ($continue -ne "s") {
        Write-Host "❌ Tests cancelados" -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "🚀 Ejecutando tests..." -ForegroundColor Green
Write-Host ""

switch ($Action) {
    "open" {
        Write-Host "📱 Abriendo Cypress en modo interactivo..." -ForegroundColor Cyan
        npm run cypress:open
    }
    "run" {
        Write-Host "🏃 Ejecutando todos los tests en modo headless..." -ForegroundColor Cyan
        npm run cypress:run
    }
    "login" {
        Write-Host "🔐 Ejecutando tests de Login..." -ForegroundColor Cyan
        npx cypress run --spec "cypress/e2e/client-login.cy.ts"
    }
    "register" {
        Write-Host "📝 Ejecutando tests de Registro..." -ForegroundColor Cyan
        npx cypress run --spec "cypress/e2e/client-register.cy.ts"
    }
    "flow" {
        Write-Host "🔄 Ejecutando tests de Flujo Completo..." -ForegroundColor Cyan
        npx cypress run --spec "cypress/e2e/auth-flow.cy.ts"
    }
    default {
        Write-Host "❌ Opción no válida: $Action" -ForegroundColor Red
        Write-Host ""
        Write-Host "Opciones disponibles:" -ForegroundColor Yellow
        Write-Host "  open     - Abrir Cypress en modo interactivo (por defecto)" -ForegroundColor White
        Write-Host "  run      - Ejecutar todos los tests en modo headless" -ForegroundColor White
        Write-Host "  login    - Ejecutar solo tests de Login" -ForegroundColor White
        Write-Host "  register - Ejecutar solo tests de Registro" -ForegroundColor White
        Write-Host "  flow     - Ejecutar solo tests de Flujo Completo" -ForegroundColor White
        Write-Host ""
        Write-Host "Ejemplos:" -ForegroundColor Yellow
        Write-Host "  .\run-tests.ps1" -ForegroundColor White
        Write-Host "  .\run-tests.ps1 open" -ForegroundColor White
        Write-Host "  .\run-tests.ps1 run" -ForegroundColor White
        Write-Host "  .\run-tests.ps1 login" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "✅ Proceso completado" -ForegroundColor Green
