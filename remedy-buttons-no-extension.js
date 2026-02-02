// REMEDY ASSISTANT - No Extension Required
// Copy this entire code and use Method 1 or 2 below

(function() {
    'use strict';

    const ASSISTANT_URL = 'http://10.128.128.178:5000';
    
    console.log('[Remedy Assistant] Injecting buttons...');

    function injectAssistantButtons() {
        // Check if already injected
        if (document.getElementById('remedy-assistant-buttons')) {
            console.log('[Remedy Assistant] Already injected');
            return;
        }

        // Find description field - UPDATE THESE SELECTORS FOR YOUR REMEDY
        const descriptionField = document.querySelector('textarea[id*="Description"]') ||
                                 document.querySelector('textarea[name*="z1D_Action"]') ||
                                 document.querySelector('[aria-label="Description"]');
        
        if (!descriptionField) {
            alert('⚠️ Cannot find description field. Press F12 and check console for help.');
            console.error('[Remedy Assistant] Description field not found. Try these selectors:');
            console.log('1. Right-click description field → Inspect');
            console.log('2. Look for id, name, or aria-label');
            console.log('3. Update line 16-18 in the script');
            return;
        }

        // Create button container
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

        // Assistant label
        const label = document.createElement('span');
        label.innerHTML = '🤖 <strong>AI Assistant:</strong>';
        label.style.cssText = 'color: white; font-size: 14px;';
        buttonContainer.appendChild(label);

        // Create buttons
        const buttons = [
            { text: '💬 Questions', action: generateQuestions, color: '#10b981' },
            { text: '✅ Resolution', action: generateResolution, color: '#3b82f6' },
            { text: '🇬🇧 English', action: () => translateText('en'), color: '#f59e0b' },
            { text: '🇩🇪 Deutsch', action: () => translateText('de'), color: '#f59e0b' },
            { text: '🚀 Full App', action: openFullAssistant, color: '#8b5cf6' }
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

        // Insert before description field
        descriptionField.parentElement.insertBefore(buttonContainer, descriptionField);
        console.log('✅ [Remedy Assistant] Buttons injected successfully!');
    }

    function getTicketData() {
        // Try multiple selectors to find description field
        const descField = document.querySelector('textarea[id*="Description"]') ||
                         document.querySelector('textarea[name*="z1D_Action"]') ||
                         document.querySelector('[aria-label="Description"]') ||
                         document.querySelector('textarea[name*="Description"]') ||
                         document.querySelector('textarea[name*="description"]') ||
                         document.querySelector('textarea'); // Last resort: any textarea
        
        const description = descField?.value || '';
        
        // Debug logging
        if (!description) {
            console.error('❌ [Remedy Assistant] Cannot find description field!');
            console.log('🔍 All textareas on page:');
            document.querySelectorAll('textarea').forEach((field, i) => {
                console.log(`Textarea ${i}:`, {
                    id: field.id,
                    name: field.name,
                    'aria-label': field.getAttribute('aria-label'),
                    value: field.value?.substring(0, 50) + '...'
                });
            });
            console.log('💡 Copy one of the selectors above and update line 95 in the code');
        }
        
        return {
            description: description,
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
                ${insertable ? '<button id="ins-btn" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">📝 Insert into Remedy</button>' : ''}
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
            alert('✅ Copied to clipboard!');
        };
        
        if (insertable) {
            modal.querySelector('#ins-btn').onclick = () => {
                const field = document.querySelector('textarea[id*="Description"]') ||
                             document.querySelector('textarea[name*="z1D_Action"]');
                if (field) {
                    field.value += '\n\n' + content;
                    alert('✅ Inserted into ticket!');
                    close();
                }
            };
        }
    }

    async function generateQuestions() {
        const data = getTicketData();
        if (!data.description) return alert('⚠️ Please fill in the description first!');

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
                showResult('💬 AI-Generated Questions', result.questions, true);
            } else {
                alert('❌ Error: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            hideLoading();
            alert('❌ Cannot connect to assistant. Is the backend running?\n' + error.message);
        }
    }

    async function generateResolution() {
        const data = getTicketData();
        if (!data.description) return alert('⚠️ Please fill in the description first!');

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
                showResult('✅ AI-Generated Resolution', result.resolution, true);
            } else {
                alert('❌ Error: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            hideLoading();
            alert('❌ Cannot connect to assistant\n' + error.message);
        }
    }

    async function translateText(targetLang) {
        const data = getTicketData();
        if (!data.description) return alert('⚠️ Please fill in the description first!');

        showLoading(`🌍 Translating to ${targetLang === 'en' ? 'English' : 'German'}...`);
        
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
                alert('❌ Error: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            hideLoading();
            alert('❌ Translation failed\n' + error.message);
        }
    }

    function openFullAssistant() {
        const data = getTicketData();
        const params = new URLSearchParams({ ticket: JSON.stringify(data) }).toString();
        window.open(`${ASSISTANT_URL}?${params}`, 'Assistant', 'width=900,height=900');
    }

    // Inject buttons
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectAssistantButtons);
    } else {
        injectAssistantButtons();
    }
})();
