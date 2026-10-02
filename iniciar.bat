@echo off
title Gestão Financeira - Iniciando...
color 0A

echo ========================================
echo   Gestão Financeira - Next.js + Prisma
echo ========================================
echo.

:: Verificar se Node.js está instalado
echo [1/4] Verificando Node.js...
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
echo [2/4] Verificando dependências...
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

:: Gerar Prisma Client
echo [3/4] Gerando Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar Prisma Client!
    echo Verifique se o arquivo .env está configurado corretamente.
    pause
    exit /b 1
)
echo.

:: Iniciar servidor de desenvolvimento
echo [4/4] Iniciando servidor de desenvolvimento...
echo.
echo ========================================
echo   Servidor iniciando em http://localhost:3000
echo   Pressione Ctrl+C para parar
echo ========================================
echo.

call npm run dev

pause
