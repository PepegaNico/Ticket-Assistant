/**
 * Popup Settings Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
    const backendUrlInput = document.getElementById('backend-url');
    const saveBtn = document.getElementById('save-btn');
    const testBtn = document.getElementById('test-btn');
    const statusMessage = document.getElementById('status-message');

    // Load saved backend URL
    loadBackendUrl();

    // Save backend URL
    saveBtn.addEventListener('click', async () => {
        const backendUrl = backendUrlInput.value.trim();

        if (!backendUrl) {
            showStatus('Please enter a backend URL', 'error');
            return;
        }

        // Validate URL format
        try {
            new URL(backendUrl);
        } catch (e) {
            showStatus('Invalid URL format', 'error');
            return;
        }

        try {
            await chrome.storage.sync.set({ backendUrl: backendUrl });
            showStatus('Backend URL saved successfully!', 'success');
        } catch (error) {
            showStatus('Failed to save backend URL', 'error');
            console.error(error);
        }
    });

    // Test backend connection
    testBtn.addEventListener('click', async () => {
        const backendUrl = backendUrlInput.value.trim();

        if (!backendUrl) {
            showStatus('Please enter a backend URL first', 'error');
            return;
        }

        testBtn.disabled = true;
        testBtn.textContent = 'Testing...';

        try {
            const response = await fetch(`${backendUrl}/health`, {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                const translationStatus = data.translation === 'available' ? '✓' : '✗';
                const aiStatus = data.ai === 'available' ? '✓' : '✗';
                
                showStatus(
                    `✅ Backend connected!\n` +
                    `Translation: ${translationStatus} | AI: ${aiStatus}`, 
                    'success'
                );
            } else {
                showStatus(`❌ Backend returned error: ${response.status}`, 'error');
            }
        } catch (error) {
            showStatus(
                '❌ Cannot connect to backend.\n' +
                'Make sure the backend service is running:\n' +
                'cd backend && ./start.sh', 
                'error'
            );
            console.error(error);
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = 'Test Connection';
        }
    });

    /**
     * Load backend URL from storage
     */
    async function loadBackendUrl() {
        try {
            const result = await chrome.storage.sync.get(['backendUrl']);
            if (result.backendUrl) {
                backendUrlInput.value = result.backendUrl;
            } else {
                backendUrlInput.value = 'http://localhost:5000';
            }
        } catch (error) {
            console.error('Failed to load backend URL:', error);
            backendUrlInput.value = 'http://localhost:5000';
        }
    }

    /**
     * Show status message
     * @param {string} message - Message to display
     * @param {string} type - 'success' or 'error'
     */
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        
        setTimeout(() => {
            statusMessage.className = 'status-message hidden';
        }, 4000);
    }
});
