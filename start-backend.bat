@echo off
title MAD EATS - Backend Server
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.12
set PATH=C:\Program Files\Java\jdk-21.0.12\bin;%PATH%
cd /d "%~dp0backend"
call .\mvnw.cmd spring-boot:run
pause
