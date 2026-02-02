@echo off
REM Quick start script for Windows

echo Starting Remedy Ticket Assistant...
echo.

REM Check if backend virtual environment exists
if not exist "backend\venv\" (
    echo ERROR: Backend not installed!
    echo Please run backend\install.bat first
    pause
    exit /b 1
)

REM Check if Ollama is installed
ollama --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Ollama not found
    echo Install from: https://ollama.ai/download/windows
    echo.
)

REM Start the application
python launcher.py

pause
