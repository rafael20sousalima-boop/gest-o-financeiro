@echo off
title Gestão Financeira - Inicializador Automático
color 0a

:: Ir para o diretório do script
cd /d "%~dp0"

echo ===================================================
echo   Iniciando Gestão Financeira
echo   Conectado ao banco de dados PostgreSQL
echo ===================================================
echo.

:: Matar processos Node.js travados
echo [1/3] Fechando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
ping 127.0.0.1 -n 2 >nul
echo Processos fechados.
echo.

:: Limpar cache do .next
echo [2/3] Limpando cache do .next...
if exist ".next" (
    rd /s /q ".next" >nul 2>&1
)
echo Cache limpo.
echo.

:: Iniciar servidor de desenvolvimento
echo [3/3] Iniciando servidor de desenvolvimento...
echo.
echo ===================================================
echo   Servidor iniciando em http://localhost:3000
echo   Pressione Ctrl+C para parar
echo ===================================================
echo.

call node start-dev.js

pause
