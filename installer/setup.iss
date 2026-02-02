; Remedy Ticket Assistant - Windows Installer Script
; Requires Inno Setup: https://jrsoftware.org/isinfo.php

#define MyAppName "Remedy Ticket Assistant"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "IT Service Desk"
#define MyAppURL "https://github.com/PepegaNico/Ticket-Assistant"
#define MyAppExeName "RemedyAssistant.exe"

[Setup]
AppId={{A7F8B9C2-3D4E-5F6A-B1C2-D3E4F5A6B7C8}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=..\dist
OutputBaseFilename=RemedyTicketAssistant-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode
Name: "startupicon"; Description: "Start automatically with Windows"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Application files
Source: "..\app\*"; DestDir: "{app}\app"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\backend\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\launcher.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\start.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme

; Portable Python (need to download separately)
Source: "python-embed\*"; DestDir: "{app}\python"; Flags: ignoreversion recursesubdirs createallsubdirs

; Installation scripts
Source: "install-ollama.ps1"; DestDir: "{app}\installer"; Flags: ignoreversion
Source: "first-run.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon

[Run]
; Install Python dependencies
Filename: "{app}\python\python.exe"; Parameters: "-m pip install --no-index --find-links {app}\wheels -r {app}\backend\requirements.txt"; StatusMsg: "Installing Python dependencies..."; Flags: runhidden

; Install Ollama
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\install-ollama.ps1"""; StatusMsg: "Installing Ollama AI engine..."; Flags: runhidden waituntilterminated

; Run first-time setup
Filename: "{app}\first-run.bat"; Description: "Complete setup and download AI model"; Flags: postinstall skipifsilent nowait

[UninstallRun]
Filename: "taskkill"; Parameters: "/F /IM ollama.exe"; Flags: runhidden; RunOnceId: "StopOllama"
Filename: "taskkill"; Parameters: "/F /IM python.exe"; Flags: runhidden; RunOnceId: "StopPython"

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
  if MsgBox('This installer will download and install Ollama (~500MB) and an AI model (~2GB). Continue?', mbConfirmation, MB_YESNO) = IDNO then
    Result := False;
end;
