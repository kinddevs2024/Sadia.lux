import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../context/TranslationContext';

/**
 * Hook to automatically translate text content of an element
 * @param {string} originalText - Original text in Russian
 * @returns {string} Translated text or original if translation not needed
 */
export const useAutoTranslate = (originalText) => {
  const { translate, currentLanguage, isTranslationNeeded } = useTranslation();
  const [translatedText, setTranslatedText] = useState(originalText);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!originalText || typeof originalText !== 'string') {
      setTranslatedText(originalText);
      return;
    }

    // If translation is not needed, use original text
    if (!isTranslationNeeded) {
      setTranslatedText(originalText);
      return;
    }

    // Translate text
    const translateText = async () => {
      try {
        const translated = await translate(originalText);
        if (isMountedRef.current) {
          setTranslatedText(translated);
        }
      } catch (error) {
        // Silently use original text if translation fails
        if (process.env.NODE_ENV === 'development') {
          console.warn('Auto-translate failed, using original text:', error.message);
        }
        if (isMountedRef.current) {
          setTranslatedText(originalText);
        }
      }
    };

    translateText();
  }, [originalText, currentLanguage, translate, isTranslationNeeded]);

  return translatedText;
};

/**
 * Hook to automatically translate all text content in a component
 * This hook will translate all text nodes in the component
 */
export const useAutoTranslateElement = (elementRef) => {
  const { translate, currentLanguage, isTranslationNeeded } = useTranslation();

  useEffect(() => {
    if (!elementRef.current || !isTranslationNeeded) return;

    const element = elementRef.current;

    // Get all text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim()) {
        textNodes.push(node);
      }
    }

    // Translate all text nodes
    const translateNodes = async () => {
      const texts = textNodes.map(node => node.textContent);
      const translatedTexts = await Promise.all(
        texts.map(text => translate(text))
      );

      textNodes.forEach((node, index) => {
        node.textContent = translatedTexts[index];
      });
    };

    translateNodes();
  }, [elementRef, currentLanguage, translate, isTranslationNeeded]);
};

