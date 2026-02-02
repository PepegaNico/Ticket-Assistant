# Remedy Ticket Assistant - Local Backend

This is the local backend service that runs on each agent's PC. It provides translation and AI features completely offline.

## What it does

- **Translation**: Uses Argos Translate (offline, no internet required)
- **AI Suggestions**: Uses Ollama (local LLM, no internet required)
- All data stays on your PC - nothing is sent to external services

## Installation

### Prerequisites

- Python 3.8 or higher
- ~2GB disk space for translation models
- ~4-8GB RAM for AI features

### Quick Install

```bash
# Make install script executable
chmod +x install.sh

# Run installation
./install.sh
```

This will:
1. Create a Python virtual environment
2. Install required packages
3. Download translation models for EN, DE, FR, ES

### Install AI Features (Optional)

For AI-powered suggestions, install Ollama:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Download a model (choose one)
ollama pull llama3:8b        # 4.7GB - Good balance
ollama pull mistral:7b       # 4.1GB - Faster
ollama pull phi3:mini        # 2.3GB - Lightweight

# Start Ollama
ollama serve
```

## Usage

### Start the Backend

```bash
chmod +x start.sh
./start.sh
```

The service will run on `http://localhost:5000`

### Test the Service

```bash
# Health check
curl http://localhost:5000/health

# Test translation
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World", "source_lang": "en", "target_lang": "de"}'
```

### Configure Extension

1. Open the browser extension settings
2. Set backend URL to: `http://localhost:5000`
3. Save settings

## Migrating to a Server (Later)

When ready to move to a central server:

1. **Copy this backend folder to your server**
2. **Run install.sh on the server**
3. **Start the service on the server**
4. **Update extension settings**:
   - Change URL from `http://localhost:5000`
   - To: `http://your-server.company.local:5000`

That's it! No code changes needed.

## API Endpoints

### GET /health
Health check

### POST /translate
Translate text
```json
{
  "text": "Text to translate",
  "source_lang": "en",
  "target_lang": "de"
}
```

### POST /ai/suggest-questions
Get suggested questions for customer
```json
{
  "title": "Cannot access email",
  "template": "email-issue",
  "description": "User reports error message"
}
```

### POST /ai/suggest-resolution
Generate resolution text
```json
{
  "title": "Password reset",
  "description": "User forgot password",
  "activity_notes": "Reset password via AD",
  "target_lang": "de"
}
```

## Resource Usage

- **Idle**: ~50MB RAM
- **Translation**: ~200MB RAM
- **With AI**: ~4-8GB RAM (depends on model)

## Troubleshooting

**Port 5000 already in use:**
```bash
# Edit server.py, change port at the bottom:
app.run(host='0.0.0.0', port=5001, debug=False)
```

**Ollama not connecting:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve
```

**Translation slow first time:**
- First translation downloads the language model
- Subsequent translations are fast

## Supported Languages

- English (en)
- German (de)
- French (fr)
- Spanish (es)
- Italian (it)
- Dutch (nl)
- Polish (pl)
- Portuguese (pt)
- And more...

To add more languages, the backend will auto-download them on first use.
