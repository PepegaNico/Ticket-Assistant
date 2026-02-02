const { app, BrowserWindow, ipcMain, Tray, Menu, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const Store = require('electron-store');

const store = new Store();
let mainWindow;
let tray;
let backendProcess = null;
let backendReady = false;

// Determine if running in development or production
const isDev = process.argv.includes('--dev');
const backendPort = 5000;

/**
 * Start the Python backend service
 */
function startBackend() {
    return new Promise((resolve, reject) => {
        console.log('[Backend] Starting Python backend...');
        
        // Determine backend path
        const backendPath = isDev 
            ? path.join(__dirname, '..', 'backend')
            : path.join(process.resourcesPath, 'backend');
        
        const pythonExecutable = isDev
            ? path.join(backendPath, 'venv', 'bin', 'python3')
            : path.join(backendPath, 'venv', 'bin', 'python3');
        
        const serverScript = path.join(backendPath, 'server.py');
        
        console.log('[Backend] Path:', backendPath);
        console.log('[Backend] Python:', pythonExecutable);
        console.log('[Backend] Script:', serverScript);
        
        // Start backend process
        backendProcess = spawn(pythonExecutable, [serverScript], {
            cwd: backendPath,
            env: { ...process.env, PYTHONUNBUFFERED: '1' }
        });
        
        backendProcess.stdout.on('data', (data) => {
            console.log('[Backend]', data.toString().trim());
            
            // Check if backend is ready
            if (data.toString().includes('Running on')) {
                backendReady = true;
                resolve();
            }
        });
        
        backendProcess.stderr.on('data', (data) => {
            console.error('[Backend Error]', data.toString().trim());
        });
        
        backendProcess.on('error', (error) => {
            console.error('[Backend] Failed to start:', error);
            reject(error);
        });
        
        backendProcess.on('close', (code) => {
            console.log('[Backend] Process exited with code:', code);
            backendReady = false;
        });
        
        // Timeout if backend doesn't start in 30 seconds
        setTimeout(() => {
            if (!backendReady) {
                reject(new Error('Backend startup timeout'));
            }
        }, 30000);
    });
}

/**
 * Stop the backend service
 */
function stopBackend() {
    if (backendProcess) {
        console.log('[Backend] Stopping...');
        backendProcess.kill();
        backendProcess = null;
        backendReady = false;
    }
}

/**
 * Check if backend is responding
 */
function checkBackendHealth() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: backendPort,
            path: '/health',
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const health = JSON.parse(data);
                    resolve(health);
                } catch (e) {
                    resolve(null);
                }
            });
        });
        
        req.on('error', () => resolve(null));
        req.on('timeout', () => {
            req.destroy();
            resolve(null);
        });
        
        req.end();
    });
}

/**
 * Create the main application window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        },
        show: false // Don't show until ready
    });
    
    // Load the main UI
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
    
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    
    // Open DevTools in development mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    
    // Handle window close
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * Create system tray icon
 */
function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                }
            }
        },
        {
            label: 'Backend Status',
            click: async () => {
                const health = await checkBackendHealth();
                const status = health 
                    ? `✅ Running\nTranslation: ${health.translation}\nAI: ${health.ai}`
                    : '❌ Not responding';
                
                dialog.showMessageBox({
                    type: 'info',
                    title: 'Backend Status',
                    message: status
                });
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);
    
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Remedy Ticket Assistant');
    
    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });
}

/**
 * Application initialization
 */
app.whenReady().then(async () => {
    console.log('[App] Starting Remedy Ticket Assistant...');
    
    try {
        // Start backend first
        await startBackend();
        console.log('[App] Backend started successfully');
        
        // Wait a bit for backend to be fully ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check backend health
        const health = await checkBackendHealth();
        if (health) {
            console.log('[App] Backend health check passed:', health);
        } else {
            console.warn('[App] Backend health check failed, but continuing...');
        }
        
        // Create application window
        createWindow();
        
        // Create system tray
        createTray();
        
        console.log('[App] Application ready!');
        
    } catch (error) {
        console.error('[App] Failed to start:', error);
        
        dialog.showErrorBox(
            'Startup Failed',
            `Failed to start backend service:\n${error.message}\n\nPlease ensure Python and dependencies are installed.`
        );
        
        app.quit();
    }
});

/**
 * Handle IPC messages from renderer
 */
ipcMain.handle('backend-health', async () => {
    return await checkBackendHealth();
});

ipcMain.handle('get-backend-url', () => {
    return `http://localhost:${backendPort}`;
});

/**
 * Cleanup on quit
 */
app.on('before-quit', () => {
    console.log('[App] Shutting down...');
    stopBackend();
});

app.on('window-all-closed', () => {
    // On macOS, keep app running even when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
