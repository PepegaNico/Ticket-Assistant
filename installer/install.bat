@echo off
REM Simple batch installer that downloads and installs everything

echo ============================================
echo Remedy Ticket Assistant - Installer
echo ============================================
echo.

set INSTALL_DIR=%LOCALAPPDATA%\RemedyAssistant

echo Creating installation directory...
mkdir "%INSTALL_DIR%" 2>nul
cd /d "%INSTALL_DIR%"

echo.
echo Downloading application from GitHub...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/PepegaNico/Ticket-Assistant/archive/refs/heads/main.zip' -OutFile 'app.zip'"
powershell -Command "Expand-Archive -Path 'app.zip' -DestinationPath '%INSTALL_DIR%' -Force"
move "%INSTALL_DIR%\Ticket-Assistant-main\*" "%INSTALL_DIR%\" >nul 2>&1
rmdir /S /Q "%INSTALL_DIR%\Ticket-Assistant-main" 2>nul
del app.zip

echo.
echo Downloading Python...
powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.0/python-3.12.0-embed-amd64.zip' -OutFile 'python.zip'"
mkdir "%INSTALL_DIR%\python" 2>nul
powershell -Command "Expand-Archive -Path 'python.zip' -DestinationPath '%INSTALL_DIR%\python' -Force"
del python.zip

echo.
echo Setting up Python pip...
powershell -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile '%INSTALL_DIR%\python\get-pip.py'"
"%INSTALL_DIR%\python\python.exe" "%INSTALL_DIR%\python\get-pip.py" --no-warn-script-location

echo.
echo Installing Python packages...
"%INSTALL_DIR%\python\python.exe" -m pip install --quiet -r "%INSTALL_DIR%\backend\requirements.txt"

echo.
echo Creating launcher...
(
echo @echo off
echo cd /d "%%~dp0"
echo start "" python\python.exe launcher.py
echo echo Access at: http://localhost:5000
) > "%INSTALL_DIR%\Start-RemedyAssistant.bat"

echo.
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Remedy Assistant.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\Start-RemedyAssistant.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()"

echo.
echo ============================================
echo Installation Complete!
echo ============================================
echo.
echo IMPORTANT: You still need to install Ollama
echo 1. Download from: https://ollama.ai/download/windows
echo 2. Install Ollama
echo 3. Open PowerShell and run: ollama pull llama3.2:3b
echo.
echo After that, use the "Remedy Assistant" shortcut on your desktop
echo.
pause
