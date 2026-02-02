@echo off
REM First-time setup for Remedy Ticket Assistant

echo ============================================
echo Remedy Ticket Assistant - First Time Setup
echo ============================================
echo.

REM Wait for Ollama service to start
echo Waiting for Ollama service to start...
timeout /t 5 /nobreak >nul

REM Check if model already exists
ollama list | findstr "llama3.2:3b" >nul 2>&1
if %errorlevel% == 0 (
    echo AI model already downloaded, skipping...
    goto :start_app
)

echo.
echo Downloading AI model (llama3.2:3b - approximately 2GB)
echo This may take 5-15 minutes depending on your connection...
echo.

ollama pull llama3.2:3b
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to download AI model
    echo You can manually download it later with: ollama pull llama3.2:3b
    pause
    exit /b 1
)

:start_app
echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Starting Remedy Ticket Assistant...
timeout /t 2 /nobreak >nul

REM Start the application
cd /d "%~dp0"
start "" pythonw.exe launcher.py

echo.
echo Application started!
echo Access it at: http://localhost:5000
echo.
echo A browser window should open automatically.
echo You can close this window.
echo.
timeout /t 5 /nobreak
