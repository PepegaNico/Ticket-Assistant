# Installing Buttons Directly in Remedy

## Method 1: Tampermonkey (Recommended if Allowed)

### Installation Steps:

1. **Install Tampermonkey**
   - Chrome: [Chrome Web Store - Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Firefox Add-ons - Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - Edge: [Edge Add-ons - Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. **Install the Userscript**
   - Click the Tampermonkey icon in your browser
   - Select "Create a new script"
   - Delete all existing code
   - Copy content from `remedy-assistant-userscript.js`
   - Paste into the editor
   - **IMPORTANT: Update line 8-9 with your actual Remedy URL:**
     ```javascript
     // @match        https://YOUR-REMEDY-URL.com/*
     // @match        http://YOUR-REMEDY-URL.com/*
     ```
   - Save (Ctrl+S or File → Save)

3. **Configure Field Selectors**
   - Open a Remedy ticket
   - Press F12 (Developer Tools)
   - Find the correct selectors for your fields (see below)
   - Update lines 26-28, 75-82 in the userscript
   - Save

4. **Test**
   - Refresh your Remedy page
   - You should see AI Assistant buttons above the description field
   - Click "Generate Questions" or other buttons

---

## Method 2: Browser Console Injection (If Tampermonkey Blocked)

If userscript managers are blocked, you can inject the code manually:

1. **Save the Code**
   - Copy content from `remedy-assistant-userscript.js`
   - Remove lines 1-11 (the `==UserScript==` header)
   - Save as `remedy-inject.js` on your desktop

2. **Inject Each Time You Use Remedy**
   - Open Remedy ticket
   - Press F12 (Developer Tools)
   - Go to "Console" tab
   - Drag and drop `remedy-inject.js` into the console
   - Press Enter
   - Buttons appear!

**Pro Tip:** Create a bookmark with the code to inject with one click:
```javascript
javascript:(function(){/* PASTE ENTIRE SCRIPT HERE */})();
```

---

## Method 3: Group Policy / IT Admin Deployment

Ask your IT department to:

1. **Deploy Tampermonkey via Group Policy**
   - IT can silently install browser extensions via GPO
   - Request: "Please allow Tampermonkey extension"

2. **Deploy the Userscript via GPO**
   - IT can auto-install specific userscripts
   - Provide them: `remedy-assistant-userscript.js`

3. **Whitelist the Backend URL**
   - Ensure firewall allows: `http://10.128.128.178:5000`

---

## Finding Your Remedy Field Selectors

Your Remedy instance may use different field IDs. Here's how to find them:

### Step-by-Step:

1. **Open Remedy ticket**
2. **Press F12** (Developer Tools)
3. **Click "Elements" tab**
4. **Click the inspect tool** (cursor icon top-left)
5. **Click on the Description field in Remedy**
6. **Look for:**
   - `id="..."`
   - `name="..."`
   - `aria-label="..."`
   - `class="..."`

### Example Findings:

```javascript
// If you find: <textarea id="arid_WIN_3_1000000151" name="z1D_Action">
// Use this selector:
document.querySelector('textarea[name="z1D_Action"]')

// Or if you find: <textarea aria-label="Detailed Description">
// Use this:
document.querySelector('[aria-label="Detailed Description"]')
```

### Update These Lines in the Userscript:

**Line 26-28** (Finding description field):
```javascript
const descriptionField = document.querySelector('YOUR_SELECTOR_HERE') ||
                         document.querySelector('BACKUP_SELECTOR_HERE') ||
                         document.querySelector('ANOTHER_OPTION_HERE');
```

**Line 75-82** (Getting ticket data):
```javascript
description: document.querySelector('YOUR_DESCRIPTION_SELECTOR')?.value || '',
summary: document.querySelector('YOUR_SUMMARY_SELECTOR')?.value || '',
ticketId: document.querySelector('YOUR_TICKETID_SELECTOR')?.value || '',
```

---

## Common Remedy Field Selectors

Try these common patterns:

### Description Field:
```javascript
document.querySelector('textarea[id*="Description"]')
document.querySelector('textarea[name*="z1D_Action"]')
document.querySelector('[aria-label="Description"]')
document.querySelector('[aria-label="Detailed Description"]')
document.querySelector('textarea[name="Detailed_Decription"]')
```

### Incident Number:
```javascript
document.querySelector('input[id*="Incident_Number"]')
document.querySelector('[aria-label="Incident Number"]')
document.querySelector('input[name="Incident Number"]')
```

### Summary:
```javascript
document.querySelector('input[id*="Summary"]')
document.querySelector('[aria-label="Summary"]')
document.querySelector('input[name="Description"]')
```

### Category:
```javascript
document.querySelector('[aria-label="Categorization Tier 1"]')
document.querySelector('select[id*="Categorization"]')
```

---

## What the Buttons Do

Once installed, you'll see these buttons in Remedy:

1. **🤖 Generate Questions**
   - Reads ticket description
   - Generates troubleshooting questions
   - Shows in popup → Insert into Remedy or Copy

2. **🤖 Generate Resolution**
   - Reads ticket details
   - Generates solution steps
   - Shows in popup → Insert into Remedy or Copy

3. **🤖 Translate to English**
   - Translates German → English
   - Shows result → Insert or Copy

4. **🤖 Translate to German**
   - Translates English → German
   - Shows result → Insert or Copy

5. **🤖 Open Full Assistant**
   - Opens assistant in new window
   - Pre-fills with current ticket data

---

## Troubleshooting

### Buttons Don't Appear
- Check Tampermonkey is enabled (icon should be green)
- Check script is enabled in Tampermonkey dashboard
- Check `@match` URL matches your Remedy URL
- Check Console (F12) for errors
- Try refreshing the page

### "Description field not found"
- Field selectors don't match your Remedy
- Use F12 to find correct selectors
- Update lines 26-28 in the script

### "Error connecting to assistant"
- Backend not running: Check `http://10.128.128.178:5000`
- Firewall blocking: Contact IT to allow port 5000
- Proxy issues: May need CORS configuration

### Buttons Look Wrong
- CSS conflicts with Remedy
- Try adjusting styles in lines 35-45

---

## Security Note

**This userscript:**
- ✅ Only runs on your Remedy URL
- ✅ Only connects to your internal backend (10.128.128.178)
- ✅ Doesn't send data to external servers
- ✅ Open source - you can review all code

**Ask your IT security team to review** `remedy-assistant-userscript.js` before installing.

---

## Alternative: Browser Extension

If your organization **does** allow extensions but you haven't tried yet:

I can create a proper Chrome/Edge extension that:
- Adds buttons to Remedy automatically
- No manual setup needed
- More reliable than userscripts
- Can be distributed internally

Let me know if you want this option!
