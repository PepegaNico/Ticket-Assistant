#!/bin/bash
# Build a complete Windows package with Python and all dependencies
# Run this on the VDI where you have internet access

set -e

echo "============================================"
echo "Building Complete Windows Package"
echo "============================================"
echo

# Create build directory
BUILD_DIR="$(pwd)/windows-package"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "1. Downloading portable Python for Windows..."
cd "$BUILD_DIR"
wget -q --show-progress https://www.python.org/ftp/python/3.12.0/python-3.12.0-embed-amd64.zip
unzip -q python-3.12.0-embed-amd64.zip -d python
rm python-3.12.0-embed-amd64.zip

echo
echo "2. Configuring portable Python..."
# Enable site-packages in portable Python
echo "import site" >> python/python312._pth

echo
echo "3. Downloading pip and all packages..."
mkdir -p pip-packages
cd pip-packages
# Download pip itself
pip download pip setuptools wheel
# Download application packages
pip download -r ../../backend/requirements.txt
cd ..

echo
echo "4. Copying application files..."
cp -r ../app ./
cp -r ../backend ./
cp ../launcher.py ./
cp ../README.md ./

echo
echo "5. Creating installer batch file..."
cat > install.bat << 'EOF'
@echo off
echo ============================================
echo Remedy Ticket Assistant - Installer
echo ============================================
echo.

set INSTALL_DIR=%LOCALAPPDATA%\RemedyAssistant
set HTTP_PROXY=http://proxy-bvcol.admin.ch:8080
set HTTPS_PROXY=http://proxy-bvcol.admin.ch:8080

echo Creating installation directory...
mkdir "%INSTALL_DIR%" 2>nul

echo Copying files...
xcopy /E /I /Y "%~dp0*" "%INSTALL_DIR%\" >nul

echo Installing pip (offline)...
cd /d "%INSTALL_DIR%"
python\python.exe -m pip install --no-index --find-links pip-packages pip setuptools wheel

echo Installing Python packages (offline)...
python\python.exe -m pip install --no-index --find-links pip-packages -r backend\requirements.txt

echo.
echo Downloading Ollama installer...
powershell -Command "Invoke-WebRequest -Uri 'https://ollama.com/download/OllamaSetup.exe' -OutFile '%TEMP%\OllamaSetup.exe' -Proxy '%HTTP_PROXY%'"

echo.
echo Installing Ollama...
echo This may take a few minutes...
start /wait "" "%TEMP%\OllamaSetup.exe" /VERYSILENT /SUPPRESSMSGBOXES /NORESTART
del "%TEMP%\OllamaSetup.exe"

echo.
echo Setting up Ollama with proxy...
setx OLLAMA_HOST "0.0.0.0:11434"
setx HTTP_PROXY "http://proxy-bvcol.admin.ch:8080"
setx HTTPS_PROXY "http://proxy-bvcol.admin.ch:8080"

echo.
echo Waiting for Ollama service to start...
timeout /t 10 /nobreak >nul

echo.
echo Downloading AI model (llama3.2:3b - ~2GB)...
echo This will take several minutes...
"%USERPROFILE%\AppData\Local\Programs\Ollama\ollama.exe" pull llama3.2:3b

echo Creating launcher...
(
echo @echo off
echo cd /d "%%~dp0"
echo start "" python\python.exe launcher.py
echo echo Access at: http://localhost:5000
) > "Start-RemedyAssistant.bat"

echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Remedy Assistant.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\Start-RemedyAssistant.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()"

echo.
echo ============================================
echo Installation Complete!
echo ============================================
echo.
echo Use the "Remedy Assistant" shortcut on your desktop to start
echo Access the app at: http://localhost:5000
echo.
pause
EOF

echo
echo "6. Creating package..."
cd ..
zip -r -q RemedyAssistant-Complete.zip windows-package/
PACKAGE_SIZE=$(du -h RemedyAssistant-Complete.zip | cut -f1)

echo
echo "============================================"
echo "Build Complete!"
echo "============================================"
echo
echo "Package: $(pwd)/RemedyAssistant-Complete.zip"
echo "Size: $PACKAGE_SIZE"
echo
echo "Next steps:"
echo "1. Transfer RemedyAssistant-Complete.zip to Windows PC"
echo "2. Extract the zip file"
echo "3. Run install.bat from the extracted folder"
echo "4. Install Ollama separately (one-time setup)"
echo
