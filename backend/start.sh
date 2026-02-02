#!/bin/bash
# Start the Remedy Ticket Assistant Backend Service

echo "Starting Remedy Ticket Assistant Backend..."

# Activate virtual environment
source venv/bin/activate

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✓ Ollama is running"
else
    echo "✗ Ollama is not running - AI features will be unavailable"
    echo "  To install Ollama: curl -fsSL https://ollama.com/install.sh | sh"
    echo "  To start Ollama: ollama serve"
fi

echo ""
echo "Backend service starting on http://localhost:5000"
echo "Press Ctrl+C to stop"
echo ""

# Start the server
python3 server.py
