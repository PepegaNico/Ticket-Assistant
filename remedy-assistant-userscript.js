// ==UserScript==
// @name         Remedy Ticket Assistant
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add AI assistant buttons to Remedy interface
// @author       Your Name
// @match        https://remedy.yourdomain.com/*
// @match        http://remedy.yourdomain.com/*
// @grant        GM_xmlhttpRequest
// @connect      10.128.128.178
// ==/UserScript==

(function() {
    'use strict';

    const ASSISTANT_URL = 'http://10.128.128.178:5000';
    
    // Wait for Remedy to fully load
    function waitForRemedyLoad() {
        const checkInterval = setInterval(() => {
            // Adjust this selector based on your Remedy version
            const descriptionField = document.querySelector('textarea[id*="Description"]') ||
                                    document.querySelector('textarea[name*="z1D_Action"]') ||
                                    document.querySelector('[aria-label="Description"]');
            
            if (descriptionField) {
                clearInterval(checkInterval);
                console.log('[Remedy Assistant] Remedy loaded, injecting buttons...');
                injectAssistantButtons();
            }
        }, 1000);
    }

    function injectAssistantButtons() {
        // Find description field container
        const descriptionField = document.querySelector('textarea[id*="Description"]') ||
                                 document.querySelector('textarea[name*="z1D_Action"]') ||
                                 document.querySelector('[aria-label="Description"]');
        
        if (!descriptionField) {
            console.error('[Remedy Assistant] Description field not found');
            return;
        }

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'remedy-assistant-buttons';
        buttonContainer.style.cssText = `
            position: relative;
            margin: 10px 0;
            padding: 10px;
            background: #f0f7ff;
            border: 2px solid #0066cc;
            border-radius: 5px;
            display: flex;
            gap: 10px;
            align-items: center;
        `;

        // Assistant label
        const label = document.createElement('span');
        label.textContent = '🤖 AI Assistant:';
        label.style.cssText = 'font-weight: bold; color: #0066cc;';
        buttonContainer.appendChild(label);

        // Create buttons
        const buttons = [
            {
                text: 'Generate Questions',
                action: generateQuestions,
                color: '#28a745'
            },
            {
                text: 'Generate Resolution',
                action: generateResolution,
                color: '#007bff'
            },
            {
                text: 'Translate to English',
                action: () => translateText('en'),
                color: '#6c757d'
            },
            {
                text: 'Translate to German',
                action: () => translateText('de'),
                color: '#6c757d'
            },
            {
                text: 'Open Full Assistant',
                action: openFullAssistant,
                color: '#17a2b8'
            }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.cssText = `
                background: ${btn.color};
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: opacity 0.2s;
            `;
            button.onmouseover = () => button.style.opacity = '0.8';
            button.onmouseout = () => button.style.opacity = '1';
            button.onclick = btn.action;
            buttonContainer.appendChild(button);
        });

        // Insert button container before description field
        descriptionField.parentElement.insertBefore(buttonContainer, descriptionField);
        console.log('[Remedy Assistant] Buttons injected successfully');
    }

    function getTicketData() {
        // Extract ticket data from Remedy
        // Adjust selectors based on your Remedy version
        return {
            description: document.querySelector('textarea[id*="Description"]')?.value ||
                        document.querySelector('textarea[name*="z1D_Action"]')?.value ||
                        document.querySelector('[aria-label="Description"]')?.value || '',
            summary: document.querySelector('input[id*="Summary"]')?.value ||
                    document.querySelector('[aria-label="Summary"]')?.value || '',
            ticketId: document.querySelector('input[id*="Incident_Number"]')?.value ||
                     document.querySelector('[aria-label="Incident Number"]')?.value || '',
            category: document.querySelector('[aria-label="Categorization Tier 1"]')?.value || '',
            userName: document.querySelector('[aria-label="First Name"]')?.value || ''
        };
    }

    function showLoading(message) {
        const loading = document.createElement('div');
        loading.id = 'remedy-assistant-loading';
        loading.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
        `;
        loading.innerHTML = `
            <div style="font-size: 16px; margin-bottom: 15px;">${message}</div>
            <div style="border: 3px solid #f3f3f3; border-top: 3px solid #0066cc; 
                        border-radius: 50%; width: 40px; height: 40px; 
                        animation: spin 1s linear infinite; margin: 0 auto;"></div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loading);
    }

    function hideLoading() {
        const loading = document.getElementById('remedy-assistant-loading');
        if (loading) loading.remove();
    }

    function showResult(title, content, insertable = false) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;
        
        modal.innerHTML = `
            <h3 style="margin-top: 0; color: #0066cc;">${title}</h3>
            <div style="white-space: pre-wrap; margin: 15px 0; padding: 15px; 
                        background: #f8f9fa; border-radius: 5px; font-size: 14px;">${content}</div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                ${insertable ? '<button id="insert-btn" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: 500;">Insert into Remedy</button>' : ''}
                <button id="copy-btn" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: 500;">Copy to Clipboard</button>
                <button id="close-btn" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: 500;">Close</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        
        // Close button
        modal.querySelector('#close-btn').onclick = () => {
            modal.remove();
            overlay.remove();
        };
        
        // Copy button
        modal.querySelector('#copy-btn').onclick = () => {
            navigator.clipboard.writeText(content);
            alert('Copied to clipboard!');
        };
        
        // Insert button
        if (insertable) {
            modal.querySelector('#insert-btn').onclick = () => {
                const descField = document.querySelector('textarea[id*="Description"]') ||
                                 document.querySelector('textarea[name*="z1D_Action"]') ||
                                 document.querySelector('[aria-label="Description"]');
                if (descField) {
                    descField.value += '\n\n' + content;
                    alert('Inserted into description field!');
                }
                modal.remove();
                overlay.remove();
            };
        }
        
        overlay.onclick = () => {
            modal.remove();
            overlay.remove();
        };
    }

    async function generateQuestions() {
        const ticketData = getTicketData();
        if (!ticketData.description) {
            alert('Please fill in the ticket description first!');
            return;
        }

        showLoading('Generating troubleshooting questions...');
        
        try {
            const response = await fetch(`${ASSISTANT_URL}/api/ai-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: ticketData.description })
            });
            
            const data = await response.json();
            hideLoading();
            
            if (data.questions) {
                showResult('AI-Generated Questions', data.questions, true);
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            hideLoading();
            alert('Error connecting to assistant: ' + error.message);
        }
    }

    async function generateResolution() {
        const ticketData = getTicketData();
        if (!ticketData.description) {
            alert('Please fill in the ticket description first!');
            return;
        }

        showLoading('Generating resolution suggestion...');
        
        try {
            const response = await fetch(`${ASSISTANT_URL}/api/ai-resolution`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            });
            
            const data = await response.json();
            hideLoading();
            
            if (data.resolution) {
                showResult('AI-Generated Resolution', data.resolution, true);
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            hideLoading();
            alert('Error connecting to assistant: ' + error.message);
        }
    }

    async function translateText(targetLang) {
        const ticketData = getTicketData();
        if (!ticketData.description) {
            alert('Please fill in the ticket description first!');
            return;
        }

        showLoading(`Translating to ${targetLang === 'en' ? 'English' : 'German'}...`);
        
        try {
            const response = await fetch(`${ASSISTANT_URL}/api/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: ticketData.description,
                    target_lang: targetLang
                })
            });
            
            const data = await response.json();
            hideLoading();
            
            if (data.translated_text) {
                showResult('Translation Result', data.translated_text, true);
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            hideLoading();
            alert('Error connecting to assistant: ' + error.message);
        }
    }

    function openFullAssistant() {
        const ticketData = getTicketData();
        const params = new URLSearchParams({ ticket: JSON.stringify(ticketData) }).toString();
        window.open(`${ASSISTANT_URL}?${params}`, 'RemedyAssistant', 'width=900,height=900');
    }

    // Start the script
    console.log('[Remedy Assistant] Userscript loaded');
    waitForRemedyLoad();
})();
