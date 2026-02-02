# Remedy Assistant - Quick Start Guide

## Is Backend Running?

The buttons need the backend running on your PC. Check:

1. Open browser → `http://localhost:5000`
2. If you see the assistant web app → ✅ Backend is running
3. If "can't connect" → ❌ Backend not installed/running

---

## Installation Status

**Not Installed Yet?**

Download and run the installer:

1. **Download:** https://github.com/PepegaNico/Ticket-Assistant/raw/main/RemedyAssistant-Complete.zip
2. **Extract** the zip file
3. **Run:** `install.bat` (as Administrator)
4. **Wait:** 10-15 minutes (installs Python, Ollama, AI model ~2GB)
5. **Start:** Desktop shortcut "Remedy Assistant" or `Start-RemedyAssistant.bat`

**Already Installed?**

Just start the backend:
- Double-click `Start-RemedyAssistant.bat` 
- Or desktop shortcut "Remedy Assistant"
- Leave the window open while using

---

## Testing the Buttons

1. **Make sure backend is running** (see above)

2. **In Remedy, inject the buttons:**
   - Press F12 → Sources → Snippets
   - Right-click your `remedy-assistant` snippet → Run
   - Or re-paste the code in Console

3. **Click "🔧 Test Connection"**
   - Should show: ✅ Connection successful!
   - If not, backend isn't running

4. **Fill in a ticket description**

5. **Click a button:**
   - 💬 Questions
   - ✅ Resolution  
   - 🇬🇧 Translate

---

## Troubleshooting

### "Cannot connect to backend"
→ Backend not running. Start it (see above)

### "Failed to fetch"
→ Backend URL wrong. Should be `http://localhost:5000`
→ Check line 8 in the button script

### Buttons don't appear
→ Re-run the snippet (F12 → Sources → Snippets → Run)

### "Please fill in description first"
→ Type something in the ticket description field
→ Or check console for field selector debug info

### AI not generating responses
→ Ollama not installed. Run full installer (see above)
→ Or check: `http://localhost:5000/health` shows `"ai":"available"`

---

## Daily Use

**Morning:**
1. Start `Start-RemedyAssistant.bat` (or use desktop shortcut)
2. Minimize the window (keep it running)

**When using Remedy:**
1. Open ticket
2. Run button snippet (F12 → Sources → Snippets → Ctrl+Enter)
3. Use AI buttons as needed

**End of day:**
1. Close the backend window (or leave it running)

---

## Network Architecture

**Wrong (doesn't work - firewall blocks):**
```
Work PC Browser → VDI (10.128.128.178:5000) → ❌ BLOCKED
```

**Correct (works):**
```
Work PC Browser → Work PC (localhost:5000) → ✅ WORKS
```

Each service desk agent needs their own installation on their work PC!
