/**
 * Remedy Ticket Assistant - Web App
 */

// Use current host for backend URL (works both locally and remotely)
const BACKEND_URL = window.location.origin;
let currentTranslation = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] Initializing...');
    
    setupTabs();
    setupEventListeners();
    checkBackend();
    loadTicketFromURL();
    
    // Check backend status periodically
    setInterval(checkBackend, 10000);
});

// Load ticket data from URL parameters (for bookmarklet integration)
function loadTicketFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const ticketData = urlParams.get('ticket');
    
    if (ticketData) {
        try {
            const ticket = JSON.parse(decodeURIComponent(ticketData));
            console.log('[App] Loading ticket from URL:', ticket);
            
            // Fill in ticket description
            if (ticket.description) {
                document.getElementById('ticket-description').value = ticket.description;
            }
            
            // Add ticket info to the UI
            if (ticket.ticketId || ticket.summary) {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'ticket-info';
                infoDiv.style.cssText = 'background: #e8f4f8; padding: 10px; margin-bottom: 15px; border-radius: 5px; font-size: 12px;';
                infoDiv.innerHTML = `
                    <strong>Ticket loaded from Remedy:</strong><br>
                    ${ticket.ticketId ? `ID: ${ticket.ticketId}<br>` : ''}
                    ${ticket.summary ? `Summary: ${ticket.summary}<br>` : ''}
                    ${ticket.category ? `Category: ${ticket.category}<br>` : ''}
                    ${ticket.userName ? `User: ${ticket.userName}` : ''}
                `;
                document.querySelector('.tab-content.active').prepend(infoDiv);
            }
        } catch (e) {
            console.error('[App] Error parsing ticket data:', e);
        }
    }
}

// Tab switching
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Event listeners
function setupEventListeners() {
    document.getElementById('btn-translate')?.addEventListener('click', handleTranslate);
    document.getElementById('btn-ai-questions')?.addEventListener('click', handleAIQuestions);
    document.getElementById('btn-generate-resolution')?.addEventListener('click', handleGenerateResolution);
    document.getElementById('btn-quick-translate')?.addEventListener('click', handleQuickTranslate);
    document.getElementById('btn-clear')?.addEventListener('click', () => {
        document.getElementById('source-text').value = '';
        document.getElementById('target-text').value = '';
    });
}

// Check backend health
async function checkBackend() {
    const statusBadge = document.getElementById('backend-status');
    const backendInfo = document.getElementById('backend-info');
    
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const health = await response.json();
        
        statusBadge.textContent = '✅ Connected';
        statusBadge.className = 'status-badge status-online';
        
        if (backendInfo) {
            backendInfo.innerHTML = `
                <p><strong>Status:</strong> ${health.status}</p>
                <p><strong>Translation:</strong> ${health.translation}</p>
                <p><strong>AI:</strong> ${health.ai}</p>
                <p><strong>Backend URL:</strong> ${BACKEND_URL}</p>
            `;
        }
        
        console.log('[App] Backend health:', health);
    } catch (error) {
        statusBadge.textContent = '❌ Disconnected';
        statusBadge.className = 'status-badge status-offline';
        
        if (backendInfo) {
            backendInfo.innerHTML = `
                <p style="color: #dc3545;"><strong>❌ Backend not responding</strong></p>
                <p>Please ensure the backend is running.</p>
            `;
        }
        
        console.error('[App] Backend check failed:', error);
    }
}

// Translate resolution
async function handleTranslate() {
    const resolutionText = document.getElementById('resolution').value.trim();
    const targetLang = document.getElementById('customer-language').value || 'de';
    
    if (!resolutionText) {
        showNotification('Please enter resolution text first', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-translate');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Translating...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${BACKEND_URL}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: resolutionText,
                target_lang: targetLang,
                source_lang: 'auto'
            })
        });
        
        if (!response.ok) throw new Error('Translation failed');
        
        const data = await response.json();
        currentTranslation = data.translated_text;
        
        // Show in modal
        document.getElementById('preview-original').textContent = resolutionText;
        document.getElementById('preview-translated').textContent = currentTranslation;
        document.getElementById('preview-target-label').textContent = `Translated (${targetLang.toUpperCase()})`;
        showModal('translation-modal');
        
    } catch (error) {
        console.error('[App] Translation error:', error);
        showNotification('Translation failed. Check backend connection.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// AI question suggestions
async function handleAIQuestions() {
    const title = document.getElementById('title').value.trim();
    const template = document.getElementById('template').value;
    const description = document.getElementById('description').value;
    
    if (!title) {
        showNotification('Please enter a ticket title first', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-ai-questions');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Generating...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${BACKEND_URL}/ai/suggest-questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, template, description })
        });
        
        if (!response.ok) throw new Error('AI service unavailable');
        
        const data = await response.json();
        const questions = data.questions;
        
        // Append questions to description field
        const descriptionField = document.getElementById('description');
        const currentDescription = descriptionField.value.trim();
        const questionsText = '\n\nSuggested Questions:\n' + questions.map(q => '- ' + q.replace(/^\d+\.\s*/, '')).join('\n');
        descriptionField.value = currentDescription + questionsText;
        
        showNotification('AI questions added to description!', 'success');
        
    } catch (error) {
        console.error('[App] AI questions error:', error);
        showNotification('AI service unavailable. Make sure Ollama is running with a model.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Generate resolution
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
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Generating...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${BACKEND_URL}/ai/suggest-resolution`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                activity_notes: activityNotes,
                target_lang: targetLang
            })
        });
        
        if (!response.ok) throw new Error('AI service unavailable');
        
        const data = await response.json();
        document.getElementById('resolution').value = data.resolution_text;
        showNotification('Resolution generated successfully!', 'success');
        
    } catch (error) {
        console.error('[App] Generate resolution error:', error);
        showNotification('AI service unavailable. Make sure Ollama is running with a model.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Quick translate
async function handleQuickTranslate() {
    const sourceText = document.getElementById('source-text').value.trim();
    const sourceLang = document.getElementById('source-lang').value;
    const targetLang = document.getElementById('target-lang').value;
    
    if (!sourceText) {
        showNotification('Please enter text to translate', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-quick-translate');
    btn.textContent = '⏳ Translating...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${BACKEND_URL}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: sourceText,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });
        
        if (!response.ok) throw new Error('Translation failed');
        
        const data = await response.json();
        document.getElementById('target-text').value = data.translated_text;
        
    } catch (error) {
        console.error('[App] Quick translate error:', error);
        showNotification('Translation failed. Check backend connection.', 'error');
    } finally {
        btn.textContent = '🌐 Translate';
        btn.disabled = false;
    }
}

// Apply translation
function applyTranslation() {
    if (currentTranslation) {
        document.getElementById('resolution').value = currentTranslation;
        showNotification('Translation applied!', 'success');
    }
    closeModal('translation-modal');
}

// Modal helpers
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
