# Remedy Ticket Assistant - Auto Launcher

## Quick Start

**Single command to run everything:**

```bash
./launcher.py
```

That's it! The launcher will:
1. Start the Python backend automatically
2. Open the web interface in your browser
3. Keep everything running

Press `Ctrl+C` to stop.

## What It Does

The launcher is a tiny Python script that:
- Starts the backend server (Flask + Python)
- Checks that backend is healthy
- Opens your default browser to the web UI
- Manages the backend process lifecycle

## Features

All features from the original extension:
- 🌐 **Translation** - Translate text to any language
- 🤖 **AI Questions** - Get suggested questions for customers
- ✨ **AI Resolution** - Auto-generate resolution text
- 📋 **Ticket Interface** - Simulate Remedy tickets
- 🔒 **100% Local** - All processing on your machine

## First Time Setup

```bash
# 1. Install backend (one time only)
cd backend
./install.sh

# 2. (Optional) Install Ollama for AI features
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3:8b

# 3. Return to main directory
cd ..

# 4. Run the app
./launcher.py
```

## Daily Use

Just run:
```bash
./launcher.py
```

## File Structure

```
ticketassistant/
├── launcher.py          # Auto-launcher (THIS IS THE APP!)
├── app/                 # Web UI
│   ├── index.html      # Main interface
│   ├── styles.css      # Styling
│   └── app.js          # Application logic
└── backend/            # Python backend (auto-started)
    ├── server.py
    ├── venv/
    └── ...
```

## How It Works

1. **You run:** `./launcher.py`
2. **Launcher starts:** Python backend on port 5000
3. **Launcher opens:** Web UI in your default browser
4. **You work:** Use the interface
5. **You stop:** Press Ctrl+C

## Advantages

✅ **No installation** - Just run one script
✅ **No browser extension** - No extension permissions needed
✅ **No Electron** - No 200MB download
✅ **Reuses existing UI** - Your beautiful web interface
✅ **Single file** - Launcher is ~100 lines of Python
✅ **Works immediately** - No npm, no network downloads

## Creating a Desktop Shortcut (Optional)

### Linux
```bash
# Create .desktop file
cat > ~/.local/share/applications/remedy-assistant.desktop << 'EOF'
[Desktop Entry]
Name=Remedy Ticket Assistant
Comment=AI-powered ticket assistant
Exec=/path/to/ticketassistant/launcher.py
Icon=applications-office
Terminal=true
Type=Application
Categories=Office;Utility;
EOF
```

### Windows
Right-click `launcher.py` → Send to → Desktop (create shortcut)

### macOS
```bash
# Create an Automator app or alias
```

## Troubleshooting

**Backend fails to start:**
```bash
cd backend
./install.sh
```

**Port 5000 in use:**
Edit `launcher.py`, change `BACKEND_PORT = 5000` to another port

**Browser doesn't open:**
Manually open: `file:///path/to/ticketassistant/app/index.html`

**AI not working:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3:8b

# Check it's running
ollama list
```

## Comparison to Alternatives

| Feature | Auto-Launcher | Electron App | Extension |
|---------|--------------|--------------|-----------|
| Size | 1KB script | 150MB | 500KB |
| Install time | Instant | 5 minutes | 2 minutes |
| Network needed | No | Yes (npm) | No |
| UI quality | Excellent | Excellent | Excellent |
| Standalone | Browser needed | Yes | Browser needed |
| Updates | Edit HTML | Rebuild | Reload extension |

## What's Next?

This launcher can easily be upgraded to:
- Add system tray icon (using `pystray`)
- Auto-start on system boot
- Check for updates
- Package as single executable (using `PyInstaller`)

For now, it's simple and works perfectly!
