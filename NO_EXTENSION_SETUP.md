# Add Buttons to Remedy - NO EXTENSION NEEDED

Since you cannot install browser extensions, use one of these methods:

---

## 🎯 Method 1: Browser DevTools Snippets (BEST - Saves Permanently)

This method saves the code in your browser so you only set it up once!

### Setup (One-Time):

1. **Open Remedy in your browser**

2. **Press F12** to open Developer Tools

3. **Go to "Sources" tab** (top menu)

4. **Click "Snippets"** on the left sidebar
   - If you don't see it, click the `>>` button to show more tabs

5. **Click "+ New snippet"**

6. **Name it:** `remedy-assistant`

7. **Copy ALL code from:** `remedy-buttons-no-extension.js`

8. **Paste** into the snippet editor

9. **Update line 7** with your backend URL if different:
   ```javascript
   const ASSISTANT_URL = 'http://10.128.128.178:5000';
   ```

10. **Right-click the snippet name** → **Run**
    - Or press **Ctrl+Enter** / **Cmd+Enter**

11. **Buttons appear!** 🎉

### Daily Usage:

Every time you open a Remedy ticket:

1. Press **F12**
2. Go to **Sources** → **Snippets**
3. Right-click `remedy-assistant` → **Run**
4. Or just press **Ctrl+Enter**

**Pro Tip:** Create a keyboard shortcut:
- Chrome: Settings → Keyboard shortcuts → Add shortcut for snippet

---

## 🎯 Method 2: Bookmarklet (One-Click)

Create a bookmark that injects the buttons with one click!

### Setup:

1. **Copy this entire code:**

```javascript
javascript:(function(){const ASSISTANT_URL='http://10.128.128.178:5000';function injectButtons(){if(document.getElementById('remedy-assistant-buttons'))return;const field=document.querySelector('textarea[id*="Description"]')||document.querySelector('textarea[name*="z1D_Action"]')||document.querySelector('[aria-label="Description"]');if(!field){alert('⚠️ Description field not found');return;}const container=document.createElement('div');container.id='remedy-assistant-buttons';container.style.cssText='margin:10px 0;padding:12px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:8px;display:flex;gap:10px;';container.innerHTML='<span style="color:white;font-weight:bold;">🤖 AI:</span>';[{t:'💬 Questions',a:'ai-questions',k:'description'},{t:'✅ Resolution',a:'ai-resolution'},{t:'🇬🇧 EN',a:'translate',k:'target_lang',v:'en'},{t:'🇩🇪 DE',a:'translate',k:'target_lang',v:'de'}].forEach(b=>{const btn=document.createElement('button');btn.textContent=b.t;btn.style.cssText='background:#10b981;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;';btn.onclick=async()=>{const desc=field.value;if(!desc)return alert('⚠️ Fill description first!');const body=b.k==='target_lang'?{text:desc,[b.k]:b.v}:{description:desc};try{const res=await fetch(`${ASSISTANT_URL}/api/${b.a}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await res.json();const result=data.questions||data.resolution||data.translated_text;if(result){if(confirm('✅ Result ready!\n\nOK = Copy to clipboard\nCancel = Insert into ticket')){navigator.clipboard.writeText(result);alert('📋 Copied!');}else{field.value+='\n\n'+result;alert('✅ Inserted!');}}}catch(e){alert('❌ Error: '+e.message);}};container.appendChild(btn);});const fullBtn=document.createElement('button');fullBtn.textContent='🚀 Full';fullBtn.style.cssText='background:#8b5cf6;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;';fullBtn.onclick=()=>window.open(`${ASSISTANT_URL}?ticket=`+encodeURIComponent(JSON.stringify({description:field.value})),'Assistant','width=900,height=900');container.appendChild(fullBtn);field.parentElement.insertBefore(container,field);}injectButtons();})();
```

2. **Create a new bookmark:**
   - Right-click bookmarks bar → **Add page** / **Add bookmark**
   - Name: `🤖 Remedy AI`
   - URL: **Paste the entire code above**
   - Save

3. **Use it:**
   - Open any Remedy ticket
   - Click the `🤖 Remedy AI` bookmark
   - Buttons appear!

---

## 🎯 Method 3: Desktop Shortcut (Auto-Inject)

Create a desktop shortcut that opens Remedy with buttons pre-loaded.

### Create a .bat file:

1. **Create a new file:** `Remedy-AI.bat`

2. **Paste this:**

```batch
@echo off
echo Opening Remedy with AI Assistant...

REM Replace with your browser and Remedy URL
start chrome "https://your-remedy-url.com" --new-window

timeout /t 3 /nobreak >nul

REM Open DevTools and run the snippet
REM (This requires the snippet to be saved in Method 1)
echo Press F12 and run the 'remedy-assistant' snippet
pause
```

3. **Double-click** to open Remedy

---

## 🎯 Method 4: Copy-Paste in Console (Quick Test)

Fastest way to test:

1. Open Remedy ticket
2. Press **F12** → **Console** tab
3. Copy entire content from `remedy-buttons-no-extension.js`
4. Paste into console
5. Press **Enter**
6. Buttons appear!

**Downside:** Need to paste every time you reload the page

---

## Finding Your Remedy Field Selectors

The buttons may not work if your Remedy uses different field IDs. To fix:

1. **Open Remedy ticket**
2. **Press F12** → **Elements** tab
3. **Click inspect tool** (cursor icon)
4. **Click the description field**
5. **Look for:** `id="..."` or `name="..."` or `aria-label="..."`

### Update these lines in the code:

**Line 16-18:**
```javascript
const descriptionField = document.querySelector('YOUR_SELECTOR_HERE') ||
                         document.querySelector('BACKUP_SELECTOR') ||
                         document.querySelector('ANOTHER_OPTION');
```

**Example selectors:**
```javascript
// If you see: <textarea id="arid_WIN_3_1000000151">
document.querySelector('textarea[id*="arid_WIN"]')

// If you see: <textarea name="z1D_Action">
document.querySelector('textarea[name="z1D_Action"]')

// If you see: <textarea aria-label="Detailed Description">
document.querySelector('[aria-label="Detailed Description"]')
```

---

## What the Buttons Do

- **💬 Questions** - Generate AI troubleshooting questions
- **✅ Resolution** - Generate AI solution steps
- **🇬🇧 English** - Translate to English
- **🇩🇪 Deutsch** - Translate to German
- **🚀 Full App** - Open full assistant in new window

Each button shows a popup with:
- **Insert into Remedy** - Adds text to ticket
- **Copy** - Copies to clipboard
- **Close** - Dismiss

---

## Troubleshooting

### "Description field not found"
→ Update selectors (lines 16-18) to match your Remedy

### "Cannot connect to assistant"
→ Check backend is running: http://10.128.128.178:5000

### Buttons don't appear
→ Check console (F12) for error messages
→ Make sure you're on a Remedy ticket page

### Code won't paste
→ Some consoles block pasting for security
→ Type `allow pasting` in console first
→ Or use Method 1 (Snippets) instead

---

## Recommended Setup

**For daily use, I recommend Method 1 (Snippets):**

✅ Code saved permanently in browser
✅ One keyboard shortcut to activate
✅ Works offline (code is local)
✅ No bookmarks bar needed
✅ Fast execution

**Takes 2 minutes to set up, saves time forever!**
