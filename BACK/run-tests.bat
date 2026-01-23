@echo off
cd /d "c:\Users\Miguel\Documents\MY APP 2\Miguel_Miguel_National_Practical_Exam_2025\backend-project"
start "CRPMS Backend Server" cmd /k "node server.js"
timeout /t 6 /nobreak
node test-api.js
pause
