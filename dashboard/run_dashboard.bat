@echo off
setlocal enabledelayedexpansion
title FinReAct Intelligence Dashboard

echo ==========================================================
echo   FinReAct Intelligence Dashboard Launcher
echo ==========================================================
echo.

cd /d "%~dp0.."
set "PROJECT_ROOT=%CD%"
set "VENV_DIR=%PROJECT_ROOT%\.venv"
set "REQ_FILE=%PROJECT_ROOT%\dashboard\requirements.txt"

:: 1. Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not found in system PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    echo.
    pause
    exit /b 1
)

:: 2. Check or create Virtual Environment in .venv
if not exist "%VENV_DIR%\Scripts\python.exe" (
    echo [1/3] Creating Python Virtual Environment in .venv...
    python -m venv --system-site-packages "%VENV_DIR%"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo       Virtual environment created successfully.
) else (
    echo [1/3] Python Virtual Environment in .venv verified.
)

:: 3. Install / Verify Dependencies
echo [2/3] Checking and installing required packages (pip install)...
if exist "%REQ_FILE%" (
    "%VENV_DIR%\Scripts\python.exe" -m pip install -q -r "%REQ_FILE%"
) else (
    "%VENV_DIR%\Scripts\python.exe" -m pip install -q starlette uvicorn google-genai python-dotenv
)

:: Verify critical modules are importable
"%VENV_DIR%\Scripts\python.exe" -c "import starlette, uvicorn" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Critical packages starlette and uvicorn could not be loaded.
    echo Please verify your internet connection or install manually:
    echo   "%VENV_DIR%\Scripts\python.exe" -m pip install -r dashboard\requirements.txt
    echo.
    pause
    exit /b 1
)
echo       Dependencies verified and ready.

:: 4. Launch Application Server and Open Browser
echo [3/3] Launching FinReAct Dashboard Server on http://localhost:8080...
echo.
echo ==========================================================
echo   * Access URL: http://localhost:8080
echo   * Security: Ephemeral session tokens (No raw keys logged)
echo   * To stop server: Press CTRL+C in this console window
echo ==========================================================
echo.

:: Open default browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8080"

:: Run server with virtual environment python
"%VENV_DIR%\Scripts\python.exe" dashboard\server.py

if %errorlevel% neq 0 (
    echo.
    echo [Server exited with error code %errorlevel%]
    pause
)
