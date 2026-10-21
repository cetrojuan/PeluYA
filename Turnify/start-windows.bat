@echo off
setlocal
cd /d %~dp0
where node >nul 2>nul
if errorlevel 1 goto missingnode
if not exist backend\.env copy backend\.env.example backend\.env >nul
echo Instalando dependencias...
call npm install
if errorlevel 1 goto error
call npm run install:all
if errorlevel 1 goto error
call npm --prefix backend run db:generate
if errorlevel 1 goto error
call npm run db:push
if errorlevel 1 goto error
echo Iniciando Turnify en http://localhost:5173
start "Turnify" http://localhost:5173
call npm run dev
pause
exit /b
:missingnode
echo Instala Node.js 22.12 o superior y volve a ejecutar este archivo.
pause
exit /b 1
:error
echo No se pudo completar el inicio. Revisa el error de arriba.
pause
exit /b 1
