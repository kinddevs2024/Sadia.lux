import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translationService, getBrowserLanguage, isTranslationNeeded } from '../services/translation.service';

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('ru'); // Default: Russian
  const [browserLanguage, setBrowserLanguage] = useState('ru');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState(new Map());

  // Detect browser language on mount
  useEffect(() => {
    const detectedLang = getBrowserLanguage();
    setBrowserLanguage(detectedLang);
    
    // If browser language is not Russian, set it as current language
    if (detectedLang !== 'ru') {
      setCurrentLanguage(detectedLang);
    }
  }, []);

  /**
   * Translate text
   */
  const translate = useCallback(async (text, targetLanguage = null) => {
    if (!text || typeof text !== 'string') return text;

    const targetLang = targetLanguage || currentLanguage;

    // If target language is Russian or same as source, return original
    if (targetLang === 'ru' || !isTranslationNeeded('ru', targetLang)) {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}:${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    // Translate
    try {
      setIsTranslating(true);
      const translated = await translationService.translate(text, targetLang, 'ru');
      
      // Cache the translation
      setTranslationCache(prev => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, translated);
        return newCache;
      });
      
      return translated;
    } catch (error) {
      // Silently return original text if translation fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Translation failed, using original text:', error.message);
      }
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage, translationCache]);

  /**
   * Translate multiple texts
   */
  const translateMultiple = useCallback(async (texts, targetLanguage = null) => {
    const targetLang = targetLanguage || currentLanguage;

    // If target language is Russian, return original texts
    if (targetLang === 'ru' || !isTranslationNeeded('ru', targetLang)) {
      return texts;
    }

    try {
      setIsTranslating(true);
      const translated = await translationService.translateMultiple(texts, targetLang, 'ru');
      return translated;
    } catch (error) {
      // Silently return original texts if translation fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Translation failed, using original texts:', error.message);
      }
      return texts; // Return original texts on error
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage]);

  /**
   * Change language
   */
  const changeLanguage = useCallback((lang) => {
    setCurrentLanguage(lang);
    // Clear cache when language changes
    setTranslationCache(new Map());
  }, []);

  /**
   * Use browser language
   */
  const useBrowserLanguage = useCallback(() => {
    changeLanguage(browserLanguage);
  }, [browserLanguage, changeLanguage]);

  const value = {
    currentLanguage,
    browserLanguage,
    isTranslating,
    translate,
    translateMultiple,
    changeLanguage,
    useBrowserLanguage,
    isTranslationNeeded: isTranslationNeeded('ru', currentLanguage),
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

