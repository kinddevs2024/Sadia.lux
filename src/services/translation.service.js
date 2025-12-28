import api from './api';

/**
 * Translation service for frontend
 */
export const translationService = {
  /**
   * Translate single text
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code (e.g., 'en', 'uz')
   * @param {string} sourceLanguage - Source language code (default: 'auto')
   * @returns {Promise<string>} Translated text
   */
  async translate(text, targetLanguage, sourceLanguage = 'auto') {
    try {
      const response = await api.post('/translate', {
        text,
        targetLanguage,
        sourceLanguage,
      });
      return response.data.data.translatedText;
    } catch (error) {
      // Silently return original text if translation fails (graceful degradation)
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Translation failed, using original text:', error.message);
      }
      return text; // Return original text on error
    }
  },

  /**
   * Translate multiple texts at once
   * @param {string[]} texts - Array of texts to translate
   * @param {string} targetLanguage - Target language code
   * @param {string} sourceLanguage - Source language code (default: 'auto')
   * @returns {Promise<string[]>} Array of translated texts
   */
  async translateMultiple(texts, targetLanguage, sourceLanguage = 'auto') {
    try {
      const response = await api.post('/translate/multiple', {
        texts,
        targetLanguage,
        sourceLanguage,
      });
      return response.data.data.translatedTexts;
    } catch (error) {
      // Silently return original texts if translation fails (graceful degradation)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Translation failed, using original texts:', error.message);
      }
      return texts; // Return original texts on error
    }
  },

  /**
   * Detect language of text
   * @param {string} text - Text to detect language for
   * @returns {Promise<string>} Detected language code
   */
  async detectLanguage(text) {
    try {
      const response = await api.post('/translate/detect', { text });
      return response.data.data.language;
    } catch (error) {
      // Silently default to Russian if detection fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Language detection failed, defaulting to Russian:', error.message);
      }
      return 'ru'; // Default to Russian on error
    }
  },
};

/**
 * Get browser language
 * @returns {string} Language code (e.g., 'en', 'ru', 'uz')
 */
export function getBrowserLanguage() {
  const lang = navigator.language || navigator.userLanguage || 'ru';
  // Normalize language code (e.g., 'en-US' -> 'en')
  return lang.split('-')[0].toLowerCase();
}

/**
 * Check if translation is needed
 * @param {string} currentLanguage - Current language
 * @param {string} targetLanguage - Target language
 * @returns {boolean}
 */
export function isTranslationNeeded(currentLanguage, targetLanguage) {
  const current = currentLanguage.split('-')[0].toLowerCase();
  const target = targetLanguage.split('-')[0].toLowerCase();
  return current !== target;
}

