@echo off
cd /d "%~dp0"
start "CRPMS Backend Server" cmd /k "node server.js"
timeout /t 6 /nobreak
node test-api.js
pause
