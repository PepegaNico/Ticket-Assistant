// REMEDY ASSISTANT - AUTO-INJECT VERSION
// This runs automatically when the page loads - no need to click Run!

(function() {
    'use strict';

    const ASSISTANT_URL = 'http://localhost:5000';
    
    // Auto-inject on page load
    function autoInject() {
        // Wait for Remedy to fully load
        const checkReady = setInterval(() => {
            const descField = document.querySelector('textarea[id*="Description"]') ||
                             document.querySelector('textarea[name*="z1D_Action"]') ||
                             document.querySelector('[aria-label="Description"]') ||
                             document.querySelector('textarea');
            
            if (descField && !document.getElementById('remedy-assistant-buttons')) {
                clearInterval(checkReady);
                console.log('✅ [Remedy Assistant] Auto-injecting buttons...');
                injectAssistantButtons();
            }
        }, 1000); // Check every second
        
        // Stop checking after 30 seconds
        setTimeout(() => clearInterval(checkReady), 30000);
    }

    function injectAssistantButtons() {
        if (document.getElementById('remedy-assistant-buttons')) return;

        const descriptionField = document.querySelector('textarea[id*="Description"]') ||
                                 document.querySelector('textarea[name*="z1D_Action"]') ||
                                 document.querySelector('[aria-label="Description"]') ||
                                 document.querySelector('textarea');
        
        if (!descriptionField) {
            console.error('[Remedy Assistant] Description field not found');
            return;
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'remedy-assistant-buttons';
        buttonContainer.style.cssText = `
            position: relative;
            margin: 10px 0;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            display: flex;
            gap: 10px;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;

        const label = document.createElement('span');
        label.innerHTML = '🤖 <strong>AI Assistant:</strong>';
        label.style.cssText = 'color: white; font-size: 14px;';
        buttonContainer.appendChild(label);

        const buttons = [
            { text: '🔧 Test', action: testConnection, color: '#ef4444' },
            { text: '💬 Questions', action: generateQuestions, color: '#10b981' },
            { text: '✅ Resolution', action: generateResolution, color: '#3b82f6' },
            { text: '🇬🇧 EN', action: () => translateText('en'), color: '#f59e0b' },
            { text: '🇩🇪 DE', action: () => translateText('de'), color: '#f59e0b' },
            { text: '🚀 App', action: openFullAssistant, color: '#8b5cf6' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.cssText = `
                background: ${btn.color};
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.2s;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;
            button.onmouseover = () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            };
            button.onmouseout = () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            };
            button.onclick = btn.action;
            buttonContainer.appendChild(button);
        });

        descriptionField.parentElement.insertBefore(buttonContainer, descriptionField);
        console.log('✅ [Remedy Assistant] Buttons injected!');
    }

    function getTicketData() {
        const descField = document.querySelector('textarea[id*="Description"]') ||
                         document.querySelector('textarea[name*="z1D_Action"]') ||
                         document.querySelector('[aria-label="Description"]') ||
                         document.querySelector('textarea');
        
        return {
            description: descField?.value || '',
            summary: document.querySelector('input[id*="Summary"]')?.value || '',
            ticketId: document.querySelector('input[id*="Incident_Number"]')?.value || '',
            category: document.querySelector('[aria-label="Categorization Tier 1"]')?.value || ''
        };
    }

    function showLoading(message) {
        const loading = document.createElement('div');
        loading.id = 'remedy-loading';
        loading.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 30px; border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 10000; text-align: center;
        `;
        loading.innerHTML = `
            <div style="font-size: 16px; margin-bottom: 15px; color: #333;">${message}</div>
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #667eea; 
                        border-radius: 50%; width: 50px; height: 50px; 
                        animation: spin 1s linear infinite; margin: 0 auto;"></div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(loading);
    }

    function hideLoading() {
        document.getElementById('remedy-loading')?.remove();
    }

    function showResult(title, content, insertable = false) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999;';
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 30px; border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4); z-index: 10000;
            max-width: 700px; max-height: 80vh; overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #667eea; font-size: 20px;">${title}</h3>
            <div style="white-space: pre-wrap; margin: 15px 0; padding: 20px; 
                        background: #f8fafc; border-radius: 8px; border-left: 4px solid #667eea;
                        font-size: 14px; line-height: 1.6; color: #334155;">${content}</div>
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                ${insertable ? '<button id="ins-btn" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">📝 Insert</button>' : ''}
                <button id="cp-btn" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">📋 Copy</button>
                <button id="cl-btn" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">✖ Close</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        
        const close = () => { modal.remove(); overlay.remove(); };
        
        modal.querySelector('#cl-btn').onclick = close;
        overlay.onclick = close;
        
        modal.querySelector('#cp-btn').onclick = () => {
            navigator.clipboard.writeText(content);
            alert('✅ Copied!');
        };
        
        if (insertable) {
            modal.querySelector('#ins-btn').onclick = () => {
                const field = document.querySelector('textarea[id*="Description"]') ||
                             document.querySelector('textarea[name*="z1D_Action"]') ||
                             document.querySelector('textarea');
                if (field) {
                    field.value += '\n\n' + content;
                    alert('✅ Inserted!');
                    close();
                }
            };
        }
    }

    async function generateQuestions() {
        const data = getTicketData();
        if (!data.description) return alert('⚠️ Fill in description first!');

        showLoading('🤖 Generating questions...');
        
        try {
            const res = await fetch(`${ASSISTANT_URL}/api/ai-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: data.description })
            });
            
            const result = await res.json();
            hideLoading();
            
            if (result.questions) {
                showResult('💬 AI Questions', result.questions, true);
            } else {
                alert('❌ Error: ' + (result.error || 'Unknown'));
            }
        } catch (error) {
            hideLoading();
            alert('❌ Backend not running!\n\nStart: python backend\\server.py');
        }
    }

    async function generateResolution() {
        const data = getTicketData();
        if (!data.description) return alert('⚠️ Fill in description first!');

        showLoading('🤖 Generating resolution...');
        
        try {
            const res = await fetch(`${ASSISTANT_URL}/api/ai-resolution`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await res.json();
            hideLoading();
            
            if (result.resolution) {
                showResult('✅ Resolution', result.resolution, true);
            } else {
                alert('❌ Error: ' + (result.error || 'Unknown'));
            }
        } catch (error) {
            hideLoading();
            alert('❌ Backend not running!');
        }
    }

    async function translateText(targetLang) {
        const data = getTicketData();
        if (!data.description) return alert('⚠️ Fill in description first!');

        showLoading(`🌍 Translating...`);
        
        try {
            const res = await fetch(`${ASSISTANT_URL}/api/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: data.description, target_lang: targetLang })
            });
            
            const result = await res.json();
            hideLoading();
            
            if (result.translated_text) {
                showResult('🌍 Translation', result.translated_text, true);
            } else {
                alert('❌ Error: ' + (result.error || 'Unknown'));
            }
        } catch (error) {
            hideLoading();
            alert('❌ Translation failed!');
        }
    }

    function openFullAssistant() {
        const data = getTicketData();
        const url = `${ASSISTANT_URL}?ticket=${encodeURIComponent(JSON.stringify(data))}`;
        const win = window.open(url, 'Assistant', 'width=900,height=900');
        if (!win) alert('❌ Enable pop-ups!');
    }

    async function testConnection() {
        showLoading('🔧 Testing...');
        
        try {
            const res = await fetch(`${ASSISTANT_URL}/health`);
            hideLoading();
            
            if (res.ok) {
                const data = await res.json();
                alert('✅ Connected!\n\n' + 
                      'Backend: ' + data.status + '\n' +
                      'AI: ' + data.ai + '\n' +
                      'Translation: ' + data.translation);
            } else {
                alert('⚠️ Backend responded: ' + res.status);
            }
        } catch (error) {
            hideLoading();
            alert('❌ Cannot connect!\n\n' +
                  'Backend not running.\n\n' +
                  'Start:\n' +
                  '1. Command Prompt\n' +
                  '2. cd %LOCALAPPDATA%\\RemedyAssistant\n' +
                  '3. python\\python.exe backend\\server.py');
        }
    }

    // Run automatically on page load
    autoInject();
    
    console.log('[Remedy Assistant] Auto-inject enabled! Buttons will appear when Remedy loads.');
})();
