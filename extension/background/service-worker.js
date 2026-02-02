/**
 * Background Service Worker
 * Handles background tasks and API calls
 */

console.log('[Remedy Assistant] Service worker initialized');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('[Remedy Assistant] Extension installed');
        // Open settings page on first install
        chrome.runtime.openOptionsPage();
    } else if (details.reason === 'update') {
        console.log('[Remedy Assistant] Extension updated');
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Service Worker] Message received:', request);

    if (request.action === 'translate') {
        handleTranslation(request.text, request.targetLang)
            .then(result => sendResponse({ success: true, translation: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }

    return false;
});

/**
 * Handle translation request
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} Translated text
 */
async function handleTranslation(text, targetLang) {
    // Get API key from storage
    const result = await chrome.storage.sync.get(['deeplApiKey']);
    const apiKey = result.deeplApiKey;

    if (!apiKey) {
        throw new Error('DeepL API key not configured');
    }

    // Call DeepL API (paid endpoint)
    const response = await fetch('https://api.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'auth_key': apiKey,
            'text': text,
            'target_lang': targetLang.toUpperCase(),
            'preserve_formatting': '1'
        })
    });

    if (!response.ok) {
        throw new Error(`DeepL API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translations[0].text;
}
