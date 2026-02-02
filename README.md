# 🎫 Remedy Ticket Assistant

AI-powered assistant for BMC Remedy SmartIT service desk agents with local LLM support, translation, and smart suggestions.

## ✨ Features

- 🤖 **AI Question Suggestions** - Automatically generate relevant diagnostic questions based on ticket content
- ✨ **AI Resolution Generation** - Create professional resolution texts using local LLM
- 🌐 **Translation** - Translate resolutions to customer's language (German, French, Spanish, etc.)
- 🔒 **100% Local AI** - Uses Ollama for privacy-focused, offline AI capabilities
- 🎯 **Smart Integration** - Browser extension injects seamlessly into Remedy interface

## 🏗️ Architecture

The project consists of three components:

### 1. Browser Extension (`extension/`)
Injects AI-powered buttons directly into BMC Remedy SmartIT web interface

### 2. Backend Service (`backend/`)
Flask-based REST API providing translation and AI features

### 3. Standalone Web App (`app/` + `launcher.py`)
Demo/testing interface that simulates Remedy ticket workflow

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Ollama for local LLM
- Chrome/Edge browser

### Installation

1. Clone repository
2. Install Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`
3. Download model: `ollama pull llama3.2:3b`
4. Install backend: `cd backend && ./install.sh`
5. Start app: `python3 launcher.py`

See full documentation in repository.

## 📄 License

MIT License
