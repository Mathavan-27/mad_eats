@echo off
title MAD EATS - Stop All Services
echo Stopping MAD EATS services...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Stopping backend on port 8080 (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Stopping frontend on port 5173 (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo Services stopped.
timeout /t 3 /nobreak >nul
