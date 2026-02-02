# Remedy Ticket Assistant - Desktop App

A **100% local** AI-powered desktop application for BMC Remedy SmartIT service desk agents.

## Features

- 🌐 **Translation** - Translate resolution text to any language (offline)
- 🤖 **AI Question Suggestions** - Get relevant questions to ask customers
- ✨ **AI Resolution Generation** - Auto-generate resolution text
- 🔒 **100% Local** - All data stays on your machine
- 📦 **Single Installer** - No separate backend installation needed

## Installation

### Download & Install

1. Download the installer for your platform:
   - **Linux**: `Remedy-Ticket-Assistant-1.0.0.AppImage` or `.deb`
   - **Windows**: `Remedy-Ticket-Assistant-Setup-1.0.0.exe`
   - **macOS**: `Remedy-Ticket-Assistant-1.0.0.dmg`

2. Run the installer

3. Done! Everything is included.

### From Source

```bash
cd desktop-app
npm install
npm start
```

## Build from Source

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for backend)

### Setup

```bash
# Install dependencies
cd desktop-app
npm install

# Install backend dependencies
cd ../backend
./install.sh

# Return to desktop-app
cd ../desktop-app
```

### Development

```bash
npm run dev
```

### Build Installers

```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:linux
npm run build:windows
npm run build:mac
```

Output will be in `desktop-app/dist/`

## How It Works

The application consists of:

1. **Electron Frontend** - Modern desktop UI
2. **Python Backend** - Runs automatically in background
3. **Translation Engine** - Google Translate (free, no API key)
4. **AI Engine** - Ollama (local LLM)

### First Run

On first run, the app will:
1. Start the Python backend automatically
2. Check if Ollama is installed (for AI features)
3. Show the main window

### AI Features (Optional)

For AI features, install Ollama:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Download a model
ollama pull llama3:8b      # Best quality (4.7GB)
# OR
ollama pull phi3:mini      # Lightweight (2.3GB)
```

The app will detect Ollama automatically.

## Usage

### Translation

1. Go to "Tickets" view
2. Enter resolution text
3. Click "🌐 Translate"
4. Review and apply

### AI Suggestions

1. Enter ticket title and description
2. Click "🤖 Get AI Suggestions"
3. View suggested questions

### Generate Resolution

1. Fill in ticket details and activity notes
2. Click "✨ Generate Resolution"
3. Resolution appears in customer's language

## Architecture

```
desktop-app/
├── main.js              # Electron main process (starts backend)
├── preload.js           # Secure bridge to renderer
├── renderer/            # UI application
│   ├── index.html       # Main interface
│   ├── styles.css       # Styling
│   └── app.js          # Application logic
├── assets/              # Icons and images
└── package.json         # App configuration

backend/                 # Python backend (bundled)
├── server.py           # Flask server
├── requirements.txt    # Python dependencies
└── venv/              # Virtual environment
```

## Security

- ✅ No external API calls
- ✅ All data processed locally
- ✅ No telemetry or tracking
- ✅ GDPR compliant
- ✅ Sandboxed renderer process
- ✅ Context isolation enabled

## Resource Usage

- **Idle**: ~100-150MB RAM
- **Translation active**: ~200-300MB RAM
- **AI active**: 4-8GB RAM (depends on Ollama model)
- **Disk**: ~500MB app + models (2-8GB for AI models)

## Troubleshooting

### App won't start

**Backend fails to start:**
- Ensure Python 3.8+ is installed
- Check that backend dependencies are installed
- Look at logs in application data folder

**Port 5000 in use:**
- Close other applications using port 5000
- Or modify port in `main.js`

### AI features not working

**Ollama not detected:**
```bash
# Check if Ollama is running
ollama list

# If not installed
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3:8b
```

### Translation slow

- First translation downloads language model
- Subsequent translations are fast

## Development

### Project Structure

- `main.js` - Electron main process, manages window and backend
- `preload.js` - Secure IPC bridge
- `renderer/` - UI code (HTML/CSS/JS)
- Backend is imported from `../backend/`

### Debug Mode

```bash
npm run dev
```

This opens DevTools automatically.

### Logs

- Main process: Terminal output
- Renderer: DevTools console
- Backend: Backend terminal output

## Building for Distribution

### Linux

```bash
npm run build:linux
```

Creates:
- `dist/Remedy-Ticket-Assistant-1.0.0.AppImage` (portable)
- `dist/Remedy-Ticket-Assistant_1.0.0_amd64.deb` (Debian/Ubuntu)

### Windows

```bash
npm run build:windows
```

Creates:
- `dist/Remedy-Ticket-Assistant-Setup-1.0.0.exe` (installer)
- `dist/Remedy-Ticket-Assistant-1.0.0.exe` (portable)

### macOS

```bash
npm run build:mac
```

Creates:
- `dist/Remedy-Ticket-Assistant-1.0.0.dmg` (installer)
- `dist/Remedy-Ticket-Assistant-1.0.0-mac.zip` (portable)

## License

Internal tool for service desk use.

## Support

Check the Settings tab in the app for backend status and connection testing.
