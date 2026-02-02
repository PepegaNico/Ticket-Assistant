/**
 * Remedy Ticket Assistant - Desktop App
 * Main Application Logic
 */

let backendUrl = 'http://localhost:5000';
let currentTranslation = null;
let currentQuestions = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[App] Initializing...');
    
    // Get backend URL from Electron
    if (window.electronAPI) {
        backendUrl = await window.electronAPI.getBackendUrl();
        console.log('[App] Backend URL:', backendUrl);
    }
    
    // Check backend status
    await checkBackendStatus();
    
    // Set up navigation
    setupNavigation();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check backend health periodically
    setInterval(checkBackendStatus, 30000);
    
    console.log('[App] Initialization complete');
});

/**
 * Check backend health
 */
async function checkBackendStatus() {
    const statusBadge = document.getElementById('backend-status');
    
    try {
        const response = await fetch(`${backendUrl}/health`);
        const health = await response.json();
        
        statusBadge.textContent = '✅ Connected';
        statusBadge.className = 'status-badge online';
        
        console.log('[App] Backend health:', health);
    } catch (error) {
        statusBadge.textContent = '❌ Disconnected';
        statusBadge.className = 'status-badge offline';
        
        console.error('[App] Backend health check failed:', error);
    }
}

/**
 * Setup navigation between views
 */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const viewPanels = document.querySelectorAll('.view-panel');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.dataset.view;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding view
            viewPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${viewName}-view`) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Ticket view buttons
    document.getElementById('btn-translate')?.addEventListener('click', handleTranslate);
    document.getElementById('btn-suggest-questions')?.addEventListener('click', handleSuggestQuestions);
    document.getElementById('btn-generate-resolution')?.addEventListener('click', handleGenerateResolution);
    
    // Translator view
    document.getElementById('btn-quick-translate')?.addEventListener('click', handleQuickTranslate);
    document.getElementById('btn-clear-translator')?.addEventListener('click', () => {
        document.getElementById('source-text').value = '';
        document.getElementById('target-text').value = '';
    });
    
    // Settings
    document.getElementById('btn-test-backend')?.addEventListener('click', testBackendConnection);
    
    // Modal controls
    setupModalControls();
}

/**
 * Setup modal controls
 */
function setupModalControls() {
    // Translation modal
    const translationModal = document.getElementById('translation-modal');
    translationModal.querySelector('.modal-close').addEventListener('click', () => {
        translationModal.classList.remove('active');
    });
    document.getElementById('modal-cancel').addEventListener('click', () => {
        translationModal.classList.remove('active');
    });
    document.getElementById('modal-accept').addEventListener('click', () => {
        if (currentTranslation) {
            document.getElementById('resolution').value = currentTranslation;
            showNotification('Translation applied!', 'success');
        }
        translationModal.classList.remove('active');
    });
    
    // Questions modal
    const questionsModal = document.getElementById('questions-modal');
    questionsModal.querySelector('.modal-close').addEventListener('click', () => {
        questionsModal.classList.remove('active');
    });
    document.getElementById('questions-ok').addEventListener('click', () => {
        questionsModal.classList.remove('active');
    });
}

/**
 * Handle translation
 */
async function handleTranslate() {
    const resolutionText = document.getElementById('resolution').value.trim();
    const targetLang = document.getElementById('customer-language').value || 'de';
    
    if (!resolutionText) {
        showNotification('Please enter resolution text first', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-translate');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Translating...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${backendUrl}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: resolutionText,
                target_lang: targetLang,
                source_lang: 'auto'
            })
        });
        
        const data = await response.json();
        currentTranslation = data.translated_text;
        
        // Show in modal
        document.getElementById('preview-original').textContent = resolutionText;
        document.getElementById('preview-translated').textContent = currentTranslation;
        document.getElementById('preview-target-label').textContent = `Translated (${targetLang.toUpperCase()})`;
        document.getElementById('translation-modal').classList.add('active');
        
    } catch (error) {
        console.error('[App] Translation error:', error);
        showNotification('Translation failed. Check backend connection.', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/**
 * Handle AI question suggestions
 */
async function handleSuggestQuestions() {
    const title = document.getElementById('title').value.trim();
    const template = document.getElementById('template').value;
    const description = document.getElementById('description').value;
    
    if (!title) {
        showNotification('Please enter a ticket title first', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-suggest-questions');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Generating...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${backendUrl}/ai/suggest-questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, template, description })
        });
        
        if (!response.ok) {
            throw new Error('AI service unavailable');
        }
        
        const data = await response.json();
        currentQuestions = data.questions;
        
        // Show in modal
        const questionsList = document.getElementById('questions-list');
        questionsList.innerHTML = '';
        currentQuestions.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q.replace(/^\d+\.\s*/, '');
            questionsList.appendChild(li);
        });
        
        document.getElementById('questions-modal').classList.add('active');
        
    } catch (error) {
        console.error('[App] AI suggestions error:', error);
        showNotification('AI service unavailable. Make sure Ollama is running with a model.', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/**
 * Handle AI resolution generation
 */
async function handleGenerateResolution() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value;
    const activityNotes = document.getElementById('activity-notes').value;
    const targetLang = document.getElementById('customer-language').value || 'de';
    
    if (!title) {
        showNotification('Please enter a ticket title first', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-generate-resolution');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Generating...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${backendUrl}/ai/suggest-resolution`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                activity_notes: activityNotes,
                target_lang: targetLang
            })
        });
        
        if (!response.ok) {
            throw new Error('AI service unavailable');
        }
        
        const data = await response.json();
        document.getElementById('resolution').value = data.resolution_text;
        showNotification('Resolution generated successfully!', 'success');
        
    } catch (error) {
        console.error('[App] Generate resolution error:', error);
        showNotification('AI service unavailable. Make sure Ollama is running with a model.', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/**
 * Handle quick translation
 */
async function handleQuickTranslate() {
    const sourceText = document.getElementById('source-text').value.trim();
    const sourceLang = document.getElementById('source-lang').value;
    const targetLang = document.getElementById('target-lang').value;
    
    if (!sourceText) {
        showNotification('Please enter text to translate', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-quick-translate');
    btn.textContent = 'Translating...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${backendUrl}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: sourceText,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });
        
        const data = await response.json();
        document.getElementById('target-text').value = data.translated_text;
        
    } catch (error) {
        console.error('[App] Quick translate error:', error);
        showNotification('Translation failed. Check backend connection.', 'error');
    } finally {
        btn.textContent = 'Translate';
        btn.disabled = false;
    }
}

/**
 * Test backend connection
 */
async function testBackendConnection() {
    const btn = document.getElementById('btn-test-backend');
    const resultDiv = document.getElementById('test-result');
    
    btn.textContent = 'Testing...';
    btn.disabled = true;
    resultDiv.textContent = '';
    resultDiv.className = 'test-result';
    
    try {
        const response = await fetch(`${backendUrl}/health`);
        const health = await response.json();
        
        resultDiv.textContent = `✅ Connected!\nTranslation: ${health.translation}\nAI: ${health.ai}`;
        resultDiv.className = 'test-result success';
        
    } catch (error) {
        resultDiv.textContent = `❌ Connection failed: ${error.message}`;
        resultDiv.className = 'test-result error';
    } finally {
        btn.textContent = 'Test Connection';
        btn.disabled = false;
    }
}

/**
 * Show notification (simple alert for now, can be enhanced)
 */
function showNotification(message, type = 'info') {
    // Simple implementation - can be enhanced with toast notifications
    if (type === 'error') {
        console.error('[Notification]', message);
    } else {
        console.log('[Notification]', message);
    }
    
    // You can add a proper toast notification system here
    alert(message);
}
