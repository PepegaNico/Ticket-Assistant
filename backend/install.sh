#!/bin/bash
# Installation script for Remedy Ticket Assistant Backend

echo "=========================================="
echo "Remedy Ticket Assistant - Backend Setup"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "Found Python $PYTHON_VERSION"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Install Ollama for AI features (optional):"
echo "   curl -fsSL https://ollama.com/install.sh | sh"
echo "   ollama pull llama3:8b"
echo ""
echo "2. Start the backend service:"
echo "   ./start.sh"
echo ""
echo "3. Configure the extension to use http://localhost:5000"
echo ""
