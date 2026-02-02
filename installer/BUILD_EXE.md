# Building a Standalone .exe Installer

## Method 1: IExpress (Windows Built-in - Recommended)

IExpress is included with Windows and creates self-extracting executables.

### Steps:

1. **Prepare files**:
   - Copy `installer/install.bat` to a temporary folder
   
2. **Run IExpress**:
   ```cmd
   iexpress
   ```

3. **Follow the wizard**:
   - Create new Self Extraction Directive file
   - Extract files and run installation command
   - Package title: "Remedy Ticket Assistant"
   - Confirmation prompt: "Install Remedy Ticket Assistant?"
   - Installation program: `cmd /c install.bat`
   - Add file: `install.bat`
   - Save SED as: `remedy-installer.sed`
   - Output: `RemedyAssistant-Setup.exe`

4. **Or use the pre-made config**:
   ```cmd
   iexpress /N installer\iexpress-config.sed
   ```

**Result**: `RemedyAssistant-Setup.exe` (~5KB) that downloads everything when run

---

## Method 2: 7-Zip SFX (More Options)

If you want to include files in the .exe:

1. **Install 7-Zip**: https://www.7-zip.org/

2. **Create archive**:
   ```cmd
   7z a -t7z RemedyAssistant.7z app\ backend\ launcher.py installer\install.bat
   ```

3. **Create SFX**:
   ```cmd
   copy /b 7zSD.sfx + config.txt + RemedyAssistant.7z RemedyAssistant-Setup.exe
   ```

4. **config.txt**:
   ```
   ;!@Install@!UTF-8!
   Title="Remedy Ticket Assistant"
   RunProgram="installer\\install.bat"
   ;!@InstallEnd@!
   ```

---

## Method 3: NSIS (Professional Installer)

For a professional installer with progress bars, uninstaller, etc:

1. **Download NSIS**: https://nsis.sourceforge.io/

2. **Use the provided script**:
   ```cmd
   makensis installer\nsis-installer.nsi
   ```

**Result**: Full Windows installer like commercial software

---

## Recommended for You

**Use IExpress** - it's already on your PC and creates a simple .exe that:
- Downloads the app from GitHub
- Installs Python automatically  
- Sets everything up
- Creates desktop shortcut

The .exe will be small (~5KB) and work on any Windows PC without triggering security warnings (since it's just a batch file wrapper).

---

## Quick Build Commands

From the repository root:

```cmd
REM Build with IExpress
iexpress /N installer\iexpress-config.sed

REM Result: RemedyAssistant-Setup.exe
```

Then distribute `RemedyAssistant-Setup.exe` to your service desk agents!
