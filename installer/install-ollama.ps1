# Install Ollama silently
$ollamaUrl = "https://ollama.ai/download/OllamaSetup.exe"
$installerPath = "$env:TEMP\OllamaSetup.exe"

Write-Host "Downloading Ollama..."
try {
    # Check if Ollama already installed
    $ollamaInstalled = Get-Command ollama -ErrorAction SilentlyContinue
    if ($ollamaInstalled) {
        Write-Host "Ollama already installed, skipping download"
        exit 0
    }

    # Download installer
    Invoke-WebRequest -Uri $ollamaUrl -OutFile $installerPath -UseBasicParsing
    
    # Install silently
    Write-Host "Installing Ollama..."
    Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait -NoNewWindow
    
    # Cleanup
    Remove-Item $installerPath -Force
    
    Write-Host "Ollama installed successfully"
    exit 0
}
catch {
    Write-Host "Error installing Ollama: $_"
    exit 1
}
