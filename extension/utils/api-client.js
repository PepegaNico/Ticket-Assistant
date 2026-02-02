/**
 * API Client for Local Backend
 * Handles communication with local translation and AI service
 */

const ApiClient = {
    /**
     * Translate text using local backend
     * @param {string} text - Text to translate
     * @param {string} targetLang - Target language code (de, en, fr, etc.)
     * @param {string} sourceLang - Source language code (optional, defaults to 'en')
     * @returns {Promise<string>} Translated text
     */
    async translate(text, targetLang, sourceLang = 'en') {
        const backendUrl = await this.getBackendUrl();
        
        if (!backendUrl) {
            throw new Error('Backend URL not configured. Please set it in extension settings.');
        }

        console.log('[API Client] Translating to:', targetLang);

        try {
            const response = await fetch(`${backendUrl}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    source_lang: sourceLang.toLowerCase(),
                    target_lang: targetLang.toLowerCase()
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Translation error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.translated_text) {
                return data.translated_text;
            } else {
                throw new Error('No translation returned from backend');
            }

        } catch (error) {
            console.error('[API Client] Translation error:', error);
            
            // Provide helpful error message if backend is not running
            if (error.message.includes('fetch')) {
                throw new Error('Cannot connect to backend service. Please make sure it is running on ' + backendUrl);
            }
            
            throw error;
        }
    },

    /**
     * Get suggested questions for customer
     * @param {string} title - Ticket title
     * @param {string} template - Template name
     * @param {string} description - Ticket description
     * @returns {Promise<Array>} Array of suggested questions
     */
    async getSuggestedQuestions(title, template, description = '') {
        const backendUrl = await this.getBackendUrl();
        
        try {
            const response = await fetch(`${backendUrl}/ai/suggest-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    template: template,
                    description: description
                })
            });

            if (!response.ok) {
                throw new Error('AI service unavailable');
            }

            const data = await response.json();
            return data.questions || [];

        } catch (error) {
            console.error('[API Client] AI questions error:', error);
            throw error;
        }
    },

    /**
     * Generate resolution text
     * @param {string} title - Ticket title
     * @param {string} description - Ticket description
     * @param {string} activityNotes - Activity notes
     * @param {string} targetLang - Target language
     * @returns {Promise<string>} Generated resolution text
     */
    async generateResolution(title, description, activityNotes, targetLang) {
        const backendUrl = await this.getBackendUrl();
        
        try {
            const response = await fetch(`${backendUrl}/ai/suggest-resolution`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    activity_notes: activityNotes,
                    target_lang: targetLang
                })
            });

            if (!response.ok) {
                throw new Error('AI service unavailable');
            }

            const data = await response.json();
            return data.resolution_text || '';

        } catch (error) {
            console.error('[API Client] AI resolution error:', error);
            throw error;
        }
    },

    /**
     * Check backend health
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        const backendUrl = await this.getBackendUrl();
        
        try {
            const response = await fetch(`${backendUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Backend unhealthy');
            }
        } catch (error) {
            throw new Error('Cannot connect to backend service');
        }
    },

    /**
     * Get backend URL from Chrome storage
     * @returns {Promise<string|null>} Backend URL or null
     */
    async getBackendUrl() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['backendUrl'], (result) => {
                resolve(result.backendUrl || 'http://localhost:5000');
            });
        });
    },

    /**
     * Save backend URL to Chrome storage
     * @param {string} url - Backend URL
     * @returns {Promise<void>}
     */
    async saveBackendUrl(url) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ backendUrl: url }, () => {
                console.log('[API Client] Backend URL saved');
                resolve();
            });
        });
    }
};
