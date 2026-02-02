const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose protected methods to the renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
    // Get backend URL
    getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
    
    // Check backend health
    checkBackendHealth: () => ipcRenderer.invoke('backend-health'),
    
    // Platform info
    platform: process.platform,
    version: process.versions.electron
});
