@echo off
REM Start Remedy Assistant Services
cd /d %LOCALAPPDATA%\RemedyAssistant

REM Start Ollama in background
echo Starting Ollama service...
start /B ollama serve

REM Wait a moment for Ollama to initialize
timeout /t 3 /nobreak >nul

REM Start Backend server
echo Starting Backend server...
cd /d %LOCALAPPDATA%\RemedyAssistant
python\python.exe backend\server.py

REM Keep window open if backend crashes
pause
