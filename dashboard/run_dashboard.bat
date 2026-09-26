@echo off
title FinReAct Intelligence Dashboard
echo ==========================================================
echo   Starting FinReAct Intelligence Dashboard Server...
echo ==========================================================
cd /d "%~dp0\.."
python dashboard\server.py
pause
