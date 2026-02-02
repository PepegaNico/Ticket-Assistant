# Remedy Ticket Assistant - Installation Guide

## Quick Install (Developer Mode)

### Chrome/Edge Installation

1. **Open Extension Management**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to the `extension` folder
   - Click "Select Folder"

4. **Verify Installation**
   - The extension should appear in your extension list
   - Pin it to your toolbar for easy access

## Backend Configuration

### Same Machine Setup
If Remedy and the backend are on the same machine:
- Default URL: `http://localhost:5000`
- No configuration needed

### Remote Backend Setup
If the backend is on a different machine:

1. **Click the extension icon**
2. **Enter Backend URL**: `http://YOUR_BACKEND_IP:5000`
   - Replace `YOUR_BACKEND_IP` with your backend server's IP address
   - Example: `http://10.128.128.178:5000`
3. **Click "Save Settings"**
4. **Verify connection** - the status should show "Connected"

## Testing

1. **Open Remedy SmartIT**
2. **Navigate to a ticket form**
3. **Look for the AI buttons**:
   - 🤖 **Get AI Suggestions** - On description field
   - ✨ **Generate Resolution** - On activity notes field
   - 🌐 **Translate** - On resolution field

## Troubleshooting

### Extension Not Working
- Check if backend is running: open `http://localhost:5000/health` in browser
- Verify backend URL in extension settings
- Check browser console (F12) for errors

### AI Features Unavailable
- Ensure Ollama is running: `systemctl status ollama`
- Verify model is installed: `ollama list`
- Check backend logs for errors

### Translation Not Working
- Verify internet connection (Google Translate requires internet)
- Check backend health endpoint
- Review network/firewall settings

## Firewall Configuration

If using remote backend, ensure port 5000 is open:
```bash
sudo ufw allow 5000/tcp
```

## Security Notes

- Backend should only be accessible on trusted networks
- Consider using HTTPS in production
- Configure CORS properly for your Remedy domain
