@echo off
echo Installing Python packages...
cd /d %LOCALAPPDATA%\RemedyAssistant
python\python.exe -m pip install --no-index --find-links packages flask flask-cors deep-translator requests
if %errorlevel% neq 0 (
    echo Error installing packages!
    pause
    exit /b 1
)
echo Packages installed successfully!
pause
