@echo off
echo ========================================
echo   Communaute de Partage des Connaissances
echo   Frontend - React Application
echo ========================================
echo.

REM S'assurer qu'on est dans le bon dossier
cd /d "%~dp0"

if not exist "node_modules" (
    echo [1/2] Installation des dependances...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERREUR: Impossible d'installer les dependances
        echo Verifiez que Node.js est installe: https://nodejs.org/
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependances installees avec succes!
    echo.
) else (
    echo [OK] Dependances deja installees
    echo.
)

echo [2/2] Lancement du serveur de developpement...
echo.
echo Le serveur va demarrer sur http://localhost:3001
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
echo ========================================
echo.

call npm run dev

pause

