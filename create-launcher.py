#!/usr/bin/env python3
"""
Create Windows executable launcher using PyInstaller
This creates RemedyAssistant.exe that can be used as the main application entry point
"""

import PyInstaller.__main__
import sys
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))

# PyInstaller options
options = [
    'launcher.py',                          # Main script
    '--name=RemedyAssistant',               # Output name
    '--onefile',                            # Single executable
    '--windowed',                           # No console window
    '--icon=app/icon.ico' if os.path.exists('app/icon.ico') else '',  # Icon
    '--add-data=app;app',                   # Include app folder
    f'--distpath={script_dir}/dist',        # Output directory
    f'--workpath={script_dir}/build',       # Build directory
    '--clean',                              # Clean cache
    '--noconfirm',                          # Overwrite without asking
]

# Remove empty icon parameter if no icon exists
options = [opt for opt in options if opt]

print("Building Windows executable...")
print("This will create RemedyAssistant.exe")
print()

try:
    PyInstaller.__main__.run(options)
    print()
    print("="*50)
    print("Build complete!")
    print(f"Executable: {script_dir}/dist/RemedyAssistant.exe")
    print("="*50)
except Exception as e:
    print(f"Build failed: {e}")
    sys.exit(1)
