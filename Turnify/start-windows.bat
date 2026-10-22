@echo off
setlocal
cd /d %~dp0

where node >nul 2>nul
if errorlevel 1 goto missingnode
where docker >nul 2>nul
if errorlevel 1 goto missingdocker

if not exist backend\.env copy backend\.env.example backend\.env >nul

echo 1/5 Iniciando PostgreSQL (Docker Desktop tiene que estar abierto)...
docker compose up -d
if errorlevel 1 goto error

echo 2/5 Instalando dependencias...
call npm install
if errorlevel 1 goto error
call npm run install:all
if errorlevel 1 goto error

echo 3/5 Creando tablas...
call npm run db:push
if errorlevel 1 goto error

echo 4/5 Cargando datos de prueba...
call npm run db:seed
if errorlevel 1 goto error

echo 5/5 Iniciando Turnify en http://localhost:5173
start "" http://localhost:5173
call npm run dev
pause
exit /b

:missingnode
echo Instala Node.js 22 o superior y volve a ejecutar este archivo.
pause
exit /b 1
:missingdocker
echo Instala Docker Desktop, abrilo y volve a ejecutar este archivo.
pause
exit /b 1
:error
echo No se pudo completar el inicio. Revisa el error de arriba.
pause
exit /b 1
