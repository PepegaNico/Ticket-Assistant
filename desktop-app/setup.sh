#!/bin/bash
# Setup script for Remedy Ticket Assistant Desktop App

echo "=========================================="
echo "Remedy Ticket Assistant - Desktop Setup"
echo "=========================================="
echo ""

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js 18+ required (you have $(node --version))"
    exit 1
fi

echo "✓ Node.js $(node --version)"

# Check Python
echo ""
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8+"
    exit 1
fi

echo "✓ Python $(python3 --version)"

# Install Node dependencies
echo ""
echo "Installing Node.js dependencies..."
npm install

# Setup backend
echo ""
echo "Setting up Python backend..."
cd ../backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

cd ../desktop-app

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "To run the app:"
echo "  npm start"
echo ""
echo "To build installers:"
echo "  npm run build          # Current platform"
echo "  npm run build:linux    # Linux AppImage/deb"
echo "  npm run build:windows  # Windows installer"
echo "  npm run build:mac      # macOS dmg"
echo ""
echo "Optional - Install Ollama for AI features:"
echo "  curl -fsSL https://ollama.com/install.sh | sh"
echo "  ollama pull llama3:8b"
echo ""
