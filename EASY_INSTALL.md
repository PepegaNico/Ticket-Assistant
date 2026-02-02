# Easy Installation for Windows

## Simple One-Command Installation

Open PowerShell as Administrator and run:

```powershell
irm https://raw.githubusercontent.com/PepegaNico/Ticket-Assistant/main/install-windows.ps1 | iex
```

**That's it!** The script will:
1. Download the application from GitHub
2. Install portable Python
3. Install Python packages
4. Download and install Ollama
5. Download AI model (llama3.2:3b ~2GB)
6. Create desktop shortcut

**Total time**: 10-20 minutes (depending on internet speed)

---

## Manual Installation (Alternative)

If you can't run the automatic script:

### Step 1: Download the Script

1. Go to: https://github.com/PepegaNico/Ticket-Assistant
2. Download `install-windows.ps1`
3. Right-click → "Run with PowerShell"

### Step 2: If Script is Blocked

If you get "execution policy" error:

```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run the script
.\install-windows.ps1
```

---

## What Gets Installed?

**Location**: `%LOCALAPPDATA%\RemedyAssistant\` (typically `C:\Users\YourName\AppData\Local\RemedyAssistant`)

**Components**:
- Application files (~1MB)
- Portable Python (~25MB)
- Python packages (~50MB)
- Ollama (~500MB) - installed to Program Files
- AI Model (~2GB) - installed to Ollama folder

**Total disk space**: ~3.5GB

---

## Using the Application

After installation:

1. **Desktop shortcut**: Double-click "Remedy Assistant"
2. **Start menu**: Search for "Remedy Assistant"
3. **Browser**: Open http://localhost:5000

The application runs in the background and opens in your default browser.

---

## For IT Departments

### Silent Deployment

Save the install script and run:

```powershell
powershell.exe -ExecutionPolicy Bypass -File install-windows.ps1
```

### Group Policy Deployment

1. Copy `install-windows.ps1` to network share
2. Create GPO startup script:
   ```cmd
   powershell.exe -ExecutionPolicy Bypass -File \\server\share\install-windows.ps1
   ```

### SCCM Package

Create application package:
- **Installation program**: `powershell.exe -ExecutionPolicy Bypass -File install-windows.ps1`
- **Uninstall program**: `powershell.exe -Command "Remove-Item -Path '$env:LOCALAPPDATA\RemedyAssistant' -Recurse -Force"`
- **Detection method**: File exists: `%LOCALAPPDATA%\RemedyAssistant\Start-RemedyAssistant.bat`

---

## Uninstallation

### Option 1: PowerShell

```powershell
# Stop the application
taskkill /F /IM python.exe 2>$null

# Remove files
Remove-Item -Path "$env:LOCALAPPDATA\RemedyAssistant" -Recurse -Force

# Remove shortcuts
Remove-Item -Path "$env:USERPROFILE\Desktop\Remedy Assistant.lnk" -Force
Remove-Item -Path "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Remedy Assistant.lnk" -Force

# Optional: Uninstall Ollama
# Go to Settings → Apps → Ollama → Uninstall
```

### Option 2: Manual

1. Delete folder: `C:\Users\YourName\AppData\Local\RemedyAssistant`
2. Delete desktop shortcut
3. Uninstall Ollama from Windows Settings (optional)

---

## Troubleshooting

### "Script is blocked"

```powershell
Unblock-File -Path .\install-windows.ps1
```

### "Cannot download files"

Check proxy settings:
```powershell
# If behind proxy
$env:HTTP_PROXY="http://proxy-server:port"
$env:HTTPS_PROXY="http://proxy-server:port"

# Then run install script
.\install-windows.ps1
```

### "Ollama installation failed"

Install Ollama manually:
1. Download from: https://ollama.ai/download/windows
2. Run installer
3. Open PowerShell: `ollama pull llama3.2:3b`

### "Application won't start"

Check if port 5000 is available:
```powershell
netstat -ano | findstr :5000
```

If port is in use, edit `backend\server.py` and change port number.

---

## Network Installation

### Running on One PC, Access from Others

1. **On the server PC**: Note IP address
   ```cmd
   ipconfig
   ```

2. **Allow firewall**:
   ```powershell
   New-NetFirewallRule -DisplayName "Remedy Assistant" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

3. **Access from other PCs**:
   ```
   http://SERVER_IP:5000
   ```

---

## Updates

To update to the latest version:

```powershell
# Re-run the installer
irm https://raw.githubusercontent.com/PepegaNico/Ticket-Assistant/main/install-windows.ps1 | iex
```

It will update the application without re-downloading Ollama or the AI model.

---

## Support

- **GitHub Issues**: https://github.com/PepegaNico/Ticket-Assistant/issues
- **Logs**: Check `%LOCALAPPDATA%\RemedyAssistant\backend\server.log`
- **Test backend**: http://localhost:5000/health
