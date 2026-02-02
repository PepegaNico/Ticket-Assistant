#!/usr/bin/env python3
"""
Remedy Ticket Assistant - Auto Launcher
Starts the backend server and opens the web interface automatically
"""

import os
import sys
import time
import subprocess
import webbrowser
import signal
import http.client
from pathlib import Path

# Configuration
BACKEND_PORT = 5000
BACKEND_HOST = "localhost"
UI_PATH = "app/index.html"  # Web UI path

class RemedyAssistantLauncher:
    def __init__(self):
        self.backend_process = None
        self.base_dir = Path(__file__).parent
        self.backend_dir = self.base_dir / "backend"
        self.ui_file = self.base_dir / UI_PATH
        
    def check_backend_health(self):
        """Check if backend is responding"""
        try:
            conn = http.client.HTTPConnection(BACKEND_HOST, BACKEND_PORT, timeout=2)
            conn.request("GET", "/health")
            response = conn.getresponse()
            conn.close()
            return response.status == 200
        except:
            return False
    
    def start_backend(self):
        """Start the Python backend server"""
        print("🚀 Starting backend server...")
        
        # Find Python executable
        venv_python = self.backend_dir / "venv" / "bin" / "python3"
        if not venv_python.exists():
            print("❌ Backend not installed. Please run: cd backend && ./install.sh")
            sys.exit(1)
        
        server_script = self.backend_dir / "server.py"
        
        # Start backend process
        self.backend_process = subprocess.Popen(
            [str(venv_python), str(server_script)],
            cwd=str(self.backend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={**os.environ, 'PYTHONUNBUFFERED': '1'}
        )
        
        # Wait for backend to be ready
        print("⏳ Waiting for backend to start...")
        for i in range(30):
            if self.check_backend_health():
                print("✅ Backend is running on http://{}:{}".format(BACKEND_HOST, BACKEND_PORT))
                return True
            time.sleep(1)
        
        print("❌ Backend failed to start within 30 seconds")
        return False
    
    def open_ui(self):
        """Open the web UI in default browser"""
        print("🌐 Opening web interface...")
        
        ui_url = f"file://{self.ui_file.absolute()}"
        webbrowser.open(ui_url)
        print("✅ Web interface opened")
    
    def run(self):
        """Main launcher logic"""
        print("=" * 50)
        print("🎫 Remedy Ticket Assistant")
        print("=" * 50)
        print()
        
        # Start backend
        if not self.start_backend():
            sys.exit(1)
        
        # Give it a moment to fully initialize
        time.sleep(2)
        
        # Open UI
        self.open_ui()
        
        print()
        print("=" * 50)
        print("✅ Application is running!")
        print("=" * 50)
        print()
        print("Backend: http://{}:{}".format(BACKEND_HOST, BACKEND_PORT))
        print("Press Ctrl+C to stop")
        print()
        
        # Keep running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n🛑 Shutting down...")
            self.cleanup()
    
    def cleanup(self):
        """Cleanup on exit"""
        if self.backend_process:
            print("Stopping backend server...")
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
        print("✅ Stopped")

def main():
    # Handle signals
    def signal_handler(sig, frame):
        print("\n\n🛑 Shutting down...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Run launcher
    launcher = RemedyAssistantLauncher()
    launcher.run()

if __name__ == "__main__":
    main()
