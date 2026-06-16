@echo off
cd /d "%~dp0"
echo ============================================
echo   Salao Reflexus - Instalando dependencias
echo ============================================
echo.
echo Diretorio atual: %CD%
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha ao instalar!
    pause
    exit /b 1
)
echo.
echo ============================================
echo   Dependencias instaladas com sucesso!
echo ============================================
echo.
echo Agora execute: iniciar.bat
pause
