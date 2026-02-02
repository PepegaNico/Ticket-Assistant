# Testing with Real Remedy

## Option 1: Bookmarklet (Recommended - No Extension Needed)

### Setup Steps:

1. **Find Remedy Field Names**
   - Open a Remedy ticket in your browser
   - Press F12 to open Developer Tools
   - Click "Elements" or "Inspector" tab
   - Click the inspect tool (cursor icon) and click on ticket fields
   - Note down the field selectors (aria-label, name, id, or class)

2. **Update Bookmarklet**
   - Open `remedy-bookmarklet.js`
   - Update the selectors to match your Remedy instance:
     ```javascript
     description: document.querySelector('[YOUR-SELECTOR-HERE]')?.innerText
     ```

3. **Create Bookmark**
   - Create a new bookmark in your browser
   - Name it: "Send to Remedy Assistant"
   - Copy the entire content from `remedy-bookmarklet.js`
   - Paste it as the bookmark URL
   - Save

4. **Use It**
   - Open any Remedy ticket
   - Click the bookmarklet
   - Ticket data opens in the assistant

---

## Option 2: Manual Copy-Paste

**Simplest approach for testing:**

1. Open Remedy ticket
2. Copy ticket description
3. Open assistant at: http://10.128.128.178:5000
4. Paste description in the text area
5. Use AI features

---

## Option 3: Side-by-Side Windows

**Best for daily use:**

1. Split your screen (Windows key + Left/Right arrow)
2. Remedy on left, Assistant on right (http://10.128.128.178:5000)
3. Copy ticket details from Remedy
4. Paste into Assistant
5. Generate questions/resolution
6. Copy results back to Remedy

---

## Finding Remedy Field Selectors

### Method 1: Developer Tools
```
1. Open Remedy ticket
2. Press F12 (Developer Tools)
3. Click Elements/Inspector tab
4. Right-click a field → Inspect
5. Look for: id, name, aria-label, or class
```

### Common Remedy Field Patterns:
```javascript
// Try these selectors in order until you find what works:

// Description field:
document.querySelector('textarea[id*="Description"]')
document.querySelector('[aria-label="Description"]')
document.querySelector('textarea[name*="z1D_Action"]')

// Incident Number:
document.querySelector('[aria-label="Incident Number"]')
document.querySelector('input[id*="Incident_Number"]')

// Summary:
document.querySelector('[aria-label="Summary"]')
document.querySelector('input[name*="Description"]')

// Category:
document.querySelector('[aria-label="Categorization Tier 1"]')
```

### Test Your Selectors:
1. Open Remedy ticket
2. Press F12 → Console tab
3. Paste selector (e.g., `document.querySelector('textarea[id*="Description"]')`)
4. Press Enter
5. If it returns an element → ✅ selector works
6. If it returns null → ❌ try another selector

---

## Example Workflow

**Scenario: User reports "Cannot access email"**

1. Open ticket in Remedy (left half of screen)
2. Open Assistant (right half): http://10.128.128.178:5000
3. Copy ticket description from Remedy
4. Paste into Assistant
5. Click "Generate Questions"
6. Copy generated questions
7. Paste into Remedy ticket to ask user
8. User responds with more details
9. Update description in Assistant
10. Click "Generate Resolution"
11. Copy suggested resolution
12. Paste into Remedy resolution field
13. Close ticket

---

## Need Actual Remedy Integration?

If you want to click a button IN Remedy that opens the assistant automatically:

**You'll need:**
- Access to Remedy administrator
- Create custom button/action in Remedy
- Button opens URL: `http://10.128.128.178:5000?ticket=` + ticket data

**OR**

- Use Tampermonkey (if allowed) - userscript that adds button to Remedy
- Contact your IT security team about allowing userscripts

---

## Testing Checklist

- [ ] Backend running on VDI (http://10.128.128.178:5000)
- [ ] Can access assistant from work PC browser
- [ ] Ollama installed and model downloaded
- [ ] Translation works (test German ↔ English)
- [ ] AI Questions generate correctly
- [ ] AI Resolution generates correctly
- [ ] Copy-paste workflow works with real ticket
- [ ] Bookmarklet created (optional)
- [ ] Bookmarklet extracts data correctly (optional)

---

## Troubleshooting

**Assistant not loading?**
- Check VDI backend is running: `curl http://localhost:5000`
- Check firewall allows port 5000
- Try from VDI first: http://localhost:5000

**AI not generating responses?**
- Check Ollama: `ollama list` (should show llama3.2:3b)
- Check Ollama running: `systemctl status ollama` (on VDI)
- Test Ollama: `ollama run llama3.2:3b "Hello"`

**Bookmarklet not extracting data?**
- Open Developer Tools (F12)
- Check Console for errors
- Verify field selectors match your Remedy version
- Update selectors in bookmarklet code
