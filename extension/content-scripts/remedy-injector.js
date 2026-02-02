/**
 * Remedy Ticket Assistant - Content Script
 * Injects translation functionality into Remedy pages
 */

(function() {
    'use strict';

    console.log('[Remedy Assistant] Content script loaded');

    // Configuration - can be adjusted for real Remedy later
    const SELECTORS = {
        resolution: '#resolution',
        title: '#title',
        description: '#description',
        activityNotes: '#activity-notes',
        customerLanguage: '#customer-language',
        template: '#template'
    };

    let translationModal = null;

    /**
     * Initialize the extension when DOM is ready
     */
    function init() {
        // Check if we're on a Remedy page (or simulation)
        const resolutionField = document.querySelector(SELECTORS.resolution);
        
        if (!resolutionField) {
            console.log('[Remedy Assistant] Resolution field not found, extension inactive');
            return;
        }

        console.log('[Remedy Assistant] Resolution field found, initializing...');
        injectTranslateButton();
        injectAIButtons();
        createTranslationModal();
        createQuestionsModal();
    }

    /**
     * Inject translate button next to resolution field
     */
    function injectTranslateButton() {
        const resolutionField = document.querySelector(SELECTORS.resolution);
        if (!resolutionField) return;

        // Find the label for the resolution field
        const label = document.querySelector(`label[for="${resolutionField.id}"]`) || 
                     resolutionField.previousElementSibling;

        if (!label) {
            console.warn('[Remedy Assistant] Could not find resolution field label');
            return;
        }

        // Create translate button
        const translateBtn = document.createElement('button');
        translateBtn.id = 'remedy-translate-btn';
        translateBtn.type = 'button';
        translateBtn.innerHTML = '🌐 Translate';
        translateBtn.style.cssText = `
            margin-left: 10px;
            padding: 4px 12px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            transition: background 0.2s;
        `;

        translateBtn.addEventListener('mouseenter', () => {
            translateBtn.style.background = '#218838';
        });

        translateBtn.addEventListener('mouseleave', () => {
            translateBtn.style.background = '#28a745';
        });

        translateBtn.addEventListener('click', handleTranslateClick);

        // Insert button after label
        label.style.display = 'inline-block';
        label.appendChild(translateBtn);

        console.log('[Remedy Assistant] Translate button injected');
    }

    /**
     * Inject AI suggestion buttons
     */
    function injectAIButtons() {
        // Add "Get AI Suggestions" button next to title
        const titleField = document.querySelector(SELECTORS.title);
        const titleLabel = document.querySelector(`label[for="${titleField?.id}"]`);
        
        if (titleLabel) {
            const aiSuggestBtn = createButton('🤖 Get AI Suggestions', '#007bff', handleAISuggestionsClick);
            aiSuggestBtn.id = 'remedy-ai-suggest-btn';
            titleLabel.appendChild(aiSuggestBtn);
        }

        // Add "Generate Resolution" button next to activity notes
        const activityField = document.querySelector(SELECTORS.activityNotes);
        const activityLabel = document.querySelector(`label[for="${activityField?.id}"]`);
        
        if (activityLabel) {
            const generateBtn = createButton('✨ Generate Resolution', '#6f42c1', handleGenerateResolutionClick);
            generateBtn.id = 'remedy-generate-btn';
            activityLabel.appendChild(generateBtn);
        }

        console.log('[Remedy Assistant] AI buttons injected');
    }

    /**
     * Helper to create styled buttons
     */
    function createButton(text, color, clickHandler) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = text;
        btn.style.cssText = `
            margin-left: 10px;
            padding: 4px 12px;
            background: ${color};
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            transition: background 0.2s;
        `;
        btn.addEventListener('click', clickHandler);
        return btn;
    }

    /**
     * Handle AI suggestions button click
     */
    async function handleAISuggestionsClick(e) {
        e.preventDefault();
        
        const titleField = document.querySelector(SELECTORS.title);
        const templateField = document.querySelector(SELECTORS.template);
        const descField = document.querySelector(SELECTORS.description);
        
        const title = titleField?.value.trim();
        const template = templateField?.value || '';
        const description = descField?.value || '';

        if (!title) {
            showNotification('Please enter a ticket title first.', 'warning');
            return;
        }

        const btn = document.getElementById('remedy-ai-suggest-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Generating...';
        btn.disabled = true;

        try {
            const questions = await ApiClient.getSuggestedQuestions(title, template, description);
            showQuestionsModal(questions);
        } catch (error) {
            console.error('[Remedy Assistant] AI suggestions error:', error);
            showNotification(error.message || 'AI service unavailable. Make sure Ollama is running.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    /**
     * Handle generate resolution button click
     */
    async function handleGenerateResolutionClick(e) {
        e.preventDefault();
        
        const titleField = document.querySelector(SELECTORS.title);
        const descField = document.querySelector(SELECTORS.description);
        const activityField = document.querySelector(SELECTORS.activityNotes);
        const resolutionField = document.querySelector(SELECTORS.resolution);
        
        const title = titleField?.value.trim();
        const description = descField?.value || '';
        const activityNotes = activityField?.value || '';
        const targetLanguage = LanguageDetector.getCustomerLanguage(SELECTORS.customerLanguage);

        if (!title) {
            showNotification('Please enter a ticket title first.', 'warning');
            return;
        }

        const btn = document.getElementById('remedy-generate-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Generating...';
        btn.disabled = true;

        try {
            const resolutionText = await ApiClient.generateResolution(title, description, activityNotes, targetLanguage);
            
            if (resolutionField) {
                resolutionField.value = resolutionText;
                const event = new Event('change', { bubbles: true });
                resolutionField.dispatchEvent(event);
                showNotification('Resolution generated successfully!', 'success');
            }
        } catch (error) {
            console.error('[Remedy Assistant] Generate resolution error:', error);
            showNotification(error.message || 'AI service unavailable. Make sure Ollama is running.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    /**
     * Handle translate button click
     */
    async function handleTranslateClick(e) {
        e.preventDefault();
        
        const resolutionField = document.querySelector(SELECTORS.resolution);
        const textToTranslate = resolutionField.value.trim();

        if (!textToTranslate) {
            showNotification('Please enter text in the resolution field first.', 'warning');
            return;
        }

        // Detect customer language
        const targetLanguage = LanguageDetector.getCustomerLanguage(SELECTORS.customerLanguage);
        console.log('[Remedy Assistant] Target language:', targetLanguage);

        // Show loading state
        const translateBtn = document.getElementById('remedy-translate-btn');
        const originalText = translateBtn.innerHTML;
        translateBtn.innerHTML = '⏳ Translating...';
        translateBtn.disabled = true;

        try {
            // Call translation API
            const translatedText = await ApiClient.translate(textToTranslate, targetLanguage);
            
            // Show translation modal
            showTranslationModal(textToTranslate, translatedText, targetLanguage);
            
        } catch (error) {
            console.error('[Remedy Assistant] Translation error:', error);
            showNotification(error.message || 'Translation failed. Please check your API key in settings.', 'error');
        } finally {
            // Reset button state
            translateBtn.innerHTML = originalText;
            translateBtn.disabled = false;
        }
    }

    /**
     * Create translation modal HTML
     */
    function createTranslationModal() {
        const modal = document.createElement('div');
        modal.id = 'remedy-translation-modal';
        modal.className = 'remedy-modal-overlay';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="remedy-modal-content">
                <div class="remedy-modal-header">
                    <h2>Translation Preview</h2>
                    <button class="remedy-modal-close" id="modal-close-btn">&times;</button>
                </div>
                <div class="remedy-modal-body">
                    <div class="translation-section">
                        <h3>Original Text</h3>
                        <div class="text-box" id="original-text"></div>
                    </div>
                    <div class="translation-arrow">↓</div>
                    <div class="translation-section">
                        <h3>Translated Text <span id="target-lang-label"></span></h3>
                        <div class="text-box" id="translated-text"></div>
                    </div>
                </div>
                <div class="remedy-modal-footer">
                    <button class="modal-btn modal-btn-secondary" id="modal-cancel-btn">Cancel</button>
                    <button class="modal-btn modal-btn-primary" id="modal-accept-btn">Use Translation</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        translationModal = modal;

        // Event listeners
        modal.querySelector('#modal-close-btn').addEventListener('click', hideTranslationModal);
        modal.querySelector('#modal-cancel-btn').addEventListener('click', hideTranslationModal);
        modal.querySelector('#modal-accept-btn').addEventListener('click', acceptTranslation);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideTranslationModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                hideTranslationModal();
            }
        });
    }

    /**
     * Show translation modal with content
     */
    function showTranslationModal(originalText, translatedText, targetLanguage) {
        if (!translationModal) return;

        document.getElementById('original-text').textContent = originalText;
        document.getElementById('translated-text').textContent = translatedText;
        document.getElementById('target-lang-label').textContent = `(${targetLanguage.toUpperCase()})`;
        
        translationModal.style.display = 'flex';
        translationModal.dataset.translatedText = translatedText;
    }

    /**
     * Hide translation modal
     */
    function hideTranslationModal() {
        if (!translationModal) return;
        translationModal.style.display = 'none';
    }

    /**
     * Accept translation and replace resolution text
     */
    function acceptTranslation() {
        const translatedText = translationModal.dataset.translatedText;
        const resolutionField = document.querySelector(SELECTORS.resolution);
        
        if (resolutionField && translatedText) {
            resolutionField.value = translatedText;
            
            // Trigger change event (in case Remedy has listeners)
            const event = new Event('change', { bubbles: true });
            resolutionField.dispatchEvent(event);
            
            showNotification('Translation applied successfully!', 'success');
        }
        
        hideTranslationModal();
    }

    /**
     * Create questions modal
     */
    function createQuestionsModal() {
        const modal = document.createElement('div');
        modal.id = 'remedy-questions-modal';
        modal.className = 'remedy-modal-overlay';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="remedy-modal-content">
                <div class="remedy-modal-header">
                    <h2>🤖 AI-Suggested Questions</h2>
                    <button class="remedy-modal-close" id="questions-close-btn">&times;</button>
                </div>
                <div class="remedy-modal-body">
                    <p style="color: #666; margin-bottom: 15px;">Ask these questions to better understand the issue:</p>
                    <ol id="questions-list" style="padding-left: 20px; line-height: 1.8;">
                    </ol>
                </div>
                <div class="remedy-modal-footer">
                    <button class="modal-btn modal-btn-primary" id="questions-ok-btn">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#questions-close-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        modal.querySelector('#questions-ok-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    /**
     * Show questions modal with AI-generated questions
     */
    function showQuestionsModal(questions) {
        const modal = document.getElementById('remedy-questions-modal');
        const questionsList = document.getElementById('questions-list');
        
        if (!modal || !questionsList) return;

        questionsList.innerHTML = '';
        questions.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q.replace(/^\d+\.\s*/, ''); // Remove number prefix if exists
            li.style.marginBottom = '10px';
            questionsList.appendChild(li);
        });
        
        modal.style.display = 'flex';
    }

    /**
     * Show notification toast
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `remedy-notification remedy-notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            z-index: 100000;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
