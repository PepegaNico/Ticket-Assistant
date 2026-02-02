# Building the Windows Installer

## Prerequisites

### 1. Install Inno Setup
Download and install from: https://jrsoftware.org/isdl.php

### 2. Download Portable Python
1. Go to: https://www.python.org/downloads/windows/
2. Download "Windows embeddable package (64-bit)" for Python 3.12
3. Extract to `installer/python-embed/`
4. Download get-pip.py: https://bootstrap.pypa.io/get-pip.py
5. Install pip in embedded Python:
   ```cmd
   cd installer\python-embed
   python.exe get-pip.py
   ```

### 3. Pre-download Python Wheels
To avoid needing internet during installation:

```cmd
cd installer
mkdir wheels
pip download -r ..\backend\requirements.txt -d wheels
```

This downloads:
- Flask
- flask-cors
- deep-translator
- requests

## Building the Installer

### Option 1: Using Inno Setup GUI
1. Open `installer/setup.iss` in Inno Setup
2. Click Build → Compile
3. Installer will be created in `dist/RemedyTicketAssistant-Setup.exe`

### Option 2: Command Line
```cmd
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer\setup.iss
```

## What the Installer Does

1. **Copies application files** to Program Files
2. **Installs embedded Python** (no system Python needed)
3. **Installs Python dependencies** from pre-downloaded wheels
4. **Downloads and installs Ollama** (~500MB)
5. **Downloads AI model** on first run (~2GB)
6. **Creates shortcuts** on desktop and start menu
7. **Sets up auto-start** (optional)

## Installer Size

- Base installer (with Python): ~60-80MB
- Total download during install: ~2.5GB (Ollama + AI model)
- Installed size: ~3.5GB

## Corporate Deployment

For mass deployment without internet access:

### 1. Pre-package Ollama
```cmd
mkdir installer\ollama
REM Copy OllamaSetup.exe to installer\ollama\
```

Update `setup.iss` to install from local file instead of downloading.

### 2. Pre-package AI Model

Download model once:
```cmd
ollama pull llama3.2:3b
```

Find model location:
- Windows: `%USERPROFILE%\.ollama\models`

Copy model files to installer and modify `first-run.bat` to copy instead of download.

### 3. Offline Installer

With Ollama and model pre-packaged:
- Installer size: ~2.5GB
- No internet required
- Fast silent deployment

## Silent Installation

For IT deployment tools (SCCM, PDQ Deploy, etc.):

```cmd
RemedyTicketAssistant-Setup.exe /SILENT /SUPPRESSMSGBOXES /NORESTART
```

## Distribution

The built installer can be:
1. Shared via network drive
2. Deployed via Group Policy
3. Packaged in SCCM/Intune
4. Downloaded from internal portal
5. Distributed on USB drives

## Uninstallation

Uninstaller is created automatically at:
```
C:\Program Files\Remedy Ticket Assistant\unins000.exe
```

Or via Windows Settings → Apps → Remedy Ticket Assistant

## Updates

To update the application:
1. Build new installer with updated version number
2. Run new installer
3. It will upgrade existing installation
4. Ollama and model won't be re-downloaded
