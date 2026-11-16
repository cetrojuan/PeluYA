param([int]$DbPort = 55432, [int]$ApiPort = 4401)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskBackend = Join-Path $taskRoot 'backend'
$taskContainer = 'turnify-pp2-test-' + [Guid]::NewGuid().ToString('N').Substring(0, 10)
$taskStarted = $false
$taskPrevious = @{}
foreach ($taskKey in @('DATABASE_URL','NODE_ENV','PORT','APP_ORIGIN','APP_TIMEZONE','TRUST_PROXY','TEST_API')) {
    $taskPrevious[$taskKey] = [Environment]::GetEnvironmentVariable($taskKey, 'Process')
}
function Assert-Exit([string]$Step) {
    if ($LASTEXITCODE -ne 0) { throw "Fallo en: $Step (codigo $LASTEXITCODE)" }
}
try {
    & node --test (Join-Path $PSScriptRoot 'run-api-isolated.test.mjs')
    Assert-Exit 'control de arranque y puerto ocupado de la API aislada'
    & docker info --format '{{.ServerVersion}}'
    Assert-Exit 'Docker Desktop debe estar abierto'
    & docker run --rm -d --name $taskContainer -p "127.0.0.1:${DbPort}:5432" `
        -e POSTGRES_USER=pp2_demo -e POSTGRES_PASSWORD=pp2_test_only -e POSTGRES_DB=pp2_review postgres:16-alpine
    Assert-Exit 'crear PostgreSQL aislado'
    $taskStarted = $true
    $taskReady = $false
    for ($taskAttempt = 0; $taskAttempt -lt 30; $taskAttempt++) {
        & docker exec $taskContainer pg_isready -U pp2_demo -d pp2_review 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) { $taskReady = $true; break }
        Start-Sleep -Seconds 1
    }
    if (-not $taskReady) { throw 'PostgreSQL de prueba no inicio a tiempo' }
    $env:DATABASE_URL = "postgresql://pp2_demo:pp2_test_only@127.0.0.1:${DbPort}/pp2_review"
    $env:NODE_ENV = 'test'
    $env:PORT = [string]$ApiPort
    $env:APP_ORIGIN = 'http://localhost:5173'
    $env:APP_TIMEZONE = 'America/Argentina/Buenos_Aires'
    $env:TRUST_PROXY = '0'
    $env:TEST_API = "http://127.0.0.1:${ApiPort}/api/v1"
    & npm --prefix $taskBackend run db:generate
    Assert-Exit 'generar Prisma'
    & npm --prefix $taskBackend run db:push
    Assert-Exit 'crear tablas de prueba'
    & npm --prefix $taskBackend run db:seed
    Assert-Exit 'seed ficticio'
    & npm --prefix $taskBackend run db:seed
    Assert-Exit 'repetir seed sin duplicar'
    & node (Join-Path $taskBackend 'scripts/audit-test-database.mjs')
    Assert-Exit 'volumen ficticio, seed repetible y hashes bcrypt en PostgreSQL'
    & npm --prefix $taskBackend test
    Assert-Exit 'pruebas unitarias'
    & npm --prefix $taskBackend run build
    Assert-Exit 'build backend'
    & npm --prefix (Join-Path $taskRoot 'frontend') run build
    Assert-Exit 'build frontend'
    # Node conserva el socket de la API y solo inicia las pruebas tras obtenerlo.
    # No depende de consultas CIM ni puede confundir otra API con la propia.
    & node (Join-Path $PSScriptRoot 'run-api-isolated.mjs')
    Assert-Exit 'integracion API'
    Write-Output 'PASS: builds, unitarias, seed repetible, API, paginacion y aislamiento.'
} finally {
    if ($taskStarted) { & docker stop --time 5 $taskContainer | Out-Null }
    foreach ($taskKey in $taskPrevious.Keys) {
        [Environment]::SetEnvironmentVariable($taskKey, $taskPrevious[$taskKey], 'Process')
    }
}
