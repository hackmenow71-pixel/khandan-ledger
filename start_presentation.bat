@echo off
title Family Ledger - Local Presentation Server (Port 3001)
echo ========================================================
echo   Khandan Ledger - Family & Sibling Expense Tracker
echo   Port: 3001 (Safe non-conflicting port)
echo   Mode: 100%% Local SQLite (No Supabase required)
echo   Google Translate API: Connected
echo ========================================================
echo.
echo Launching local development server on http://localhost:3001 ...
cd /d "C:\Users\M Ibrahim\.gemini\antigravity\scratch\account-management\account-management-master"
set "PATH=C:\Program Files\nodejs;%PATH%"
set "PORT=3001"

REM Open default browser after 4 seconds
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3001/en"

npm run dev
pause
