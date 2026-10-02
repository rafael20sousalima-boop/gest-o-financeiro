@echo off
title Gestão Financeira - Setup do Banco de Dados
color 0E

echo ========================================
echo   Gestão Financeira - Setup do Banco
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

:: Verificar arquivo .env
echo [2/3] Verificando arquivo .env...
if not exist ".env" (
    echo AVISO: Arquivo .env não encontrado!
    echo.
    echo Por favor, copie .env.example para .env e configure:
    echo   DATABASE_URL
    echo.
    pause
    exit /b 1
)
echo Arquivo .env encontrado.
echo.

:: Rodar migrations
echo [3/3] Rodando migrations do banco de dados...
echo.
echo Isso irá criar/atualizar as tabelas no banco.
echo.
call npx prisma migrate dev
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   ERRO: Migrations falharam!
    echo ========================================
    echo.
    echo Possíveis causas:
    echo   - DATABASE_URL incorreta no .env
    echo   - Banco de dados não acessível
    echo   - Permissões insuficientes
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup do banco concluído com sucesso!
echo ========================================
echo.
echo Tabelas criadas/atualizadas no banco de dados.
echo.
pause
