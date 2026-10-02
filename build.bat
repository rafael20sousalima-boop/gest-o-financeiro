@echo off
title Gestão Financeira - Build
color 0B

echo ========================================
echo   Gestão Financeira - Build para Produção
echo ========================================
echo.

:: Verificar se Node.js está instalado
echo [1/3] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js não está instalado!
    echo Por favor, instale o Node.js em https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js encontrado!
echo.

:: Instalar dependências se necessário
echo [2/3] Verificando dependências...
if not exist "node_modules" (
    echo Instalando dependências...
    call npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependências!
        pause
        exit /b 1
    )
) else (
    echo Dependências já instaladas.
)
echo.

:: Executar build
echo [3/3] Executando build...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   ERRO: Build falhou!
    echo ========================================
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build concluído com sucesso!
echo ========================================
echo.
echo Para iniciar em produção, execute:
echo   npm start
echo.
pause
