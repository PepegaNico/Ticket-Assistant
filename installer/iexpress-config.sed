[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=0
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=%DisplayLicense%
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=%AdminQuietInstCmd%
UserQuietInstCmd=%UserQuietInstCmd%
SourceFiles=SourceFiles

[Strings]
InstallPrompt=Install Remedy Ticket Assistant? This will download ~3GB of files.
DisplayLicense=
FinishMessage=Installation complete! Check your desktop for "Remedy Assistant" shortcut.
TargetName=RemedyAssistant-Setup.exe
FriendlyName=Remedy Ticket Assistant Installer
AppLaunched=cmd /c install.bat
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
FILE0="install.bat"

[SourceFiles]
SourceFiles0=.
[SourceFiles0]
%FILE0%=
