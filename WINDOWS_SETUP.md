# Windows Setup Instructions

## First-Time Setup

### 1. Install Packages
After extracting and running `install.bat`, you need to install Python packages:

```batch
C:\Users\YOUR_USERNAME\AppData\Local\RemedyAssistant\install-packages.bat
```

This installs Flask and other dependencies into the portable Python.

### 2. Test Manual Start
Test that services start correctly:

```batch
C:\Users\YOUR_USERNAME\AppData\Local\RemedyAssistant\start-services.bat
```

You should see:
- "Starting Ollama service..."
- "Starting Backend server..."
- Flask server running on http://127.0.0.1:5000

Press `Ctrl+C` to stop.

## Automatic Startup (Recommended)

### Option 1: Hidden Background Services (No Console Windows)

1. Copy `start-services-hidden.vbs` to Startup folder:
   - Press `Win+R`
   - Type: `shell:startup`
   - Copy `C:\Users\YOUR_USERNAME\AppData\Local\RemedyAssistant\start-services-hidden.vbs` to this folder

2. Reboot Windows

3. Services will start automatically in background (no windows)

### Option 2: Visible Console Window

1. Create shortcut to `start-services.bat` in Startup folder:
   - Press `Win+R`
   - Type: `shell:startup`
   - Right-click → New → Shortcut
   - Browse to: `C:\Users\YOUR_USERNAME\AppData\Local\RemedyAssistant\start-services.bat`

2. Reboot Windows

3. Console window will appear showing service status

## Browser Setup

### Add Auto-Inject Snippet (One-Time)

1. Open Chrome/Edge
2. Press `F12` (DevTools)
3. Go to **Sources** tab → **Snippets** (left sidebar)
4. Click **+ New snippet**
5. Name it: `Remedy Assistant Auto-Inject`
6. Paste contents of `remedy-buttons-auto-inject.js`
7. Press `Ctrl+S` to save

Now buttons will appear automatically whenever you load Remedy!

## Verification

### Check Services Running

Open Command Prompt:

```batch
tasklist | findstr "ollama"
tasklist | findstr "python"
```

You should see both processes.

### Test Backend

Open browser: http://localhost:5000

You should see the Remedy Assistant web interface.

## Troubleshooting

### Backend doesn't start
- Run `install-packages.bat` again
- Check if Python packages installed: `python\python.exe -m pip list`

### Ollama not responding
- Check if Ollama installed: `where ollama`
- Restart Ollama: `taskkill /F /IM ollama.exe` then run startup script again

### Services don't auto-start
- Check Startup folder (`Win+R` → `shell:startup`)
- Verify VBS file is there
- Check Windows Event Viewer for errors
