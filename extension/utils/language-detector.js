/**
 * Language Detector Utility
 * Extracts customer language from Remedy ticket fields
 */

const LanguageDetector = {
    /**
     * Get customer language from hidden field
     * @param {string} selector - CSS selector for language field
     * @returns {string} Language code (de, en, fr, etc.)
     */
    getCustomerLanguage(selector) {
        const languageField = document.querySelector(selector);
        
        if (languageField && languageField.value) {
            const langCode = languageField.value.trim().toLowerCase();
            console.log('[Language Detector] Found language:', langCode);
            return langCode;
        }

        console.warn('[Language Detector] Language field not found, defaulting to EN');
        return 'en';
    },

    /**
     * Map Remedy language codes to DeepL language codes
     * @param {string} remedyLang - Remedy language code
     * @returns {string} DeepL language code
     */
    mapToDeeplLanguage(remedyLang) {
        const mapping = {
            'de': 'de',
            'en': 'en-us',
            'fr': 'fr',
            'es': 'es',
            'it': 'it',
            'nl': 'nl',
            'pl': 'pl',
            'pt': 'pt-pt',
            'ru': 'ru',
            'ja': 'ja',
            'zh': 'zh'
        };

        return mapping[remedyLang.toLowerCase()] || 'en-us';
    },

    /**
     * Get language name for display
     * @param {string} langCode - Language code
     * @returns {string} Language name
     */
    getLanguageName(langCode) {
        const names = {
            'de': 'German',
            'en': 'English',
            'fr': 'French',
            'es': 'Spanish',
            'it': 'Italian',
            'nl': 'Dutch',
            'pl': 'Polish',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'zh': 'Chinese'
        };

        return names[langCode.toLowerCase()] || 'English';
    }
};
