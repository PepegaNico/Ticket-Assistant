# Remedy Ticket Assistant - One-Click Installer for Windows
# This script downloads and installs everything automatically

param(
    [string]$InstallPath = "$env:LOCALAPPDATA\RemedyAssistant"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Remedy Ticket Assistant - Installer" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Running without administrator rights" -ForegroundColor Yellow
    Write-Host "Some features may require admin rights" -ForegroundColor Yellow
    Write-Host ""
}

# Create installation directory
Write-Host "[1/6] Creating installation directory..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
Set-Location $InstallPath

# Download application from GitHub
Write-Host "[2/6] Downloading application..." -ForegroundColor Green
$repoUrl = "https://github.com/PepegaNico/Ticket-Assistant/archive/refs/heads/main.zip"
$zipPath = "$InstallPath\app.zip"

try {
    Invoke-WebRequest -Uri $repoUrl -OutFile $zipPath -UseBasicParsing
    Expand-Archive -Path $zipPath -DestinationPath $InstallPath -Force
    Move-Item "$InstallPath\Ticket-Assistant-main\*" $InstallPath -Force
    Remove-Item "$InstallPath\Ticket-Assistant-main" -Recurse -Force
    Remove-Item $zipPath -Force
    Write-Host "   ✓ Application downloaded" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to download application: $_" -ForegroundColor Red
    exit 1
}

# Download and install Python
Write-Host "[3/6] Installing Python..." -ForegroundColor Green
$pythonUrl = "https://www.python.org/ftp/python/3.12.0/python-3.12.0-embed-amd64.zip"
$pythonZip = "$InstallPath\python.zip"
$pythonDir = "$InstallPath\python"

if (-not (Test-Path "$pythonDir\python.exe")) {
    try {
        Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonZip -UseBasicParsing
        New-Item -ItemType Directory -Force -Path $pythonDir | Out-Null
        Expand-Archive -Path $pythonZip -DestinationPath $pythonDir -Force
        Remove-Item $pythonZip -Force
        
        # Get pip
        $pipUrl = "https://bootstrap.pypa.io/get-pip.py"
        Invoke-WebRequest -Uri $pipUrl -OutFile "$pythonDir\get-pip.py" -UseBasicParsing
        & "$pythonDir\python.exe" "$pythonDir\get-pip.py" --no-warn-script-location
        
        Write-Host "   ✓ Python installed" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ Failed to install Python: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✓ Python already installed" -ForegroundColor Green
}

# Install Python dependencies
Write-Host "[4/6] Installing Python packages..." -ForegroundColor Green
$pipResult = & "$pythonDir\python.exe" -m pip install --quiet --no-warn-script-location -r "$InstallPath\backend\requirements.txt" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Python packages installed" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed to install packages" -ForegroundColor Red
    Write-Host "   Continuing anyway..." -ForegroundColor Yellow
}

# Download and install Ollama
Write-Host "[5/6] Installing Ollama..." -ForegroundColor Green
$ollamaPath = "C:\Program Files\Ollama\ollama.exe"

if (-not (Test-Path $ollamaPath)) {
    $ollamaUrl = "https://ollama.ai/download/OllamaSetup.exe"
    $ollamaInstaller = "$env:TEMP\OllamaSetup.exe"
    
    try {
        Write-Host "   Downloading Ollama (~500MB)..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $ollamaUrl -OutFile $ollamaInstaller -UseBasicParsing
        
        Write-Host "   Installing Ollama (requires admin)..." -ForegroundColor Yellow
        if ($isAdmin) {
            Start-Process -FilePath $ollamaInstaller -ArgumentList "/S" -Wait -NoNewWindow
        } else {
            Start-Process -FilePath $ollamaInstaller -ArgumentList "/S" -Wait -Verb RunAs
        }
        
        Remove-Item $ollamaInstaller -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Ollama installed" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ Failed to install Ollama: $_" -ForegroundColor Red
        Write-Host "   You can install manually from: https://ollama.ai/download" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✓ Ollama already installed" -ForegroundColor Green
}

# Wait for Ollama service to start
Start-Sleep -Seconds 3

# Download AI model
Write-Host "[6/6] Downloading AI model..." -ForegroundColor Green
Write-Host "   This will download ~2GB and may take 5-15 minutes" -ForegroundColor Yellow

$ollamaExe = "C:\Program Files\Ollama\ollama.exe"
if (Test-Path $ollamaExe) {
    # Check if model already exists
    $existingModels = & $ollamaExe list 2>&1 | Out-String
    
    if ($existingModels -match "llama3.2:3b") {
        Write-Host "   ✓ AI model already downloaded" -ForegroundColor Green
    } else {
        try {
            Write-Host "   Downloading llama3.2:3b model..." -ForegroundColor Yellow
            & $ollamaExe pull llama3.2:3b
            Write-Host "   ✓ AI model downloaded" -ForegroundColor Green
        } catch {
            Write-Host "   ✗ Failed to download model" -ForegroundColor Red
            Write-Host "   You can download it later with: ollama pull llama3.2:3b" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ⚠ Ollama not found, skipping model download" -ForegroundColor Yellow
}

# Create launcher script
Write-Host ""
Write-Host "Creating launcher..." -ForegroundColor Green

$launcherContent = @"
@echo off
cd /d "%~dp0"
start "" python\python.exe launcher.py
echo Remedy Ticket Assistant is starting...
echo Access it at: http://localhost:5000
timeout /t 3 /nobreak >nul
"@

Set-Content -Path "$InstallPath\Start-RemedyAssistant.bat" -Value $launcherContent

# Create desktop shortcut
try {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Remedy Assistant.lnk")
    $Shortcut.TargetPath = "$InstallPath\Start-RemedyAssistant.bat"
    $Shortcut.WorkingDirectory = $InstallPath
    $Shortcut.Description = "Remedy Ticket Assistant"
    $Shortcut.Save()
    Write-Host "   ✓ Desktop shortcut created" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Could not create desktop shortcut" -ForegroundColor Yellow
}

# Create start menu shortcut
try {
    $startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
    $Shortcut = $WshShell.CreateShortcut("$startMenuPath\Remedy Assistant.lnk")
    $Shortcut.TargetPath = "$InstallPath\Start-RemedyAssistant.bat"
    $Shortcut.WorkingDirectory = $InstallPath
    $Shortcut.Description = "Remedy Ticket Assistant"
    $Shortcut.Save()
    Write-Host "   ✓ Start menu shortcut created" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Could not create start menu shortcut" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installation location: $InstallPath" -ForegroundColor White
Write-Host ""
Write-Host "To start the application:" -ForegroundColor White
Write-Host "  • Double-click 'Remedy Assistant' on your desktop" -ForegroundColor White
Write-Host "  • Or run: $InstallPath\Start-RemedyAssistant.bat" -ForegroundColor White
Write-Host ""
Write-Host "Access in browser: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Ask to start now
$response = Read-Host "Start Remedy Assistant now? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Start-Process -FilePath "$InstallPath\Start-RemedyAssistant.bat"
    Write-Host ""
    Write-Host "Application starting..." -ForegroundColor Green
    Write-Host "A browser window should open at http://localhost:5000" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
