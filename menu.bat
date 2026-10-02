@echo off
title Gestão Financeira - Menu Principal
color 0F

:menu
cls
echo ========================================
echo       GESTÃO FINANCEIRA - MENU
echo ========================================
echo.
echo [1] Iniciar servidor de desenvolvimento
echo [2] Fazer build para produção
echo [3] Setup do banco de dados (migrations)
echo [4] Instalar dependências
echo [5] Limpar cache e reinstalar
echo [6] Sair
echo.
echo ========================================
set /p opcao="Escolha uma opção: "

if "%opcao%"=="1" goto iniciar
if "%opcao%"=="2" goto build
if "%opcao%"=="3" goto banco
if "%opcao%"=="4" goto instalar
if "%opcao%"=="5" goto limpar
if "%opcao%"=="6" goto sair
goto opcao_invalida

:iniciar
cls
echo Iniciando servidor de desenvolvimento...
echo.
call iniciar.bat
goto menu

:build
cls
echo Fazendo build para produção...
echo.
call build.bat
goto menu

:banco
cls
echo Setup do banco de dados...
echo.
call setup-banco.bat
goto menu

:instalar
cls
echo Instalando dependências...
echo.
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependências!
    pause
) else (
    echo Dependências instaladas com sucesso!
    pause
)
goto menu

:limpar
cls
echo Limpando cache e reinstalando...
echo.
echo Isso vai remover:
echo   - node_modules
echo   - .next
echo   - E reinstalar as dependências
echo.
set /p confirm="Deseja continuar? (S/N): "
if /i "%confirm%"=="S" (
    echo.
    echo Removendo node_modules...
    if exist node_modules rmdir /s /q node_modules
    echo Removendo .next...
    if exist .next rmdir /s /q .next
    echo.
    echo Reinstalando dependências...
    call npm install
    echo.
    echo Limpeza concluída!
    pause
) else (
    echo Operação cancelada.
    pause
)
goto menu

:opcao_invalida
cls
echo Opção inválida! Por favor, escolha um número de 1 a 6.
pause
goto menu

:sair
cls
echo Saindo...
exit /b 0
