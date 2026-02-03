' Start Remedy Assistant Services Hidden (No Console Windows)
' This VBS script starts the services without showing command prompt windows

Set WshShell = CreateObject("WScript.Shell")

' Get the RemedyAssistant path
assistantPath = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\RemedyAssistant"

' Start Ollama service hidden
WshShell.Run "ollama serve", 0, False

' Wait 3 seconds for Ollama to initialize
WScript.Sleep 3000

' Start Backend server hidden
WshShell.Run assistantPath & "\python\python.exe " & assistantPath & "\backend\server.py", 0, False

' Script exits immediately - services run in background
