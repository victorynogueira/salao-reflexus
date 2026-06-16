@echo off
cd /d "%~dp0"
cls
echo.
echo ============================================
echo    Salao Reflexus - Sistema PWA
echo ============================================
echo.
echo   Servidor: http://localhost:3000
echo   Login: admin@reflexus.com / admin123
echo.
echo   Para instalar no celular:
echo   1. Acesse o site no navegador
echo   2. Toque em "Adicionar a tela inicial"
echo   3. Pronto! O app estara na sua tela
echo.
echo ============================================
echo.

node run.js dev

pause
