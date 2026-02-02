# Windows Installation Guide

## Prerequisites

### 1. Install Python 3.12+

Download from: https://www.python.org/downloads/

**IMPORTANT**: During installation, check ✅ "Add Python to PATH"

Verify installation:
```cmd
python --version
```

### 2. Install Git (if not already installed)

Download from: https://git-scm.com/download/win

## Installation Steps

### Step 1: Clone Repository

Open Command Prompt or PowerShell:

```cmd
git clone https://github.com/PepegaNico/Ticket-Assistant.git
cd Ticket-Assistant
```

### Step 2: Install Backend

```cmd
cd backend
install.bat
```

This will:
- Create a Python virtual environment
- Install all required packages (Flask, deep-translator, etc.)
- Take about 1-2 minutes

### Step 3: Install Ollama

1. Download Ollama for Windows: https://ollama.ai/download/windows
2. Run the installer (OllamaSetup.exe)
3. Open a new Command Prompt and verify:
   ```cmd
   ollama --version
   ```

### Step 4: Download AI Model

```cmd
ollama pull llama3.2:3b
```

This downloads ~2GB. Wait for completion (about 5-10 minutes depending on connection).

**Alternative smaller model** (if 2GB is too large):
```cmd
ollama pull qwen2.5:1.5b
```

If using the smaller model, edit `backend\server.py` line 169:
```python
def call_ollama(prompt, model='qwen2.5:1.5b'):  # Changed from llama3.2:3b
```

### Step 5: Configure Proxy (if needed)

If you're behind a corporate proxy, configure Ollama:

Create/edit `%USERPROFILE%\.ollama\config.json`:
```json
{
  "proxy": "http://your-proxy:8080"
}
```

Restart Ollama service from Task Manager or:
```cmd
taskkill /F /IM ollama.exe
ollama serve
```

## Running the Application

### Start the App

From the repository root:

```cmd
python launcher.py
```

This will:
1. Start the Flask backend on port 5000
2. Open the web interface in your default browser
3. Display status information

### Access the Web Interface

Browser should open automatically to `http://localhost:5000` or the file path.

If not, manually open: http://localhost:5000/health

## Installing Browser Extension

### Load Extension in Chrome/Edge

1. Open Chrome/Edge
2. Navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `extension` folder from the cloned repository
6. Extension icon should appear in toolbar

### Configure Extension

1. Click the extension icon
2. Backend URL should be: `http://localhost:5000`
3. Click **Save Settings**
4. Status should show "✅ Connected"

### Test in Remedy

1. Open your Remedy SmartIT system
2. Navigate to a ticket
3. AI buttons should appear automatically:
   - 🤖 **Get AI Suggestions** on Description field
   - ✨ **Generate Resolution** on Activity Notes
   - 🌐 **Translate** on Resolution field

## Troubleshooting

### Python not found

- Ensure Python is installed and in PATH
- Restart Command Prompt after installing Python
- Try `py --version` instead of `python --version`

### pip install fails

```cmd
python -m pip install --upgrade pip
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### Ollama not found

- Verify installation: `ollama --version`
- Check if service is running: Task Manager → Services → Ollama
- Restart Ollama: `ollama serve`

### Backend won't start

```cmd
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, change port in backend\server.py line 244:
app.run(host='0.0.0.0', port=5001, debug=False)  # Changed to 5001
```

### AI features not working

```cmd
# Check Ollama is running
ollama list

# Test Ollama
ollama run llama3.2:3b "Hello"

# Check backend logs
type backend\server.log
```

### Extension not working

- Verify backend is running: http://localhost:5000/health
- Check browser console (F12 → Console)
- Verify extension permissions (chrome://extensions/)
- Check backend URL in extension settings

## Uninstallation

### Remove Application

```cmd
cd Ticket-Assistant
cd backend
deactivate  # Exit virtual environment
cd ..\..
rmdir /s /q Ticket-Assistant
```

### Uninstall Ollama

1. Control Panel → Programs → Uninstall Ollama
2. Delete `%USERPROFILE%\.ollama` folder
3. Delete models (can be several GB)

### Remove Extension

1. Go to `chrome://extensions/`
2. Click **Remove** on Remedy Ticket Assistant

## Network Configuration

### Allow Backend Through Firewall

If accessing from another device:

1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Port → TCP → 5000
4. Allow the connection
5. Name: "Remedy Assistant Backend"

### Access from Remote Device

Backend URL: `http://YOUR_PC_IP:5000`

Find your IP:
```cmd
ipconfig
```

Look for "IPv4 Address" under your active network adapter.

## Performance Tips

- **Faster responses**: Use smaller model (qwen2.5:1.5b)
- **Better quality**: Use larger model (llama3.2:3b or llama3:8b)
- **GPU acceleration**: Ollama automatically uses GPU if available (NVIDIA/AMD)

## Support

- GitHub Issues: https://github.com/PepegaNico/Ticket-Assistant/issues
- Check logs: `backend\server.log`
- Verify backend health: http://localhost:5000/health

## What's Installed?

```
Ticket-Assistant/
├── backend/
│   ├── venv/              # Python virtual environment (~100MB)
│   ├── server.py          # Flask backend server
│   └── requirements.txt   # Python dependencies
├── extension/             # Browser extension files
├── app/                   # Standalone web interface
└── launcher.py            # Application launcher
```

**Ollama models** are stored in:
- `%USERPROFILE%\.ollama\models\`
- llama3.2:3b = ~2GB
- qwen2.5:1.5b = ~1GB

Total disk space: ~3-4GB (including Python packages and models)
