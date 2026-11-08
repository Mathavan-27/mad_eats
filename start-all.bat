@echo off
title MAD EATS - All Services
echo Starting MAD EATS Backend and Frontend...
start "" "%~dp0start-backend.bat"
timeout /t 5 /nobreak >nul
start "" "%~dp0start-frontend.bat"
echo Servers launched.
echo Backend: http://localhost:8080/api/health
echo Frontend: http://localhost:5173/
pause
