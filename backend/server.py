#!/usr/bin/env python3
"""
Remedy Ticket Assistant - Local Backend Service

This service runs locally on each agent's PC and provides:
- Translation (using deep-translator with Google Translate - free, no API key needed)
- AI text generation (using Ollama)

Translation is done via Google Translate (free tier, no API key required).
For completely offline translation, you can set up a local LibreTranslate instance.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from deep_translator import GoogleTranslator
import requests
import os
import logging

# Get the parent directory to access app folder
PARENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DIR = os.path.join(PARENT_DIR, 'app')

app = Flask(__name__, static_folder=APP_DIR)
CORS(app)  # Allow extension to connect

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434')


@app.route('/')
def index():
    """Serve the main web application"""
    return send_from_directory(APP_DIR, 'index.html')


@app.route('/<path:path>')
def static_files(path):
    """Serve static files (CSS, JS, etc.)"""
    return send_from_directory(APP_DIR, path)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Remedy Ticket Assistant Backend',
        'translation': 'available',
        'ai': 'available' if check_ollama() else 'unavailable'
    })


@app.route('/translate', methods=['POST'])
def translate():
    """
    Translate text using Google Translate (free, no API key needed)
    
    Body: {
        "text": "Text to translate",
        "target_lang": "de",
        "source_lang": "en" (optional, auto-detect if not provided)
    }
    """
    try:
        data = request.json
        text = data.get('text', '')
        target_lang = data.get('target_lang', 'en').lower()
        source_lang = data.get('source_lang', 'auto')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Perform translation using Google Translate
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated_text = translator.translate(text)
        
        logger.info(f"Translated: {source_lang} -> {target_lang}")
        
        return jsonify({
            'translated_text': translated_text,
            'source_lang': source_lang,
            'target_lang': target_lang
        })
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/ai/suggest-questions', methods=['POST'])
def suggest_questions():
    """
    Generate suggested questions for customer using Ollama
    
    Body: {
        "title": "User cannot access shared folder",
        "template": "access-request",
        "description": "Additional context..."
    }
    """
    try:
        data = request.json
        title = data.get('title', '')
        template = data.get('template', '')
        description = data.get('description', '')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        # Create prompt for Ollama
        prompt = f"""You are an IT service desk professional. Generate exactly 5 clear, specific diagnostic questions to ask the customer.

Ticket: {title}
Type: {template}
Details: {description}

Example format:
1. When did this issue first occur?
2. Have you restarted your device?
3. Does this happen with all files or specific ones?
4. Are other users experiencing the same problem?
5. What error message do you see?

Now generate 5 relevant questions for this ticket (numbered 1-5):"""

        # Call Ollama
        response = call_ollama(prompt)
        
        if response:
            # Parse questions from response
            questions = [q.strip() for q in response.split('\n') if q.strip() and q[0].isdigit()]
            
            return jsonify({
                'questions': questions
            })
        else:
            return jsonify({'error': 'AI service unavailable'}), 503
            
    except Exception as e:
        logger.error(f"AI suggestion error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/ai/suggest-resolution', methods=['POST'])
def suggest_resolution():
    """
    Generate resolution text using Ollama
    
    Body: {
        "title": "...",
        "description": "...",
        "activity_notes": "...",
        "target_lang": "de"
    }
    """
    try:
        data = request.json
        title = data.get('title', '')
        description = data.get('description', '')
        activity_notes = data.get('activity_notes', '')
        target_lang = data.get('target_lang', 'en')
        
        # Create prompt
        prompt = f"""Write a professional IT support resolution in {get_language_name(target_lang)}.

Issue: {title}
Details: {description}
Actions taken: {activity_notes}

Example resolution:
"The issue has been resolved. I verified your account permissions and re-enabled access to the system. You should now be able to log in successfully. If you continue to experience problems, please contact the service desk."

Write a similar professional resolution for this ticket:"""

        # Call Ollama
        response = call_ollama(prompt)
        
        if response:
            return jsonify({
                'resolution_text': response.strip()
            })
        else:
            return jsonify({'error': 'AI service unavailable'}), 503
            
    except Exception as e:
        logger.error(f"AI resolution error: {e}")
        return jsonify({'error': str(e)}), 500


def call_ollama(prompt, model='llama3.2:3b'):
    """Call local Ollama instance"""
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                'model': model,
                'prompt': prompt,
                'stream': False
            },
            timeout=30
        )
        
        if response.ok:
            return response.json().get('response', '')
        else:
            logger.error(f"Ollama error: {response.status_code}")
            return None
            
    except requests.exceptions.ConnectionError:
        logger.warning("Ollama not running or not accessible")
        return None
    except Exception as e:
        logger.error(f"Ollama call error: {e}")
        return None


def check_ollama():
    """Check if Ollama is running"""
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2)
        return response.ok
    except:
        return False


def get_language_name(lang_code):
    """Get language name from code"""
    languages = {
        'de': 'German',
        'en': 'English',
        'fr': 'French',
        'es': 'Spanish',
        'it': 'Italian',
        'nl': 'Dutch',
        'pl': 'Polish',
        'pt': 'Portuguese'
    }
    return languages.get(lang_code.lower(), 'English')


if __name__ == '__main__':
    logger.info("Starting Remedy Ticket Assistant Backend Service")
    logger.info(f"Ollama URL: {OLLAMA_URL}")
    logger.info("Translation: Google Translate (free, no API key required)")
    logger.info("Note: For fully offline translation, consider setting up LibreTranslate")
    logger.info("AI: Ollama (local)")
    logger.info("\nService will run on http://localhost:5000")
    
    # Check Ollama availability
    if check_ollama():
        logger.info("✓ Ollama is running")
    else:
        logger.warning("✗ Ollama is not running - AI features will be unavailable")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
